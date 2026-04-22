const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/prepController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', [query('date').optional().isISO8601()], validate, controller.list);
router.post(
  '/',
  [
    body('task_name').trim().notEmpty(),
    body('notes').optional({ nullable: true }).isString(),
    body('priority').optional().isIn(['urgent', 'medium', 'low']),
    body('date').optional().isISO8601(),
  ],
  validate,
  controller.create
);
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }),
    body('notes').optional({ nullable: true }).isString(),
    body('status').optional().isIn(['pending', 'done']),
    body('priority').optional().isIn(['urgent', 'medium', 'low']),
    body('sort_order').optional().isInt({ min: 0 }),
  ],
  validate,
  controller.update
);
router.delete('/:id', [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
