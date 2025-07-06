import express from 'express';
import jwt from 'jsonwebtoken';
import { getPool } from '../database/connection';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Get messages for a room
router.get('/messages/:room?', authenticateToken, async (req, res) => {
  try {
    const room = req.params.room || 'general';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const pool = getPool();
    const result = await pool.query(`
      SELECT m.id, m.content, m.room, m.created_at, u.username, u.id as user_id
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [room, limit, offset]);

    res.json({
      messages: result.rows.reverse(),
      room,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { content, room = 'general' } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    const pool = getPool();
    const result = await pool.query(`
      INSERT INTO messages (user_id, content, room) 
      VALUES ($1, $2, $3) 
      RETURNING id, content, room, created_at
    `, [userId, content.trim(), room]);

    const message = result.rows[0];

    // Get user info for the response
    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );

    const responseMessage = {
      ...message,
      username: userResult.rows[0].username,
      user_id: userId
    };

    res.status(201).json({
      message: 'Message sent successfully',
      data: responseMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get available rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT DISTINCT room, COUNT(*) as message_count
      FROM messages
      GROUP BY room
      ORDER BY message_count DESC
    `);

    res.json({
      rooms: result.rows
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

export { router as chatRouter };
