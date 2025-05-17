
// import stripe from 'stripe';
// import Order from '../models/orderModel.js';

// // @desc    Create a payment intent
// // @route   POST /api/payments/create-payment-intent
// // @access  Private
// const createPaymentIntent = async (req, res) => {
//   try {
//     const { amount, currency = 'usd', description, metadata } = req.body;
    
//     // Validate input
//     if (!amount || amount < 1) {
//       return res.status(400).json({ message: 'Invalid amount' });
//     }
    
//     // Create payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount, // Amount in cents
//       currency,
//       description,
//       metadata: metadata || {},
//       receipt_email: req.user?.email,
//     });
    
//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // @desc    Confirm payment and update order
// // @route   POST /api/payments/confirm
// // @access  Private
// const confirmPayment = async (req, res) => {
//   try {
//     const { paymentIntentId, orderId } = req.body;
    
//     // Validate input
//     if (!paymentIntentId || !orderId) {
//       return res.status(400).json({ message: 'Payment intent ID and order ID are required' });
//     }
    
//     // Get payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
//     if (paymentIntent.status !== 'succeeded') {
//       return res.status(400).json({ message: 'Payment not successful' });
//     }
    
//     // Update order status
//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
    
//     order.isPaid = true;
//     order.paidAt = Date.now();
//     order.paymentResult = {
//       id: paymentIntentId,
//       status: paymentIntent.status,
//       update_time: Date.now(),
//       email_address: req.user.email,
//     };
    
//     const updatedOrder = await order.save();
    
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     console.error('Error confirming payment:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // @desc    Get customer payment methods
// // @route   GET /api/payments/payment-methods
// // @access  Private
// const getPaymentMethods = async (req, res) => {
//   try {
//     // Get customer ID from Stripe
//     const customers = await stripe.customers.list({
//       email: req.user.email,
//       limit: 1,
//     });
    
//     let customerId;
    
//     // If customer doesn't exist, create one
//     if (customers.data.length === 0) {
//       const newCustomer = await stripe.customers.create({
//         email: req.user.email,
//         name: req.user.name,
//       });
//       customerId = newCustomer.id;
//     } else {
//       customerId = customers.data[0].id;
//     }
    
//     // Get payment methods
//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: customerId,
//       type: 'card',
//     });
    
//     res.status(200).json(paymentMethods.data);
//   } catch (error) {
//     console.error('Error getting payment methods:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// export {
//   createPaymentIntent,
//   confirmPayment,
//   getPaymentMethods,
// };



import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/orderModel.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order (like payment intent)
// @route   POST /api/payments/create-payment-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify payment and update order
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const hmac = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (hmac !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature, payment verification failed' });
    }

    // Update your MongoDB order here
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      signature: razorpay_signature,
      status: 'paid',
    };

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export {
  createPaymentOrder,
  verifyPayment,
};
