import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials not configured:', {
    keyId: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
    keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
  });
  throw new Error('Razorpay credentials are missing. Please check your environment variables.');
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default razorpay; 