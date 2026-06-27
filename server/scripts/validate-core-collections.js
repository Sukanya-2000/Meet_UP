import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Photo from '../models/Photo.js';
import Like from '../models/Like.js';
import Match from '../models/Match.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Subscription from '../models/Subscription.js';

dotenv.config();

const models = [User, Profile, Photo, Like, Match, Conversation, Message, Subscription];

try {
  await connectDB();
  await Promise.all(models.map((model) => model.createCollection()));
  await Promise.all(models.map((model) => model.syncIndexes()));
  console.log('Core collection validation complete:', models.map((model) => model.collection.name).join(', '));
  process.exit(0);
} catch (error) {
  console.error('Core collection validation failed:', error.message);
  process.exit(1);
}
