import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { normalizeEmail, validateEmail, validatePassword } from '../utils/validation.js';

const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  accountStatus: user.accountStatus,
  isPremium: user.isPremium,
});

export const register = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    res.status(400);
    throw new Error(passwordError);
  }

  if (await User.exists({ email })) {
    res.status(409);
    throw new Error('This email is already registered. Please log in instead.');
  }

  const user = await User.create({ email, password });
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user._id),
    user: publicUser(user),
  });
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.accountStatus !== 'active') {
    res.status(403);
    throw new Error('This account is not active');
  }

  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: publicUser(user),
  });
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!validateEmail(email)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }

  // Phase 1 deliberately does not send email or persist reset tokens.
  // This neutral response prevents account enumeration.
  res.json({
    success: true,
    message: 'If an account exists for that email, password reset instructions will be sent.',
  });
};
