import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { validateEnv } from './utils/validateEnv';
import { apiLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

// Validate environment variables with fallback for development
try {
  validateEnv();
} catch (error) {
  console.warn('⚠️ Environment validation failed, continuing with defaults for development');
  console.warn('Error:', error);
}

const app: Application = express();
const PORT = process.env.PORT || process.env.AUTH_SERVICE_PORT || 4002;

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://swiftchat-frontend.onrender.com',
  'http://localhost:4000', // API Gateway
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(apiLimiter);

// Logging and parsing
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await connectDatabase();
    console.log('✅ Database connected successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Graceful shutdown function
    const gracefulShutdown = (signal: string) => {
      console.log(`${signal} received, shutting down gracefully`);
      
      server.close((err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Auth Service shut down complete');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start auth service:', error);
    process.exit(1);
  }
};

startServer();

export default app;
