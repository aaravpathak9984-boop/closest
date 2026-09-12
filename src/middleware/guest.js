/**
 * Guest Middleware (guest).
 * Redirects already-authenticated users away from public auth pages (login, signup) to /dashboard.
 */

function guest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = {
  guest,
};
