const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/stockController');
const { validate } = require('../middleware/validate');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', controller.listCategories);
router.post(
  '/categories',
  requireRole('owner', 'staff'),
  [body('name').trim().isLength({ min: 1, max: 50 })],
  validate,
  controller.createCategory
);
router.delete(
  '/categories/:id',
  requireRole('owner'),
  [param('id').isInt({ min: 1 })],
  validate,
  controller.removeCategory
);

router.get('/', controller.list);
router.get('/low-stock', controller.lowStock);
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('category').trim().isLength({ min: 1, max: 50 }),
    body('quantity').isFloat({ min: 0 }),
    body('item_detail').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('unit').trim().notEmpty(),
    body('par_level').optional({ nullable: true }).isFloat({ min: 0 }),
    body('max_level').optional({ nullable: true }).isFloat({ min: 0 }),
  ],
  validate,
  controller.create
);
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }),
    body('category').optional().trim().isLength({ min: 1, max: 50 }),
    body('quantity').optional().isFloat({ min: 0 }),
    body('delta').optional().isFloat(),
    body('item_detail').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('par_level').optional({ nullable: true }).isFloat({ min: 0 }),
    body('max_level').optional({ nullable: true }).isFloat({ min: 0 }),
  ],
  validate,
  controller.update
);
router.delete('/:id', [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
