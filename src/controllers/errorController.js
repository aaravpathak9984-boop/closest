/**
 * Error Controller for rendering 404 and 500 error pages directly if requested.
 */

const getNotFoundPage = (req, res) => {
  res.status(404).render('errors/404', {
    title: '404 - Page Not Found',
    path: req.originalUrl,
  });
};

const getServerErrorPage = (req, res) => {
  res.status(500).render('errors/500', {
    title: '500 - Server Error',
    message: 'Internal server error',
    stack: null,
  });
};

module.exports = {
  getNotFoundPage,
  getServerErrorPage,
};
