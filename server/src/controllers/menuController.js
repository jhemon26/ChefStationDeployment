const MenuCount = require('../models/MenuCount');
const Dish = require('../models/Dish');
const { toLocalDateString } = require('../utils/date');

const getDateParam = (value) => value || toLocalDateString();

async function list(req, res, next) {
  try {
    const rows = await MenuCount.listByDate(req.user.restaurant_id, getDateParam(req.query.date));
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function upsert(req, res, next) {
  try {
    const dish = await Dish.findById(req.body.dish_id, req.user.restaurant_id);
    if (!dish) return res.status(404).json({ error: 'Dish not found' });

    const total = Number(req.body.total_portions);
    const remaining =
      req.body.remaining_portions === undefined ? total : Number(req.body.remaining_portions);

    const row = await MenuCount.upsert({
      restaurant_id: req.user.restaurant_id,
      dish_id: Number(req.body.dish_id),
      date: getDateParam(req.body.date),
      total_portions: total,
      remaining_portions: remaining,
      updated_by: req.user.id,
    });

    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    let row = null;

    if (req.body.delta !== undefined) {
      row = await MenuCount.updateRemaining(
        req.params.id,
        req.user.restaurant_id,
        Number(req.body.delta),
        req.user.id
      );
    } else if (req.body.remaining_portions !== undefined) {
      row = await MenuCount.setRemaining(
        req.params.id,
        req.user.restaurant_id,
        Number(req.body.remaining_portions),
        req.user.id
      );
    } else {
      return res.status(400).json({ error: 'Provide delta or remaining_portions' });
    }

    if (!row) return res.status(404).json({ error: 'Menu count not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

async function resetDay(req, res, next) {
  try {
    const date = getDateParam(req.body.date || req.query.date);
    await MenuCount.resetDay(req.user.restaurant_id, date, req.user.id);
    res.json({ ok: true, date });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, upsert, update, resetDay };
