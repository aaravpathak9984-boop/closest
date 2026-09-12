/**
 * HTTP Server Listener Boot Script.
 * Connected to MongoDB Atlas Cloud Cluster0 [DB: closest] with debounced search & password visibility.
 */
const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

// Connect to Database and start server
async function startServer() {
  await connectDB();

  let currentPort = port;

  const listenOnPort = (p) => {
    const server = app.listen(p, () => {
      logger.info(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${p}`);
      logger.info(` Local Access: http://localhost:${p}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Port ${p} is already in use. Retrying on port ${p + 1}...`);
        setTimeout(() => listenOnPort(p + 1), 500);
      } else {
        logger.error('Server error:', err);
      }
    });

    const handleExit = (signal) => {
      logger.warn(`Received ${signal}. Shutting down server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleExit('SIGINT'));
    process.on('SIGTERM', () => handleExit('SIGTERM'));
  };

  listenOnPort(currentPort);

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
  });
}

startServer();
