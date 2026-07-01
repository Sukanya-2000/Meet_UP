import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from './config/database.js';
import { expireDueMatches } from './controllers/lifecycle.controller.js';
import DeadLetterJob from './models/DeadLetterJob.js';
import Event from './models/Event.js';
import MatchmakerSession from './models/MatchmakerSession.js';
import Profile from './models/Profile.js';
import { jobs } from './services/job-queue.service.js';
import { logger } from './services/observability.service.js';

let running = true;
const run = async () => {
  await expireDueMatches();
  await Profile.updateMany({ 'travelMode.enabled': true, 'travelMode.expiresAt': { $lte: new Date() } }, { $set: { 'travelMode.enabled': false } });
  await Profile.updateMany({ 'snooze.enabled': true, 'snooze.endsAt': { $lte: new Date() } }, { $set: { 'snooze.enabled': false } });
  await MatchmakerSession.updateMany({ status: 'active', expiresAt: { $lte: new Date() } }, { $set: { status: 'expired' } });
  const upcoming = await Event.find({ status: 'published', startsAt: { $gte: new Date(), $lte: new Date(Date.now() + 3600000) } }).select('_id');
  for (const event of upcoming) await jobs.enqueue('event-reminder', { eventId: event._id });
  logger.info('worker_tick', { jobs: await jobs.stats() });
};
const safeRun = async () => {
  try { await run(); }
  catch (error) {
    logger.error('worker_error', { error: error.message });
    await DeadLetterJob.create({ jobName: 'worker-tick', payload: { at: new Date() }, error: error.message, attempts: 1 });
  }
};

await connectDatabase();
await safeRun();
const timer = setInterval(() => { if (running) safeRun(); }, 60000);
const shutdown = async (signal) => { running = false; clearInterval(timer); logger.info('worker_shutdown', { signal }); await mongoose.disconnect(); process.exit(0); };
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
