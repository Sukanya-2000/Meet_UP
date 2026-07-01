import DeviceToken from '../models/DeviceToken.js';
import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';

export const listNotifications = async (req, res) => {
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  const unread = await Notification.countDocuments({ userId: req.user._id, readAt: null });
  res.json({ success: true, notifications: items, unread });
};
export const markRead = async (req, res) => { await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { readAt: new Date() }); res.json({ success: true }); };
export const markAllRead = async (req, res) => { await Notification.updateMany({ userId: req.user._id, readAt: null }, { readAt: new Date() }); res.json({ success: true }); };
export const getPreferences = async (req, res) => res.json({ success: true, preferences: await NotificationPreference.findOneAndUpdate({ userId: req.user._id }, { $setOnInsert: { userId: req.user._id } }, { upsert: true, new: true }) });
export const updatePreferences = async (req, res) => {
  const allowed = ['push','email','inApp','matches','messages','likes','safety','marketing'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => allowed.includes(key) && typeof value === 'boolean'));
  res.json({ success: true, preferences: await NotificationPreference.findOneAndUpdate({ userId: req.user._id }, update, { upsert: true, new: true, runValidators: true }) });
};
export const registerDevice = async (req, res) => res.status(201).json({ success: true, device: await DeviceToken.findOneAndUpdate({ token: req.body.token }, { userId: req.user._id, token: req.body.token, platform: req.body.platform, enabled: true, lastSeenAt: new Date() }, { upsert: true, new: true, runValidators: true }) });
export const unregisterDevice = async (req, res) => { await DeviceToken.updateOne({ token: req.body.token, userId: req.user._id }, { enabled: false }); res.json({ success: true }); };
