/**
 * Authentication Controller.
 * Handles rendering login, signup, and forgot password pages, processing registration & login,
 * server-side form validation, error retention, and logout.
 */
const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const { isValidEmail, evaluatePasswordStrength } = require('../utils/validators');
const { setFlash } = require('../utils/flash');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /login - Render login form
 */
const showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Log In',
    errors: {},
    values: {},
  });
};

/**
 * GET /signup - Render signup form
 */
const showSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Create Account',
    errors: {},
    values: {},
  });
};

/**
 * GET /forgot-password - Render forgot password page (extension point)
 */
const showForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
  });
};

const Doctor = require('../models/Doctor');

/**
 * POST /auth/signup - Process user registration
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role, specialization } = req.body;
  const errors = {};
  const values = {
    name: name ? name.trim() : '',
    email: email ? email.trim().toLowerCase() : '',
    role: role || 'patient',
    specialization: specialization || 'General Medicine',
  };

  // Server-side validation
  if (!name || name.trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters.';
  } else if (name.trim().length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const selectedRole = role === 'doctor' ? 'doctor' : 'patient';

  // If validation fails, re-render form with field errors and retained safe values
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('auth/signup', {
      title: 'Create Account',
      errors,
      values,
    });
  }

  try {
    const user = await authService.registerUser({
      name,
      email,
      password,
      role: selectedRole,
    });

    // If registered as Doctor, create associated Doctor profile (pending verification)
    if (user.role === 'doctor') {
      await Doctor.create({
        user: user._id,
        name: user.name,
        specialization: specialization ? specialization.trim() : 'General Medicine',
        qualification: 'MBBS',
        experienceYears: 5,
        consultationFee: 500,
        bio: `Dr. ${user.name} is a specialist in ${specialization || 'General Medicine'}.`,
        workingHours: { start: '09:00', end: '17:00', slotDurationMinutes: 30 },
        isVerified: false,
        verificationStatus: 'pending',
      });
    }

    // Automatically create session after signup
    tokenService.createSession(req, user);
    if (user.role === 'doctor') {
      setFlash(req, 'info', `Welcome, Dr. ${user.name}! Your doctor application is submitted and pending admin verification by aaravpathak9984@gmail.com.`);
      return res.redirect('/appointments/doctor-queue');
    }

    setFlash(req, 'success', `Welcome, ${user.name}! Your ${user.role} account has been created.`);
    return res.redirect('/dashboard');
  } catch (error) {
    if (error.field === 'email') {
      errors.email = error.message;
      return res.status(400).render('auth/signup', {
        title: 'Create Account',
        errors,
        values,
      });
    }
    throw error;
  }
});

/**
 * POST /auth/login - Process user authentication
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const errors = {};
  const values = { email: email ? email.trim().toLowerCase() : '' };

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('auth/login', {
      title: 'Log In',
      errors,
      values,
    });
  }

  try {
    const user = await authService.loginUser(email, password);
    tokenService.createSession(req, user);
    setFlash(req, 'success', `Welcome back, ${user.name}!`);
    return res.redirect('/dashboard');
  } catch (error) {
    // Generic error message on authentication failure to prevent account enumeration
    setFlash(req, 'error', 'Invalid email or password.');
    return res.status(401).render('auth/login', {
      title: 'Log In',
      errors: { general: 'Invalid email or password.' },
      values,
    });
  }
});

/**
 * POST /auth/logout or GET /logout - Destroy session and log out user
 */
const logout = asyncHandler(async (req, res) => {
  await tokenService.destroySession(req);
  res.clearCookie('connect.sid');
  res.redirect('/login?logout=success');
});

module.exports = {
  showLogin,
  showSignup,
  showForgotPassword,
  signup,
  login,
  logout,
};
