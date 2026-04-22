const { query } = require('../config/db');

const listByDate = async (restaurantId, date) => {
  const { rows } = await query(
    `SELECT t.*, cu.display_name AS completed_by_name
     FROM todo_items t
     LEFT JOIN users cu ON cu.id = t.completed_by
     WHERE t.restaurant_id = $1 AND t.date = $2
     ORDER BY t.sort_order ASC, t.task_text ASC`,
    [restaurantId, date]
  );
  return rows;
};

const create = async ({ restaurant_id, task_text, notes, priority, date, created_by }) => {
  const { rows } = await query(
    `INSERT INTO todo_items (restaurant_id, task_text, notes, priority, sort_order, date, created_by)
     VALUES (
       $1,$2,$3,$4,
       COALESCE((SELECT MAX(sort_order) + 1 FROM todo_items WHERE restaurant_id = $1 AND date = $5), 1),
       $5,$6
     ) RETURNING *`,
    [restaurant_id, task_text, notes, priority, date, created_by]
  );
  return rows[0];
};

const findById = async (id, restaurantId) => {
  const { rows } = await query(
    `SELECT * FROM todo_items WHERE id = $1 AND restaurant_id = $2`,
    [id, restaurantId]
  );
  return rows[0] || null;
};

const setCompleted = async (id, restaurantId, isCompleted, userId) => {
  const { rows } = await query(
    `UPDATE todo_items SET
       is_completed = $3,
       completed_by = CASE WHEN $3 THEN $4::int ELSE NULL END,
       completed_at = CASE WHEN $3 THEN NOW() ELSE NULL END
     WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    [id, restaurantId, isCompleted, userId]
  );
  return rows[0] || null;
};

const update = async (id, restaurantId, { task_text, notes, priority, sort_order }) => {
  const { rows } = await query(
    `UPDATE todo_items SET
       task_text = COALESCE($3, task_text),
       notes = COALESCE($4, notes),
       priority = COALESCE($5, priority),
       sort_order = COALESCE($6, sort_order)
     WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    [id, restaurantId, task_text, notes, priority, sort_order]
  );
  return rows[0] || null;
};

const remove = async (id, restaurantId) => {
  await query(`DELETE FROM todo_items WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
};

module.exports = { listByDate, create, findById, setCompleted, update, remove };
