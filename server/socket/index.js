import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import { assertMatchMember } from '../services/match.service.js';

const onlineUsers = new Map();
export const isUserOnline = (userId) => onlineUsers.has(String(userId));

const addSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId) || new Set();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
};

const removeSocket = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) onlineUsers.delete(userId);
};

const resolveChat = async (id, userId) => {
  const conversation = await Conversation.findOne({ _id: id, participants: userId });
  if (conversation) return { conversation, match: await assertMatchMember(conversation.matchId, userId) };
  const match = await assertMatchMember(id, userId);
  const ensured = await Conversation.findOneAndUpdate(
    { matchId: match._id },
    { $setOnInsert: { matchId: match._id, participants: [match.user1, match.user2] } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return { conversation: ensured, match };
};

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.accountStatus !== 'active') throw new Error();
      socket.userId = String(user._id);
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    addSocket(socket.userId, socket.id);
    socket.join(`user:${socket.userId}`);
    io.emit('presence:update', { userId: socket.userId, online: true });
    socket.emit('presence:list', [...onlineUsers.keys()]);

    const matches = await Match.find({
      status: 'active',
      $or: [{ user1: socket.userId }, { user2: socket.userId }],
    }).select('_id');
    matches.forEach((match) => socket.join(`match:${match._id}`));

    socket.on('match:join', async ({ matchId, conversationId }) => {
      try {
        const { match, conversation } = await resolveChat(conversationId || matchId, socket.userId);
        socket.join(`match:${match._id}`);
        socket.join(`conversation:${conversation._id}`);
      } catch {
        socket.emit('chat:error', { message: 'Unable to join this chat' });
      }
    });

    socket.on('message:send', async ({ matchId, conversationId, message, text }, acknowledge) => {
      try {
        const body = text || message;
        if (!body?.trim()) throw new Error('Message cannot be empty');
        const { match, conversation } = await resolveChat(conversationId || matchId, socket.userId);
        const receiverId = String(match.user1) === socket.userId ? match.user2 : match.user1;
        const created = await Message.create({
          matchId: match._id,
          conversationId: conversation._id,
          senderId: socket.userId,
          receiverId,
          message: body.trim(),
          text: body.trim(),
          deliveredAt: onlineUsers.has(String(receiverId)) ? new Date() : null,
        });
        io.to(`match:${match._id}`).to(`conversation:${conversation._id}`).emit('message:new', created);
        acknowledge?.({ success: true, message: created });
      } catch (error) {
        acknowledge?.({ success: false, error: error.message });
      }
    });

    socket.on('typing:start', async ({ matchId, conversationId }) => {
      try {
        const { match, conversation } = await resolveChat(conversationId || matchId, socket.userId);
        socket.to(`match:${match._id}`).to(`conversation:${conversation._id}`).emit('typing:update', { matchId: String(match._id), conversationId: String(conversation._id), userId: socket.userId, isTyping: true });
      } catch { /* Ignore invalid room events. */ }
    });

    socket.on('typing:stop', async ({ matchId, conversationId }) => {
      try {
        const { match, conversation } = await resolveChat(conversationId || matchId, socket.userId);
        socket.to(`match:${match._id}`).to(`conversation:${conversation._id}`).emit('typing:update', { matchId: String(match._id), conversationId: String(conversation._id), userId: socket.userId, isTyping: false });
      } catch { /* Ignore invalid room events. */ }
    });

    socket.on('messages:read', async ({ matchId, conversationId }) => {
      try {
        const { match, conversation } = await resolveChat(conversationId || matchId, socket.userId);
        const readAt = new Date();
        await Message.updateMany(
          { $or: [{ matchId: match._id }, { conversationId: conversation._id }], receiverId: socket.userId, deliveredAt: null },
          { deliveredAt: readAt },
        );
        await Message.updateMany(
          { $or: [{ matchId: match._id }, { conversationId: conversation._id }], receiverId: socket.userId, readAt: null },
          { readAt },
        );
        socket.to(`match:${match._id}`).to(`conversation:${conversation._id}`).emit('messages:delivered', { matchId: String(match._id), conversationId: String(conversation._id), deliveredTo: socket.userId, deliveredAt: readAt });
        socket.to(`match:${match._id}`).to(`conversation:${conversation._id}`).emit('messages:seen', { matchId: String(match._id), conversationId: String(conversation._id), readBy: socket.userId, readAt });
      } catch { /* Ignore invalid read events. */ }
    });

    socket.on('disconnect', () => {
      removeSocket(socket.userId, socket.id);
      if (!onlineUsers.has(socket.userId)) {
        io.emit('presence:update', { userId: socket.userId, online: false });
      }
    });
  });

  return io;
};
