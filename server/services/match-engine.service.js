import Conversation from '../models/Conversation.js';
import Like from '../models/Like.js';
import Match from '../models/Match.js';
import { canonicalPair, getCelebrationView } from './match.service.js';

export const createMatchIfMutual = async ({ fromUser, toUser, forceMutual = false }) => {
  const reciprocal = forceMutual || await Like.exists({
    fromUser: toUser,
    toUser: fromUser,
    status: { $ne: 'passed' },
  });
  if (!reciprocal) return { matched: false, isNewMatch: false, match: null, conversation: null };

  console.info('MUTUAL_LIKE_FOUND', { fromUser: String(fromUser), toUser: String(toUser) });
  const [user1, user2] = canonicalPair(fromUser, toUser);
  let match = await Match.findOne({ user1, user2 });
  let isNewMatch = false;

  if (!match) {
    try {
      match = await Match.create({ user1, user2, status: 'active', matchedAt: new Date() });
      isNewMatch = true;
      console.info('MATCH_CREATED', { matchId: String(match._id), user1, user2 });
    } catch (error) {
      if (error.code !== 11000) throw error;
      match = await Match.findOne({ user1, user2 });
    }
  } else if (match.status !== 'active') {
    match.status = 'active';
    match.matchedAt = new Date();
    await match.save();
    isNewMatch = true;
    console.info('MATCH_CREATED', { matchId: String(match._id), user1, user2, reactivated: true });
  }

  const existingConversation = await Conversation.findOne({ matchId: match._id });
  const conversation = existingConversation || await Conversation.create({
    matchId: match._id,
    participants: [user1, user2],
  });
  if (!existingConversation) {
    console.info('CHAT_CREATED', { conversationId: String(conversation._id), matchId: String(match._id) });
  }

  await Like.updateMany(
    {
      $or: [
        { fromUser, toUser },
        { fromUser: toUser, toUser: fromUser },
      ],
    },
    { status: 'accepted' },
  );

  return {
    matched: true,
    isNewMatch,
    match,
    conversation,
    celebration: await getCelebrationView(match),
  };
};
