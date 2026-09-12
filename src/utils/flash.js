/**
 * Flash Notification Helper for Express Session & EJS views.
 * Allows setting error, success, and info messages across redirects.
 */

function setFlash(req, type, message) {
  if (!req.session) return;
  req.session.flash = req.session.flash || {};
  req.session.flash[type] = message;
}

function getAndClearFlash(req) {
  if (!req.session || !req.session.flash) {
    return { success: null, error: null, info: null };
  }
  const flashMessages = { ...req.session.flash };
  delete req.session.flash;
  return flashMessages;
}

module.exports = {
  setFlash,
  getAndClearFlash,
};
