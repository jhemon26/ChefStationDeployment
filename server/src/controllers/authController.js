const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const InviteCode = require('../models/InviteCode');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { sign } = require('../utils/generateToken');
const { pool } = require('../config/db');
const { seedDefaultStockCategories } = require('../config/migrate');

async function registerRestaurant(req, res, next) {
  try {
    const { restaurantName, address, phone, username, password, displayName } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const restaurant = await Restaurant.create({ name: restaurantName, address, phone });
    await seedDefaultStockCategories(pool, restaurant.id);
    const hash = await hashPassword(password);
    const user = await User.create({
      restaurant_id: restaurant.id,
      username,
      password_hash: hash,
      display_name: displayName,
      role: 'owner',
    });
    const token = sign({ userId: user.id, role: user.role, restaurantId: restaurant.id });
    await User.updateLastLogin(user.id);
    res.status(201).json({ token, user, restaurant });
  } catch (e) {
    next(e);
  }
}

async function registerStaff(req, res, next) {
  try {
    const { inviteCode, username, password, displayName } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const code = await InviteCode.findValidByCode(inviteCode);
    if (!code) return res.status(400).json({ error: 'Invalid or expired invite code' });

    const restaurant = await Restaurant.findById(code.restaurant_id);
    if (!restaurant || !restaurant.is_active) {
      return res.status(400).json({ error: 'Restaurant is not active' });
    }

    const hash = await hashPassword(password);
    const user = await User.create({
      restaurant_id: code.restaurant_id,
      username,
      password_hash: hash,
      display_name: displayName,
      role: code.role || 'staff',
    });
    await InviteCode.markUsed(code.id, user.id);
    const token = sign({ userId: user.id, role: user.role, restaurantId: user.restaurant_id });
    await User.updateLastLogin(user.id);
    res.status(201).json({ token, user, restaurant });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'Account suspended' });

    if (user.restaurant_id) {
      const restaurant = await Restaurant.findById(user.restaurant_id);
      if (!restaurant || !restaurant.is_active) {
        return res.status(403).json({ error: 'Restaurant suspended' });
      }
    }

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign({ userId: user.id, role: user.role, restaurantId: user.restaurant_id });
    await User.updateLastLogin(user.id);
    const { password_hash, ...safeUser } = user;
    let restaurant = null;
    if (user.restaurant_id) restaurant = await Restaurant.findById(user.restaurant_id);
    res.json({ token, user: safeUser, restaurant });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    let restaurant = null;
    if (req.user.restaurant_id) restaurant = await Restaurant.findById(req.user.restaurant_id);
    res.json({ user: req.user, restaurant });
  } catch (e) {
    next(e);
  }
}

module.exports = { registerRestaurant, registerStaff, login, me };
