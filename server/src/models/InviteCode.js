const { query } = require('../config/db');

const create = async ({ restaurant_id, code, role, expires_at }) => {
  const { rows } = await query(
    `INSERT INTO invite_codes (restaurant_id, code, role, expires_at)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [restaurant_id, code, role, expires_at]
  );
  return rows[0];
};

const findValidByCode = async (code) => {
  const { rows } = await query(
    `SELECT * FROM invite_codes
     WHERE code = $1 AND is_used = false AND expires_at > NOW()`,
    [code]
  );
  return rows[0] || null;
};

const listByRestaurant = async (restaurantId) => {
  const { rows } = await query(
    `SELECT ic.*, u.display_name AS used_by_name
     FROM invite_codes ic
     LEFT JOIN users u ON u.id = ic.used_by
     WHERE ic.restaurant_id = $1
     ORDER BY ic.code ASC`,
    [restaurantId]
  );
  return rows;
};

const markUsed = async (id, userId) => {
  const { rows } = await query(
    `UPDATE invite_codes SET is_used = true, used_by = $2 WHERE id = $1 RETURNING *`,
    [id, userId]
  );
  return rows[0] || null;
};

const remove = async (id, restaurantId) => {
  const params = [id];
  let where = 'id = $1 AND is_used = false';

  if (restaurantId !== undefined) {
    params.push(restaurantId);
    where += ' AND restaurant_id = $2';
  }

  const { rows } = await query(`DELETE FROM invite_codes WHERE ${where} RETURNING *`, params);
  return rows[0] || null;
};

module.exports = { create, findValidByCode, listByRestaurant, markUsed, remove };
