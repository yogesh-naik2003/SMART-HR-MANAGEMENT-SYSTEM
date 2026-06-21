const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught:", err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only send stack trace if we are not in production
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;