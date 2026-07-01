import 'dotenv/config';
import mongoose from 'mongoose';
import AppearanceSetting from '../models/AppearanceSetting.js';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
await mongoose.connect(process.env.MONGO_URI);
await AppearanceSetting.syncIndexes();
console.log('CyberNest 1.0.0 migration complete');
await mongoose.disconnect();
