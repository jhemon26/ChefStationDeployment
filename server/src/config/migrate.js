const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool } = require('./db');
const env = require('./env');

const ROYAL_OAK_MENU = [
  { name: 'Scotch Egg', course: 'Snack', ingredients: 'egg, sausage meat, HP sauce', allergens: ['Eggs'] },
  { name: 'Salt & Pepper Squid', course: 'Snack', ingredients: 'squid, salt, pepper, aioli', allergens: ['Molluscs', 'Eggs'] },
  { name: 'Buttermilk Fried Chicken (Snack)', course: 'Snack', ingredients: 'chicken, buttermilk coating, hot sauce, celery, blue cheese mayo', allergens: ['Celery', 'Dairy', 'Eggs', 'Gluten'] },
  { name: 'Hummus', course: 'Snack', ingredients: 'hummus, sumac, crispy chickpeas, flatbread', allergens: ['Gluten', 'Sesame'] },
  { name: 'Nachos', course: 'Snack', ingredients: 'tortilla chips, melted cheese, green chilli, pico', allergens: ['Dairy'] },
  { name: 'Fillet O Fish', course: 'Small Plate', ingredients: 'fish fillet, cos lettuce, gherkins, tartare sauce', allergens: ['Eggs', 'Fish'] },
  { name: 'Classic Cheeseburger', course: 'Small Plate', ingredients: 'beef patty, lettuce, pickle, onion, burger sauce, optional bacon', allergens: ['Dairy', 'Eggs', 'Gluten'] },
  { name: 'Buttermilk Fried Chicken (Main)', course: 'Small Plate', ingredients: 'chicken, buttermilk coating, hot sauce, cos lettuce, garlic mayo', allergens: ['Dairy', 'Eggs', 'Gluten'] },
  { name: 'Vegan Cheeseburger', course: 'Small Plate', ingredients: 'plant-based patty, lettuce, pickle, onion, burger sauce', allergens: ['Gluten', 'Soy'] },
  { name: 'Caesar Salad', course: 'Starter', ingredients: 'cos lettuce, croutons, parmesan, anchovy dressing, optional chicken', allergens: ['Dairy', 'Eggs', 'Fish', 'Gluten'] },
  { name: 'Mozzarella & English Tomato Salad', course: 'Starter', ingredients: 'mozzarella, tomato, charred aubergine, basil, pine nuts', allergens: ['Dairy', 'Pine nuts'] },
  { name: 'Garlic & Chilli Prawns', course: 'Starter', ingredients: 'prawns, garlic, chilli, parsley, lemon, grilled sourdough', allergens: ['Crustaceans', 'Gluten'] },
  { name: 'Chicken Liver Parfait', course: 'Starter', ingredients: 'chicken liver, confit onion, sherry marmalade, toast', allergens: ['Gluten', 'Sulphites'] },
  { name: 'Whipped Feta & Goats Cheese Dip', course: 'Starter', ingredients: 'feta, goat’s cheese, pea salsa, pita chips', allergens: ['Dairy', 'Gluten'] },
  { name: 'Cheeseburger', course: 'Burger', ingredients: 'beef patty, lettuce, pickle, onion, burger sauce, fries', allergens: ['Dairy', 'Eggs', 'Gluten'] },
  { name: 'Grilled Salmon', course: 'Main', ingredients: 'salmon, spring onion potato cake, crushed peas, tomato dressing', allergens: ['Fish'] },
  { name: 'Beer Battered Haddock', course: 'Main', ingredients: 'haddock, batter, mushy peas, tartare sauce, lemon, fries', allergens: ['Eggs', 'Fish', 'Gluten'] },
  { name: 'Steak & Ale Pie', course: 'Main', ingredients: 'beef, ale gravy, pastry, buttered kale, creamed potatoes, gravy', allergens: ['Dairy', 'Gluten', 'Sulphites'] },
  { name: 'Cotswold White Chicken Schnitzel', course: 'Main', ingredients: 'chicken schnitzel, cos lettuce, fennel salad, aioli', allergens: ['Eggs', 'Gluten'] },
  { name: '230g Rump Steak', course: 'Main', ingredients: 'steak, slow roast tomato, watercress, fries, optional peppercorn sauce or garlic butter', allergens: ['Dairy'] },
  { name: 'Pea Tortellini', course: 'Main', ingredients: 'tortellini, goat’s curd, peas, broad beans, lemon, mint', allergens: ['Dairy', 'Eggs', 'Gluten'] },
  { name: 'Lamb Kofta Skewers', course: 'Main', ingredients: 'lamb kofta, tzatziki, pickled fennel, chopped salad, flatbread', allergens: ['Dairy', 'Gluten'] },
  { name: 'Fries', course: 'Side', ingredients: 'fries, rosemary salt', allergens: [] },
  { name: 'Pigs in Blankets', course: 'Side', ingredients: 'sausages, bacon', allergens: [] },
  { name: 'Steamed Kale & Green Beans', course: 'Side', ingredients: 'kale, green beans, olive oil, sea salt', allergens: [] },
  { name: 'Truffle Mashed Potato', course: 'Side', ingredients: 'mashed potato, truffle', allergens: ['Dairy'] },
  { name: 'Sticky Toffee Pudding', course: 'Dessert', ingredients: 'sponge cake, toffee sauce, vanilla ice cream', allergens: ['Dairy', 'Eggs', 'Gluten'] },
  { name: 'Dark Chocolate Pot', course: 'Dessert', ingredients: 'dark chocolate, creme fraiche, honeycomb', allergens: ['Dairy'] },
  { name: 'Vegan Tropical Fruit Cheesecake', course: 'Dessert', ingredients: 'plant-based cheesecake, tropical fruit', allergens: ['Gluten', 'Soy'] },
  { name: 'Ice Cream & Sorbet', course: 'Dessert', ingredients: 'ice cream or sorbet (various flavours)', allergens: ['Dairy'] },
];

