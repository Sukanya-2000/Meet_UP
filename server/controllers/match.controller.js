import Match from '../models/Match.js';
import { getMatchView } from '../services/match.service.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';

export const getMatches = async (req, res) => {
  const acceptedRequests = await ConnectionRequest.find({
    status: 'accepted',
    $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
  }).lean();

  await Promise.all(acceptedRequests.map((request) => createMatchIfMutual({
    fromUser: request.toUser,
    toUser: request.fromUser,
    forceMutual: true,
  })));

  const matches = await Match.find({
    status: 'active',
    $or: [{ user1: req.user._id }, { user2: req.user._id }],
  }).sort({ matchedAt: -1 });
  const data = await Promise.all(matches.map((match) => getMatchView(match, req.user._id)));
  res.json({ success: true, matches: data });
};
