const { query } = require('../config/db');

const listByDate = async (restaurantId, date) => {
  const { rows } = await query(
    `SELECT mc.*, d.name AS dish_name,
       COALESCE(
         json_agg(
           json_build_object('name', da.allergen_name, 'is_custom', da.is_custom)
           ORDER BY da.allergen_name ASC
         ) FILTER (WHERE da.id IS NOT NULL),
         '[]'
       ) AS allergens
     FROM menu_counts mc
     JOIN dishes d ON d.id = mc.dish_id
     LEFT JOIN dish_allergens da ON da.dish_id = d.id
     WHERE mc.restaurant_id = $1 AND mc.date = $2
     GROUP BY mc.id, d.name
     ORDER BY d.name ASC`,
    [restaurantId, date]
  );
  return rows;
};

const upsert = async ({ restaurant_id, dish_id, date, total_portions, remaining_portions, updated_by }) => {
  const { rows } = await query(
    `INSERT INTO menu_counts (restaurant_id, dish_id, date, total_portions, remaining_portions, updated_by)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (restaurant_id, dish_id, date)
     DO UPDATE SET total_portions = EXCLUDED.total_portions,
                   remaining_portions = EXCLUDED.remaining_portions,
                   updated_by = EXCLUDED.updated_by,
                   updated_at = NOW()
     RETURNING *`,
    [restaurant_id, dish_id, date, total_portions, remaining_portions, updated_by]
  );
  return rows[0];
};

const updateRemaining = async (id, restaurantId, delta, userId) => {
  const { rows } = await query(
    `UPDATE menu_counts
     SET remaining_portions = GREATEST(0, remaining_portions + $3),
         updated_by = $4,
         updated_at = NOW()
     WHERE id = $1 AND restaurant_id = $2
     RETURNING *`,
    [id, restaurantId, delta, userId]
  );
  return rows[0] || null;
};

const setRemaining = async (id, restaurantId, value, userId) => {
  const { rows } = await query(
    `UPDATE menu_counts
     SET remaining_portions = GREATEST(0, $3),
         updated_by = $4,
         updated_at = NOW()
     WHERE id = $1 AND restaurant_id = $2
     RETURNING *`,
    [id, restaurantId, value, userId]
  );
  return rows[0] || null;
};

const resetDay = async (restaurantId, date, userId) => {
  await query(
    `UPDATE menu_counts SET remaining_portions = 0, updated_by = $3, updated_at = NOW()
     WHERE restaurant_id = $1 AND date = $2`,
    [restaurantId, date, userId]
  );
};

module.exports = { listByDate, upsert, updateRemaining, setRemaining, resetDay };
