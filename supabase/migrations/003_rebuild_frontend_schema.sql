-- ============================================================
-- MYDUUKA — Fresh Retail schema matching the frontend
-- Safe reset: this rebuilds the app tables to match the screens
-- and data model used by the JS app in /js/data.js and /js/screens/*.
-- ============================================================

-- If you want a full reset of the current project database, run this in
-- the Supabase SQL editor on the target project.
-- This drops all app tables in the public schema and recreates a clean schema.

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Shops ───────────────────────────────────────────────────────
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  shop_type text DEFAULT 'Retail Shop',
  location text DEFAULT 'Kampala',
  currency text DEFAULT 'UGX',
  opening_float numeric DEFAULT 0,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── Profiles ─────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text UNIQUE,
  role text DEFAULT 'Attendant',
  pin text,
  color text DEFAULT '#1A6B4A',
  active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ── Products ─────────────────────────────────────────────────────
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  emoji text DEFAULT '📦',
  buying_unit text,
  selling_unit text NOT NULL DEFAULT 'piece',
  conversion integer DEFAULT 1,
  buying_price numeric DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  status text DEFAULT 'good',
  brand text,
  barcode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── Customers ─────────────────────────────────────────────────────
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  balance numeric DEFAULT 0,
  last_tx timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.customer_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  sale_id uuid
);

-- ── Suppliers ─────────────────────────────────────────────────────
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  location text,
  contact text,
  products jsonb DEFAULT '[]'::jsonb,
  balance numeric DEFAULT 0,
  rating integer DEFAULT 5,
  last_order timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  date timestamptz DEFAULT now(),
  items text,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Sales ─────────────────────────────────────────────────────────
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  receipt_no text UNIQUE NOT NULL,
  time timestamptz DEFAULT now(),
  total numeric NOT NULL,
  payment text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text,
  attendant text,
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now()
);

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product text NOT NULL,
  product_id uuid,
  qty integer NOT NULL,
  price numeric NOT NULL,
  total numeric NOT NULL
);

-- ── Expenses ──────────────────────────────────────────────────────
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL,
  date timestamptz DEFAULT now(),
  payment text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- ── Stock movements and activity log ─────────────────────────────
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  type text NOT NULL,
  prev_qty integer NOT NULL,
  new_qty integer NOT NULL,
  reason text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  action text NOT NULL,
  detail text,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Sync queue ─────────────────────────────────────────────────────
CREATE TABLE public.sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  entity text NOT NULL,
  action text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX idx_profiles_shop ON public.profiles(shop_id);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_products_shop ON public.products(shop_id);
CREATE INDEX idx_customers_shop ON public.customers(shop_id);
CREATE INDEX idx_suppliers_shop ON public.suppliers(shop_id);
CREATE INDEX idx_sales_shop ON public.sales(shop_id);
CREATE INDEX idx_sales_time ON public.sales(time DESC);
CREATE INDEX idx_expenses_shop ON public.expenses(shop_id);
CREATE INDEX idx_stock_shop ON public.stock_movements(shop_id);
CREATE INDEX idx_activity_shop ON public.activity_log(shop_id);
CREATE INDEX idx_sync_queue_shop ON public.sync_queue(shop_id);
CREATE INDEX idx_sync_queue_entity ON public.sync_queue(entity);
CREATE INDEX idx_sync_queue_processed ON public.sync_queue(processed_at);

-- ── Helper function: current signed-in user's shop ───────────────
CREATE OR REPLACE FUNCTION public.get_user_shop_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- ── Update timestamps ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER shops_set_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS setup ─────────────────────────────────────────────────────
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Shop policies
CREATE POLICY "shop_read_own" ON public.shops
FOR SELECT USING (id = public.get_user_shop_id());

CREATE POLICY "shop_update_own" ON public.shops
FOR UPDATE USING (id = public.get_user_shop_id());

-- Profile policies
CREATE POLICY "profile_read_own" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "profile_update_own" ON public.profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profile_insert_own" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Product policies
CREATE POLICY "products_read_own_shop" ON public.products
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "products_write_own_shop" ON public.products
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

CREATE POLICY "products_update_own_shop" ON public.products
FOR UPDATE USING (shop_id = public.get_user_shop_id());

CREATE POLICY "products_delete_own_shop" ON public.products
FOR DELETE USING (shop_id = public.get_user_shop_id());

-- Customer policies
CREATE POLICY "customers_read_own_shop" ON public.customers
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "customers_write_own_shop" ON public.customers
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

CREATE POLICY "customers_update_own_shop" ON public.customers
FOR UPDATE USING (shop_id = public.get_user_shop_id());

CREATE POLICY "customers_delete_own_shop" ON public.customers
FOR DELETE USING (shop_id = public.get_user_shop_id());

-- Customer transactions
CREATE POLICY "customer_transactions_read_own_shop" ON public.customer_transactions
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "customer_transactions_write_own_shop" ON public.customer_transactions
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

-- Supplier policies
CREATE POLICY "suppliers_read_own_shop" ON public.suppliers
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "suppliers_write_own_shop" ON public.suppliers
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

CREATE POLICY "suppliers_update_own_shop" ON public.suppliers
FOR UPDATE USING (shop_id = public.get_user_shop_id());

CREATE POLICY "suppliers_delete_own_shop" ON public.suppliers
FOR DELETE USING (shop_id = public.get_user_shop_id());

-- Purchase policies
CREATE POLICY "purchases_read_own_shop" ON public.purchases
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "purchases_write_own_shop" ON public.purchases
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

-- Sales policies
CREATE POLICY "sales_read_own_shop" ON public.sales
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "sales_write_own_shop" ON public.sales
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

CREATE POLICY "sales_update_own_shop" ON public.sales
FOR UPDATE USING (shop_id = public.get_user_shop_id());

-- Sale item policies
CREATE POLICY "sale_items_read_own_shop" ON public.sale_items
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "sale_items_write_own_shop" ON public.sale_items
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

-- Expense policies
CREATE POLICY "expenses_read_own_shop" ON public.expenses
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "expenses_write_own_shop" ON public.expenses
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

CREATE POLICY "expenses_update_own_shop" ON public.expenses
FOR UPDATE USING (shop_id = public.get_user_shop_id());

CREATE POLICY "expenses_delete_own_shop" ON public.expenses
FOR DELETE USING (shop_id = public.get_user_shop_id());

-- Stock movement policies
CREATE POLICY "stock_movements_read_own_shop" ON public.stock_movements
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "stock_movements_write_own_shop" ON public.stock_movements
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

-- Activity log policies
CREATE POLICY "activity_log_read_own_shop" ON public.activity_log
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "activity_log_write_own_shop" ON public.activity_log
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

-- Sync queue policies
CREATE POLICY "sync_queue_read_own_shop" ON public.sync_queue
FOR SELECT USING (shop_id = public.get_user_shop_id());

CREATE POLICY "sync_queue_write_own_shop" ON public.sync_queue
FOR INSERT WITH CHECK (shop_id = public.get_user_shop_id());

CREATE POLICY "sync_queue_update_own_shop" ON public.sync_queue
FOR UPDATE USING (shop_id = public.get_user_shop_id());

-- ── Realtime publication ─────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;

-- ── Sample default status update helper ───────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_product_status(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products
  SET status = CASE
    WHEN stock <= 0 THEN 'out'
    WHEN stock <= min_stock THEN 'low'
    ELSE 'good'
  END,
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

-- End of reset migration
