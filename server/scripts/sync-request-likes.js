import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import Like from '../models/Like.js';

const syncRequestLikes = async () => {
  await connectDatabase();
  const requests = await ConnectionRequest.find({ status: { $in: ['pending', 'accepted'] } }).lean();
  for (const request of requests) {
    await Like.findOneAndUpdate(
      { fromUser: request.fromUser, toUser: request.toUser },
      {
        fromUser: request.fromUser,
        toUser: request.toUser,
        status: request.status === 'accepted' ? 'accepted' : 'pending',
      },
      { upsert: true, new: true, runValidators: true },
    );
  }
  console.log(`Synchronized ${requests.length} connection requests into likes`);
  await mongoose.disconnect();
};

syncRequestLikes().catch(async (error) => {
  console.error(`Request-like sync failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
