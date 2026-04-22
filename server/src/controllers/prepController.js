const PrepTask = require('../models/PrepTask');
const { toLocalDateString } = require('../utils/date');

const getDateParam = (value) => value || toLocalDateString();

async function list(req, res, next) {
  try {
    const rows = await PrepTask.listByDate(req.user.restaurant_id, getDateParam(req.query.date));
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const row = await PrepTask.create({
      restaurant_id: req.user.restaurant_id,
      task_name: req.body.task_name,
      notes: req.body.notes || null,
      quantity: req.body.quantity || null,
      unit: req.body.unit || null,
      assigned_to: req.body.assigned_to || null,
      priority: req.body.priority || 'medium',
      date: getDateParam(req.body.date),
      created_by: req.user.id,
    });

    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const row = await PrepTask.update(req.params.id, req.user.restaurant_id, req.body, req.user.id);
    if (!row) return res.status(404).json({ error: 'Prep task not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await PrepTask.remove(req.params.id, req.user.restaurant_id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove };
