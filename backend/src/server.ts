import express from 'express';
import cors from 'cors';
import { env } from './config/environment';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimit } from './middleware/rateLimit';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import deitiesRouter from './routes/deities';
import chatRouter from './routes/chat';
import conversationsRouter from './routes/conversations';
import ttsRouter from './routes/tts';
import { logger } from './utils/logger';

const app = express();

// Core middleware — in production accept any origin (Expo Go + future native app)
const corsOrigin = env.NODE_ENV === 'production' ? true : env.ALLOWED_ORIGINS;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(globalRateLimit);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/deities', deitiesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/tts', ttsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Sanathana Dharma API running on port ${env.PORT} [${env.NODE_ENV}]`);
  if (!env.ANTHROPIC_API_KEY || env.MOCK_MODE) {
    logger.warn('MOCK MODE active — Claude API is disabled. Pre-written Hanuma responses will be used.');
    logger.warn('To use real AI: set ANTHROPIC_API_KEY in environment variables');
  }
  if (!env.ELEVENLABS_API_KEY) {
    logger.warn('ELEVENLABS_API_KEY not set — voice mode disabled');
  }
});

export default app;
