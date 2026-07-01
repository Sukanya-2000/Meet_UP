import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { normalizeEmail, validateEmail, validatePassword } from '../utils/validation.js';
import crypto from 'crypto';
import PasswordResetToken from '../models/PasswordResetToken.js';
import UserSession from '../models/UserSession.js';
import SecurityEvent from '../models/SecurityEvent.js';
import { createSession, revokeSession, rotateSession } from '../services/session.service.js';

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
  const session = await createSession(user._id, req);
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user._id),
    ...session,
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
    await SecurityEvent.create({ userId: user?._id || null, type: 'login_failed', severity: 'warning', ipAddress: req.ip, userAgent: req.get('user-agent') || '', metadata: { email } });
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.accountStatus !== 'active') {
    res.status(403);
    throw new Error('This account is not active');
  }

  const session = await createSession(user._id, req);
  await SecurityEvent.create({ userId: user._id, type: 'login_success', severity: 'info', ipAddress: req.ip, userAgent: req.get('user-agent') || '' });
  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    ...session,
    user: publicUser(user),
  });
};

export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!validateEmail(email)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }

  const user = await User.findOne({ email });
  let developmentResetToken;
  if (user) {
    const raw = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60000) });
    if (process.env.NODE_ENV !== 'production') developmentResetToken = raw;
  }
  res.json({
    success: true,
    message: 'If an account exists for that email, password reset instructions will be sent.',
    ...(developmentResetToken ? { developmentResetToken } : {}),
  });
};

export const resetPassword = async (req, res) => {
  const error = validatePassword(req.body.password);
  if (error) { res.status(400); throw new Error(error); }
  const tokenHash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
  const reset = await PasswordResetToken.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: new Date() } });
  if (!reset) { res.status(400); throw new Error('Reset link is invalid or expired'); }
  const user = await User.findById(reset.userId).select('+password'); user.password = req.body.password; await user.save();
  await UserSession.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
  reset.usedAt = new Date(); await reset.save();
  res.json({ success: true, message: 'Password updated successfully' });
};
export const refreshSession = async (req,res)=>{const rotated=await rotateSession(req.body.refreshToken||'',req);if(!rotated){res.status(401);throw new Error('Refresh session is invalid or expired');}const user=await User.findById(rotated.userId);if(!user||user.accountStatus!=='active'){res.status(401);throw new Error('Account unavailable');}res.json({success:true,token:generateToken(user._id),refreshToken:rotated.refreshToken,expiresAt:rotated.expiresAt,user:publicUser(user)});};
export const logoutSession = async(req,res)=>{if(req.body.refreshToken)await revokeSession(req.body.refreshToken);res.json({success:true});};
export const listSessions=async(req,res)=>res.json({success:true,sessions:await UserSession.find({userId:req.user._id,revokedAt:null,expiresAt:{$gt:new Date()}}).select('-tokenHash').sort({lastUsedAt:-1})});
export const revokeSessionById=async(req,res)=>{await UserSession.updateOne({_id:req.params.id,userId:req.user._id},{revokedAt:new Date()});res.json({success:true});};
