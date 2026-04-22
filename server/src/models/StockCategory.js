const { query } = require('../config/db');

const normalize = (name) => String(name || '').trim().toLowerCase();

const listByRestaurant = async (restaurantId) => {
  const { rows } = await query(
    `SELECT id, restaurant_id, name, created_at,
       (SELECT COUNT(*)::int FROM stock_items si
         WHERE si.restaurant_id = sc.restaurant_id
           AND LOWER(si.category) = LOWER(sc.name)) AS item_count
     FROM stock_categories sc
     WHERE restaurant_id = $1
     ORDER BY name ASC`,
    [restaurantId]
  );
  return rows;
};

const create = async ({ restaurant_id, name }) => {
  const clean = normalize(name);
  if (!clean) return null;
  const { rows } = await query(
    `INSERT INTO stock_categories (restaurant_id, name)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [restaurant_id, clean]
  );
  if (rows[0]) return rows[0];
  const existing = await query(
    `SELECT * FROM stock_categories WHERE restaurant_id = $1 AND LOWER(name) = $2`,
    [restaurant_id, clean]
  );
  return existing.rows[0] || null;
};

const findById = async (id, restaurantId) => {
  const { rows } = await query(
    `SELECT * FROM stock_categories WHERE id = $1 AND restaurant_id = $2`,
    [id, restaurantId]
  );
  return rows[0] || null;
};

const remove = async (id, restaurantId) => {
  const cat = await findById(id, restaurantId);
  if (!cat) return { removed: false, reason: 'not_found' };
  const { rows } = await query(
    `SELECT 1 FROM stock_items
     WHERE restaurant_id = $1 AND LOWER(category) = LOWER($2)
     LIMIT 1`,
    [restaurantId, cat.name]
  );
  if (rows.length > 0) return { removed: false, reason: 'in_use' };
  await query(`DELETE FROM stock_categories WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
  return { removed: true };
};

module.exports = { listByRestaurant, create, findById, remove, normalize };
