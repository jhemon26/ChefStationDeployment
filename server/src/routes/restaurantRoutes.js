const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/restaurantController');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', controller.list);
router.put('/:id', [param('id').isInt({ min: 1 })], validate, controller.update);
router.put('/:id/suspend', [param('id').isInt({ min: 1 })], validate, controller.suspend);
router.put('/:id/activate', [param('id').isInt({ min: 1 })], validate, controller.activate);
router.delete('/:id', [param('id').isInt({ min: 1 })], validate, controller.remove);

module.exports = router;
