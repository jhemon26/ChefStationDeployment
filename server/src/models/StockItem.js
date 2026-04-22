const { query } = require('../config/db');

const listByRestaurant = async (restaurantId) => {
  const { rows } = await query(
    `SELECT * FROM stock_items WHERE restaurant_id = $1 ORDER BY name ASC`,
    [restaurantId]
  );
  return rows;
};

const create = async ({ restaurant_id, name, category, quantity, item_size, item_detail, unit, par_level, max_level, updated_by }) => {
  const { rows } = await query(
    `INSERT INTO stock_items (restaurant_id, name, category, quantity, item_size, item_detail, unit, par_level, max_level, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [restaurant_id, name, category, quantity, item_size, item_detail, unit, par_level, max_level, updated_by]
  );
  return rows[0];
};

const update = async (id, restaurantId, { name, category, quantity, item_size, item_detail, unit, par_level, max_level }, userId) => {
  const { rows } = await query(
    `UPDATE stock_items SET
       name = COALESCE($3, name),
       category = COALESCE($4, category),
       quantity = GREATEST(0, COALESCE($5, quantity)),
       item_size = COALESCE($6, item_size),
       item_detail = COALESCE($7, item_detail),
       unit = COALESCE($8, unit),
       par_level = COALESCE($9, par_level),
       max_level = COALESCE($10, max_level),
       updated_by = $11,
       updated_at = NOW()
     WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    [id, restaurantId, name, category, quantity, item_size, item_detail, unit, par_level, max_level, userId]
  );
  return rows[0] || null;
};

const remove = async (id, restaurantId) => {
  await query(`DELETE FROM stock_items WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
};

const lowStock = async (restaurantId) => {
  const { rows } = await query(
    `SELECT * FROM stock_items
     WHERE restaurant_id = $1 AND par_level IS NOT NULL AND quantity < par_level
     ORDER BY name ASC`,
    [restaurantId]
  );
  return rows;
};

module.exports = { listByRestaurant, create, update, remove, lowStock };
