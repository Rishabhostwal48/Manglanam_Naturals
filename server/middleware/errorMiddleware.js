
// Handle 404 errors
const notFound = (req, res, next) => {
  // Skip for static files that might be handled by express.static
  if (req.url.includes('.')) {
    return next();
  }
  
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Handle all other errors
const errorHandler = (err, req, res, next) => {
  // Get appropriate status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error for debugging
  console.error(`Error: ${statusCode} - ${err.message}`);
  if (err.stack) {
    console.error(`Stack: ${err.stack}`);
  }
  
  // Send response
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    // Include more details for MongoDB errors
    ...(err.name === 'MongoError' || err.name === 'MongoServerError' ? {
      code: err.code,
      mongoError: true
    } : {})
  });
};

export { notFound, errorHandler };
