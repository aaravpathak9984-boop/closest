/**
 * Application Constants and Centralized Configurations.
 */
module.exports = {
  appName: process.env.APP_NAME || 'Hackathon Starter',
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },
  roles: {
    USER: 'user',
    ADMIN: 'admin',
  },
  passwordRules: {
    minLength: 8,
  },
  rateLimits: {
    authWindowMs: 15 * 60 * 1000, // 15 minutes
    authMax: 30, // Limit each IP to 30 auth requests per window
    apiWindowMs: 15 * 60 * 1000,
    apiMax: 100,
  },
};
