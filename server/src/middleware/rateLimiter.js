const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const skipInDevelopment = () => env.NODE_ENV === 'development';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: { error: 'Too many auth attempts, please try again later' },
});

module.exports = { apiLimiter, authLimiter };
