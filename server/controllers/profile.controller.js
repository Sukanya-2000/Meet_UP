import Profile from '../models/Profile.js';
import { calculateAge } from '../utils/validation.js';
import { checkProfileCompletion } from '../utils/profileCompletion.js';
import { hasEntitlement } from '../services/entitlement.service.js';

const allowedGenders = ['man', 'woman', 'non-binary', 'other'];
const allowedPreferences = ['man', 'woman', 'everyone'];
const allowedInterests = ['Coffee', 'Travel', 'Fitness', 'Movies', 'Music', 'Books', 'Photography', 'Gaming'];

export const saveBasicProfile = async (req, res) => {
  const { firstName, dob, gender, lookingFor, city } = req.body;
  if (!firstName || !dob || !gender || !lookingFor || !city) {
    res.status(400);
    throw new Error('All profile fields are required');
  }
  if (String(firstName).trim().length < 2 || String(city).trim().length < 2) {
    res.status(400);
    throw new Error('First name and city must be at least 2 characters');
  }
  if (!allowedGenders.includes(gender) || !allowedPreferences.includes(lookingFor)) {
    res.status(400);
    throw new Error('Select valid gender and looking-for options');
  }
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime()) || calculateAge(birthDate) < 18) {
    res.status(400);
    throw new Error('You must be at least 18 years old');
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    {
      userId: req.user._id,
      firstName: String(firstName).trim(),
      dob: birthDate,
      gender,
      lookingFor,
      city: String(city).trim(),
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({
    success: true,
    message: 'Basic profile saved successfully',
    profile,
  });
};

export const saveInterests = async (req, res) => {
  const interests = [...new Set(req.body.interests || [])];
  if (!interests.length || interests.length > allowedInterests.length || interests.some((item) => !allowedInterests.includes(item))) {
    res.status(400);
    throw new Error('Select at least one valid interest');
  }

  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { interests },
    { new: true, runValidators: true },
  );
  if (!profile) {
    res.status(404);
    throw new Error('Complete basic profile setup first');
  }

  res.json({ success: true, message: 'Interests saved successfully', profile });
};

export const getMyProfile = async (req, res) => {
  const completion = await checkProfileCompletion(req.user._id);
  res.json({
    success: true,
    profileCompleted: completion.isComplete,
    profileExists: completion.profileExists,
    profile: completion.profile,
  });
};

export const updateProfile = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Complete onboarding before editing your profile');
  }

  const updates = {};
  const stringFields = ['firstName', 'bio', 'city', 'occupation', 'company', 'religion', 'politics', 'familyPlans', 'communicationStyle', 'loveStyle', 'pets', 'drinking', 'smoking', 'workout'];
  stringFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = String(req.body[field] || '').trim();
  });

  if (Object.prototype.hasOwnProperty.call(req.body, 'gender')) {
    if (!allowedGenders.includes(req.body.gender)) {
      res.status(400);
      throw new Error('Select a valid gender');
    }
    updates.gender = req.body.gender;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'lookingFor')) {
    if (!allowedPreferences.includes(req.body.lookingFor)) {
      res.status(400);
      throw new Error('Select a valid looking-for option');
    }
    updates.lookingFor = req.body.lookingFor;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'interests')) {
    const interests = [...new Set(req.body.interests || [])];
    if (!interests.length || interests.length > allowedInterests.length || interests.some((item) => !allowedInterests.includes(item))) {
      res.status(400);
      throw new Error('Select at least one valid interest');
    }
    updates.interests = interests;
  }
  const arrayRules = {
    relationshipIntentions: ['long-term','short-term','casual-dating','marriage','friendship','networking','figuring-it-out','open-to-exploring'],
    sexualOrientations: null, pronouns: null, qualitiesSought: null, languages: null,
  };
  Object.entries(arrayRules).forEach(([field, allowed]) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, field)) return;
    const values = [...new Set((req.body[field] || []).map((item) => String(item).trim()).filter(Boolean))].slice(0, field === 'pronouns' ? 4 : 8);
    if (allowed && values.some((item) => !allowed.includes(item))) { res.status(400); throw new Error(`Select valid ${field}`); }
    if (values.some((item) => item.length > 50)) { res.status(400); throw new Error(`${field} values are too long`); }
    updates[field] = values;
  });
  if (Object.prototype.hasOwnProperty.call(req.body, 'heightCm')) { if (req.body.heightCm === '' || req.body.heightCm === null) updates.heightCm = null; else { const height = Number(req.body.heightCm); if (!Number.isFinite(height) || height < 100 || height > 250) { res.status(400); throw new Error('Height must be between 100 and 250 cm'); } updates.heightCm = height; } }
  if (Object.prototype.hasOwnProperty.call(req.body, 'children')) { if (!['','have-children','want-children','dont-want-children','open-to-children'].includes(req.body.children)) { res.status(400); throw new Error('Select a valid children preference'); } updates.children = req.body.children; }

  if (updates.firstName && updates.firstName.length < 2) {
    res.status(400);
    throw new Error('First name must be at least 2 characters');
  }
  if (updates.city && updates.city.length < 2) {
    res.status(400);
    throw new Error('City must be at least 2 characters');
  }

  Object.assign(profile, updates);
  await profile.save();
  const completion = await checkProfileCompletion(req.user._id);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    profileCompleted: completion.isComplete,
    completionPercent: completion.percent,
    profile,
  });
};

export const updateLocation = async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || req.body.consent !== true) {
    res.status(400); throw new Error('Valid coordinates and location consent are required');
  }
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { location: { type: 'Point', coordinates: [longitude, latitude], updatedAt: new Date() }, locationConsentAt: new Date() },
    { new: true, runValidators: true },
  );
  if (!profile) { res.status(404); throw new Error('Complete your profile first'); }
  res.json({ success: true, locationUpdatedAt: profile.location.updatedAt });
};

export const updateDiscoveryPrivacy = async (req, res) => {
  if (req.body.incognitoEnabled === true && !(await hasEntitlement(req.user._id, 'incognito'))) { res.status(403); throw new Error('Incognito Mode requires an eligible plan'); }
  const profile = await Profile.findOneAndUpdate({ userId: req.user._id }, { incognitoEnabled: Boolean(req.body.incognitoEnabled) }, { new: true });
  res.json({ success: true, incognitoEnabled: profile.incognitoEnabled });
};
export const updateTravelMode = async (req, res) => {
  if (req.body.enabled && !(await hasEntitlement(req.user._id, 'travel_mode'))) { res.status(403); throw new Error('Travel Mode requires an eligible plan'); }
  const latitude = Number(req.body.latitude); const longitude = Number(req.body.longitude); const days = Math.min(Math.max(Number(req.body.days) || 7, 1), 30);
  if (req.body.enabled && (!req.body.city || !req.body.country || !Number.isFinite(latitude) || !Number.isFinite(longitude))) { res.status(400); throw new Error('Travel city, country, and coordinates are required'); }
  const travelMode = req.body.enabled ? { enabled: true, city: String(req.body.city).trim(), country: String(req.body.country).trim(), location: { type: 'Point', coordinates: [longitude, latitude] }, expiresAt: new Date(Date.now() + days * 86400000) } : { enabled: false, city: '', country: '', expiresAt: null };
  const profile = await Profile.findOneAndUpdate({ userId: req.user._id }, { travelMode }, { new: true, runValidators: true }); res.json({ success: true, travelMode: profile.travelMode });
};
