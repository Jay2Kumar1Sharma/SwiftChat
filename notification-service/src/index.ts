import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || process.env.NOTIFICATION_SERVICE_PORT || 4004;

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
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Notification Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      notifications: '/api/notifications/*'
    }
  });
});

// Notification API routes
app.post('/api/notifications/send', (req: Request, res: Response) => {
  const { userId, type, title, message, data } = req.body;
  
  // Mock notification sending for demo mode
  console.log('📧 Sending notification:', { userId, type, title, message });
  
  res.status(200).json({
    success: true,
    message: 'Notification sent successfully',
    data: {
      id: Date.now().toString(),
      userId,
      type: type || 'info',
      title,
      message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
  });
});

app.get('/api/notifications/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  
  // Mock notifications for demo mode
  const mockNotifications = [
    {
      id: '1',
      userId,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message in General chat',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: '2',
      userId,
      type: 'system',
      title: 'Welcome!',
      message: 'Welcome to the chat application!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ];
  
  res.json({
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length
  });
});

app.put('/api/notifications/:notificationId/read', (req: Request, res: Response) => {
  const { notificationId } = req.params;
  
  // Mock marking notification as read
  res.json({
    success: true,
    message: 'Notification marked as read',
    notificationId
  });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const { userId } = req.body;
  
  // Mock marking all notifications as read
  res.json({
    success: true,
    message: 'All notifications marked as read',
    userId
  });
});

// Push notification endpoints
app.post('/api/notifications/push/subscribe', (req: Request, res: Response) => {
  const { userId, subscription } = req.body;
  
  // Mock push subscription
  res.json({
    success: true,
    message: 'Push subscription registered',
    userId,
    subscriptionId: Date.now().toString()
  });
});

app.post('/api/notifications/push/send', (req: Request, res: Response) => {
  const { userIds, title, body, data } = req.body;
  
  // Mock push notification sending
  console.log('🔔 Sending push notification:', { userIds, title, body });
  
  res.json({
    success: true,
    message: 'Push notification sent',
    sentTo: userIds?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// Email notification endpoints
app.post('/api/notifications/email/send', (req: Request, res: Response) => {
  const { to, subject, text, html } = req.body;
  
  // Mock email sending
  console.log('📧 Sending email:', { to, subject });
  
  res.json({
    success: true,
    message: 'Email sent successfully',
    messageId: `email-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Notification Service Error:', err);
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
  console.log(`📬 Notification Service running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Notification Service shut down complete');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Notification Service shut down complete');
    process.exit(0);
  });
});

export default app;
