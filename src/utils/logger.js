/**
 * Simple Console Logger.
 * Formats log messages with timestamps and severity levels.
 */

const logger = {
  info: (msg, meta = '') => {
    console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, meta ? meta : '');
  },
  error: (msg, meta = '') => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, meta ? meta : '');
  },
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${msg}`, meta ? meta : '');
    }
  },
};

module.exports = logger;
