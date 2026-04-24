const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

async function list(req, res, next) {
  try {
    if (req.user.role === 'super_admin') {
      const rows = await User.listAll();
      return res.json(rows);
    }
    if (req.user.role === 'owner') {
      const rows = await User.listByRestaurant(req.user.restaurant_id);
      return res.json(rows);
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
}

async function updateMe(req, res, next) {
  try {
    const current = await User.findAuthById(req.user.id);
    if (!current) return res.status(404).json({ error: 'User not found' });

    const nextUsername = req.body.username?.trim();
    const nextDisplayName = req.body.displayName?.trim();
    const currentPassword = req.body.currentPassword || '';
    const newPassword = req.body.newPassword || '';

    if (nextUsername && nextUsername !== current.username) {
      const existing = await User.findByUsername(nextUsername);
      if (existing && existing.id !== current.id) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    let passwordHash = null;
    if (newPassword) {
      const ok = await comparePassword(currentPassword, current.password_hash);
      if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });
      passwordHash = await hashPassword(newPassword);
    }

    const updated = await User.updateSelf(current.id, {
      username: nextUsername || null,
      display_name: nextDisplayName || null,
      password_hash: passwordHash,
    });
    res.json(updated);
  } catch (e) { next(e); }
}

async function suspend(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot suspend yourself' });
    if (req.user.role === 'owner' && target.restaurant_id !== req.user.restaurant_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (target.role === 'super_admin') return res.status(403).json({ error: 'Cannot modify super admin' });
    const updated = await User.setActive(target.id, false);
    res.json(updated);
  } catch (e) { next(e); }
}

async function activate(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (req.user.role === 'owner' && target.restaurant_id !== req.user.restaurant_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (target.role === 'super_admin') return res.status(403).json({ error: 'Cannot modify super admin' });
    const updated = await User.setActive(target.id, true);
    res.json(updated);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });
    if (req.user.role === 'owner' && target.restaurant_id !== req.user.restaurant_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (target.role === 'super_admin') return res.status(403).json({ error: 'Cannot remove super admin' });
    if (req.user.role === 'owner' && target.role === 'owner' && target.id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot remove another owner' });
    }
    await User.remove(target.id);
    res.status(204).end();
  } catch (e) { next(e); }
}

async function resetPassword(req, res, next) {
  try {
    const { password } = req.body;
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (req.user.role === 'owner' && target.restaurant_id !== req.user.restaurant_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (target.role === 'super_admin') return res.status(403).json({ error: 'Cannot modify super admin' });
    if (req.user.role === 'owner' && target.role === 'owner' && target.id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot reset another owner password' });
    }
    const hash = await hashPassword(password);
    await User.updatePassword(target.id, hash);
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { list, me, updateMe, suspend, activate, remove, resetPassword };
