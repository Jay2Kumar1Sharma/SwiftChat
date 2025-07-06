// Simple test version of the auth service
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 4002;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service-test',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Test JWT endpoint
app.get('/test-jwt', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ test: 'payload' }, 'test-secret', { expiresIn: '1h' });
    
    res.json({
      message: 'JWT test successful',
      token: token,
      decoded: jwt.verify(token, 'test-secret'),
    });
  } catch (error) {
    res.status(500).json({
      error: 'JWT test failed',
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth Service Test running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 JWT test: http://localhost:${PORT}/test-jwt`);
});

export default app;
