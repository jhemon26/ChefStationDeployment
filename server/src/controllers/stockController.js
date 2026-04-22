const StockItem = require('../models/StockItem');
const StockCategory = require('../models/StockCategory');

async function list(req, res, next) {
  try {
    const rows = await StockItem.listByRestaurant(req.user.restaurant_id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function ensureCategoryExists(restaurantId, rawName) {
  const name = StockCategory.normalize(rawName);
  if (!name) return null;
  const existing = await StockCategory.listByRestaurant(restaurantId);
  const match = existing.find((c) => c.name.toLowerCase() === name);
  if (match) return match;
  return StockCategory.create({ restaurant_id: restaurantId, name });
}

async function create(req, res, next) {
  try {
    const normalizedCategory = StockCategory.normalize(req.body.category);
    if (!normalizedCategory) return res.status(400).json({ error: 'Category is required' });
    await ensureCategoryExists(req.user.restaurant_id, normalizedCategory);

    const row = await StockItem.create({
      restaurant_id: req.user.restaurant_id,
      name: req.body.name,
      category: normalizedCategory,
      quantity: Number(req.body.quantity),
      item_size: null,
      item_detail: req.body.item_detail ? String(req.body.item_detail).trim() : null,
      unit: req.body.unit,
      par_level: req.body.par_level === undefined ? null : Number(req.body.par_level),
      max_level: req.body.max_level === undefined ? null : Number(req.body.max_level),
      updated_by: req.user.id,
    });

    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const updates = { ...req.body };

    if (updates.category !== undefined) {
      const normalized = StockCategory.normalize(updates.category);
      if (!normalized) return res.status(400).json({ error: 'Category is required' });
      await ensureCategoryExists(req.user.restaurant_id, normalized);
      updates.category = normalized;
    }

    if (req.body.delta !== undefined) {
      const currentItems = await StockItem.listByRestaurant(req.user.restaurant_id);
      const current = currentItems.find((item) => String(item.id) === String(req.params.id));
      if (!current) return res.status(404).json({ error: 'Stock item not found' });
      updates.quantity = Math.max(0, Number(current.quantity) + Number(req.body.delta));
    }

    if (updates.quantity !== undefined) updates.quantity = Math.max(0, Number(updates.quantity));
    if (updates.item_detail !== undefined) {
      updates.item_detail = updates.item_detail ? String(updates.item_detail).trim() : null;
    }
    if (updates.par_level !== undefined && updates.par_level !== null) {
      updates.par_level = Number(updates.par_level);
    }
    if (updates.max_level !== undefined && updates.max_level !== null) {
      updates.max_level = Number(updates.max_level);
    }

    const row = await StockItem.update(req.params.id, req.user.restaurant_id, updates, req.user.id);
    if (!row) return res.status(404).json({ error: 'Stock item not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await StockItem.remove(req.params.id, req.user.restaurant_id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

async function lowStock(req, res, next) {
  try {
    const rows = await StockItem.lowStock(req.user.restaurant_id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function listCategories(req, res, next) {
  try {
    const rows = await StockCategory.listByRestaurant(req.user.restaurant_id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function createCategory(req, res, next) {
  try {
    const name = StockCategory.normalize(req.body.name);
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const row = await StockCategory.create({ restaurant_id: req.user.restaurant_id, name });
    if (!row) return res.status(400).json({ error: 'Invalid category name' });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

async function removeCategory(req, res, next) {
  try {
    const result = await StockCategory.remove(req.params.id, req.user.restaurant_id);
    if (result.reason === 'not_found') return res.status(404).json({ error: 'Category not found' });
    if (result.reason === 'in_use') {
      return res.status(409).json({ error: 'Cannot remove a category while stock items still use it' });
    }
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
  lowStock,
  listCategories,
  createCategory,
  removeCategory,
};
