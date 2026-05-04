const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Handle Multer upload errors gracefully
  if (err.name === 'MulterError') {
    statusCode = 400; // Bad Request
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'הקובץ גדול מדי. הגודל המקסימלי לכל תמונה הוא 5MB.';
    }
  } else if (err.message === 'Only image files are allowed!') {
    statusCode = 400;
  }
  
  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
