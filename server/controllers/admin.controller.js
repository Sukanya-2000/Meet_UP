import Notification from '../models/Notification.js';
import Profile from '../models/Profile.js';
import Report from '../models/Report.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import VerificationRequest from '../models/VerificationRequest.js';

export const dashboard = async (_req, res) => {
  const [users, activeUsers, premium, reports, pendingVerifications] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: 'active' }),
    Subscription.countDocuments({ plan: 'premium', status: 'active' }),
    Report.countDocuments({ status: { $in: ['open', 'reviewing'] } }),
    VerificationRequest.countDocuments({ status: 'pending' }),
  ]);
  res.json({ success: true, stats: { users, activeUsers, premium, reports, pendingVerifications } });
};

export const listUsers = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 25;
  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(),
  ]);
  const profiles = await Profile.find({ userId: { $in: users.map((user) => user._id) } }).lean();
  res.json({
    success: true,
    users: users.map((user) => ({ ...user, profile: profiles.find((profile) => String(profile.userId) === String(user._id)) })),
    pagination: { page, total, pages: Math.ceil(total / limit) },
  });
};

export const updateUserStatus = async (req, res) => {
  const { accountStatus } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { accountStatus }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await Notification.create({
    userId: user._id,
    type: 'moderation',
    title: 'Account status updated',
    body: `Your account status is now ${accountStatus}.`,
  });
  res.json({ success: true, user });
};

export const listReports = async (_req, res) => {
  const reports = await Report.find().populate('reporterId', 'email').populate('reportedUserId', 'email').sort({ createdAt: -1 });
  res.json({ success: true, reports });
};

export const updateReport = async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, reviewedBy: req.user._id },
    { new: true, runValidators: true },
  );
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  res.json({ success: true, report });
};

export const listVerifications = async (_req, res) => {
  const requests = await VerificationRequest.find().populate('userId', 'email').sort({ createdAt: -1 });
  res.json({ success: true, requests });
};

export const reviewVerification = async (req, res) => {
  const request = await VerificationRequest.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, note: req.body.note || '', reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true, runValidators: true },
  );
  if (!request) {
    res.status(404);
    throw new Error('Verification request not found');
  }
  await Promise.all([
    Profile.updateOne({ userId: request.userId }, { isVerified: request.status === 'approved' }),
    Notification.create({
      userId: request.userId,
      type: 'verification',
      title: `Verification ${request.status}`,
      body: request.status === 'approved' ? 'Your profile is now verified.' : 'Your verification request was not approved.',
    }),
  ]);
  res.json({ success: true, request });
};

export const managePremium = async (req, res) => {
  const active = req.body.status === 'active';
  const subscription = await Subscription.findOneAndUpdate(
    { userId: req.params.id },
    {
      userId: req.params.id,
      plan: active ? 'premium' : 'free',
      status: active ? 'active' : 'cancelled',
      provider: 'admin',
      currentPeriodStart: active ? new Date() : null,
      currentPeriodEnd: active ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      boostsRemaining: active ? 3 : 0,
    },
    { upsert: true, new: true, runValidators: true },
  );
  res.json({ success: true, subscription });
};
