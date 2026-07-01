import 'dotenv/config'; import mongoose from 'mongoose'; import Match from '../models/Match.js'; import Profile from '../models/Profile.js'; import SystemSetting from '../models/SystemSetting.js'; import GameQuestion from '../models/GameQuestion.js'; import { defaults } from '../services/settings.service.js';
await mongoose.connect(process.env.MONGO_URI);
await Promise.all(Object.entries(defaults).map(([key,value])=>SystemSetting.findOneAndUpdate({key},{$setOnInsert:{key,value,description:`CyberNest ${key} configuration`}},{upsert:true})));
await Profile.updateMany({'snooze.enabled':{$exists:false}},{$set:{snooze:{enabled:false,reason:'',startedAt:null,endsAt:null,pauseNotifications:true},firstMovePreference:'default',verificationLevel:'none'}});
await Match.updateMany({expiresAt:{$exists:false}},{$set:{expiresAt:null,graceEndsAt:null,extensionCount:0,firstMoveRule:'anyone',firstMessageSentAt:null}});
const questions=[['What made you smile today?','fun','easy'],['What value matters most in a relationship?','values','medium'],['What does a meaningful life look like to you?','values','deep']];
await Promise.all(questions.map(([text,category,difficulty],orderIndex)=>GameQuestion.findOneAndUpdate({text},{$setOnInsert:{text,category,difficulty,orderIndex,available:true}},{upsert:true})));
await Promise.all([Profile.syncIndexes(),Match.syncIndexes(),SystemSetting.syncIndexes(),GameQuestion.syncIndexes()]); console.log('Priority 2 migration complete'); await mongoose.disconnect();
