const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/dishController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', controller.list);
router.post('/', [body('name').trim().notEmpty()], validate, controller.create);
router.put('/:id', [param('id').isInt({ min: 1 })], validate, controller.update);
router.delete('/:id', [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
