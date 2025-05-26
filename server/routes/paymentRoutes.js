import express from 'express';
const router = express.Router();
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Confirm payment
router.post('/confirm', protect, confirmPayment);

// Get customer payment methods
router.get('/payment-methods', protect, getPaymentMethods);

// Razorpay routes
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-razorpay', protect, verifyRazorpayPayment);

export default router;
