/**
 * Global Express Error Handling Middleware.
 * Catches unhandled application errors, suppresses stack traces in production,
 * and renders user-friendly error views or returns JSON responses.
 */
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Log error internally with stack trace
  logger.error(`[${statusCode}] ${message}`, err.stack);

  // Return JSON response for API or AJAX requests
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.path.startsWith('/api')) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
  }

  // Web response: render 500 EJS template
  res.status(statusCode).render('errors/500', {
    title: '500 - Server Error',
    statusCode,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred on our server. Please try again later.'
      : message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
}

module.exports = errorHandler;
