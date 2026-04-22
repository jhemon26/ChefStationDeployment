CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  logo_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin','owner','staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_restaurant ON users(restaurant_id);

CREATE TABLE IF NOT EXISTS invite_codes (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by INT REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invite_restaurant ON invite_codes(restaurant_id);

CREATE TABLE IF NOT EXISTS dishes (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  course VARCHAR(100),
  ingredients TEXT,
  show_on_menu BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant_id);

CREATE TABLE IF NOT EXISTS dish_allergens (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  allergen_name VARCHAR(100) NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_allergens_dish ON dish_allergens(dish_id);

CREATE TABLE IF NOT EXISTS menu_counts (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_portions INT NOT NULL,
  remaining_portions INT NOT NULL,
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, dish_id, date)
);
CREATE INDEX IF NOT EXISTS idx_menucount_restaurant_date ON menu_counts(restaurant_id, date);

CREATE TABLE IF NOT EXISTS prep_tasks (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL,
  notes TEXT,
  quantity VARCHAR(50),
  unit VARCHAR(50),
  assigned_to VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent','medium','low')),
  sort_order INT NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  completed_by INT REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prep_restaurant_date ON prep_tasks(restaurant_id, date);

CREATE TABLE IF NOT EXISTS stock_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_categories_restaurant_name
  ON stock_categories(restaurant_id, LOWER(name));

CREATE TABLE IF NOT EXISTS stock_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity FLOAT NOT NULL,
  item_size FLOAT,
  item_detail VARCHAR(100),
  unit VARCHAR(50) NOT NULL,
  par_level FLOAT,
  max_level FLOAT,
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_restaurant ON stock_items(restaurant_id);

CREATE TABLE IF NOT EXISTS todo_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  notes TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  completed_by INT REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_todo_restaurant_date ON todo_items(restaurant_id, date);

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  steps TEXT NOT NULL,
  notes TEXT,
  prep_time_mins INT,
  total_steps INT,
  section VARCHAR(100),
  photo_url VARCHAR(500),
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipes_restaurant ON recipes(restaurant_id);
