import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const router = express.Router();
import  {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getFeaturedProducts,
  getBestSellerProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload, videoUpload } from '../middleware/uploadMiddleware.js';

// Error handling wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create a custom middleware that combines image and video uploads
const productUpload = (req, res, next) => {
  // First handle image uploads
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 8 },
    { name: 'video', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return next(err);
    }
    next();
  });
};

// Public routes
router.get('/', asyncHandler(getProducts));
router.get('/categories', asyncHandler(getProductCategories));
router.get('/featured', asyncHandler(getFeaturedProducts));
router.get('/bestsellers', asyncHandler(getBestSellerProducts));
router.get('/slug/:slug', asyncHandler(getProductBySlug));
router.get('/:id', asyncHandler(getProductById));

// Protected admin routes
router.post('/', protect, admin, productUpload, asyncHandler(createProduct));
router.put('/:id', protect, admin, productUpload, asyncHandler(updateProduct));
router.delete('/:id', protect, admin, asyncHandler(deleteProduct));

// Image upload route
router.post('/upload', protect, admin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ image: imagePath });
}));

// Video upload route
router.post('/upload-video', protect, admin, videoUpload.single('video'), asyncHandler(async (req, res) => {
  console.log('Video upload request received');
  
  if (!req.file) {
    console.error('No video file in request');
    return res.status(400).json({ message: 'No video file uploaded' });
  }
  
  console.log('Video file details:', {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  });
  
  // Ensure the path starts with a forward slash
  const videoPath = `/uploads/${req.file.filename}`;
  console.log('Video path generated:', videoPath);
  
  // Get the server base URL
  const baseUrl = process.env.NODE_ENV === 'production'
    ? (process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`)
    : 'http://localhost:5000';
    
  // Construct the full URL
  const fullUrl = `${baseUrl}${videoPath}`;
  console.log('Full video URL:', fullUrl);
  
  // Verify the file exists and is accessible
  const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads', req.file.filename);
  console.log('Checking file at path:', filePath);
  
  if (fs.existsSync(filePath)) {
    console.log('File exists on disk');
    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size);
  } else {
    console.error('File does not exist on disk!');
  }
  
  // Return both the relative path and the full URL
  res.json({ 
    video: videoPath,
    fullVideoUrl: fullUrl
  });
}));

export default router;
