const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/recipeController');
const { upload } = require('../middleware/fileUpload');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', [param('id').isInt({ min: 1 })], validate, controller.getOne);
router.post(
  '/',
  upload.single('photo'),
  [
    body('dish_name').trim().notEmpty(),
    body('steps').trim().notEmpty(),
    body('notes').optional({ nullable: true }).isString(),
    body('prep_time_mins').optional({ nullable: true }).isInt({ min: 0 }),
    body('total_steps').optional({ nullable: true }).isInt({ min: 0 }),
    body('section').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
  ],
  validate,
  controller.create
);
router.put(
  '/:id',
  upload.single('photo'),
  [
    param('id').isInt({ min: 1 }),
    body('notes').optional({ nullable: true }).isString(),
    body('prep_time_mins').optional({ nullable: true }).isInt({ min: 0 }),
    body('total_steps').optional({ nullable: true }).isInt({ min: 0 }),
    body('section').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
  ],
  validate,
  controller.update
);
router.delete('/:id', [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
