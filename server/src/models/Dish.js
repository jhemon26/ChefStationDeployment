const { pool, query } = require('../config/db');

const listByRestaurant = async (restaurantId) => {
  const { rows } = await query(
    `SELECT d.*,
       COALESCE(
         json_agg(
           json_build_object('id', da.id, 'name', da.allergen_name, 'is_custom', da.is_custom)
           ORDER BY da.allergen_name ASC
         ) FILTER (WHERE da.id IS NOT NULL),
         '[]'
       ) AS allergens
     FROM dishes d
     LEFT JOIN dish_allergens da ON da.dish_id = d.id
     WHERE d.restaurant_id = $1
     GROUP BY d.id
     ORDER BY d.name ASC`,
    [restaurantId]
  );
  return rows;
};

const findById = async (id, restaurantId) => {
  const { rows } = await query(
    `SELECT * FROM dishes WHERE id = $1 AND restaurant_id = $2`,
    [id, restaurantId]
  );
  return rows[0] || null;
};

const createWithAllergens = async ({ restaurant_id, name, course, ingredients, show_on_menu, created_by, allergens }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO dishes (restaurant_id, name, course, ingredients, show_on_menu, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [restaurant_id, name, course || null, ingredients, !!show_on_menu, created_by]
    );
    const dish = rows[0];
    for (const a of allergens || []) {
      await client.query(
        `INSERT INTO dish_allergens (dish_id, allergen_name, is_custom) VALUES ($1,$2,$3)`,
        [dish.id, a.name, !!a.is_custom]
      );
    }
    await client.query('COMMIT');
    return dish;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const updateWithAllergens = async (id, restaurantId, { name, course, ingredients, show_on_menu, allergens }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE dishes SET
         name = COALESCE($3, name),
         course = COALESCE($4, course),
         ingredients = COALESCE($5, ingredients),
         show_on_menu = COALESCE($6, show_on_menu),
         updated_at = NOW()
       WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
      [id, restaurantId, name, course, ingredients, show_on_menu]
    );
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    if (Array.isArray(allergens)) {
      await client.query(`DELETE FROM dish_allergens WHERE dish_id = $1`, [id]);
      for (const a of allergens) {
        await client.query(
          `INSERT INTO dish_allergens (dish_id, allergen_name, is_custom) VALUES ($1,$2,$3)`,
          [id, a.name, !!a.is_custom]
        );
      }
    }
    await client.query('COMMIT');
    return rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const remove = async (id, restaurantId) => {
  await query(`DELETE FROM dishes WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
};

module.exports = { listByRestaurant, findById, createWithAllergens, updateWithAllergens, remove };