const ROYAL_OAK_PREP_TASKS = [
  { task_name: 'Portion burger patties', notes: 'Set for lunch service', quantity: '24', unit: 'pcs', assigned_to: 'Jahid Emon', priority: 'urgent' },
  { task_name: 'Prep tartare sauce', notes: 'For fish dishes and fillet o fish', quantity: '2', unit: 'litres', assigned_to: 'Demo Staff', priority: 'medium' },
  { task_name: 'Blanch fries', notes: 'Half-cook for service', quantity: '2', unit: 'trays', assigned_to: 'Demo Staff', priority: 'urgent' },
  { task_name: 'Marinate lamb kofta skewers', notes: 'Label and chill after prep', quantity: '18', unit: 'skewers', assigned_to: 'Jahid Emon', priority: 'medium' },
  { task_name: 'Set dessert station', notes: 'Check toffee sauce and ice cream tubs', quantity: '1', unit: 'station', assigned_to: 'Demo Staff', priority: 'low' },
];

const ROYAL_OAK_TODOS = [
  { task_text: 'Check Friday fish delivery', notes: 'Confirm salmon and haddock quantities', priority: 'high' },
  { task_text: 'Write allergens on specials board', notes: 'Double-check vegan options wording', priority: 'medium' },
  { task_text: 'Top up dry store labels', notes: 'Especially flours, spices, and batters', priority: 'low' },
  { task_text: 'Review weekend rota', notes: 'Confirm late shift cover', priority: 'medium' },
  { task_text: 'Prepare fresh invite code for trial staff', notes: 'Keep one code ready for onboarding test', priority: 'low' },
];

async function upsertDishAllergens(client, dishId, allergens) {
  await client.query(`DELETE FROM dish_allergens WHERE dish_id = $1`, [dishId]);
  for (const allergen of allergens) {
    await client.query(
      `INSERT INTO dish_allergens (dish_id, allergen_name, is_custom) VALUES ($1, $2, $3)`,
      [dishId, allergen, allergen === 'Pine nuts']
    );
  }
}

