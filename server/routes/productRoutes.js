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
  getProductsByIds,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

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
router.get('/id/:id', asyncHandler(getProductById));
router.get('/slug/:slug', asyncHandler(getProductBySlug));
router.get('/featured', asyncHandler(getFeaturedProducts));
router.get('/bestsellers', asyncHandler(getBestSellerProducts));
router.get('/by-ids', asyncHandler(getProductsByIds));
router.get('/categories', asyncHandler(getProductCategories));

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


export default router;
