const { query } = require('../config/db');

const create = async ({ name, address, phone }) => {
  const { rows } = await query(
    `INSERT INTO restaurants (name, address, phone) VALUES ($1,$2,$3) RETURNING *`,
    [name, address, phone]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await query(`SELECT * FROM restaurants WHERE id = $1`, [id]);
  return rows[0] || null;
};

const listAll = async () => {
  const { rows } = await query(
    `SELECT r.*,
       (SELECT COUNT(*) FROM users u WHERE u.restaurant_id = r.id)::int AS user_count
     FROM restaurants r
     ORDER BY r.name ASC`
  );
  return rows;
};

const update = async (id, { name, address, phone, logo_url }) => {
  const { rows } = await query(
    `UPDATE restaurants SET
       name = COALESCE($2, name),
       address = COALESCE($3, address),
       phone = COALESCE($4, phone),
       logo_url = COALESCE($5, logo_url)
     WHERE id = $1 RETURNING *`,
    [id, name, address, phone, logo_url]
  );
  return rows[0] || null;
};

const setActive = async (id, isActive) => {
  const { rows } = await query(
    `UPDATE restaurants SET is_active = $2 WHERE id = $1 RETURNING *`,
    [id, isActive]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  await query(`DELETE FROM restaurants WHERE id = $1`, [id]);
};

module.exports = { create, findById, listAll, update, setActive, remove };
