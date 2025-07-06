import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || process.env.CHAT_SERVICE_PORT || 4003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Chat Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      chat: '/api/chat/*'
    }
  });
});

// Chat API routes
app.get('/api/chat/rooms', (req: Request, res: Response) => {
  // Mock data for demo mode
  res.json({
    rooms: [
      { id: '1', name: 'General', type: 'public', memberCount: 5 },
      { id: '2', name: 'Random', type: 'public', memberCount: 3 },
      { id: '3', name: 'Development', type: 'private', memberCount: 2 }
    ]
  });
});

app.get('/api/chat/messages/:roomId', (req: Request, res: Response) => {
  const { roomId } = req.params;
  
  // Mock messages for demo mode
  res.json({
    messages: [
      {
        id: '1',
        roomId,
        userId: 'demo-user-1',
        username: 'Demo User',
        content: 'Welcome to the chat room!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'text'
      },
      {
        id: '2',
        roomId,
        userId: 'demo-user-2',
        username: 'System',
        content: 'This is a demo message from the chat service.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: 'text'
      }
    ]
  });
});

app.post('/api/chat/messages', (req: Request, res: Response) => {
  const { roomId, content, type = 'text' } = req.body;
  
  // Mock message creation for demo mode
  const newMessage = {
    id: Date.now().toString(),
    roomId,
    userId: 'demo-user-1',
    username: 'Demo User',
    content,
    timestamp: new Date().toISOString(),
    type
  };
  
  res.status(201).json({
    message: 'Message sent successfully',
    data: newMessage
  });
});

// User management endpoints
app.get('/api/chat/users', (req: Request, res: Response) => {
  res.json({
    users: [
      { id: 'demo-user-1', username: 'Demo User', status: 'online' },
      { id: 'demo-user-2', username: 'System', status: 'online' },
      { id: 'demo-user-3', username: 'Guest', status: 'offline' }
    ]
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Chat Service Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 Chat Service running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Chat Service shut down complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Chat Service shut down complete');
    process.exit(0);
  });
});

export default app;
