export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  let status = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  }
  if (error.code === 11000) {
    status = 409;
    message = 'A record with these details already exists';
  }
  if (error.name === 'MulterError') {
    status = 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Each photo must be smaller than 5 MB' : error.message;
  }

  if (status >= 500) console.error(error.stack || error);
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
