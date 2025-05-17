
// import  express from 'express';
// const router = express.Router();
// import {
//   createPaymentIntent,
//   confirmPayment,
//   getPaymentMethods,
// } from '../controllers/paymentController.js';
// import { protect } from '../middleware/authMiddleware.js';

// // Create payment intent
// router.post('/create-payment-intent', protect, createPaymentIntent);

// // Confirm payment
// router.post('/confirm', protect, confirmPayment);

// // Get customer payment methods
// router.get('/payment-methods', protect, getPaymentMethods);

// export default router;


import express from 'express';
const router = express.Router();

import {
  createPaymentOrder,
  verifyPayment,
} from '../controllers/paymentController.js';

import { protect } from '../middleware/authMiddleware.js';

// Create Razorpay order
router.post('/create-payment-order', protect, createPaymentOrder);

// Verify Razorpay payment
router.post('/verify', protect, verifyPayment);

export default router;