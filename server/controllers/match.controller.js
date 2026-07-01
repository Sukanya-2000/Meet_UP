import Match from '../models/Match.js';
import { getMatchView } from '../services/match.service.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';
import Conversation from '../models/Conversation.js';

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

export const unmatch = async (req, res) => {
  const match = await Match.findOne({ _id: req.params.id, status: 'active', $or: [{ user1: req.user._id }, { user2: req.user._id }] });
  if (!match) { res.status(404); throw new Error('Active match not found'); }
  match.status = 'unmatched'; match.unmatchedBy = req.user._id; match.unmatchedAt = new Date(); match.unmatchReason = String(req.body.reason || '').trim().slice(0, 300); await match.save();
  await Conversation.updateOne({ matchId: match._id }, { active: false, closedAt: new Date() });
  req.app.get('io')?.to(`match:${match._id}`).emit('match:unmatched', { matchId: String(match._id) });
  res.json({ success: true, message: 'Match removed' });
};
