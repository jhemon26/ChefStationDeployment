const Restaurant = require('../models/Restaurant');

async function get(req, res, next) {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurant_id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const restaurant = await Restaurant.update(req.user.restaurant_id, req.body);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (e) {
    next(e);
  }
}

module.exports = { get, update };
