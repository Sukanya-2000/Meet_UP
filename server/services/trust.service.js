import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

export const calculateTrust = async (userId) => {
  const [user, profile, photoCount, upheldReports] = await Promise.all([
    User.findById(userId).lean(),
    Profile.findOne({ userId }).lean(),
    Photo.countDocuments({ userId }),
    Report.countDocuments({ reportedUserId: userId, status: 'resolved' }),
  ]);
  if (!user || !profile) return null;

  const signals = {
    emailEstablished: Date.now() - new Date(user.createdAt).getTime() > 24 * 60 * 60 * 1000,
    profileComplete: Boolean(profile.firstName && profile.dob && profile.gender && profile.city && profile.interests?.length),
    hasPhotos: photoCount > 0,
    verified: Boolean(profile.isVerified),
    cleanStanding: upheldReports === 0 && user.accountStatus === 'active',
  };
  const score = Math.max(0, Math.min(100,
    20
    + (signals.emailEstablished ? 10 : 0)
    + (signals.profileComplete ? 20 : 0)
    + (signals.hasPhotos ? 15 : 0)
    + (signals.verified ? 25 : 0)
    + (signals.cleanStanding ? 10 : -30),
  ));
  await Profile.updateOne({ userId }, { trustScore: score, trustSignals: signals });
  return { score, signals };
};
