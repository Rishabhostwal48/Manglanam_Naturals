import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
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
app.use(cors());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Uploads directory path:', path.join(__dirname, 'uploads'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));
      
  // Any route that is not an API route will be directed to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
        } else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
  
  // In development, handle non-API routes that aren't found
  app.get('*', (req, res, next) => {
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
