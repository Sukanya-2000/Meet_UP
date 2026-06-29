import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import photoRoutes from './routes/photo.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import swipeRoutes from './routes/swipe.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import likeRoutes from './routes/like.routes.js';
import matchRoutes from './routes/match.routes.js';
import messageRoutes from './routes/message.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import premiumRoutes from './routes/premium.routes.js';
import reportRoutes from './routes/report.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import safetyRoutes from './routes/safety.routes.js';
import likesRoutes from './routes/likes.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import featureRoutes from './routes/feature.routes.js';
import { stripeWebhook } from './controllers/payment.controller.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { sanitizeInput } from './middleware/security.middleware.js';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.set('trust proxy', 1);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    await stripeWebhook(req, res);
  } catch (error) {
    next(error);
  }
});
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use('/uploads', express.static(path.resolve('uploads')));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'CyberNest API is healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/features', featureRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
