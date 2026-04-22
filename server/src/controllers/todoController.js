const TodoItem = require('../models/TodoItem');
const { toLocalDateString } = require('../utils/date');

const getDateParam = (value) => value || toLocalDateString();

async function list(req, res, next) {
  try {
    const rows = await TodoItem.listByDate(req.user.restaurant_id, getDateParam(req.query.date));
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const row = await TodoItem.create({
      restaurant_id: req.user.restaurant_id,
      task_text: req.body.task_text,
      notes: req.body.notes || null,
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
    let row = null;

    if (typeof req.body.is_completed === 'boolean') {
      row = await TodoItem.setCompleted(
        req.params.id,
        req.user.restaurant_id,
        req.body.is_completed,
        req.user.id
      );
    }

    if (
      req.body.task_text !== undefined ||
      req.body.notes !== undefined ||
      req.body.priority !== undefined ||
      req.body.sort_order !== undefined
    ) {
      row = await TodoItem.update(req.params.id, req.user.restaurant_id, req.body);
    }

    if (!row) return res.status(404).json({ error: 'Todo item not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await TodoItem.remove(req.params.id, req.user.restaurant_id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove };
