import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  groupId: string;
  timestamp: Date;
  messageType: 'text' | 'image' | 'file' | 'system';
}

class WebSocketGateway {
  private io: Server;
  private redisClient: ReturnType<typeof createClient>;
  private httpServer: ReturnType<typeof createServer>;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> groupIds
  private isShuttingDown = false;

  constructor() {
    this.httpServer = createServer();
    
    // Add health check endpoint
    this.httpServer.on('request', (req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          service: 'websocket-gateway',
          timestamp: new Date().toISOString(),
          connectedUsers: this.connectedUsers.size
        }));
        return;
      }
      
      res.writeHead(404);
      res.end('Not Found');
    });
    
    this.io = new Server(this.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Redis URL fallback for both local and cloud environments
    const redisUrl = process.env.REDIS_URL || 
                    `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    this.redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000
      }
    });

    this.setupRedis();
    this.setupSocketHandlers();
    this.startServer();
  }

  private async setupRedis(): Promise<void> {
    try {
      // Add error handlers before connecting
      this.redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('🔄 Connecting to Redis...');
      });

      this.redisClient.on('ready', () => {
        console.log('✅ Connected to Redis and ready');
      });

      this.redisClient.on('end', () => {
        console.log('🔌 Redis connection ended');
      });

      await this.redisClient.connect();

      // Subscribe to message events from chat service
      const subscriber = this.redisClient.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe('message:new', (message) => {
        try {
          this.handleNewMessage(JSON.parse(message));
        } catch (error) {
          console.error('Error handling new message:', error);
        }
      });

      await subscriber.subscribe('user:online', (message) => {
        try {
          this.handleUserOnline(JSON.parse(message));
        } catch (error) {
          console.error('Error handling user online:', error);
        }
      });

      await subscriber.subscribe('user:offline', (message) => {
        try {
          this.handleUserOffline(JSON.parse(message));
        } catch (error) {
          console.error('Error handling user offline:', error);
        }
      });

      await subscriber.subscribe('typing:start', (message) => {
        try {
          this.handleTypingStart(JSON.parse(message));
        } catch (error) {
          console.error('Error handling typing start:', error);
        }
      });

      await subscriber.subscribe('typing:stop', (message) => {
        try {
          this.handleTypingStop(JSON.parse(message));
        } catch (error) {
          console.error('Error handling typing stop:', error);
        }
      });

    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      if (process.env.NODE_ENV === 'production') {
        // In production, exit on Redis failure
        process.exit(1);
      } else {
        // In development, continue without Redis
        console.warn('⚠️ Continuing without Redis in development mode');
      }
    }
  }

  private setupSocketHandlers(): void {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          return next(new Error('Server configuration error'));
        }

        const decoded = jwt.verify(token, jwtSecret) as {
          id: string;
          username: string;
          email: string;
        };

        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    if (!socket.user) return;

    const userId = socket.user.id;
    
    console.log(`🔌 User ${socket.user.username} connected (${socket.id})`);

    // Store user connection
    this.connectedUsers.set(userId, socket.id);

    // Join user to their groups
    await this.joinUserGroups(socket, userId);

    // Notify others that user is online
    await this.publishUserStatus(userId, 'online');

    // Socket event handlers
    socket.on('join:group', (groupId: string) => {
      this.handleJoinGroup(socket, groupId);
    });

    socket.on('leave:group', (groupId: string) => {
      this.handleLeaveGroup(socket, groupId);
    });

    socket.on('message:send', (messageData: Partial<Message>) => {
      this.handleSendMessage(socket, messageData);
    });

    socket.on('typing:start', (data: { groupId: string }) => {
      this.handleTypingEvent(socket, data.groupId, 'start');
    });

    socket.on('typing:stop', (data: { groupId: string }) => {
      this.handleTypingEvent(socket, data.groupId, 'stop');
    });

    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  private async joinUserGroups(socket: AuthenticatedSocket, userId: string): Promise<void> {
    try {
      // Get user's groups from Redis cache or database
      const userGroupsKey = `user:${userId}:groups`;
      const groupIds = await this.redisClient.sMembers(userGroupsKey);
      
      if (groupIds.length > 0) {
        // Join socket to group rooms
        for (const groupId of groupIds) {
          socket.join(`group:${groupId}`);
        }
        
        // Store user's rooms
        this.userRooms.set(userId, new Set(groupIds));
        
        console.log(`📁 User ${userId} joined ${groupIds.length} groups`);
      }
    } catch (error) {
      console.error('Error joining user groups:', error);
    }
  }

  private handleJoinGroup(socket: AuthenticatedSocket, groupId: string): void {
    if (!socket.user) return;

    socket.join(`group:${groupId}`);
    
    // Update user's rooms
    const userRooms = this.userRooms.get(socket.user.id) || new Set();
    userRooms.add(groupId);
    this.userRooms.set(socket.user.id, userRooms);

    // Notify group members
    socket.to(`group:${groupId}`).emit('user:joined', {
      userId: socket.user.id,
      username: socket.user.username,
      groupId
    });

    console.log(`➕ User ${socket.user.username} joined group ${groupId}`);
  }

  private handleLeaveGroup(socket: AuthenticatedSocket, groupId: string): void {
    if (!socket.user) return;

    socket.leave(`group:${groupId}`);
    
    // Update user's rooms
    const userRooms = this.userRooms.get(socket.user.id);
    if (userRooms) {
      userRooms.delete(groupId);
    }

    // Notify group members
    socket.to(`group:${groupId}`).emit('user:left', {
      userId: socket.user.id,
      username: socket.user.username,
      groupId
    });

    console.log(`➖ User ${socket.user.username} left group ${groupId}`);
  }

  private async handleSendMessage(socket: AuthenticatedSocket, messageData: Partial<Message>): Promise<void> {
    if (!socket.user || !messageData.groupId) return;

    try {
      // Publish message to Redis for chat service to process
      await this.redisClient.publish('message:send', JSON.stringify({
        ...messageData,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('Error publishing message to Redis:', error);
      // Fallback: broadcast directly if Redis fails
      socket.to(`group:${messageData.groupId}`).emit('message:new', {
        ...messageData,
        senderId: socket.user.id,
        senderUsername: socket.user.username,
        timestamp: new Date()
      });
    }
  }

  private async handleTypingEvent(socket: AuthenticatedSocket, groupId: string, action: 'start' | 'stop'): Promise<void> {
    if (!socket.user) return;

    const eventData = {
      userId: socket.user.id,
      username: socket.user.username,
      groupId,
      timestamp: new Date()
    };

    // Broadcast to other users in the group
    socket.to(`group:${groupId}`).emit(`typing:${action}`, eventData);

    try {
      // Publish to Redis for other instances
      await this.redisClient.publish(`typing:${action}`, JSON.stringify(eventData));
    } catch (error) {
      console.error(`Error publishing typing:${action} to Redis:`, error);
    }
  }

  private async handleDisconnection(socket: AuthenticatedSocket): Promise<void> {
    if (!socket.user) return;

    const userId = socket.user.id;
    
    // Remove user connection
    this.connectedUsers.delete(userId);
    this.userRooms.delete(userId);

    // Notify others that user is offline
    await this.publishUserStatus(userId, 'offline');

    console.log(`🔌 User ${socket.user.username} disconnected`);
  }

  // Redis event handlers
  private handleNewMessage(message: Message): void {
    // Broadcast message to group members
    this.io.to(`group:${message.groupId}`).emit('message:new', message);
  }

  private handleUserOnline(data: { userId: string }): void {
    this.io.emit('user:online', data);
  }

  private handleUserOffline(data: { userId: string }): void {
    this.io.emit('user:offline', data);
  }

  private handleTypingStart(data: { userId: string; groupId: string; username: string }): void {
    this.io.to(`group:${data.groupId}`).emit('typing:start', data);
  }

  private handleTypingStop(data: { userId: string; groupId: string }): void {
    this.io.to(`group:${data.groupId}`).emit('typing:stop', data);
  }

  private async publishUserStatus(userId: string, status: 'online' | 'offline'): Promise<void> {
    try {
      await this.redisClient.publish(`user:${status}`, JSON.stringify({ userId }));
    } catch (error) {
      console.error(`Error publishing user:${status} to Redis:`, error);
    }
  }

  private startServer(): void {
    const PORT = process.env.PORT || process.env.WEBSOCKET_GATEWAY_PORT || 4001;
    
    this.httpServer.listen(parseInt(PORT as string), () => {
      console.log(`🚀 WebSocket Gateway running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
    });

    // Handle server errors
    this.httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });
  }

  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log('🔄 Gracefully shutting down WebSocket Gateway...');

    try {
      // Close Socket.IO server
      this.io.close();
      
      // Close Redis connections
      await this.redisClient.quit();
      
      // Close HTTP server
      this.httpServer.close(() => {
        console.log('✅ WebSocket Gateway shut down complete');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the WebSocket Gateway
const gateway = new WebSocketGateway();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await gateway.shutdown();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await gateway.shutdown();
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
