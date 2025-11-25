import express from 'express';
import { getProtectedData, getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// どちらのルートも authenticateToken ミドルウェアを通す
router.get('/protected', authenticateToken, getProtectedData);
router.get('/profile', authenticateToken, getUserProfile);

export default router;