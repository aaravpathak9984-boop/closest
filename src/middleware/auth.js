/**
 * Authentication Enforcement Middleware (requireAuth).
 * 
 * Server-side security check. Reject access to protected routes if user is not authenticated.
 * Never relies on client-side state or hidden UI elements.
 */
const { setFlash } = require('../utils/flash');

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    // Attach user to req and res.locals for template access
    req.user = req.session.user;
    res.locals.currentUser = req.session.user;
    return next();
  }

  // Handle API vs Web requests
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
  }

  // Web request: set flash notice and redirect to login page
  setFlash(req, 'error', 'Please log in to access this page.');
  return res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    req.user = req.session.user;
    res.locals.currentUser = req.session.user;
    return next();
  }

  setFlash(req, 'error', 'Access denied. Clinic Master Admin privilege required.');
  return res.redirect('/dashboard');
}

module.exports = {
  requireAuth,
  requireAdmin,
};
