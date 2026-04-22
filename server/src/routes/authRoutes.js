const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register-restaurant',
  authLimiter,
  [
    body('restaurantName').trim().notEmpty(),
    body('username').trim().isLength({ min: 3 }),
    body('password').isLength({ min: 8 }),
    body('displayName').trim().notEmpty(),
  ],
  validate,
  controller.registerRestaurant
);

router.post(
  '/register-staff',
  authLimiter,
  [
    body('inviteCode').trim().notEmpty(),
    body('username').trim().isLength({ min: 3 }),
    body('password').isLength({ min: 8 }),
    body('displayName').trim().notEmpty(),
  ],
  validate,
  controller.registerStaff
);

router.post(
  '/login',
  authLimiter,
  [body('username').trim().notEmpty(), body('password').notEmpty()],
  validate,
  controller.login
);

router.post('/logout', (_req, res) => res.json({ ok: true }));
router.get('/me', authenticate, controller.me);

module.exports = router;
