
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect routes - verify token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if JWT_SECRET is defined
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ 
          message: 'Server configuration error', 
          error: 'JWT_SECRET is not defined' 
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token', 
          error: error.message 
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired', 
          error: error.message 
        });
      } else {
        return res.status(401).json({ 
          message: 'Not authorized, token failed', 
          error: error.message 
        });
      }
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export  { protect, admin };
