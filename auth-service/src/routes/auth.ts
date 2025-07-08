import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { registerLimiter, loginLimiter } from '../middleware/rateLimiter';

const router: Router = Router();

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom((value) => {
      if (value.startsWith('_') || value.endsWith('_')) {
        throw new Error('Username cannot start or end with underscore');
      }
      return true;
    }),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
router.post('/register', registerLimiter, registerValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
      return;
    }

    const { username, email, password } = req.body;
    
    // Log registration attempt for monitoring
    console.log(`📝 Registration attempt: ${email} (${username}) from IP: ${req.ip}`);
    
    const result = await authService.register({ username, email, password });

    console.log(`✅ Registration successful: ${email} (${username})`);
    
    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error.message);
    
    // Don't expose sensitive error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction && error.message.includes('validation') 
      ? 'Invalid registration data provided'
      : error.message;
    
    res.status(400).json({
      error: errorMessage || 'Registration failed',
    });
  }
});

router.post('/login', loginLimiter, loginValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.json({
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Login failed',
    });
  }
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        error: 'Refresh token is required',
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: error.message || 'Token refresh failed',
    });
  }
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      res.status(400).json({
        error: 'User ID is required',
      });
      return;
    }

    await authService.logout(userId);

    res.json({
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: error.message || 'Logout failed',
    });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Access token required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const { verifyToken } = await import('../utils/jwt');
      const payload = verifyToken(token);
      
      const user = await authService.getProfile(payload.userId);
      
      res.json({
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      res.status(401).json({
        error: 'Invalid or expired token',
      });
      return;
    }
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get user profile',
    });
  }
});

export { router as authRoutes };
