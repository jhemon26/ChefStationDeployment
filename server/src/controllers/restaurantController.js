const Restaurant = require('../models/Restaurant');

async function list(_req, res, next) {
  try {
    const rows = await Restaurant.listAll();
    res.json(rows);
  } catch (e) { next(e); }
}

async function suspend(req, res, next) {
  try {
    const r = await Restaurant.setActive(req.params.id, false);
    if (!r) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(r);
  } catch (e) { next(e); }
}

async function activate(req, res, next) {
  try {
    const r = await Restaurant.setActive(req.params.id, true);
    if (!r) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(r);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const r = await Restaurant.update(req.params.id, req.body);
    if (!r) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(r);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    await Restaurant.remove(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
}

module.exports = { list, suspend, activate, update, remove };
