/**
 * MongoDB Atlas Connection Configuration via Mongoose.
 * 
 * Flow:
 * Atlas Account -> Project -> Cluster -> Database User -> Network/IP Access
 *   -> Connection String -> MONGODB_URI -> Mongoose -> MongoDB
 */
const mongoose = require('mongoose');

// Helper to sanitize connection strings in log outputs to prevent password leakage
function sanitizeConnectionString(uri) {
  if (!uri) return '';
  return uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  // Validate existence of MONGODB_URI; fail fast if missing
  if (!mongoUri) {
    console.error(' MongoDB Connection Error: MONGODB_URI is not defined in environment variables.');
    console.error('Please add MONGODB_URI to your .env file.');
    process.exit(1);
  }

  const sanitizedUri = sanitizeConnectionString(mongoUri);

  try {
    // Connect to MongoDB via Mongoose with standard timeout options
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log(` MongoDB Connected Successfully: ${conn.connection.host} [DB: ${conn.connection.name}]`);
    console.log(` Target URI: ${sanitizedUri}`);
  } catch (error) {
    console.error('\n================================================================');
    console.error(' ⚠️ Primary MongoDB Connection Failed!');
    console.error(` Sanitized Target: ${sanitizedUri}`);
    console.error(` Error Details: ${error.message}`);
    console.error('----------------------------------------------------------------');

    if (mongoUri.includes('cluster0') || mongoUri.includes('mongodb+srv')) {
      console.warn('⚡ Attempting Automatic Fallback to Local MongoDB (mongodb://127.0.0.1:27017/closest)...');
      try {
        const localUri = 'mongodb://127.0.0.1:27017/closest';
        const fallbackConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✓ Local MongoDB Fallback Connected: ${fallbackConn.connection.host} [DB: ${fallbackConn.connection.name}]`);
        return;
      } catch (fallbackErr) {
        console.error('❌ Local MongoDB Fallback also failed:', fallbackErr.message);
      }
    }

    console.error('💡 TO CONNECT TO ATLAS CLOUD:');
    console.error('   1. Verify your database password in Atlas -> Database Access.');
    console.error('   2. Verify Network Access in Atlas -> Add IP Address 0.0.0.0/0.');
    console.error('================================================================\n');

    if (process.env.NODE_ENV === 'production') {
      console.error(' Stopping application boot process (Production Mode).');
      process.exit(1);
    }
  }
}

module.exports = connectDB;
