import Block from '../models/Block.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import SafetyCheckIn from '../models/SafetyCheckIn.js';
import { calculateTrust } from '../services/trust.service.js';

export const blockUser = async (req, res) => {
  const { blockedUserId, reason = '' } = req.body;
  if (!blockedUserId || String(blockedUserId) === String(req.user._id)) {
    res.status(400);
    throw new Error('Select a valid user to block');
  }
  const block = await Block.findOneAndUpdate(
    { blockerId: req.user._id, blockedUserId },
    { blockerId: req.user._id, blockedUserId, reason },
    { upsert: true, new: true, runValidators: true },
  );
  await Match.updateMany(
    { $or: [{ user1: req.user._id, user2: blockedUserId }, { user1: blockedUserId, user2: req.user._id }] },
    { status: 'unmatched' },
  );
  res.status(201).json({ success: true, message: 'User blocked', block });
};

export const unblockUser = async (req, res) => {
  await Block.deleteOne({ blockerId: req.user._id, blockedUserId: req.params.userId });
  res.json({ success: true, message: 'User unblocked' });
};

export const listBlocked = async (req, res) => {
  const blocks = await Block.find({ blockerId: req.user._id })
    .populate('blockedUserId', 'email')
    .sort({ createdAt: -1 });
  res.json({ success: true, blocks });
};

export const reportAndOptionallyBlock = async (req, res) => {
  const { reportedUserId, reason, details = '', block = false } = req.body;
  if (!reportedUserId || String(reportedUserId) === String(req.user._id)) {
    res.status(400);
    throw new Error('Select a valid user to report');
  }
  const report = await Report.create({
    reporterId: req.user._id,
    reportedUserId,
    reason,
    details,
  });
  if (block) {
    await Block.findOneAndUpdate(
      { blockerId: req.user._id, blockedUserId: reportedUserId },
      { blockerId: req.user._id, blockedUserId: reportedUserId, reason },
      { upsert: true },
    );
    await Match.updateMany(
      { $or: [{ user1: req.user._id, user2: reportedUserId }, { user1: reportedUserId, user2: req.user._id }] },
      { status: 'unmatched' },
    );
  }
  await calculateTrust(reportedUserId);
  res.status(201).json({ success: true, message: block ? 'Report submitted and user blocked' : 'Report submitted', report });
};

export const createCheckIn = async (req, res) => {
  const { matchId, scheduledFor, venue, trustedContactName = '', trustedContactPhone = '' } = req.body;
  const schedule = new Date(scheduledFor);
  if (Number.isNaN(schedule.getTime()) || schedule <= new Date()) {
    res.status(400);
    throw new Error('Choose a future check-in time');
  }
  if (matchId && !(await Match.exists({ _id: matchId, status: 'active', $or: [{ user1: req.user._id }, { user2: req.user._id }] }))) {
    res.status(404);
    throw new Error('Active match not found');
  }
  const checkIn = await SafetyCheckIn.create({
    userId: req.user._id,
    matchId: matchId || null,
    scheduledFor: schedule,
    venue,
    trustedContactName,
    trustedContactPhone,
  });
  res.status(201).json({ success: true, message: 'Safety check-in scheduled', checkIn });
};

export const listCheckIns = async (req, res) => {
  await SafetyCheckIn.updateMany(
    { userId: req.user._id, status: 'scheduled', scheduledFor: { $lt: new Date() } },
    { status: 'overdue' },
  );
  const checkIns = await SafetyCheckIn.find({ userId: req.user._id }).sort({ scheduledFor: -1 });
  res.json({ success: true, checkIns });
};

export const updateCheckIn = async (req, res) => {
  const { status } = req.body;
  const checkIn = await SafetyCheckIn.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status, checkedInAt: ['safe', 'needs-help'].includes(status) ? new Date() : null },
    { new: true, runValidators: true },
  );
  if (!checkIn) {
    res.status(404);
    throw new Error('Check-in not found');
  }
  if (status === 'needs-help') {
    await Notification.create({
      userId: req.user._id,
      type: 'moderation',
      title: 'Safety support requested',
      body: 'Your safety alert was recorded. Contact local emergency services if you are in immediate danger.',
      data: { checkInId: checkIn._id },
    });
  }
  res.json({ success: true, message: `Check-in marked ${status}`, checkIn });
};

export const getMyTrust = async (req, res) => {
  const trust = await calculateTrust(req.user._id);
  res.json({ success: true, trust });
};
