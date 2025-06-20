import Order from "../models/orderModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import {
  sendOrderConfirmationMessage,
  sendOrderStatusUpdateMessage,
} from "../utils/smsService.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log("Creating order with body:", req.body);

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

    // Validate required fields
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    // Validate shipping address fields
    const requiredShippingFields = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    const missingFields = requiredShippingFields.filter(field => !shippingAddress[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required shipping fields: ${missingFields.join(', ')}` 
      });
    }

    // Process order items
    orderItems = orderItems.map(item => {
      if (!item.product || !item.name || !item.quantity || !item.price) {
        throw new Error(`Invalid order item: ${JSON.stringify(item)}`);
      }

      return {
        product: item.product,
        name: item.name,
        size: item.size || 'default',
        quantity: item.quantity,
        price: item.price,
        salePrice: item.salePrice || item.price,
        image: item.image
      };
    });

    // Calculate prices if not provided
    if (!itemsPrice) {
      itemsPrice = orderItems.reduce(
        (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
        0
      );
    }

    if (!taxPrice) {
      taxPrice = itemsPrice * 0.1; // 10% tax
    }

    if (!shippingPrice) {
      shippingPrice = itemsPrice > 1000 ? 0 : 100; // Free shipping over ₹1000
    }

    if (!totalPrice) {
      totalPrice = itemsPrice + taxPrice + shippingPrice;
    }

    // Handle user ID
    let userId = null;
    if (req.user) {
      userId = req.user._id;
    } else if (req.body.userId && req.body.userId !== "guest") {
      try {
        userId = mongoose.Types.ObjectId(req.body.userId);
      } catch (e) {
        userId = req.body.userId;
      }
    }

    // Create the order
    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
      isPaid: false,
      isDelivered: false
    };

    if (userId) {
      orderData.user = userId;
    }

    console.log("Creating order with data:", orderData);
    const order = new Order(orderData);
    const createdOrder = await order.save();

    // Generate order number and tracking ID
    const orderNumber = createdOrder._id.toString().slice(-6).toUpperCase();
    const trackingId = `MNG-${orderNumber}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

    // Add tracking ID to the order
    createdOrder.trackingId = trackingId;
    await createdOrder.save();

    // Send notification if socket.io is available
    try {
      const io = req.app.get("io");
      if (io) {
        const orderNotification = {
          _id: createdOrder._id,
          orderNumber,
          totalPrice: createdOrder.totalPrice,
          customerName: shippingAddress.fullName,
          items: orderItems.length,
          createdAt: createdOrder.createdAt,
          trackingId
        };
        io.to("admin").emit("newOrder", orderNotification);
      }
    } catch (error) {
      console.error("Error sending order notification:", error);
    }

    // Send SMS notification
    try {
      const contactNumber = shippingAddress.whatsappNumber || shippingAddress.phone;
      if (contactNumber) {
        await sendOrderConfirmationMessage(
          contactNumber,
          orderNumber,
          trackingId,
          !!shippingAddress.whatsappNumber
        );
      }
    } catch (error) {
      console.error("Error sending SMS notification:", error);
    }

    // Return the complete order data
    const responseData = createdOrder.toObject();
    responseData.trackingId = trackingId;
    responseData.orderNumber = orderNumber;

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      message: "Error creating order", 
      error: error.message 
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // Check if order belongs to logged in user or if user is admin
      if (
        (order.user &&
          order.user._id &&
          order.user._id.toString() === req.user._id.toString()) ||
        req.user.role === "admin"
      ) {
        res.json(order);
      } else {
        res.status(401).json({ message: "Not authorized to view this order" });
      }
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
      order.status = "delivered";

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Populate user and shipping address to get phone number
    const order = await Order.findById(req.params.id)
      .populate("user", "id")
      .lean();

    if (order) {
      // Get the original order to update
      const orderToUpdate = await Order.findById(req.params.id);
      orderToUpdate.status = status;

      // If status is delivered, update isDelivered as well
      if (status === "delivered") {
        orderToUpdate.isDelivered = true;
        orderToUpdate.deliveredAt = Date.now();
      }

      const updatedOrder = await orderToUpdate.save();

      // Generate order number for notifications
      const orderNumber = updatedOrder._id
        .toString()
        .substring(updatedOrder._id.toString().length - 6)
        .toUpperCase();

      // Access the Socket.IO instance and emit a 'orderStatusUpdate' event
      const io = req.app.get("io");
      if (io) {
        const statusUpdate = {
          _id: updatedOrder._id,
          orderNumber: orderNumber,
          status: updatedOrder.status,
          updatedAt: new Date().toISOString(),
        };

        // Emit to admin room for all admins to see the update
        io.to("admin").emit("orderStatusUpdate", statusUpdate);

        // Emit to the specific user who owns this order
        if (order.user?._id) {
          io.to(`user-${order.user._id}`).emit(
            "orderStatusUpdate",
            statusUpdate
          );
        }
      }

      // Send notification (SMS or WhatsApp) if phone number is available
      try {
        // Check if there's a WhatsApp number in the shipping address
        let contactNumber =
          order.shippingAddress?.whatsappNumber || order.shippingAddress?.phone;
        let useWhatsApp = order.shippingAddress?.preferWhatsapp || false;

        // If no number in shipping address but order has user, try to get from user profile
        if (!contactNumber && order.user) {
          try {
            const user = await User.findById(order.user);
            if (user) {
              // If user has WhatsApp number and prefers it, use that
              if (user.whatsappNumber && user.preferWhatsapp) {
                contactNumber = user.whatsappNumber;
                useWhatsApp = true;
              }
              // Otherwise use WhatsApp number if available but not preferred
              else if (user.whatsappNumber) {
                contactNumber = user.whatsappNumber;
                useWhatsApp = false;
              }
            }
          } catch (userError) {
            console.error(
              "Error fetching user for status notification:",
              userError
            );
          }
        }

        if (contactNumber) {
          // Format phone number if needed (add country code if not present)
          const formattedPhone = contactNumber.startsWith("+")
            ? contactNumber
            : `+${contactNumber}`;

          // Send order status update message
          const messageResult = await sendOrderStatusUpdateMessage(
            formattedPhone,
            orderNumber,
            status,
            useWhatsApp
          );

          if (!messageResult.success) {
            console.warn(
              `Status update notification failed: ${messageResult.error}`
            );
          } else {
            console.log(
              `Order status update sent via ${
                useWhatsApp ? "WhatsApp" : "SMS"
              } to ${formattedPhone}`
            );
          }
        } else {
          console.log(
            "No phone number available for status update notification"
          );
        }
      } catch (notificationError) {
        console.error(
          "Error sending status update notification:",
          notificationError
        );
        // Continue with the response, don't let notification errors fail the status update
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name", "email");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
