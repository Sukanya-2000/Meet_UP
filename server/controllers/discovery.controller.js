import mongoose from 'mongoose';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import Preference from '../models/Preference.js';
import Swipe from '../models/Swipe.js';
import Like from '../models/Like.js';
import { isPremium } from '../services/subscription.service.js';
import Block from '../models/Block.js';
import { isUserOnline } from '../socket/index.js';
import { discoveryModeMeta, discoveryModes, enrichAndRankProfiles, zodiacSigns } from '../services/discovery-ranking.service.js';

export const getDiscovery = async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 30);
  const premium = await isPremium(req.user._id);
  const savedPreference = await Preference.findOne({ userId: req.user._id }).lean();
  const queryNumber = (name, fallback, min, max) => Math.min(Math.max(Number(req.query[name] ?? fallback) || fallback, min), max);
  const queryList = (name) => String(req.query[name] || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const ageMin = queryNumber('ageMin', savedPreference?.ageMin ?? 18, 18, 100);
  const ageMax = queryNumber('ageMax', savedPreference?.ageMax ?? 60, 18, 100);
  const maximumDistance = queryNumber('distanceKm', savedPreference?.distanceKm ?? 50, 1, 500);
  const minimumPhotos = queryNumber('minimumPhotos', savedPreference?.minimumPhotos ?? 0, 0, 6);
  const hasBio = req.query.hasBio === 'true' || savedPreference?.hasBio === true;
  const verifiedOnly = req.query.verifiedOnly === 'true';
  const gender = ['man', 'woman', 'non-binary', 'other'].includes(req.query.gender) ? req.query.gender : null;
  const interests = queryList('interests');
  const zodiac = queryList('zodiac');
  const languages = queryList('languages');
  const openTo = queryList('openTo');
  const lookingFor = queryList('lookingFor');
  const education = queryList('education');
  const familyPlans = queryList('familyPlans');
  const communicationStyle = queryList('communicationStyle');
  const loveStyle = queryList('loveStyle');
  const pets = queryList('pets');
  const drinking = queryList('drinking');
  const smoking = queryList('smoking');
  const workout = queryList('workout');
  const socialMedia = queryList('socialMedia');
  const discoveryMode = discoveryModes.includes(req.query.mode) ? req.query.mode : 'for-you';
  const myZodiac = zodiacSigns.includes(req.query.myZodiac) ? req.query.myZodiac : '';
  const compatibility = ['all', 'high', 'medium'].includes(req.query.compatibility) ? req.query.compatibility : 'all';
  const [swipedIds, likedIds, blocks] = await Promise.all([
    Swipe.distinct('toUser', { fromUser: req.user._id }),
    Like.distinct('toUser', { fromUser: req.user._id }),
    Block.find({ $or: [{ blockerId: req.user._id }, { blockedUserId: req.user._id }] }).lean(),
  ]);
  const blockedIds = blocks.map((block) =>
    String(block.blockerId) === String(req.user._id) ? block.blockedUserId : block.blockerId);
  const excluded = [...new Set([...swipedIds, ...likedIds, ...blockedIds, req.user._id].map(String))]
    .map((id) => new mongoose.Types.ObjectId(id));
  const fallbackExcluded = [...new Set([...blockedIds, req.user._id].map(String))]
    .map((id) => new mongoose.Types.ObjectId(id));

  const today = new Date();
  const youngestDob = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
  const oldestDob = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate() + 1);
  const buildMatch = (excludedIds) => ({
    userId: { $nin: excludedIds },
    dob: { $gte: oldestDob, $lte: youngestDob },
    ...((verifiedOnly || discoveryMode === 'verified-only') && { isVerified: true }),
    ...(gender && { gender }),
    ...(hasBio && { bio: { $exists: true, $nin: ['', null] } }),
    ...(interests.length && { interests: { $in: interests } }),
    ...(zodiac.length && { zodiac: { $in: zodiac } }),
    ...(languages.length && { languages: { $in: languages } }),
    ...(openTo.length && { openTo: { $in: openTo } }),
    ...(lookingFor.length && { lookingFor: { $in: lookingFor } }),
    ...(education.length && { education: { $in: education } }),
    ...(familyPlans.length && { familyPlans: { $in: familyPlans } }),
    ...(communicationStyle.length && { communicationStyle: { $in: communicationStyle } }),
    ...(loveStyle.length && { loveStyle: { $in: loveStyle } }),
    ...(pets.length && { pets: { $in: pets } }),
    ...(drinking.length && { drinking: { $in: drinking } }),
    ...(smoking.length && { smoking: { $in: smoking } }),
    ...(workout.length && { workout: { $in: workout } }),
    ...(socialMedia.length && { socialMedia: { $in: socialMedia } }),
  });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const buildPipeline = (match, includePaging = true) => [
    { $match: match },
    { $lookup: { from: 'photos', localField: 'userId', foreignField: 'userId', as: 'photoDocs' } },
    { $match: { $expr: { $gte: [{ $size: '$photoDocs' }, minimumPhotos] } } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $match: { 'user.accountStatus': 'active' } },
    ...(discoveryMode === 'new-members' ? [{ $match: { createdAt: { $gte: sevenDaysAgo } } }] : []),
    { $addFields: { boostRank: { $cond: [{ $gt: ['$boostedUntil', new Date()] }, 1, 0] } } },
    { $sort: { boostRank: -1, updatedAt: -1 } },
    ...(includePaging ? [{ $skip: (page - 1) * limit }, { $limit: limit }] : []),
    { $project: { photoDocs: 0 } },
  ];
  const baseMatch = buildMatch(excluded);
  let profiles = await Profile.aggregate([
    ...buildPipeline(baseMatch, false),
    { $limit: 160 },
  ]);
  let replayingSeenProfiles = false;
  if (!profiles.length && page === 1) {
    replayingSeenProfiles = true;
    const replayMatch = buildMatch(fallbackExcluded);
    profiles = await Profile.aggregate([...buildPipeline(replayMatch, false), { $limit: 160 }]);
  }

  const photos = await Photo.find({ userId: { $in: profiles.map((profile) => profile.userId) } }).sort({ orderIndex: 1 });
  let data = enrichAndRankProfiles({
    profiles,
    photos,
    isUserOnline,
    context: {
      mode: discoveryMode,
      myZodiac,
      compatibility,
      maximumDistance,
      interests,
    },
  });
  if (discoveryMode === 'online-now') data = data.filter((profile) => profile.isOnline);
  if (discoveryMode === 'music') data = data.filter((profile) => profile.interests?.includes('Music') || profile.music?.anthem);
  if (discoveryMode === 'astrology') data = data.filter((profile) => profile.zodiac || profile.astrology?.sun);
  if (discoveryMode === 'double-date') data = data.filter((profile) => profile.modeEligibility?.doubleDate !== false && (profile.openTo?.includes('Dates') || profile.lookingFor));
  if (discoveryMode === 'matchmaker') data = data.filter((profile) => profile.modeEligibility?.matchmaker !== false && (profile.isVerified || profile.trustScore >= 60));
  if (discoveryMode === 'share-date') data = data.filter((profile) => profile.modeEligibility?.shareDate !== false && profile.isVerified && profile.trustScore >= 60);

  const total = data.length;
  const pagedProfiles = data.slice((page - 1) * limit, page * limit);
  const meta = discoveryModeMeta[discoveryMode] || discoveryModeMeta['for-you'];
  const emptyReason = pagedProfiles.length ? null : replayingSeenProfiles ? 'NO_REPLAYABLE_PROFILES' : meta.emptyReason;

  res.json({
    success: true,
    discovery: {
      version: '1.2.0',
      premium,
      mode: discoveryMode,
      title: meta.title,
      activeCopy: meta.activeCopy,
      replayingSeenProfiles,
      emptyReason,
      filters: { ageMin, ageMax, distanceKm: maximumDistance, minimumPhotos, hasBio, verifiedOnly, gender, interests, zodiac, languages, openTo, lookingFor, education, familyPlans, communicationStyle, loveStyle, pets, drinking, smoking, workout, socialMedia, myZodiac, compatibility },
    },
    profiles: pagedProfiles,
    pagination: { page, limit, total, hasMore: page * limit < total },
  });
};
