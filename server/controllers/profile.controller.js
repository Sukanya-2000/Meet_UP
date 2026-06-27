import Profile from '../models/Profile.js';
import { calculateAge } from '../utils/validation.js';
import { checkProfileCompletion } from '../utils/profileCompletion.js';

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
  const stringFields = ['firstName', 'bio', 'city'];
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
    profile,
  });
};
