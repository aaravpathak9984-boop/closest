/**
 * 404 Not Found Middleware.
 * Captures requests to non-existent endpoints and renders 404 error page.
 */

function notFound(req, res, next) {
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: `Resource not found: ${req.originalUrl}`,
    });
  }

  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    path: req.originalUrl,
  });
}

module.exports = notFound;
