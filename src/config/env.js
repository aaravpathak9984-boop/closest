/**
 * Environment configuration loader and validator.
 * Validates mandatory environment variables before boot to fail fast with helpful messages.
 */
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];

function validateEnv() {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.error(' Critical Error: Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error('Please configure your .env file before starting the application.');
    process.exit(1);
  }
}

// Perform validation on module load
validateEnv();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret',
  appName: process.env.APP_NAME || 'MediClinic Care',
  isProduction: process.env.NODE_ENV === 'production',
};
