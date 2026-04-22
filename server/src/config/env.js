const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../..');
const serverRoot = path.resolve(__dirname, '../..');
const envPath = [path.join(projectRoot, '.env'), path.join(serverRoot, '.env')].find((candidate) =>
  fs.existsSync(candidate)
);

require('dotenv').config(envPath ? { path: envPath } : undefined);

const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var: ${name}`);
  return v;
};

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: required('DATABASE_URL', 'postgresql://chefstation:chefstation_pw@localhost:5432/chefstation'),
  JWT_SECRET: required('JWT_SECRET', 'dev-secret-change-me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CORS_ORIGINS: parseOrigins(process.env.CORS_ORIGIN || 'http://localhost:3000'),
  API_RATE_LIMIT_WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  API_RATE_LIMIT_MAX: parseInt(process.env.API_RATE_LIMIT_MAX || '2000', 10),
  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '200', 10),
  SEED_SUPER_ADMIN_USERNAME: process.env.SEED_SUPER_ADMIN_USERNAME || 'admin',
  SEED_SUPER_ADMIN_PASSWORD: process.env.SEED_SUPER_ADMIN_PASSWORD || 'changeme123',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
};
