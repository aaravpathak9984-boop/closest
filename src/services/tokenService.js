// Session & Token Service
const crypto = require('crypto');

class TokenService {
  // Initialize user session data upon login/signup
  createSession(req, user) {
    if (!req.session) return;
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  // Destroy current session on logout
  destroySession(req) {
    return new Promise((resolve, reject) => {
      if (!req.session) return resolve(true);
      req.session.destroy((err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  // Generate random token for extension points
  generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new TokenService();
