import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Upload image
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Upload video
router.post('/video', protect, admin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Video upload failed', error: error.message });
  }
});

export default router;
