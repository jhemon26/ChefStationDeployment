const { query } = require('../config/db');

const publicFields = `id, restaurant_id, username, display_name, role, is_active, last_login, created_at`;

const findById = async (id) => {
  const { rows } = await query(`SELECT ${publicFields} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
};

const findByUsername = async (username) => {
  const { rows } = await query(
    `SELECT id, restaurant_id, username, password_hash, display_name, role, is_active FROM users WHERE username = $1`,
    [username]
  );
  return rows[0] || null;
};

const create = async ({ restaurant_id, username, password_hash, display_name, role }) => {
  const { rows } = await query(
    `INSERT INTO users (restaurant_id, username, password_hash, display_name, role)
     VALUES ($1,$2,$3,$4,$5) RETURNING ${publicFields}`,
    [restaurant_id, username, password_hash, display_name, role]
  );
  return rows[0];
};

const listByRestaurant = async (restaurantId) => {
  const { rows } = await query(
    `SELECT ${publicFields} FROM users WHERE restaurant_id = $1 ORDER BY display_name ASC`,
    [restaurantId]
  );
  return rows;
};

const listAll = async () => {
  const { rows } = await query(
    `SELECT u.id, u.restaurant_id, u.username, u.display_name, u.role, u.is_active, u.last_login, u.created_at,
            r.name AS restaurant_name
     FROM users u
     LEFT JOIN restaurants r ON r.id = u.restaurant_id
     ORDER BY u.display_name ASC`
  );
  return rows;
};

const updateLastLogin = async (id) => {
  await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [id]);
};

const setActive = async (id, isActive) => {
  const { rows } = await query(
    `UPDATE users SET is_active = $2 WHERE id = $1 RETURNING ${publicFields}`,
    [id, isActive]
  );
  return rows[0] || null;
};

const updatePassword = async (id, password_hash) => {
  await query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [password_hash, id]);
};

const remove = async (id) => {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
};

module.exports = {
  findById,
  findByUsername,
  create,
  listByRestaurant,
  listAll,
  updateLastLogin,
  setActive,
  updatePassword,
  remove,
};
