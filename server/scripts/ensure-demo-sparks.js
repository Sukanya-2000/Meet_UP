import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import Block from '../models/Block.js';
import Like from '../models/Like.js';
import Photo from '../models/Photo.js';
import Preference from '../models/Preference.js';
import Profile from '../models/Profile.js';
import Swipe from '../models/Swipe.js';
import User from '../models/User.js';

const loginEmail = 'demo.aarhi@cybernest.local';
const password = 'DemoUser123';

const birthDateForAge = (age) => new Date(new Date().getFullYear() - age, 5, 15);

const sparkProfiles = [
  ['Maya', 'woman', 'Bengaluru', 24, ['Music', 'Travel', 'Coffee'], 'Leo', 32, 'Golden Hour', ['SZA', 'Arijit Singh'], ['Pop', 'Indie']],
  ['Isha', 'woman', 'Mumbai', 27, ['Music', 'Movies', 'Photography'], 'Aries', 47, 'Midnight City', ['The Weeknd', 'Prateek Kuhad'], ['Synthpop', 'Hindi Indie']],
  ['Tara', 'woman', 'Pune', 25, ['Music', 'Fitness', 'Travel'], 'Aquarius', 48, 'Levitating', ['Dua Lipa', 'Ritviz'], ['Dance', 'Electronic']],
  ['Naina', 'non-binary', 'Goa', 26, ['Music', 'Books', 'Coffee'], 'Sagittarius', 45, 'Space Song', ['Beach House', 'Nucleya'], ['Dream Pop', 'Electronic']],
  ['Leela', 'woman', 'Delhi', 29, ['Music', 'Gaming', 'Movies'], 'Libra', 60, 'Blinding Lights', ['Taylor Swift', 'Seedhe Maut'], ['Pop', 'Hip Hop']],
  ['Aarav', 'man', 'Hyderabad', 28, ['Music', 'Travel', 'Photography'], 'Gemini', 12, 'Heat Waves', ['Glass Animals', 'Anuv Jain'], ['Alt Pop', 'Acoustic']],
  ['Kabir', 'man', 'Chennai', 30, ['Music', 'Fitness', 'Coffee'], 'Leo', 14, 'As It Was', ['Harry Styles', 'A. R. Rahman'], ['Pop', 'Soundtrack']],
  ['Riya', 'woman', 'Kochi', 23, ['Music', 'Books', 'Travel'], 'Aries', 49, 'Until I Found You', ['Stephen Sanchez', 'Shreya Ghoshal'], ['Retro Pop', 'Bollywood']],
  ['Zoya', 'woman', 'Jaipur', 31, ['Music', 'Movies', 'Coffee'], 'Aquarius', 25, 'Sunflower', ['Post Malone', 'When Chai Met Toast'], ['Hip Hop', 'Folk Pop']],
  ['Sam', 'non-binary', 'Indore', 27, ['Music', 'Photography', 'Travel'], 'Sagittarius', 53, 'Electric Feel', ['MGMT', 'OAFF'], ['Indie', 'Electronic']],
  ['Mira', 'woman', 'Noida', 26, ['Music', 'Fitness', 'Movies'], 'Libra', 41, 'Anti-Hero', ['Taylor Swift', 'Diljit Dosanjh'], ['Pop', 'Punjabi']],
  ['Anika', 'woman', 'Surat', 24, ['Music', 'Books', 'Gaming'], 'Gemini', 39, 'Apocalypse', ['Cigarettes After Sex', 'Lifafa'], ['Ambient Pop', 'Indie']],
];

const onlineSparkNames = new Set(['Maya', 'Isha', 'Tara', 'Naina', 'Leela', 'Aarav']);

const upsertUser = async (email, demoOnline = false) => {
  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    user = new User({ email, password, accountStatus: 'active', isPremium: true, demoOnline });
  } else {
    user.accountStatus = 'active';
    user.isPremium = true;
    user.demoOnline = demoOnline;
    if (!user.password) user.password = password;
  }
  await user.save();
  return user;
};

const run = async () => {
  await connectDatabase();

  const loginUser = await upsertUser(loginEmail, true);
  await Profile.findOneAndUpdate(
    { userId: loginUser._id },
    {
      userId: loginUser._id,
      firstName: 'Aarhi',
      dob: birthDateForAge(28),
      gender: 'man',
      lookingFor: 'everyone',
      city: 'Bengaluru',
      bio: 'Testing every CyberNest spark mode.',
      interests: ['Music', 'Travel', 'Coffee'],
      zodiac: 'Sagittarius',
      isVerified: true,
      trustScore: 95,
      astrology: { sun: 'Sagittarius', moon: 'Libra', rising: 'Aquarius' },
      education: 'Graduate degree',
      languages: ['English', 'Hindi'],
      openTo: ['Dates', 'Chats'],
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await Preference.findOneAndUpdate(
    { userId: loginUser._id },
    {
      userId: loginUser._id,
      ageMin: 18,
      ageMax: 60,
      distanceKm: 100,
      genderPreference: 'everyone',
      minimumPhotos: 0,
      hasBio: false,
      interests: [],
      zodiac: [],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const candidateIds = [];
  for (const [firstName, gender, city, age, interests, zodiac, imageId, anthem, topArtists, topGenres] of sparkProfiles) {
    const email = `spark.${firstName.toLowerCase()}@cybernest.local`;
    const user = await upsertUser(email, onlineSparkNames.has(firstName));
    candidateIds.push(user._id);
    await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        firstName,
        dob: birthDateForAge(age),
        gender,
        lookingFor: 'everyone',
        city,
        bio: `${firstName} is here for music, good conversation, and a little cosmic timing.`,
        interests,
        zodiac,
        isVerified: true,
        trustScore: 90,
        astrology: {
          sun: zodiac,
          moon: zodiac === 'Sagittarius' ? 'Libra' : 'Sagittarius',
          rising: zodiac === 'Aquarius' ? 'Gemini' : 'Aquarius',
          birthTime: '09:49',
          birthPlace: city,
          completedAt: new Date(),
        },
        music: {
          anthem,
          topArtists,
          topGenres,
          provider: 'manual',
          connectedAt: new Date(),
        },
        modeEligibility: { doubleDate: true, matchmaker: true, shareDate: true },
        education: 'Graduate degree',
        languages: ['English', 'Hindi'],
        openTo: ['Dates', 'Chats'],
        familyPlans: 'Open to kids',
        communicationStyle: 'Texter',
        loveStyle: 'Time together',
        pets: 'Dog',
        drinking: 'Socially',
        smoking: 'Never',
        workout: 'Often',
        socialMedia: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    await Photo.findOneAndUpdate(
      { userId: user._id, isMain: true },
      {
        userId: user._id,
        imageUrl: `https://i.pravatar.cc/900?img=${imageId}`,
        isMain: true,
        orderIndex: 0,
      },
      { upsert: true, new: true },
    );
  }

  await User.updateOne({ email: 'spark.anika@cybernest.local' }, { $set: { demoOnline: false } });

  await Promise.all([
    Swipe.deleteMany({ fromUser: loginUser._id }),
    Like.deleteMany({ fromUser: loginUser._id }),
    Block.deleteMany({
      $or: [
        { blockerId: loginUser._id, blockedUserId: { $in: candidateIds } },
        { blockedUserId: loginUser._id, blockerId: { $in: candidateIds } },
      ],
    }),
  ]);

  console.log(`Ensured ${candidateIds.length} spark demo profiles for ${loginEmail}`);
  console.log('Password remains DemoUser123');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Demo spark setup failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
