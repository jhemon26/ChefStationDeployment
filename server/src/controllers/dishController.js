const Dish = require('../models/Dish');

const normalizeAllergens = (allergens) => {
  if (!Array.isArray(allergens)) return [];

  return allergens
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item.trim(), is_custom: true };
      }

      if (!item || typeof item !== 'object') return null;

      return {
        name: String(item.name || '').trim(),
        is_custom: Boolean(item.is_custom),
      };
    })
    .filter((item) => item && item.name);
};

async function list(req, res, next) {
  try {
    const rows = await Dish.listByRestaurant(req.user.restaurant_id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const dish = await Dish.createWithAllergens({
      restaurant_id: req.user.restaurant_id,
      name: req.body.name,
      course: req.body.course || null,
      ingredients: req.body.ingredients || null,
      show_on_menu: req.body.show_on_menu !== false,
      created_by: req.user.id,
      allergens: normalizeAllergens(req.body.allergens),
    });

    const fullDish = await Dish.findById(dish.id, req.user.restaurant_id);
    res.status(201).json(fullDish || dish);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const updated = await Dish.updateWithAllergens(req.params.id, req.user.restaurant_id, {
      name: req.body.name,
      course: req.body.course,
      ingredients: req.body.ingredients,
      show_on_menu: req.body.show_on_menu,
      allergens: Array.isArray(req.body.allergens)
        ? normalizeAllergens(req.body.allergens)
        : undefined,
    });

    if (!updated) return res.status(404).json({ error: 'Dish not found' });

    const fullDish = await Dish.findById(updated.id, req.user.restaurant_id);
    res.json(fullDish || updated);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await Dish.findById(req.params.id, req.user.restaurant_id);
    if (!existing) return res.status(404).json({ error: 'Dish not found' });

    await Dish.remove(req.params.id, req.user.restaurant_id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove };
