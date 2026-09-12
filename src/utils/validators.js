// Validation utility helpers

// Validate email format using regex
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  return emailRegex.test(email.trim());
}

// Calculate password strength score and return suggestions
function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Weak', feedback: ['Password is required'] };
  }

  let score = 0;
  const feedback = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Must be at least 8 characters long');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add an uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add a lowercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add a number');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add a special character (!@#$%^&*)');
  }

  let label = 'Weak';
  if (score >= 4) label = 'Strong';
  else if (score >= 3) label = 'Good';
  else if (score >= 2) label = 'Fair';

  return { score, label, feedback };
}

// Sanitize text input by trimming and escaping HTML tags
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = {
  isValidEmail,
  evaluatePasswordStrength,
  sanitizeInput,
};
