import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import User from '../models/User.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

const run = async () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!validateEmail(email) || validatePassword(password)) {
    throw new Error('Set valid ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars, uppercase, number)');
  }
  await connectDatabase();
  let admin = await User.findOne({ email }).select('+password');
  if (!admin) admin = new User({ email, password, role: 'admin' });
  admin.role = 'admin';
  admin.accountStatus = 'active';
  admin.password = password;
  await admin.save();
  console.log(`Admin account ready: ${email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
