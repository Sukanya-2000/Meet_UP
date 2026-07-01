import Profile from '../models/Profile.js';

export const checkProfileCompletion = async (userId) => {
  const profile = await Profile.findOne({ userId });
  const required = ['firstName', 'dob', 'gender', 'lookingFor', 'city'];
  const hasBasics = !!profile && required.every((field) => Boolean(profile[field]));
  const hasInterests = Array.isArray(profile?.interests) && profile.interests.length > 0;
  const isComplete = Boolean(hasBasics && hasInterests);
  const scored = ['firstName','dob','gender','lookingFor','city','bio','occupation','education','relationshipIntentions','sexualOrientations','pronouns','qualitiesSought'];
  const completed = scored.filter((field) => Array.isArray(profile?.[field]) ? profile[field].length : Boolean(profile?.[field])).length + (hasInterests ? 1 : 0);
  const percent = Math.round((completed / (scored.length + 1)) * 100);

  if (!profile) console.info('PROFILE_INCOMPLETE', { userId: String(userId), reason: 'missing_profile' });
  else {
    console.info('PROFILE_FOUND', { userId: String(userId), profileId: String(profile._id) });
    console.info(isComplete ? 'PROFILE_COMPLETE' : 'PROFILE_INCOMPLETE', { userId: String(userId) });
  }

  return {
    profileExists: Boolean(profile),
    isComplete,
    profile,
    percent,
  };
};
