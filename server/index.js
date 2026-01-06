import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import uploadRoutes from "./routes/upload.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB (wrapped in try-catch to prevent server crash)
try {
  connectDB();
} catch (error) {
  console.error('MongoDB connection error:', error);
  // Continue running the server even if MongoDB connection fails
}
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] 
    : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:8081'],
  credentials: true
}));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use("/products/upload", uploadRoutes);
app.use("/products/upload-video", uploadRoutes);



// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Since frontend is deployed separately, do not serve static frontend files here
  // Remove or comment out the static folder and catch-all route for frontend

  // Optionally, respond with a simple message or 404 for non-API routes
  app.get('/', (req, res) => {
    res.send('API is running in production mode');
  });

  // Handle non-API routes with 404 JSON response
  app.get('/*', (req, res, next) => {
    if (req.url.startsWith('/api/') || 
        req.url.startsWith('/uploads/') || 
        req.url.includes('.')) {
      return next();
    }
    res.status(404).json({
      message: 'Route not found',
      note: 'This is an API-only backend server'
    });
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // In development, handle non-API routes that aren't found
  app.get('/*', (req, res, next) => {
    // Skip API routes and static file routes
    if (req.url.startsWith('/api/') || 
        req.url.startsWith('/uploads/') || 
        req.url.includes('.')) {
      return next();
    }
    
    // For other routes, send a friendly message
    res.status(404).json({
      message: 'Route not found in development mode',
      note: 'In production, this would serve the React app'
    });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.IO (if needed)
try {
  const { Server } = await import('socket.io');
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://manglanam-naturals.vercel.app']
        : ['http://localhost:8080',],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Store io instance on app for use in routes
  app.set('io', io);
  
  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join admin room if admin user
    socket.on('joinAdminRoom', () => {
      socket.join('admin');
      // console.log('Admin joined admin room');
    });
    
    // Join user room
    socket.on('joinUserRoom', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        // console.log(`User ${userId} joined their room`);
      }
    });
    
    socket.on('disconnect', () => {
      // console.log('Client disconnected');
    });
  });
  
  // console.log('Socket.IO initialized');
} catch (error) {
  console.error('Failed to initialize Socket.IO:', error);
  // console.log('Continuing without Socket.IO');
}


export default app;