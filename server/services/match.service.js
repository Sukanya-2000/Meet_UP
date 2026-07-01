import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import Block from '../models/Block.js';
import Conversation from '../models/Conversation.js';

export const canonicalPair = (first, second) =>
  [String(first), String(second)].sort();

export const assertMatchMember = async (matchId, userId) => {
  const match = await Match.findOne({
    _id: matchId,
    status: 'active',
    $or: [{ user1: userId }, { user2: userId }],
  });
  if (!match) {
    const error = new Error('Active match not found');
    error.statusCode = 404;
    throw error;
  }
  const otherUserId = String(match.user1) === String(userId) ? match.user2 : match.user1;
  if (await Block.exists({
    $or: [
      { blockerId: userId, blockedUserId: otherUserId },
      { blockerId: otherUserId, blockedUserId: userId },
    ],
  })) {
    const error = new Error('This conversation is unavailable');
    error.statusCode = 403;
    throw error;
  }
  return match;
};

export const assertConversationMember = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, participants: userId, active: true });
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }
  const match = await assertMatchMember(conversation.matchId, userId);
  return { conversation, match };
};

export const getMatchView = async (match, currentUserId) => {
  const otherUserId = String(match.user1) === String(currentUserId) ? match.user2 : match.user1;
  const conversation = await Conversation.findOne({ matchId: match._id }).lean();
  const messageScope = { $or: [{ matchId: match._id }, ...(conversation ? [{ conversationId: conversation._id }] : [])] };
  const [profile, photo, lastMessage, unreadCount] = await Promise.all([
    Profile.findOne({ userId: otherUserId }).lean(),
    Photo.findOne({ userId: otherUserId, isMain: true }).lean(),
    Message.findOne(messageScope).sort({ createdAt: -1 }).lean(),
    Message.countDocuments({ ...messageScope, receiverId: currentUserId, readAt: null }),
  ]);
  return { ...match.toObject(), profile, photo, lastMessage, unreadCount, otherUserId, conversation };
};

export const getCelebrationView = async (match) => {
  const [profiles, photos] = await Promise.all([
    Profile.find({ userId: { $in: [match.user1, match.user2] } }).lean(),
    Photo.find({ userId: { $in: [match.user1, match.user2] }, isMain: true }).lean(),
  ]);
  const people = profiles.map((profile) => ({
    ...profile,
    photo: photos.find((photo) => String(photo.userId) === String(profile.userId)),
  }));
  const sharedInterests = people.length === 2
    ? people[0].interests.filter((interest) => people[1].interests.includes(interest))
    : [];
  return { ...match.toObject(), people, sharedInterests };
};
