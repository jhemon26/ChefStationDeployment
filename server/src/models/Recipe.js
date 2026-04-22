const { query } = require('../config/db');

const listByRestaurant = async (restaurantId) => {
  const { rows } = await query(
    `SELECT r.*, d.name AS dish_name, d.ingredients,
       COALESCE(
         json_agg(
           json_build_object('name', da.allergen_name, 'is_custom', da.is_custom)
           ORDER BY da.allergen_name ASC
         ) FILTER (WHERE da.id IS NOT NULL),
         '[]'
       ) AS allergens
     FROM recipes r
     JOIN dishes d ON d.id = r.dish_id
     LEFT JOIN dish_allergens da ON da.dish_id = d.id
     WHERE r.restaurant_id = $1
     GROUP BY r.id, d.name, d.ingredients
     ORDER BY d.name ASC`,
    [restaurantId]
  );
  return rows;
};

const findById = async (id, restaurantId) => {
  const { rows } = await query(
    `SELECT r.*, d.name AS dish_name, d.ingredients,
       COALESCE(
         json_agg(
           json_build_object('name', da.allergen_name, 'is_custom', da.is_custom)
           ORDER BY da.allergen_name ASC
         ) FILTER (WHERE da.id IS NOT NULL),
         '[]'
       ) AS allergens
     FROM recipes r
     JOIN dishes d ON d.id = r.dish_id
     LEFT JOIN dish_allergens da ON da.dish_id = d.id
     WHERE r.id = $1 AND r.restaurant_id = $2
     GROUP BY r.id, d.name, d.ingredients`,
    [id, restaurantId]
  );
  return rows[0] || null;
};

const create = async ({ restaurant_id, dish_id, steps, notes, prep_time_mins, total_steps, section, photo_url, created_by }) => {
  const { rows } = await query(
    `INSERT INTO recipes (restaurant_id, dish_id, steps, notes, prep_time_mins, total_steps, section, photo_url, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [restaurant_id, dish_id, steps, notes, prep_time_mins, total_steps, section, photo_url, created_by]
  );
  return rows[0];
};

const update = async (id, restaurantId, { steps, notes, prep_time_mins, total_steps, section, photo_url }) => {
  const { rows } = await query(
    `UPDATE recipes SET
       steps = COALESCE($3, steps),
       notes = COALESCE($4, notes),
       prep_time_mins = COALESCE($5, prep_time_mins),
       total_steps = COALESCE($6, total_steps),
       section = COALESCE($7, section),
       photo_url = COALESCE($8, photo_url),
       updated_at = NOW()
     WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    [id, restaurantId, steps, notes, prep_time_mins, total_steps, section, photo_url]
  );
  return rows[0] || null;
};

const remove = async (id, restaurantId) => {
  const { rows } = await query(
    `DELETE FROM recipes WHERE id = $1 AND restaurant_id = $2 RETURNING photo_url`,
    [id, restaurantId]
  );
  return rows[0] || null;
};

module.exports = { listByRestaurant, findById, create, update, remove };
