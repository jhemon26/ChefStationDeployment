const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { migrate } = require('./config/migrate');
const { authenticate, requireRole } = require('./middleware/auth');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const userRoutes = require('./routes/userRoutes');
const inviteCodeRoutes = require('./routes/inviteCodeRoutes');
const dishRoutes = require('./routes/dishRoutes');
const menuRoutes = require('./routes/menuRoutes');
const prepRoutes = require('./routes/prepRoutes');
const stockRoutes = require('./routes/stockRoutes');
const todoRoutes = require('./routes/todoRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
// Netlify's edge sits in front — trust one hop so rate-limiter sees real IPs
app.set('trust proxy', 1);
const allowedOrigins = new Set(env.CORS_ORIGINS);
const isProd = env.NODE_ENV === 'production';

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
          },
        }
      : false,
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // In production, always require an explicit allow-list — never fail open
      if (!origin) {
        // Same-origin or server-to-server — allow
        callback(null, true);
        return;
      }
      if (isProd && allowedOrigins.size === 0) {
        callback(new Error('CORS origins not configured'));
        return;
      }
      if (allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);
// Serve uploads only from the configured directory — no directory listing
app.use('/uploads', express.static(path.join(env.UPLOAD_DIR), { index: false, dotfiles: 'deny' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', authenticate, requireRole('super_admin'), restaurantRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/invite-codes', authenticate, requireRole('owner'), inviteCodeRoutes);
app.use('/api/dishes', authenticate, requireRole('owner', 'staff'), dishRoutes);
app.use('/api/menu-counts', authenticate, requireRole('owner', 'staff'), menuRoutes);
app.use('/api/prep-tasks', authenticate, requireRole('owner', 'staff'), prepRoutes);
app.use('/api/stock', authenticate, requireRole('owner', 'staff'), stockRoutes);
app.use('/api/todos', authenticate, requireRole('owner', 'staff'), todoRoutes);
app.use('/api/recipes', authenticate, requireRole('owner', 'staff'), recipeRoutes);
app.use('/api/settings', authenticate, requireRole('owner'), settingsRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await migrate();
  app.listen(env.PORT, () => {
    console.log(`[server] listening on ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('[startup]', err);
  process.exit(1);
});

module.exports = app;