async function seedRoyalOakMenu(client, restaurantId, date) {
  for (let index = 0; index < ROYAL_OAK_MENU.length; index += 1) {
    const item = ROYAL_OAK_MENU[index];
    const existing = await client.query(
      `SELECT id FROM dishes WHERE restaurant_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
      [restaurantId, item.name]
    );

    let dishId;
    if (existing.rows.length > 0) {
      dishId = existing.rows[0].id;
      await client.query(
        `UPDATE dishes
         SET name = $3,
             course = $4,
             ingredients = $5,
             show_on_menu = true,
             is_active = true,
             updated_at = NOW()
         WHERE id = $1 AND restaurant_id = $2`,
        [dishId, restaurantId, item.name, item.course, item.ingredients]
      );
    } else {
      const created = await client.query(
        `INSERT INTO dishes (restaurant_id, name, course, ingredients, show_on_menu, created_by)
         VALUES ($1, $2, $3, $4, true, NULL)
         RETURNING id`,
        [restaurantId, item.name, item.course, item.ingredients]
      );
      dishId = created.rows[0].id;
    }

    await upsertDishAllergens(client, dishId, item.allergens);

    const defaultCount = Math.max(4, 14 - (index % 6) * 2);
    await client.query(
      `INSERT INTO menu_counts (restaurant_id, dish_id, date, total_portions, remaining_portions, updated_by)
       VALUES ($1, $2, $3, $4, $5, NULL)
       ON CONFLICT (restaurant_id, dish_id, date)
       DO UPDATE SET total_portions = EXCLUDED.total_portions,
                     remaining_portions = EXCLUDED.remaining_portions,
                     updated_by = NULL,
                     updated_at = NOW()`,
      [restaurantId, dishId, date, defaultCount, defaultCount]
    );
  }
}

async function seedPrepTasksIfEmpty(client, restaurantId, date, createdBy) {
  const existing = await client.query(
    `SELECT id FROM prep_tasks WHERE restaurant_id = $1 AND date = $2 LIMIT 1`,
    [restaurantId, date]
  );
  if (existing.rows.length > 0) return;

  for (let index = 0; index < ROYAL_OAK_PREP_TASKS.length; index += 1) {
    const task = ROYAL_OAK_PREP_TASKS[index];
    await client.query(
      `INSERT INTO prep_tasks (restaurant_id, task_name, notes, quantity, unit, assigned_to, priority, sort_order, date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [restaurantId, task.task_name, task.notes, task.quantity, task.unit, task.assigned_to, task.priority, index + 1, date, createdBy]
    );
  }
}

async function seedTodosIfEmpty(client, restaurantId, date, createdBy) {
  const existing = await client.query(
    `SELECT id FROM todo_items WHERE restaurant_id = $1 AND date = $2 LIMIT 1`,
    [restaurantId, date]
  );
  if (existing.rows.length > 0) return;

  for (let index = 0; index < ROYAL_OAK_TODOS.length; index += 1) {
    const task = ROYAL_OAK_TODOS[index];
    await client.query(
      `INSERT INTO todo_items (restaurant_id, task_text, notes, priority, sort_order, date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [restaurantId, task.task_text, task.notes, task.priority, index + 1, date, createdBy]
    );
  }
}

async function seedDemoData() {
  const ownerUsername = 'demo_owner';
  const staffUsername = 'demo_staff';
  const ownerPassword = 'owner12345';
  const staffPassword = 'staff12345';
  const restaurantName = 'The Royal Oak';

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
      `SELECT r.*
       FROM restaurants r
       LEFT JOIN users u ON u.restaurant_id = r.id AND u.username = $1
       WHERE r.name IN ($2, $3) OR u.id IS NOT NULL
       ORDER BY CASE WHEN r.name = $2 THEN 0 WHEN r.name = $3 THEN 1 ELSE 2 END
       LIMIT 1`,
      [ownerUsername, restaurantName, 'Demo Bistro']
    );

    if (existingRestaurant.rows.length > 0) {
      restaurant = existingRestaurant.rows[0];
      const updatedRestaurant = await client.query(
        `UPDATE restaurants
         SET name = $2,
             address = $3,
             phone = $4,
             is_active = true
         WHERE id = $1
         RETURNING *`,
        [restaurant.id, restaurantName, 'The Royal Oak, Main Road, London', '+44 20 7946 0958']
      );
      restaurant = updatedRestaurant.rows[0];
    } else {
      const restaurantResult = await client.query(
        `INSERT INTO restaurants (name, address, phone)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [restaurantName, 'The Royal Oak, Main Road, London', '+44 20 7946 0958']
      );
      restaurant = restaurantResult.rows[0];
      console.log(`[migrate] seeded demo restaurant: ${restaurantName}`);
    }

    let owner;
    const existingOwner = await client.query(
      `SELECT id FROM users WHERE username = $1 LIMIT 1`,
      [ownerUsername]
    );

    if (existingOwner.rows.length > 0) {
      const updatedOwner = await client.query(
        `UPDATE users
         SET restaurant_id = $2,
             password_hash = $3,
             display_name = $4,
             role = 'owner',
             is_active = true
         WHERE id = $1
         RETURNING id`,
        [existingOwner.rows[0].id, restaurant.id, ownerHash, 'Jahid Emon']
      );
      owner = updatedOwner.rows[0];
    } else {
      const ownerResult = await client.query(
        `INSERT INTO users (restaurant_id, username, password_hash, display_name, role, last_login)
         VALUES ($1, $2, $3, $4, 'owner', NOW())
         RETURNING id`,
        [restaurant.id, ownerUsername, ownerHash, 'Jahid Emon']
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
      const updatedStaff = await client.query(
        `UPDATE users
         SET restaurant_id = $2,
             password_hash = $3,
             display_name = $4,
             role = 'staff',
             is_active = true
         WHERE id = $1
         RETURNING id`,
        [existingStaff.rows[0].id, restaurant.id, staffHash, 'Demo Staff']
      );
      staff = updatedStaff.rows[0];
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
         VALUES ($1, $2, 'staff', false, NULL, NOW() + INTERVAL '30 days')`,
        [restaurant.id, 'CHEF-DEMO']
      );
    } else {
      await client.query(
        `UPDATE invite_codes
         SET restaurant_id = $1,
             role = 'staff',
             is_used = false,
             used_by = NULL,
             expires_at = NOW() + INTERVAL '30 days'
         WHERE code = $2`,
        [restaurant.id, 'CHEF-DEMO']
      );
    }

    await seedRoyalOakMenu(client, restaurant.id, today);
    await seedPrepTasksIfEmpty(client, restaurant.id, today, owner.id);
    await seedTodosIfEmpty(client, restaurant.id, tomorrow, owner.id);

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
