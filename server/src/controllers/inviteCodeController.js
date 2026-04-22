const InviteCode = require('../models/InviteCode');
const { generateInviteCode } = require('../utils/generateInviteCode');

async function create(req, res, next) {
  try {
    const role = req.body.role || 'staff';
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);

    let attempts = 0;
    let created = null;
    while (attempts < 5 && !created) {
      try {
        const code = generateInviteCode();
        created = await InviteCode.create({
          restaurant_id: req.user.restaurant_id,
          code,
          role,
          expires_at,
        });
      } catch (err) {
        if (err.code !== '23505') throw err;
        attempts++;
      }
    }
    if (!created) return res.status(500).json({ error: 'Could not generate unique code' });
    res.status(201).json(created);
  } catch (e) { next(e); }
}

async function list(req, res, next) {
  try {
    const rows = await InviteCode.listByRestaurant(req.user.restaurant_id);
    res.json(rows);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const removed = await InviteCode.remove(req.params.id, req.user.restaurant_id);
    if (!removed) return res.status(404).json({ error: 'Invite code not found or already used' });
    res.status(204).end();
  } catch (e) { next(e); }
}

module.exports = { create, list, remove };
