const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool } = require('./db');
const env = require('./env');

async function seedDemoData() {
  const ownerUsername = 'demo_owner';
  const staffUsername = 'demo_staff';
  const ownerPassword = 'owner12345';
  const staffPassword = 'staff12345';

  const ownerHash = await bcrypt.hash(ownerPassword, 12);
  const staffHash = await bcrypt.hash(staffPassword, 12);
  const { toLocalDateString, addDays } = require('../utils/date');
  const today = toLocalDateString();
  const tomorrow = toLocalDateString(addDays(new Date(), 1));

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let restaurant;
    const existingRestaurant = await client.query(
      `SELECT * FROM restaurants WHERE name = $1 LIMIT 1`,
      ['Demo Bistro']
    );

    if (existingRestaurant.rows.length > 0) {
      restaurant = existingRestaurant.rows[0];
    } else {
      const restaurantResult = await client.query(
        `INSERT INTO restaurants (name, address, phone)
         VALUES ($1, $2, $3)
         RETURNING *`,
        ['Demo Bistro', '12 Service Lane, London', '+44 20 7946 0958']
      );
      restaurant = restaurantResult.rows[0];
      console.log('[migrate] seeded demo restaurant: Demo Bistro');
    }

    let owner;
    const existingOwner = await client.query(
      `SELECT id FROM users WHERE username = $1 LIMIT 1`,
      [ownerUsername]
    );

    if (existingOwner.rows.length > 0) {
      owner = existingOwner.rows[0];
    } else {
      const ownerResult = await client.query(
        `INSERT INTO users (restaurant_id, username, password_hash, display_name, role, last_login)
         VALUES ($1, $2, $3, $4, 'owner', NOW())
         RETURNING id`,
        [restaurant.id, ownerUsername, ownerHash, 'Demo Owner']
      );
      owner = ownerResult.rows[0];
      console.log(`[migrate] seeded demo owner: ${ownerUsername} / ${ownerPassword}`);
    }

    let staff;
    const existingStaff = await client.query(
      `SELECT id FROM users WHERE username = $1 LIMIT 1`,
      [staffUsername]
    );

    if (existingStaff.rows.length > 0) {
      staff = existingStaff.rows[0];
    } else {
      const staffResult = await client.query(
        `INSERT INTO users (restaurant_id, username, password_hash, display_name, role, last_login)
         VALUES ($1, $2, $3, $4, 'staff', NOW())
         RETURNING id`,
        [restaurant.id, staffUsername, staffHash, 'Demo Staff']
      );
      staff = staffResult.rows[0];
      console.log(`[migrate] seeded demo staff: ${staffUsername} / ${staffPassword}`);
    }

    const existingInvite = await client.query(
      `SELECT id FROM invite_codes WHERE code = $1 LIMIT 1`,
      ['CHEF-DEMO']
    );

    if (existingInvite.rows.length === 0) {
      await client.query(
        `INSERT INTO invite_codes (restaurant_id, code, role, is_used, used_by, expires_at)
         VALUES ($1, $2, 'staff', true, $3, NOW() + INTERVAL '48 hours')`,
        [restaurant.id, 'CHEF-DEMO', staff.id]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const DEFAULT_STOCK_CATEGORIES = ['bread', 'consumables', 'dry', 'greens', 'liquid', 'meat'];

async function seedDefaultStockCategories(client, restaurantId) {
  for (const name of DEFAULT_STOCK_CATEGORIES) {
    await client.query(
      `INSERT INTO stock_categories (restaurant_id, name)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [restaurantId, name]
    );
  }
}

async function backfillStockCategoriesForAllRestaurants() {
  const { rows: restaurants } = await pool.query(`SELECT id FROM restaurants`);
  for (const r of restaurants) {
    await seedDefaultStockCategories(pool, r.id);
  }
  const { rows: usedCategories } = await pool.query(
    `SELECT DISTINCT restaurant_id, category FROM stock_items`
  );
  for (const c of usedCategories) {
    await pool.query(
      `INSERT INTO stock_categories (restaurant_id, name)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [c.restaurant_id, c.category]
    );
  }
}

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(`ALTER TABLE prep_tasks ADD COLUMN IF NOT EXISTS notes TEXT`);
  await pool.query(`ALTER TABLE prep_tasks ADD COLUMN IF NOT EXISTS sort_order INT`);
  await pool.query(`UPDATE prep_tasks SET sort_order = id WHERE sort_order IS NULL`);
  await pool.query(`ALTER TABLE prep_tasks ALTER COLUMN sort_order SET DEFAULT 0`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_prep_restaurant_date_order
     ON prep_tasks(restaurant_id, date, sort_order)`
  );
  await pool.query(`ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS notes TEXT`);
  await pool.query(`ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS sort_order INT`);
  await pool.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS notes TEXT`);
  await pool.query(`ALTER TABLE recipes ALTER COLUMN section TYPE VARCHAR(100)`);
  await pool.query(`ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_section_check`);
  await pool.query(`ALTER TABLE dishes ADD COLUMN IF NOT EXISTS course VARCHAR(100)`);
  await pool.query(`ALTER TABLE dishes ADD COLUMN IF NOT EXISTS show_on_menu BOOLEAN NOT NULL DEFAULT false`);
  await pool.query(
    `UPDATE dishes d
     SET show_on_menu = CASE
       WHEN EXISTS (SELECT 1 FROM menu_counts mc WHERE mc.dish_id = d.id) THEN true
       WHEN EXISTS (SELECT 1 FROM recipes r WHERE r.dish_id = d.id) THEN false
       ELSE true
     END`
  );
  await pool.query(`UPDATE todo_items SET sort_order = id WHERE sort_order IS NULL`);
  await pool.query(`ALTER TABLE todo_items ALTER COLUMN sort_order SET DEFAULT 0`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_todo_restaurant_date_order
     ON todo_items(restaurant_id, date, sort_order)`
  );
  await pool.query(`ALTER TABLE stock_items DROP CONSTRAINT IF EXISTS stock_items_category_check`);
  await pool.query(`ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS item_size FLOAT`);
  await pool.query(`ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS item_detail VARCHAR(100)`);
  await pool.query(`ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS max_level FLOAT`);
  await backfillStockCategoriesForAllRestaurants();
  console.log('[migrate] schema applied');

  const { rows } = await pool.query(
    "SELECT id FROM users WHERE role = 'super_admin' LIMIT 1"
  );
  const hash = await bcrypt.hash(env.SEED_SUPER_ADMIN_PASSWORD, 12);
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO users (username, password_hash, display_name, role, restaurant_id)
       VALUES ($1, $2, $3, 'super_admin', NULL)`,
      [env.SEED_SUPER_ADMIN_USERNAME, hash, 'Super Admin']
    );
    console.log(`[migrate] seeded super admin: ${env.SEED_SUPER_ADMIN_USERNAME}`);
  } else {
    await pool.query(
      `UPDATE users
       SET username = $2,
           password_hash = $3,
           display_name = 'Super Admin'
       WHERE id = $1`,
      [rows[0].id, env.SEED_SUPER_ADMIN_USERNAME, hash]
    );
    console.log(`[migrate] synced super admin credentials: ${env.SEED_SUPER_ADMIN_USERNAME}`);
  }

  await seedDemoData();
}

module.exports = { migrate, seedDefaultStockCategories, DEFAULT_STOCK_CATEGORIES };
