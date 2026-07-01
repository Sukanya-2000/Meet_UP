import crypto from 'crypto';
import UserSession from '../models/UserSession.js';

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
export const createSession = async (userId, req) => {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + 30 * 86400000);
  await UserSession.create({ userId, tokenHash: hash(refreshToken), expiresAt, deviceName: req.body.deviceName || 'Unknown device', userAgent: req.get('user-agent') || '', ipAddress: req.ip || '' });
  return { refreshToken, expiresAt };
};
export const rotateSession = async (refreshToken, req) => {
  const current = await UserSession.findOne({ tokenHash: hash(refreshToken), revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!current) return null;
  current.revokedAt = new Date(); await current.save();
  return { userId: current.userId, ...(await createSession(current.userId, req)) };
};
export const revokeSession = (refreshToken) => UserSession.updateOne({ tokenHash: hash(refreshToken) }, { revokedAt: new Date() });
export const tokenHash = hash;
