import express from 'express';
import * as mongoose from 'mongoose';
import cors from 'cors';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

// Load environment variables
dotenv.config();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS for real-time updates
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.IO connections
io.on('connection', (socket) => {
  // console.log('Client connected:', socket.id);
  
  // Join admin room if client is admin
  socket.on('joinAdminRoom', () => {
    socket.join('admin');
    // console.log(`Socket ${socket.id} joined admin room`);
  });
  
  // Join user room with their ID for personalized updates
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user-${userId}`);
    // console.log(`Socket ${socket.id} joined user room for user ${userId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible through app
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));
// console.log('Serving uploads from:', uploadsDir);

// Middleware to transform image URLs in responses to absolute URLs
app.use((req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(body) {
    if (!body || typeof body !== 'object') {
      return originalJson.call(this, body);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const transformImagePaths = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => transformImagePaths(item));
      }
      
      // Create a new object to avoid modifying the original
      const result = {};
      
      // Process each key in the object
      for (const key in obj) {
        if (key === 'image' && typeof obj[key] === 'string') {
          // Transform single image URL
          result[key] = obj[key].startsWith('/uploads/') && !obj[key].includes('://')
            ? `${baseUrl}${obj[key]}`
            : obj[key];
        } else if (key === 'images' && Array.isArray(obj[key])) {
          // Transform array of image URLs
          result[key] = obj[key].map(img => 
            typeof img === 'string' && img.startsWith('/uploads/') && !img.includes('://')
              ? `${baseUrl}${img}`
              : img
          );
        } else if (obj[key] && typeof obj[key] === 'object') {
          // Recursively transform nested objects
          result[key] = transformImagePaths(obj[key]);
        } else {
          // Copy other values as is
          result[key] = obj[key];
        }
      }
      
      return result;
    };
    
    try {
      const transformedBody = transformImagePaths(body);
      return originalJson.call(this, transformedBody);
    } catch (error) {
      console.error('[Image URL Transformer] Error:', error);
      return originalJson.call(this, body);
    }
  };
  
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// API root
app.get('/api', (req, res) => {
  res.send('API is running');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// In your backend routes
app.post('/products/upload', upload.single('image'), (req, res) => {
  // Handle image upload and return the URL
  res.json({ image: `/uploads/${req.file.filename}` });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
