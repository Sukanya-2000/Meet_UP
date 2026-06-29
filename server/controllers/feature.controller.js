import crypto from 'crypto';
import mongoose from 'mongoose';
import DatePlan from '../models/DatePlan.js';
import DoubleDateGroup from '../models/DoubleDateGroup.js';
import Match from '../models/Match.js';
import MatchmakerSession from '../models/MatchmakerSession.js';

const objectId = (value, field) => {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${field}`);
    error.statusCode = 400;
    throw error;
  }
  return value;
};

const ownsMatch = async (matchId, userId) => Match.exists({
  _id: objectId(matchId, 'matchId'),
  status: 'active',
  $or: [{ user1: userId }, { user2: userId }],
});

export const getDoubleDateGroup = async (req, res) => {
  const group = await DoubleDateGroup.findOne({ ownerUserId: req.user._id }).lean();
  res.json({ success: true, group });
};

export const saveDoubleDateGroup = async (req, res) => {
  const memberUserIds = [...new Set((req.body.memberUserIds || []).map(String))]
    .filter((id) => id !== String(req.user._id))
    .map((id) => objectId(id, 'memberUserIds'))
    .slice(0, 3);
  const allowedStatus = ['draft', 'active', 'paused'];
  const status = allowedStatus.includes(req.body.status) ? req.body.status : 'draft';
  const preferences = req.body.preferences || {};
  const ageMin = Math.max(18, Math.min(100, Number(preferences.ageMin) || 18));
  const ageMax = Math.max(ageMin, Math.min(100, Number(preferences.ageMax) || 60));
  const genderPreference = ['man', 'woman', 'everyone'].includes(preferences.genderPreference)
    ? preferences.genderPreference
    : 'everyone';

  const group = await DoubleDateGroup.findOneAndUpdate(
    { ownerUserId: req.user._id },
    { memberUserIds, status, preferences: { ageMin, ageMax, genderPreference } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.json({ success: true, group });
};

export const createMatchmakerSession = async (req, res) => {
  await MatchmakerSession.updateMany(
    { ownerUserId: req.user._id, status: 'active' },
    { $set: { status: 'closed' } },
  );
  const session = await MatchmakerSession.create({
    ownerUserId: req.user._id,
    inviteCode: crypto.randomBytes(6).toString('base64url'),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  res.status(201).json({ success: true, session });
};

export const getMatchmakerSession = async (req, res) => {
  const session = await MatchmakerSession.findOne({ ownerUserId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, session });
};

export const listDatePlans = async (req, res) => {
  const plans = await DatePlan.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, plans });
};

export const createDatePlan = async (req, res) => {
  if (req.body.matchId && !(await ownsMatch(req.body.matchId, req.user._id))) {
    res.status(404);
    throw new Error('Active match not found');
  }
  const plan = await DatePlan.create({
    userId: req.user._id,
    matchId: req.body.matchId || undefined,
    venue: req.body.venue,
    scheduledFor: req.body.scheduledFor,
    trustedContacts: (req.body.trustedContacts || []).slice(0, 5),
    shareToken: crypto.randomBytes(18).toString('base64url'),
    status: req.body.status === 'shared' ? 'shared' : 'draft',
  });
  res.status(201).json({ success: true, plan });
};

export const updateDatePlan = async (req, res) => {
  const allowed = ['venue', 'scheduledFor', 'trustedContacts', 'status'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (update.trustedContacts) update.trustedContacts = update.trustedContacts.slice(0, 5);
  const plan = await DatePlan.findOneAndUpdate(
    { _id: objectId(req.params.id, 'date plan id'), userId: req.user._id },
    update,
    { new: true, runValidators: true },
  );
  if (!plan) {
    res.status(404);
    throw new Error('Date plan not found');
  }
  res.json({ success: true, plan });
};
