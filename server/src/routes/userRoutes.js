const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/userController');
const { requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/me', controller.me);
router.put(
  '/me',
  [
    body('username').optional().trim().isLength({ min: 3 }),
    body('displayName').optional().trim().notEmpty(),
    body('currentPassword').optional().isLength({ min: 8 }),
    body('newPassword').optional().isLength({ min: 8 }),
  ],
  validate,
  controller.updateMe
);

router.get('/', requireRole('super_admin', 'owner'), controller.list);
router.put('/:id/suspend', requireRole('super_admin', 'owner'), [param('id').isInt({ min: 1 })], validate, controller.suspend);
router.put('/:id/activate', requireRole('super_admin', 'owner'), [param('id').isInt({ min: 1 })], validate, controller.activate);
router.put(
  '/:id/reset-password',
  requireRole('super_admin', 'owner'),
  [param('id').isInt({ min: 1 }), body('password').isLength({ min: 8 })],
  validate,
  controller.resetPassword
);
router.delete('/:id', requireRole('super_admin', 'owner'), [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
