import 'dotenv/config'; import mongoose from 'mongoose'; import Profile from '../models/Profile.js'; import Subscription from '../models/Subscription.js';
await mongoose.connect(process.env.MONGO_URI);
await Profile.updateMany({ relationshipIntentions: { $exists: false } }, { $set: { relationshipIntentions: [], sexualOrientations: [], pronouns: [], qualitiesSought: [], incognitoEnabled: false } });
await Subscription.updateMany({ plan: 'premium' }, { $set: { plan: 'gold' } });
await Promise.all([Profile.syncIndexes(), Subscription.syncIndexes()]); console.log('Priority 1 migration complete'); await mongoose.disconnect();
