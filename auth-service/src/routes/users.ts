import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { userRepository } from '../repositories';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

// Get user profile (protected)
router.get('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await authService.getProfile(userId);

    res.json({
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(404).json({
      error: error.message || 'Profile not found',
    });
  }
});

// Get all users (protected)
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepository.getAllUsers();

    res.json({
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve users',
    });
  }
});

// Update online status (protected)
router.patch('/:userId/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isOnline } = req.body;
    const requestUserId = (req as any).user.userId;

    // Validate userId parameter
    if (!userId) {
      res.status(400).json({
        error: 'User ID is required',
      });
      return;
    }

    // Users can only update their own status
    if (userId !== requestUserId) {
      res.status(403).json({
        error: 'Forbidden: You can only update your own status',
      });
      return;
    }

    await userRepository.updateOnlineStatus(userId, isOnline);

    res.json({
      message: 'Status updated successfully',
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update status',
    });
  }
});

// Search users (protected)
router.get('/search', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        error: 'Search query is required',
      });
      return;
    }

    const users = await userRepository.searchUsers(q);

    res.json({
      message: 'Users found',
      data: users,
    });
  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: error.message || 'Failed to search users',
    });
  }
});

// Get user by ID (protected)
router.get('/:userId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        error: 'User ID is required',
      });
      return;
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      res.status(404).json({
        error: 'User not found',
      });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: 'User retrieved successfully',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: error.message || 'Failed to retrieve user',
    });
  }
});

export { router as userRoutes };
