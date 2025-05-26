import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  createAdminUser,
  getAllUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.post('/admin', protect, admin, createAdminUser);

export default router;
