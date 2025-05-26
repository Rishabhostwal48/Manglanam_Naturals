import stripe from 'stripe';
import Order from '../models/orderModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create a payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', description, metadata } = req.body;
    
    // Validate input
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      description,
      metadata: metadata || {},
      receipt_email: req.user?.email,
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Confirm payment and update order
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    // Validate input
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ message: 'Payment intent ID and order ID are required' });
    }
    
    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }
    
    // Update order status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentIntentId,
      status: paymentIntent.status,
      update_time: Date.now(),
      email_address: req.user.email,
    };
    
    const updatedOrder = await order.save();
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get customer payment methods
// @route   GET /api/payments/payment-methods
// @access  Private
const getPaymentMethods = async (req, res) => {
  try {
    // Get customer ID from Stripe
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });
    
    let customerId;
    
    // If customer doesn't exist, create one
    if (customers.data.length === 0) {
      const newCustomer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });
      customerId = newCustomer.id;
    } else {
      customerId = customers.data[0].id;
    }
    
    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    res.status(200).json(paymentMethods.data);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-razorpay-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    console.log('Creating Razorpay order with:', { amount, currency, receipt });
    
    // Validate input
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!receipt) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({ message: 'Payment system not configured properly' });
    }
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency,
      receipt,
      notes: {
        orderId: receipt,
        userId: req.user?._id || 'guest'
      }
    });
    
    console.log('Razorpay order created:', order);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      message: 'Failed to create payment order',
      error: error.message,
      details: error.error?.description || error.description || 'Unknown error'
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify-razorpay
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }
    
    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Update order status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Verify payment with Razorpay
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      if (payment.status !== 'captured') {
        return res.status(400).json({ message: 'Payment not captured' });
      }

      if (payment.order_id !== razorpay_order_id) {
        return res.status(400).json({ message: 'Invalid order ID in payment' });
      }
    } catch (error) {
      console.error('Error verifying payment with Razorpay:', error);
      return res.status(500).json({ message: 'Failed to verify payment with Razorpay' });
    }
    
    // Update order
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: Date.now(),
      email_address: req.user.email,
    };
    
    const updatedOrder = await order.save();
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ 
      message: 'Failed to verify payment',
      error: error.message 
    });
  }
};

export {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  createRazorpayOrder,
  verifyRazorpayPayment
};
