import rateLimit from 'express-rate-limit';

export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMIT', message: 'Too many requests. Please slow down.' },
  },
});

export const chatRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => {
    const userId = (req as any).userId;
    return userId ?? req.ip ?? 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'DAILY_LIMIT_REACHED',
      message: 'You have reached your daily message limit. Come back tomorrow for more blessings.',
    },
  },
});
