import Notification from '../models/Notification.js';
import Profile from '../models/Profile.js';
import Report from '../models/Report.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import VerificationRequest from '../models/VerificationRequest.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import Match from '../models/Match.js';
import ProfilePrompt from '../models/ProfilePrompt.js';
import mongoose from 'mongoose';
import SystemSetting from '../models/SystemSetting.js';
import OpeningMove from '../models/OpeningMove.js';
import GameQuestion from '../models/GameQuestion.js';
import ModerationScan from '../models/ModerationScan.js';
const audit = (req, action, targetType, targetId, before, after) => AdminAuditLog.create({ actorId: req.user._id, action, targetType, targetId: String(targetId), before, after, ipAddress: req.ip || '' });

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
  const before = await User.findById(req.params.id).lean();
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
  await audit(req, 'user.status.update', 'User', user._id, { accountStatus: before?.accountStatus }, { accountStatus });
  res.json({ success: true, user });
};

export const listReports = async (_req, res) => {
  const reports = await Report.find().populate('reporterId', 'email').populate('reportedUserId', 'email').sort({ createdAt: -1 });
  res.json({ success: true, reports });
};

export const updateReport = async (req, res) => {
  const before = await Report.findById(req.params.id).lean();
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, reviewedBy: req.user._id },
    { new: true, runValidators: true },
  );
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  await audit(req, 'report.status.update', 'Report', report._id, { status: before?.status }, { status: report.status });
  res.json({ success: true, report });
};

export const listVerifications = async (_req, res) => {
  const requests = await VerificationRequest.find().populate('userId', 'email').sort({ createdAt: -1 });
  res.json({ success: true, requests });
};

export const reviewVerification = async (req, res) => {
  const before = await VerificationRequest.findById(req.params.id).lean();
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
    Profile.updateOne({ userId: request.userId }, { isVerified: request.status === 'approved', verificationLevel: request.status === 'approved' ? request.type : 'none' }),
    Notification.create({
      userId: request.userId,
      type: 'verification',
      title: `Verification ${request.status}`,
      body: request.status === 'approved' ? 'Your profile is now verified.' : 'Your verification request was not approved.',
    }),
  ]);
  request.history.push({ status: request.status, note: request.note, actorId: req.user._id }); await request.save();
  await audit(req, 'verification.review', 'VerificationRequest', request._id, { status: before?.status }, { status: request.status, note: request.note });
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
  await audit(req, 'subscription.admin.update', 'Subscription', subscription._id, null, { status: subscription.status, plan: subscription.plan });
  res.json({ success: true, subscription });
};

export const listAuditLogs = async (req, res) => {
  const logs = await AdminAuditLog.find().populate('actorId', 'email').sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, logs });
};
export const listUnmatched = async (_req, res) => res.json({ success: true, matches: await Match.find({ status: 'unmatched' }).populate('user1 user2', 'email').sort({ unmatchedAt: -1 }).limit(200) });
export const listPromptsForModeration = async (_req, res) => res.json({ success: true, prompts: await ProfilePrompt.find().populate('userId', 'email').sort({ createdAt: -1 }).limit(250) });
export const moderatePrompt = async (req, res) => { const before = await ProfilePrompt.findById(req.params.id).lean(); const prompt = await ProfilePrompt.findByIdAndUpdate(req.params.id, { moderationStatus: req.body.status, moderationNote: String(req.body.note || '') }, { new: true, runValidators: true }); if (!prompt) { res.status(404); throw new Error('Prompt not found'); } await audit(req, 'profile_prompt.moderate', 'ProfilePrompt', prompt._id, { status: before?.moderationStatus }, { status: prompt.moderationStatus, note: prompt.moderationNote }); res.json({ success: true, prompt }); };
export const getSettings = async (_req,res)=>res.json({success:true,settings:await SystemSetting.find().sort({key:1})});
export const updateSetting = async(req,res)=>{const before=await SystemSetting.findOne({key:req.params.key}).lean();const item=await SystemSetting.findOneAndUpdate({key:req.params.key},{key:req.params.key,value:req.body.value,description:String(req.body.description||''),updatedBy:req.user._id},{upsert:true,new:true,runValidators:true});await audit(req,'system_setting.update','SystemSetting',item._id,before?.value,item.value);res.json({success:true,setting:item});};
export const listOpeningMoves=async(_req,res)=>res.json({success:true,openingMoves:await OpeningMove.find().populate('userId','email').sort({createdAt:-1})});
export const moderateOpeningMove=async(req,res)=>{const move=await OpeningMove.findByIdAndUpdate(req.params.id,{moderationStatus:req.body.status,moderationNote:String(req.body.note||'')},{new:true,runValidators:true});if(!move){res.status(404);throw new Error('Opening Move not found');}await audit(req,'opening_move.moderate','OpeningMove',move._id,null,{status:move.moderationStatus});res.json({success:true,openingMove:move});};
export const listQuestions=async(_req,res)=>res.json({success:true,questions:await GameQuestion.find().sort({category:1,orderIndex:1})});
export const saveQuestion=async(req,res)=>{const id=req.params.id||new mongoose.Types.ObjectId();const item=await GameQuestion.findByIdAndUpdate(id,req.body,{upsert:true,new:true,runValidators:true});res.json({success:true,question:item});};
export const moderationQueue=async(_req,res)=>res.json({success:true,items:await ModerationScan.find({status:'queued'}).populate('userId','email').sort({createdAt:-1})});
