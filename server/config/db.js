import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.warn('Warning: MONGO_URI is not defined in environment variables');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Add connection options for better reliability
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit the process, let the server continue running
    // process.exit(1);
  }
};

export default connectDB;