import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

const samples = [
  ['Aarohi', 'woman', 'Mumbai', ['Coffee', 'Travel', 'Music'], 24, 32],
  ['Meera', 'woman', 'Bengaluru', ['Books', 'Photography', 'Coffee'], 27, 47],
  ['Riya', 'woman', 'Pune', ['Fitness', 'Movies', 'Travel'], 25, 49],
  ['Ananya', 'woman', 'Delhi', ['Gaming', 'Music', 'Movies'], 26, 44],
  ['Kabir', 'man', 'Hyderabad', ['Fitness', 'Travel', 'Photography'], 29, 12],
  ['Arjun', 'man', 'Chennai', ['Coffee', 'Books', 'Music'], 28, 11],
  ['Vihaan', 'man', 'Kolkata', ['Gaming', 'Movies', 'Fitness'], 25, 13],
  ['Ishaan', 'man', 'Jaipur', ['Travel', 'Photography', 'Books'], 30, 14],
  ['Naina', 'non-binary', 'Goa', ['Music', 'Travel', 'Photography'], 26, 45],
  ['Tara', 'woman', 'Kochi', ['Books', 'Coffee', 'Movies'], 28, 48],
  ['Saanvi', 'woman', 'Ahmedabad', ['Fitness', 'Coffee', 'Travel'], 23, 5],
  ['Diya', 'woman', 'Surat', ['Photography', 'Music', 'Movies'], 31, 9],
  ['Myra', 'woman', 'Lucknow', ['Coffee', 'Music', 'Travel'], 22, 16],
  ['Ira', 'woman', 'Indore', ['Gaming', 'Books', 'Fitness'], 35, 20],
  ['Zoya', 'woman', 'Chandigarh', ['Photography', 'Movies', 'Coffee'], 29, 25],
  ['Aditya', 'man', 'Nagpur', ['Fitness', 'Coffee', 'Travel'], 24, 3],
  ['Reyansh', 'man', 'Bhopal', ['Fitness', 'Gaming', 'Coffee'], 32, 7],
  ['Dhruv', 'man', 'Noida', ['Gaming', 'Fitness', 'Movies'], 27, 15],
  ['Ayaan', 'man', 'Gurugram', ['Gaming', 'Music', 'Travel'], 36, 17],
  ['Rohan', 'man', 'Mysuru', ['Books', 'Photography', 'Coffee'], 23, 33],
  ['Neel', 'man', 'Vadodara', ['Fitness', 'Movies', 'Travel'], 41, 52],
  ['Avni', 'non-binary', 'Dehradun', ['Travel', 'Books', 'Fitness'], 25, 36],
  ['Kiran', 'non-binary', 'Bhubaneswar', ['Movies', 'Photography', 'Gaming'], 30, 39],
  ['Sam', 'non-binary', 'Pondicherry', ['Travel', 'Coffee', 'Music'], 28, 53],
  ['Rudra', 'man', 'Guwahati', ['Travel', 'Fitness', 'Movies'], 45, 59],
  ['Leela', 'woman', 'Udaipur', ['Books', 'Music', 'Travel'], 39, 60],
  ['Om', 'man', 'Nashik', ['Fitness', 'Books', 'Coffee'], 21, 61],
  ['Mahi', 'woman', 'Ranchi', ['Travel', 'Fitness', 'Books'], 33, 62],
];

const allowedInterests = new Set(Profile.schema.path('interests').caster.enumValues);
for (const [firstName, , , interests] of samples) {
  const invalid = interests.filter((interest) => !allowedInterests.has(interest));
  if (invalid.length) throw new Error(`Invalid interests for ${firstName}: ${invalid.join(', ')}`);
}

const birthDateForAge = (age) => new Date(new Date().getFullYear() - age, 4, 15);

const seed = async () => {
  await connectDatabase();
  for (const [firstName, gender, city, interests, age, imageId] of samples) {
    const email = `demo.${firstName.toLowerCase()}@cybernest.local`;
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email, password: 'DemoUser123' });

    await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        firstName,
        dob: birthDateForAge(age),
        gender,
        lookingFor: 'everyone',
        city,
        interests,
      },
      { upsert: true, new: true, runValidators: true },
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
  console.log(`Seeded ${samples.length} CyberNest demo profiles`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
