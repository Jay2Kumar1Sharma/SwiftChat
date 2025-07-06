import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getRedisClient } from '../redis/connection';
import { getPool } from '../database/connection';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

export function setupSocketHandlers(io: SocketIOServer) {
  // Authentication middleware for Socket.IO
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Verify user exists in database
      const pool = getPool();
      const result = await pool.query(
        'SELECT id, username FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', async (socket: any) => {
    console.log(`User ${socket.username} connected with ID: ${socket.id}`);

    // Join user to general room by default
    socket.join('general');

    // Store user session in Redis
    try {
      const redis = getRedisClient();
      await redis.setEx(`user:${socket.userId}`, 3600, JSON.stringify({
        socketId: socket.id,
        username: socket.username,
        lastSeen: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Redis error:', error);
    }

    // Handle joining rooms
    socket.on('join-room', (room: string) => {
      socket.join(room);
      socket.emit('joined-room', { room });
      console.log(`${socket.username} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      socket.emit('left-room', { room });
      console.log(`${socket.username} left room: ${room}`);
    });

    // Handle new messages
    socket.on('send-message', async (data: { content: string; room?: string }) => {
      try {
        const { content, room = 'general' } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        if (content.length > 1000) {
          socket.emit('error', { message: 'Message too long (max 1000 characters)' });
          return;
        }

        // Save message to database
        const pool = getPool();
        const result = await pool.query(`
          INSERT INTO messages (user_id, content, room) 
          VALUES ($1, $2, $3) 
          RETURNING id, content, room, created_at
        `, [socket.userId, content.trim(), room]);

        const message = {
          ...result.rows[0],
          username: socket.username,
          user_id: socket.userId
        };

        // Broadcast message to room
        io.to(room).emit('new-message', message);

        console.log(`Message sent by ${socket.username} in ${room}: ${content.substring(0, 50)}...`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { room: string; isTyping: boolean }) => {
      socket.to(data.room).emit('user-typing', {
        username: socket.username,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.username} disconnected`);

      // Remove user session from Redis
      try {
        const redis = getRedisClient();
        await redis.del(`user:${socket.userId}`);
      } catch (error) {
        console.error('Redis cleanup error:', error);
      }

      // Notify rooms about user disconnect
      socket.broadcast.emit('user-disconnected', {
        username: socket.username,
        userId: socket.userId
      });
    });

    // Send welcome message
    socket.emit('welcome', {
      message: 'Connected to chat server',
      username: socket.username,
      timestamp: new Date().toISOString()
    });
  });
}
