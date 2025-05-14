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
    : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
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

// Serve uploaded files with proper MIME types
const uploadsPath = path.join(__dirname, 'uploads');
// console.log('Uploads directory path:', uploadsPath);

// Check if uploads directory exists, create it if not
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  // console.log('Created uploads directory');
}

// List files in uploads directory for debugging
try {
  const files = fs.readdirSync(uploadsPath);
  // console.log('Files in uploads directory:', files);
} catch (error) {
  console.error('Error reading uploads directory:', error);
}

// Add a specific route for video files to handle them properly
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsPath, filename);
  
  // console.log(`Request for file: ${filename}`);
  // console.log(`Full path: ${filepath}`);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    return res.status(404).send('File not found');
  }
  
  // Set appropriate content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.mp4') {
    contentType = 'video/mp4';
  } else if (ext === '.webm') {
    contentType = 'video/webm';
  } else if (ext === '.mov' || ext === '.qt') {
    contentType = 'video/quicktime';
  } else if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.webp') {
    contentType = 'image/webp';
  }
  
  // Set headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  // Stream the file
  const fileStream = fs.createReadStream(filepath);
  fileStream.pipe(res);
  
  fileStream.on('error', (error) => {
    console.error(`Error streaming file ${filepath}:`, error);
    if (!res.headersSent) {
      res.status(500).send('Error streaming file');
    }
  });
});

// Keep the static middleware as a fallback
app.use('/uploads', express.static(uploadsPath));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));

  // Any route that is not an API route will be directed to index.html
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
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
        ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
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
      console.log('Client disconnected');
    });
  });
  
  console.log('Socket.IO initialized');
} catch (error) {
  console.error('Failed to initialize Socket.IO:', error);
  console.log('Continuing without Socket.IO');
}
