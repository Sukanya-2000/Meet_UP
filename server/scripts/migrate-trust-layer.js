import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import Profile from '../models/Profile.js';
import { calculateTrust } from '../services/trust.service.js';

const run = async () => {
  await connectDatabase();
  const profiles = await Profile.find().select('userId');
  for (const profile of profiles) await calculateTrust(profile.userId);
  console.log(`Trust signals migrated for ${profiles.length} profiles`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
