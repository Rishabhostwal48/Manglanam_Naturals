// const express = require('express');
import express from 'express';
const router = express.Router();
import  {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

// Handle file uploads for product images
const productUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 8 },
]);

// Public routes
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Protected admin routes
router.post('/', protect, admin, productUpload, createProduct);
router.put('/:id', protect, admin, productUpload, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Image upload route
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ image: imagePath });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

export default router;
