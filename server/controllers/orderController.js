import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log('Creating order with body:', req.body);
    
    // Extract data from request body
    let {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    
    // Handle different order formats
    // If client sends items instead of orderItems, convert it
    if (!orderItems && req.body.items) {
      console.log('Converting items to orderItems format');
      orderItems = req.body.items.map(item => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }));
    }
    
    // Validate and convert product IDs to ObjectId
    try {
      orderItems = orderItems.map(item => {
        try {
          console.log('Processing product ID:', item.product, 'Type:', typeof item.product);
          
          // If we're using mock data, just use the ID as is
          if (process.env.VITE_USE_MOCK_DATA === 'true') {
            console.log('Using mock data, skipping ObjectId validation');
            return item;
          }
          
          if (typeof item.product === 'string' && mongoose.Types.ObjectId.isValid(item.product)) {
            item.product = new mongoose.Types.ObjectId(item.product);
          } else if (item.product && typeof item.product === 'object' && item.product._bsontype === 'ObjectID') {
            // Already an ObjectId, no conversion needed
          } else if (item.product && typeof item.product === 'string') {
            // If it's a string but not a valid ObjectId, use it as is for mock data
            console.log('Using non-ObjectId string as product ID:', item.product);
          } else {
            console.warn(`Potentially invalid product ID: ${item.product}, using as is`);
          }
        } catch (err) {
          console.error('Product ID validation error for item:', item, 'Error:', err);
          // Don't throw, just use the ID as is
        }
        return item;
      });
    } catch (mapError) {
      console.error('Error processing order items:', mapError);
      // Continue with the original items
    }
    
    // If totalPrice is not provided but total is, use that
    if (!totalPrice && req.body.total) {
      totalPrice = req.body.total;
    }
    
    // Calculate prices if not provided
    if (!itemsPrice) {
      itemsPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    if (!taxPrice) {
      taxPrice = req.body.taxPrice || 0;
    }
    
    if (!shippingPrice) {
      shippingPrice = req.body.shippingPrice || 0;
    }
    
    console.log('Processed order data:', {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Handle user ID
    let userId;
    
    if (req.user) {
      // If authenticated, use the authenticated user's ID
      userId = req.user._id;
    } else if (req.body.userId && req.body.userId !== 'guest') {
      // If a userId is provided and it's not 'guest', use it
      try {
        // Try to convert to ObjectId if it's a valid MongoDB ID
        userId = mongoose.Types.ObjectId(req.body.userId);
      } catch (e) {
        // If not a valid ObjectId, use as string
        userId = req.body.userId;
      }
    }
    
    // Create the order object
    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };
    
    // Only add user if we have a valid userId
    if (userId) {
      orderData.user = userId;
    }
    
    console.log('Final order data:', orderData);
    const order = new Order(orderData);

    const createdOrder = await order.save();
    
    // Access the Socket.IO instance and emit a 'newOrder' event to admin room
    try {
      const io = req.app.get('io');
      if (io) {
        const orderNotification = {
          _id: createdOrder._id,
          orderNumber: createdOrder._id.toString().substring(createdOrder._id.toString().length - 6).toUpperCase(),
          totalPrice: createdOrder.totalPrice,
          customerName: shippingAddress?.fullName || 'Guest',
          items: orderItems.length,
          createdAt: createdOrder.createdAt
        };
        
        // Emit to admin room for real-time updates in admin panel
        io.to('admin').emit('newOrder', orderNotification);
        
        // Emit to specific user room if user created the order
        if (req.user) {
          io.to(`user-${req.user._id}`).emit('orderConfirmation', orderNotification);
        }
      } else {
        console.log('Socket.IO not initialized, skipping notifications');
      }
    } catch (socketError) {
      console.error('Error sending socket notifications:', socketError);
      // Continue with the response, don't let socket errors fail the order creation
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      // Check if order belongs to logged in user or if user is admin
      if (
        order.user._id.toString() === req.user._id.toString() ||
        req.user.role === 'admin'
      ) {
        res.json(order);
      } else {
        res.status(401).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'id');

    if (order) {
      order.status = status;
      
      // If status is delivered, update isDelivered as well
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      
      // Access the Socket.IO instance and emit a 'orderStatusUpdate' event
      const io = req.app.get('io');
      if (io) {
        const statusUpdate = {
          _id: updatedOrder._id,
          orderNumber: updatedOrder._id.toString().substring(updatedOrder._id.toString().length - 6).toUpperCase(),
          status: updatedOrder.status,
          updatedAt: new Date().toISOString()
        };
        
        // Emit to admin room for all admins to see the update
        io.to('admin').emit('orderStatusUpdate', statusUpdate);
        
        // Emit to the specific user who owns this order
        if (order.user?._id) {
          io.to(`user-${order.user._id}`).emit('orderStatusUpdate', statusUpdate);
        }
      }
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export {
  createOrder,
  getOrderById,
  getOrders,
  getMyOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
};
