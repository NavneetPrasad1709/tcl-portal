-- TCL Customer Portal — Schema Migration

-- ── Enums ─────────────────────────────────────────────────

CREATE TYPE user_type AS ENUM (
  'customer',
  'account_manager',
  'campus_rep'
);

CREATE TYPE order_status AS ENUM (
  'new',
  'proof_pending',
  'proof_ready',
  'approved',
  'in_production',
  'shipped',
  'complete'
);

CREATE TYPE print_type AS ENUM (
  'screen_print',
  'embroidery',
  'puff_print',
  'foil',
  'dye_sublimation'
);

-- ── Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text NOT NULL,
  email            text UNIQUE NOT NULL,
  organization     text,
  school           text,
  user_type        user_type NOT NULL DEFAULT 'customer',
  loyalty_points   integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                     text UNIQUE NOT NULL,
  name                    text NOT NULL,
  category                text NOT NULL,
  turnaround_days         integer NOT NULL DEFAULT 10,
  starting_price          numeric(10,2) NOT NULL DEFAULT 0,
  is_featured             boolean NOT NULL DEFAULT false,
  print_types_available   print_type[] NOT NULL DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_name                  text NOT NULL,
  due_date                    date,
  status                      order_status NOT NULL DEFAULT 'new',
  order_type                  text NOT NULL DEFAULT 'group_order',
  products_selected           uuid[] NOT NULL DEFAULT '{}',
  print_type                  print_type,
  front_design_description    text,
  back_design_description     text,
  front_design_file           text,
  back_design_file            text,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proofs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          uuid REFERENCES products(id) ON DELETE SET NULL,
  proof_number        integer NOT NULL DEFAULT 1,
  color               text,
  print_type          print_type,
  mockup_image_url    text,
  est_ship_date       date,
  price_tiers         jsonb,
  status              text NOT NULL DEFAULT 'pending',
  uploaded_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revision_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id      uuid NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  customer_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes         text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────

ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_requests ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Products: anyone authenticated can read, service role can write
CREATE POLICY "products_select_all" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "products_service_role_all" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Orders: customers can only see their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE USING (auth.uid() = customer_id);

-- Proofs: customers can see proofs for their own orders
CREATE POLICY "proofs_select_own" ON proofs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = proofs.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "proofs_update_own" ON proofs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = proofs.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Revision requests: customers can insert and view their own
CREATE POLICY "revisions_select_own" ON revision_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "revisions_insert_own" ON revision_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
