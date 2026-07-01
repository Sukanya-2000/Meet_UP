import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Match from '../models/Match.js';
import { assertConversationMember, assertMatchMember, getMatchView } from '../services/match.service.js';
import ModerationScan from '../models/ModerationScan.js';
import { moderationProvider } from '../services/moderation-provider.service.js';
import Profile from '../models/Profile.js';
import OpeningMove from '../models/OpeningMove.js';

const fileKind = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('spreadsheet') || mimeType.includes('presentation')) return 'document';
  return 'file';
};

const toAttachment = (file) => ({
  url: `/uploads/chat/${file.filename}`,
  originalName: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  kind: fileKind(file.mimetype),
});

const resolveConversation = async (id, userId) => {
  const direct = await Conversation.findOne({ _id: id, participants: userId });
  if (direct) return { conversation: direct, match: await assertMatchMember(direct.matchId, userId) };
  const match = await assertMatchMember(id, userId);
  let conversation = await Conversation.findOne({ matchId: match._id });
  if (!conversation) {
    conversation = await Conversation.create({ matchId: match._id, participants: [match.user1, match.user2] });
    console.info('CONVERSATION_CREATED', { conversationId: String(conversation._id), matchId: String(match._id) });
  }
  return { conversation, match };
};

export const getConversations = async (req, res) => {
  const matches = await Match.find({
    status: 'active',
    $or: [{ user1: req.user._id }, { user2: req.user._id }],
  }).sort({ matchedAt: -1 });
  const conversations = await Promise.all(matches.map(async (match) => {
    let conversation = await Conversation.findOne({ matchId: match._id });
    if (!conversation) {
      conversation = await Conversation.create({ matchId: match._id, participants: [match.user1, match.user2] });
      console.info('CONVERSATION_CREATED', { conversationId: String(conversation._id), matchId: String(match._id) });
    }
    const view = await getMatchView(match, req.user._id);
    return { ...conversation.toObject(), match: view };
  }));
  res.json({ success: true, conversations });
};

export const getMessages = async (req, res) => {
  const { conversation, match } = await resolveConversation(req.params.matchId, req.user._id);
  await Message.updateMany(
    { $or: [{ conversationId: conversation._id }, { matchId: match._id }], receiverId: req.user._id, readAt: null },
    { readAt: new Date(), deliveredAt: new Date() },
  );
  const messages = await Message.find({ $or: [{ conversationId: conversation._id }, { matchId: match._id }] }).sort({ createdAt: 1 }).limit(500);
  res.json({ success: true, match, conversation, messages });
};

export const createMessage = async (req, res) => {
  const { matchId, conversationId, message, text, openingMoveId } = req.body;
  const body = text || message;
  if (!body?.trim()) {
    res.status(400);
    throw new Error('Message cannot be empty');
  }
  const { conversation, match } = conversationId
    ? await assertConversationMember(conversationId, req.user._id)
    : await resolveConversation(matchId, req.user._id);
  const scan = await moderationProvider.scan({ text: body, targetType: 'message' });
  await ModerationScan.create({ userId: req.user._id, targetType: 'message', targetId: String(conversation._id), ...scan, status: scan.action === 'allow' ? 'completed' : 'queued' });
  if (scan.action === 'warn' && req.body.confirmModerationWarning !== true) return res.status(422).json({ success: false, warning: true, categories: scan.categories, message: 'Review this message before sending.' });
  const receiverId = String(match.user1) === String(req.user._id) ? match.user2 : match.user1;
  if (!match.firstMessageSentAt && match.firstMoveRule === 'women-first') { const sender = await Profile.findOne({ userId: req.user._id }).select('gender'); if (sender?.gender !== 'woman') { res.status(403); throw new Error('This match uses Women First messaging'); } }
  if (!match.firstMessageSentAt && match.firstMoveRule === 'opening-move' && !(await OpeningMove.exists({ _id: openingMoveId, userId: receiverId, enabled: true, moderationStatus: 'approved' }))) { res.status(403); throw new Error('Reply to an approved Opening Move to begin'); }
  const created = await Message.create({
    matchId: match._id,
    conversationId: conversation._id,
    senderId: req.user._id,
    receiverId,
    message: body.trim(),
    text: body.trim(),
    deliveredAt: null,
  });
  if (!match.firstMessageSentAt) { match.firstMessageSentAt = new Date(); await match.save(); }
  res.status(201).json({ success: true, message: created });
};

export const uploadMessageMedia = async (req, res) => {
  const { conversationId, matchId, text = '' } = req.body;
  const files = req.files || [];
  if (!files.length && !text.trim()) {
    res.status(400);
    throw new Error('Add a message or at least one media file');
  }
  const { conversation, match } = conversationId
    ? await assertConversationMember(conversationId, req.user._id)
    : await resolveConversation(matchId, req.user._id);
  const receiverId = String(match.user1) === String(req.user._id) ? match.user2 : match.user1;
  const created = await Message.create({
    matchId: match._id,
    conversationId: conversation._id,
    senderId: req.user._id,
    receiverId,
    message: text.trim() || '[Media]',
    text: text.trim(),
    attachments: files.map((file) => toAttachment(file, req)),
    deliveredAt: null,
  });
  req.app.get('io')?.to(`match:${match._id}`).to(`conversation:${conversation._id}`).emit('message:new', created);
  res.status(201).json({ success: true, message: created });
};
