import ConnectionRequest from '../models/ConnectionRequest.js';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import Like from '../models/Like.js';
import Match from '../models/Match.js';
import Conversation from '../models/Conversation.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';
import { canonicalPair } from '../services/match.service.js';

const hydrateRequests = async (requests, direction) => {
  const userIds = requests.map((request) => request[direction]);
  const [profiles, photos] = await Promise.all([
    Profile.find({ userId: { $in: userIds } }).lean(),
    Photo.find({ userId: { $in: userIds }, isMain: true }).lean(),
  ]);
  return Promise.all(requests.map(async (request) => {
    const userId = request[direction];
    let match = null;
    let conversation = null;
    if (request.status === 'accepted') {
      const [user1, user2] = canonicalPair(request.fromUser, request.toUser);
      match = await Match.findOne({ user1, user2, status: 'active' }).lean();
      if (match) conversation = await Conversation.findOne({ matchId: match._id }).lean();
      if (!match || !conversation) {
        const result = await createMatchIfMutual({
          fromUser: request.toUser,
          toUser: request.fromUser,
          forceMutual: true,
        });
        match = result.match?.toObject ? result.match.toObject() : result.match;
        conversation = result.conversation?.toObject ? result.conversation.toObject() : result.conversation;
      }
    }
    return {
      ...request.toObject(),
      profile: profiles.find((profile) => String(profile.userId) === String(userId)),
      photo: photos.find((photo) => String(photo.userId) === String(userId)),
      matchId: match?._id || null,
      conversationId: conversation?._id || null,
    };
  }));
};

export const sendRequest = async (req, res) => {
  const { toUser } = req.body;
  if (!toUser || String(toUser) === String(req.user._id)) {
    res.status(400);
    throw new Error('Select a valid profile');
  }
  if (!(await Profile.exists({ userId: toUser }))) {
    res.status(404);
    throw new Error('Profile not found');
  }

  const reverse = await ConnectionRequest.findOne({ fromUser: toUser, toUser: req.user._id });
  if (reverse?.status === 'pending') {
    res.status(409);
    throw new Error('This person already sent you a request. Check Requests.');
  }

  const request = await ConnectionRequest.findOneAndUpdate(
    { fromUser: req.user._id, toUser },
    { status: 'pending' },
    { upsert: true, new: true, runValidators: true },
  );
  await Like.findOneAndUpdate(
    { fromUser: req.user._id, toUser },
    { fromUser: req.user._id, toUser, status: 'pending' },
    { upsert: true, new: true, runValidators: true },
  );
  res.status(201).json({ success: true, message: 'Connection request sent', request });
};

export const listRequests = async (req, res) => {
  const [received, sent] = await Promise.all([
    ConnectionRequest.find({ toUser: req.user._id, status: 'pending' }).sort({ createdAt: -1 }),
    ConnectionRequest.find({ fromUser: req.user._id }).sort({ createdAt: -1 }),
  ]);
  res.json({
    success: true,
    received: await hydrateRequests(received, 'fromUser'),
    sent: await hydrateRequests(sent, 'toUser'),
  });
};

export const respondRequest = async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    res.status(400);
    throw new Error('Choose accept or decline');
  }
  const request = await ConnectionRequest.findOneAndUpdate(
    { _id: req.params.id, toUser: req.user._id, status: 'pending' },
    { status },
    { new: true },
  );
  if (!request) {
    res.status(404);
    throw new Error('Pending request not found');
  }

  if (status === 'accepted') {
    await Like.findOneAndUpdate(
      { fromUser: request.fromUser, toUser: request.toUser },
      { fromUser: request.fromUser, toUser: request.toUser, status: 'accepted' },
      { upsert: true, new: true, runValidators: true },
    );
    await Like.findOneAndUpdate(
      { fromUser: request.toUser, toUser: request.fromUser },
      { fromUser: request.toUser, toUser: request.fromUser, status: 'accepted' },
      { upsert: true, new: true, runValidators: true },
    );
    console.info('LIKE_ACCEPTED', { requestId: String(request._id), fromUser: String(request.fromUser), toUser: String(request.toUser) });

    const result = await createMatchIfMutual({
      fromUser: request.toUser,
      toUser: request.fromUser,
      forceMutual: true,
    });

    return res.json({
      success: true,
      message: 'Request accepted',
      request,
      matched: result.matched,
      matchId: result.match?._id || null,
      conversationId: result.conversation?._id || null,
      match: result.celebration || null,
    });
  }

  return res.json({ success: true, message: `Request ${status}`, request });
};
