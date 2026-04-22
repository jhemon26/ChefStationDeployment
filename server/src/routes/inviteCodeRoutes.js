const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/inviteCodeController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', controller.list);
router.post(
  '/',
  [body('role').optional().isIn(['staff'])],
  validate,
  controller.create
);
router.delete('/:id', [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
