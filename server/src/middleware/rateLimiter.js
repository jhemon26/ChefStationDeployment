const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const isProd = env.NODE_ENV === 'production';

// In development skip rate limits so local work isn't interrupted.
// In production ALL limiters are always active.
const skipInDev = () => !isProd;

const apiLimiter = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { error: 'Too many requests, please try again later' },
});

// Auth: tighter window and much lower cap — 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: isProd ? Math.min(env.AUTH_RATE_LIMIT_MAX, 10) : env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { error: 'Too many auth attempts, please try again later' },
});

// Upload: 20 file uploads per 10 minutes per IP
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { error: 'Too many uploads, please try again later' },
});

// Sensitive user ops (password reset, suspend, delete): 15 per 15 min per IP
const userMgmtLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { error: 'Too many requests, please try again later' },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, userMgmtLimiter };
