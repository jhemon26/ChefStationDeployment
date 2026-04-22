const { verify } = require('../utils/generateToken');
const { query } = require('../config/db');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = verify(token);
    const { rows } = await query(
      'SELECT id, restaurant_id, username, display_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.is_active) return res.status(403).json({ error: 'Account suspended' });

    if (user.restaurant_id) {
      const r = await query('SELECT is_active FROM restaurants WHERE id = $1', [user.restaurant_id]);
      if (!r.rows[0] || !r.rows[0].is_active) {
        return res.status(403).json({ error: 'Restaurant suspended' });
      }
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };

module.exports = { authenticate, requireRole };
