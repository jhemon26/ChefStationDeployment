const { query } = require('../config/db');

const listByDate = async (restaurantId, date) => {
  const { rows } = await query(
    `SELECT pt.*, cu.display_name AS completed_by_name
     FROM prep_tasks pt
     LEFT JOIN users cu ON cu.id = pt.completed_by
     WHERE pt.restaurant_id = $1 AND pt.date = $2
     ORDER BY pt.sort_order ASC, pt.task_name ASC`,
    [restaurantId, date]
  );
  return rows;
};

const create = async ({ restaurant_id, task_name, notes, quantity, unit, assigned_to, priority, date, created_by }) => {
  const { rows } = await query(
    `INSERT INTO prep_tasks (restaurant_id, task_name, notes, quantity, unit, assigned_to, priority, sort_order, date, created_by)
     VALUES (
       $1,$2,$3,$4,$5,$6,$7,
       COALESCE((SELECT MAX(sort_order) + 1 FROM prep_tasks WHERE restaurant_id = $1 AND date = $8), 1),
       $8,$9
     ) RETURNING *`,
    [restaurant_id, task_name, notes || null, quantity, unit, assigned_to, priority, date, created_by]
  );
  return rows[0];
};

const findById = async (id, restaurantId) => {
  const { rows } = await query(
    `SELECT * FROM prep_tasks WHERE id = $1 AND restaurant_id = $2`,
    [id, restaurantId]
  );
  return rows[0] || null;
};

const update = async (id, restaurantId, { status, priority, task_name, notes, quantity, unit, assigned_to, sort_order }, userId) => {
  const { rows } = await query(
    `UPDATE prep_tasks SET
       status = COALESCE($3, status),
       priority = COALESCE($4, priority),
       task_name = COALESCE($5, task_name),
       notes = COALESCE($6, notes),
       quantity = COALESCE($7, quantity),
       unit = COALESCE($8, unit),
       assigned_to = COALESCE($9, assigned_to),
       sort_order = COALESCE($10, sort_order),
       completed_by = CASE
         WHEN $3 = 'done' THEN $11::int
         WHEN $3 = 'pending' THEN NULL
         ELSE completed_by
       END,
       completed_at = CASE
         WHEN $3 = 'done' THEN NOW()
         WHEN $3 = 'pending' THEN NULL
         ELSE completed_at
       END
     WHERE id = $1 AND restaurant_id = $2 RETURNING *`,
    [id, restaurantId, status, priority, task_name, notes, quantity, unit, assigned_to, sort_order, userId]
  );
  return rows[0] || null;
};

const remove = async (id, restaurantId) => {
  await query(`DELETE FROM prep_tasks WHERE id = $1 AND restaurant_id = $2`, [id, restaurantId]);
};

const countTomorrow = async (restaurantId, tomorrow) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS c FROM prep_tasks WHERE restaurant_id = $1 AND date = $2`,
    [restaurantId, tomorrow]
  );
  return rows[0].c;
};

module.exports = { listByDate, create, findById, update, remove, countTomorrow };
