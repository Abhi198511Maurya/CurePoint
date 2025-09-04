const errorHandler = (err, req, res, next) => {
  res.json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
