/**
 * Express Rate Limiter Middleware.
 * Prevents brute-force attacks on sensitive endpoints like login and signup.
 */
const rateLimit = require('express-rate-limit');
const { rateLimits } = require('../config/appConfig');

const authRateLimiter = rateLimit({
  windowMs: rateLimits.authWindowMs,
  max: rateLimits.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(429).json(options.message);
    }
    res.status(429).render('errors/error', {
      title: '429 - Too Many Requests',
      message: 'Too many login or registration attempts. Please wait 15 minutes before trying again.',
    });
  },
});

const apiRateLimiter = rateLimit({
  windowMs: rateLimits.apiWindowMs,
  max: rateLimits.apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'API rate limit exceeded. Please slow down your requests.',
  },
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
};
