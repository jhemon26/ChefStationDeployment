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

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const JWT_SECRET = required('JWT_SECRET', 'dev-secret-change-me');

// Hard block: refuse to start in production with a weak or default JWT secret
if (isProd && (JWT_SECRET === 'dev-secret-change-me' || JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET must be at least 32 characters in production. Set a strong random value.');
}

const SEED_SUPER_ADMIN_PASSWORD = required('SEED_SUPER_ADMIN_PASSWORD', '');
if (isProd && (!SEED_SUPER_ADMIN_PASSWORD || SEED_SUPER_ADMIN_PASSWORD.length < 16)) {
  throw new Error('SEED_SUPER_ADMIN_PASSWORD must be at least 16 characters in production.');
}

module.exports = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '5001', 10),
  DATABASE_URL: required('DATABASE_URL', 'postgresql://chefstation:chefstation_pw@localhost:5432/chefstation'),
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CORS_ORIGINS: parseOrigins(process.env.CORS_ORIGIN || 'http://localhost:3000'),
  API_RATE_LIMIT_WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  API_RATE_LIMIT_MAX: parseInt(process.env.API_RATE_LIMIT_MAX || '2000', 10),
  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '200', 10),
  SEED_SUPER_ADMIN_USERNAME: process.env.SEED_SUPER_ADMIN_USERNAME || 'admin',
  SEED_SUPER_ADMIN_PASSWORD,
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
};
