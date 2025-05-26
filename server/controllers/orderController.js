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

    // Handle different order formats
    // If client sends items instead of orderItems, convert it
    if (!orderItems && req.body.items) {
      console.log("Converting items to orderItems format");
      orderItems = req.body.items.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price || 0,
        salePrice: item.salePrice || 0,
        image: item.image,
      }));
    }

    // Validate and convert product IDs to ObjectId
    try {
      orderItems = orderItems.map((item) => {
        try {
          console.log(
            "Processing product ID:",
            item.product,
            "Type:",
            typeof item.product
          );

          // If we're using mock data, just use the ID as is
          if (process.env.VITE_USE_MOCK_DATA === "true") {
            console.log("Using mock data, skipping ObjectId validation");
            return item;
          }

          if (
            typeof item.product === "string" &&
            mongoose.Types.ObjectId.isValid(item.product)
          ) {
            item.product = new mongoose.Types.ObjectId(item.product);
          } else if (
            item.product &&
            typeof item.product === "object" &&
            item.product._bsontype === "ObjectID"
          ) {
            // Already an ObjectId, no conversion needed
          } else if (item.product && typeof item.product === "string") {
            // If it's a string but not a valid ObjectId, use it as is for mock data
            console.log(
              "Using non-ObjectId string as product ID:",
              item.product
            );
          } else {
            console.warn(
              `Potentially invalid product ID: ${item.product}, using as is`
            );
          }
        } catch (err) {
          console.error(
            "Product ID validation error for item:",
            item,
            "Error:",
            err
          );
          // Don't throw, just use the ID as is
        }
        return item;
      });
    } catch (mapError) {
      console.error("Error processing order items:", mapError);
      // Continue with the original items
    }

    // If totalPrice is not provided but total is, use that
    if (!totalPrice && req.body.total) {
      totalPrice = req.body.total;
    }

    // Calculate prices if not provided
    if (!itemsPrice) {
      itemsPrice = orderItems.reduce(
        (sum, item) => sum + ((item.salePrice && item.salePrice > 0) ? item.salePrice : item.price) * item.quantity,
        0
      );
    }

    if (!taxPrice) {
      taxPrice = req.body.taxPrice || 0;
    }

    if (!shippingPrice) {
      shippingPrice = req.body.shippingPrice || 0;
    }

    if (!totalPrice) {
      totalPrice = itemsPrice + taxPrice + shippingPrice;
    }

    console.log("Processed order data:", {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: "No order items" });
      return;
    }

    // Handle user ID
    let userId;

    if (req.user) {
      // If authenticated, use the authenticated user's ID
      userId = req.user._id;
    } else if (req.body.userId && req.body.userId !== "guest") {
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

    console.log("Final order data:", orderData);
    const order = new Order(orderData);

    const createdOrder = await order.save();

    // Generate order number and tracking ID for notifications
    const orderNumber = createdOrder._id
      .toString()
      .substring(createdOrder._id.toString().length - 6)
      .toUpperCase();
    const trackingId = `MNG-${orderNumber}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    // Access the Socket.IO instance and emit a 'newOrder' event to admin room
    try {
      const io = req.app.get("io");
      if (io) {
        const orderNotification = {
          _id: createdOrder._id,
          orderNumber: orderNumber,
          totalPrice: createdOrder.totalPrice,
          customerName: shippingAddress?.fullName || "Guest",
          items: orderItems.length,
          createdAt: createdOrder.createdAt,
          trackingId: trackingId,
        };

        // Emit to admin room for real-time updates in admin panel
        io.to("admin").emit("newOrder", orderNotification);

        // Emit to specific user room if user created the order
        if (req.user) {
          io.to(`user-${req.user._id}`).emit(
            "orderConfirmation",
            orderNotification
          );
        }
      } else {
        console.log("Socket.IO not initialized, skipping notifications");
      }
    } catch (socketError) {
      console.error("Error sending socket notifications:", socketError);
      // Continue with the response, don't let socket errors fail the order creation
    }

    // Send notification (SMS or WhatsApp) if phone number is available
    try {
      // Check if there's a WhatsApp number in the shipping address
      let contactNumber =
        shippingAddress?.whatsappNumber || shippingAddress?.phone;
      let useWhatsApp = shippingAddress?.preferWhatsapp || false;

      // If no number in shipping address but user is logged in, try to get from user profile
      if (!contactNumber && userId) {
        try {
          const user = await User.findById(userId);
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
            // If no WhatsApp number, check for phone in shipping address
            else if (shippingAddress?.phone) {
              contactNumber = shippingAddress.phone;
              useWhatsApp = false;
            }
          }
        } catch (userError) {
          console.error("Error fetching user for notification:", userError);
        }
      }

      if (contactNumber) {
        // Format phone number if needed (add country code if not present)
        const formattedPhone = contactNumber.startsWith("+")
          ? contactNumber
          : `+${contactNumber}`;

        // Send order confirmation message with tracking ID
        const messageResult = await sendOrderConfirmationMessage(
          formattedPhone,
          orderNumber,
          trackingId,
          useWhatsApp
        );

        if (!messageResult.success) {
          console.warn(`Notification failed: ${messageResult.error}`);
        } else {
          console.log(
            `Order confirmation sent via ${
              useWhatsApp ? "WhatsApp" : "SMS"
            } to ${formattedPhone}`
          );
        }
      } else {
        console.log("No phone number available for notification");
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // Continue with the response, don't let notification errors fail the order creation
    }

    // Include tracking ID in the response
    const responseOrder = createdOrder.toObject();
    responseOrder.trackingId = trackingId;

    res.status(201).json(responseOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
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
