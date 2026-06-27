import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import Conversation from '../models/Conversation.js';
import Like from '../models/Like.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';

const run = async () => {
  await connectDatabase();
  await Promise.all([Like.createCollection(), Match.createCollection(), Conversation.createCollection(), Message.createCollection()]);
  await Promise.all([Like.syncIndexes(), Match.syncIndexes(), Conversation.syncIndexes(), Message.syncIndexes()]);
  await Like.updateMany({ status: { $exists: false } }, { status: 'pending' });
  const matches = await Match.find();
  let conversationsCreated = 0;
  for (const match of matches) {
    const result = await Conversation.updateOne(
      { matchId: match._id },
      { $setOnInsert: { matchId: match._id, participants: [match.user1, match.user2] } },
      { upsert: true },
    );
    if (result.upsertedCount) conversationsCreated += 1;
  }
  console.log(`Matching migration complete: ${matches.length} matches checked, ${conversationsCreated} conversations created`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
