
import  express from 'express';
const router = express.Router();
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Confirm payment
router.post('/confirm', protect, confirmPayment);

// Get customer payment methods
router.get('/payment-methods', protect, getPaymentMethods);

export default router;
