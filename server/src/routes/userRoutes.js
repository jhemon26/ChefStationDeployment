const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/fileUpload');
const { validate } = require('../middleware/validate');
const { uploadLimiter, userMgmtLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes in this file are already mounted under authenticate in index.js,
// but we add it here explicitly too so the file is self-contained and safe
// if the mount ever changes.
router.use(authenticate);

router.get('/me', controller.me);
router.put(
  '/me',
  uploadLimiter,
  avatarUpload.single('avatar'),
  [
    body('username').optional().trim().isLength({ min: 3, max: 100 }),
    body('displayName').optional().trim().isLength({ min: 1, max: 255 }),
    body('currentPassword').optional().isLength({ min: 8 }),
    body('newPassword').optional().isLength({ min: 10 }),
  ],
  validate,
  controller.updateMe
);

router.get('/', requireRole('super_admin', 'owner'), controller.list);

router.put(
  '/:id/suspend',
  userMgmtLimiter,
  requireRole('super_admin', 'owner'),
  [param('id').isInt({ min: 1 })],
  validate,
  controller.suspend
);
router.put(
  '/:id/activate',
  userMgmtLimiter,
  requireRole('super_admin', 'owner'),
  [param('id').isInt({ min: 1 })],
  validate,
  controller.activate
);
router.put(
  '/:id/reset-password',
  userMgmtLimiter,
  requireRole('super_admin', 'owner'),
  [param('id').isInt({ min: 1 }), body('password').isLength({ min: 10 })],
  validate,
  controller.resetPassword
);
router.delete(
  '/:id',
  userMgmtLimiter,
  requireRole('super_admin', 'owner'),
  [param('id').isInt({ min: 1 })],
  validate,
  controller.remove
);

module.exports = router;
