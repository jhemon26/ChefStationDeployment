const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/menuController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', [query('date').optional().isISO8601()], validate, controller.list);
router.post(
  '/',
  [
    body('dish_id').isInt({ min: 1 }),
    body('date').optional().isISO8601(),
    body('total_portions').isInt({ min: 0 }),
    body('remaining_portions').optional().isInt({ min: 0 }),
  ],
  validate,
  controller.upsert
);
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }),
    body('delta').optional().isInt(),
    body('remaining_portions').optional().isInt({ min: 0 }),
  ],
  validate,
  controller.update
);
router.post('/reset', [body('date').optional().isISO8601()], validate, controller.resetDay);

module.exports = router;
