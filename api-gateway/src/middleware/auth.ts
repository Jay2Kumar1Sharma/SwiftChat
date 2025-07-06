import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    iat?: number;
    exp?: number;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'Authorization header missing',
        message: 'Please provide an Authorization header with format: Bearer <token>'
      });
      return;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ 
        error: 'Invalid authorization header format',
        message: 'Authorization header must be in format: Bearer <token>'
      });
      return;
    }

    const token = parts[1];
    
    if (!token) {
      res.status(401).json({ 
        error: 'Token missing',
        message: 'No token provided in Authorization header'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Authentication service not properly configured'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      username: string;
      email: string;
      iat?: number;
      exp?: number;
    };

    // Validate required token fields
    if (!decoded.id || !decoded.username || !decoded.email) {
      res.status(401).json({ 
        error: 'Invalid token payload',
        message: 'Token does not contain required user information'
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is malformed or invalid'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expired',
        message: 'The provided token has expired. Please login again.'
      });
    } else if (error instanceof jwt.NotBeforeError) {
      res.status(401).json({ 
        error: 'Token not active',
        message: 'The provided token is not active yet'
      });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        message: 'An error occurred during authentication'
      });
    }
    return;
  }
};
