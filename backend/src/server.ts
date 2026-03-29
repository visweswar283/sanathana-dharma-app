import express from 'express';
import cors from 'cors';
import { env } from './config/environment';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimit } from './middleware/rateLimit';
import healthRouter from './routes/health';
import { logger } from './utils/logger';

const app = express();

// Core middleware
app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(globalRateLimit);

// Routes
app.use('/api/health', healthRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Sanathana Dharma API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
