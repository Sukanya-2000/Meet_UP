import SystemSetting from '../models/SystemSetting.js';
export const defaults = { matchLifecycle: { enabled: true, expirationHours: 24, graceHours: 2, freeExtendsPerDay: 1 }, firstMove: { defaultRule: 'anyone', allowPersonalPreference: true }, questionGame: { randomize: true }, verification: { maxRetries: 3 }, moderation: { blurThreshold: 0.7 }, openingMoves: { maxPerUser: 3 } };
export const setting = async (key) => (await SystemSetting.findOne({ key }).lean())?.value ?? defaults[key];
