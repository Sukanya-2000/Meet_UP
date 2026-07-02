import test from 'node:test';
import assert from 'node:assert/strict';
import Profile from '../models/Profile.js';
import NotificationPreference from '../models/NotificationPreference.js';
import ProfilePrompt from '../models/ProfilePrompt.js';
import Like from '../models/Like.js';
import Subscription from '../models/Subscription.js';
import Match from '../models/Match.js';
import OpeningMove from '../models/OpeningMove.js';
import CallSession from '../models/CallSession.js';
import Event from '../models/Event.js';
import GroupConversation from '../models/GroupConversation.js';
import { ExplainableProvider } from '../services/recommendation-engine.service.js';
import { MemoryCache } from '../services/cache.service.js';
import { LocalRulesAI } from '../services/ai-provider.service.js';
import { CircuitBreaker, retry } from '../services/resilience.service.js';
import ConsentRecord from '../models/ConsentRecord.js';
import { validateEnvironment } from '../config/environment.js';
import fs from 'node:fs';

test('profile declares a GeoJSON 2dsphere index', () => {
  assert.ok(Profile.schema.indexes().some(([fields]) => fields.location === '2dsphere'));
});
test('priority four AI, privacy, retry and circuit breaker foundations work', async () => {
  const result = await new LocalRulesAI().profile({ profile: { city: 'Bengaluru', interests: ['Music'] }, capability: 'improve' });
  assert.equal(result.provider, 'local-rules'); assert.ok(result.suggestions.bio);
  assert.ok(ConsentRecord.schema.indexes().some(([fields]) => fields.userId === 1 && fields.type === 1));
  let attempts = 0; assert.equal(await retry(async () => { attempts += 1; if (attempts < 2) throw new Error('retry'); return 'ok'; }, { attempts: 2, baseDelayMs: 1 }), 'ok');
  const breaker = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 100 }); await assert.rejects(() => breaker.execute(async () => { throw new Error('fail'); })); await assert.rejects(() => breaker.execute(async () => 'blocked'));
});
test('production environment validation rejects missing secrets', () => {
  const nodeEnv = process.env.NODE_ENV; const jwt = process.env.JWT_SECRET; const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.NODE_ENV = 'production'; process.env.JWT_SECRET = 'short'; delete process.env.STRIPE_WEBHOOK_SECRET;
  assert.throws(validateEnvironment, /Missing or unsafe/);
  process.env.NODE_ENV = nodeEnv; process.env.JWT_SECRET = jwt; if (webhook) process.env.STRIPE_WEBHOOK_SECRET = webhook;
});
test('release artifacts include accessibility and API contracts', () => {
  const css = fs.readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion/); assert.match(css, /focus-visible/);
  const openapi = fs.readFileSync(new URL('../../docs/openapi.yaml', import.meta.url), 'utf8');
  assert.match(openapi, /openapi: 3\.1\.0/); assert.match(openapi, /\/auth\/refresh/);
});
test('Spotify browser callback remains public', () => {
  const routes = fs.readFileSync(new URL('../routes/platform.routes.js', import.meta.url), 'utf8');
  assert.ok(routes.indexOf("router.get('/music/spotify/callback'") < routes.indexOf('router.use(protect)'));
});
test('priority two lifecycle and provider-neutral call schemas are constrained', () => {
  assert.deepEqual(Match.schema.path('firstMoveRule').enumValues, ['anyone', 'women-first', 'opening-move', 'custom']);
  assert.deepEqual(OpeningMove.schema.path('type').enumValues, ['text', 'emoji', 'prompt', 'question']);
  assert.deepEqual(CallSession.schema.path('status').enumValues, ['ringing', 'connected', 'ended', 'declined', 'missed', 'failed']);
});
test('priority three social and recommendation foundations are deterministic', async () => {
  assert.ok(Event.schema.indexes().some(([fields]) => fields.location === '2dsphere'));
  assert.ok(GroupConversation.schema.indexes().some(([fields, options]) => fields.type === 1 && fields.sourceId === 1 && options.unique));
  const scored = new ExplainableProvider().score({ interests: ['Music'], isVerified: true }, { interests: ['Music'] });
  assert.ok(scored.score > 0); assert.ok(scored.reasons.includes('interest'));
  const cache = new MemoryCache(); await cache.set('x', { ok: true }, 30); assert.deepEqual(await cache.get('x'), { ok: true });
});
test('notification preferences default to user-safe channels', () => {
  const value = new NotificationPreference({ userId: '507f1f77bcf86cd799439011' });
  assert.equal(value.push, true); assert.equal(value.marketing, false); assert.equal(value.safety, true);
});
test('priority one schemas preserve tier and interaction constraints', () => {
  assert.deepEqual(Subscription.schema.path('plan').enumValues, ['free', 'plus', 'gold', 'platinum', 'premium']);
  assert.deepEqual(Like.schema.path('kind').enumValues, ['like', 'super-like']);
  assert.equal(ProfilePrompt.schema.indexes().some(([fields, options]) => fields.userId === 1 && fields.orderIndex === 1 && options.unique), true);
});
