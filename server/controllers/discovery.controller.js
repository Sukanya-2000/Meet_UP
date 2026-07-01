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
import { recommendationProvider } from '../services/recommendation-engine.service.js';
import { cache } from '../services/cache.service.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

export const getDiscovery = async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 30);
  const premium = await isPremium(req.user._id);
  const savedPreference = await Preference.findOne({ userId: req.user._id }).lean();
  const myProfile = await Profile.findOne({ userId: req.user._id }).select('location travelMode interests music relationshipIntentions').lean();
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
  const [swipedIds, likedIds, inboundLikerIds, blocks] = await Promise.all([
    Swipe.distinct('toUser', { fromUser: req.user._id }),
    Like.distinct('toUser', { fromUser: req.user._id }),
    Like.distinct('fromUser', { toUser: req.user._id }),
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
    $or: [{ incognitoEnabled: { $ne: true } }, { userId: { $in: inboundLikerIds } }],
    $and: [{ $or: [{ 'snooze.enabled': { $ne: true } }, { 'snooze.endsAt': { $lte: new Date() } }] }],
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
  const origin = myProfile?.travelMode?.enabled && new Date(myProfile.travelMode.expiresAt) > new Date() ? myProfile.travelMode.location?.coordinates : myProfile?.location?.coordinates;
  if (origin?.length === 2) {
    const radians = (degrees) => degrees * Math.PI / 180;
    data = data.map((profile) => {
      const point = profile.location?.coordinates;
      if (!point?.length) return { ...profile, distanceKm: null };
      const dLat = radians(point[1] - origin[1]); const dLon = radians(point[0] - origin[0]);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(origin[1])) * Math.cos(radians(point[1])) * Math.sin(dLon / 2) ** 2;
      return { ...profile, distanceKm: Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10 };
    }).filter((profile) => profile.distanceKm === null || profile.distanceKm <= maximumDistance);
  } else data = data.map((profile) => ({ ...profile, distanceKm: null }));
  if (discoveryMode === 'online-now') data = data.filter((profile) => profile.isOnline);
  if (discoveryMode === 'music') data = data.filter((profile) => profile.interests?.includes('Music') || profile.music?.anthem);
  if (discoveryMode === 'astrology') data = data.filter((profile) => profile.zodiac || profile.astrology?.sun);
  if (discoveryMode === 'double-date') data = data.filter((profile) => profile.modeEligibility?.doubleDate !== false && (profile.openTo?.includes('Dates') || profile.lookingFor));
  if (discoveryMode === 'matchmaker') data = data.filter((profile) => profile.modeEligibility?.matchmaker !== false && (profile.isVerified || profile.trustScore >= 60));
  if (discoveryMode === 'share-date') data = data.filter((profile) => profile.modeEligibility?.shareDate !== false && profile.isVerified && profile.trustScore >= 60);
  data = data.map((profile) => ({ ...profile, recommendation: recommendationProvider.score(profile, { interests: myProfile?.interests || [], music: myProfile?.music?.topArtists || [], intentions: myProfile?.relationshipIntentions || [], maximumDistance }) })).sort((a,b)=>b.recommendation.score-a.recommendation.score);

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
  await AnalyticsEvent.create({ userId: req.user._id, name: 'discovery_view', properties: { mode: discoveryMode, count: pagedProfiles.length } });
};

export const getCuratedDiscovery = async (req,res)=>{
  const key=`curated:${req.user._id}`;const cached=await cache.get(key);if(cached)return res.json({...cached,cached:true});
  const profiles=await Profile.find({userId:{$ne:req.user._id},'snooze.enabled':{$ne:true}}).sort({trustScore:-1,updatedAt:-1}).limit(100).lean();const context=await Profile.findOne({userId:req.user._id}).lean();
  const ranked=profiles.map(p=>({...p,recommendation:recommendationProvider.score(p,{interests:context?.interests||[],music:context?.music?.topArtists||[],intentions:context?.relationshipIntentions||[],maximumDistance:50})})).sort((a,b)=>b.recommendation.score-a.recommendation.score);
  const payload={success:true,collections:{dailyPicks:ranked.slice(0,10),topPicks:ranked.filter(p=>p.isVerified).slice(0,10),trending:ranked.slice().sort((a,b)=>(b.trustScore||0)-(a.trustScore||0)).slice(0,10),recentlyActive:ranked.slice().sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,10),mostCompatible:ranked.slice(0,10),sharedInterests:ranked.filter(p=>p.recommendation.signals.interest>0).slice(0,10),sharedMusic:ranked.filter(p=>p.recommendation.signals.music>0).slice(0,10),sharedLifestyle:ranked.filter(p=>p.recommendation.signals.lifestyle>0).slice(0,10)}};await cache.set(key,payload,3600);res.json(payload);
};
