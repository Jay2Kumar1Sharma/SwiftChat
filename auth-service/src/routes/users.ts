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

export { router as userRoutes };
