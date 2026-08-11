-- ============================================================
-- MYDUUKA — Supabase Initial Schema
-- Phone OTP auth + shop-scoped business data
-- ============================================================

-- ── Shops ──────────────────────────────────────────────────
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  shop_type text default 'Retail Shop',
  location text default 'Kampala',
  currency text default 'UGX',
  opening_float numeric default 0,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Profiles (extends auth.users) ──────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  name text not null,
  phone text unique,
  role text default 'Attendant',
  pin text,
  color text default '#1A6B4A',
  active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now()
);

-- ── Products ───────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  category text,
  emoji text default '📦',
  buying_unit text,
  selling_unit text not null,
  conversion integer default 1,
  buying_price numeric default 0,
  selling_price numeric not null,
  stock integer default 0,
  min_stock integer default 0,
  status text default 'good',
  brand text,
  barcode text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Customers ──────────────────────────────────────────────
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  phone text,
  balance numeric default 0,
  last_tx timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- ── Customer Transactions ──────────────────────────────────
create table public.customer_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  shop_id uuid references public.shops(id) on delete cascade not null,
  date timestamptz default now(),
  type text not null,
  amount numeric not null,
  desc text,
  sale_id uuid
);

-- ── Suppliers ──────────────────────────────────────────────
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  phone text,
  location text,
  contact text,
  products jsonb default '[]',
  balance numeric default 0,
  rating integer default 5,
  last_order timestamptz,
  created_at timestamptz default now()
);

-- ── Supplier Purchases ─────────────────────────────────────
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  date timestamptz default now(),
  items text,
  amount numeric not null,
  created_at timestamptz default now()
);

-- ── Sales ──────────────────────────────────────────────────
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  receipt_no text unique not null,
  time timestamptz default now(),
  total numeric not null,
  payment text not null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  attendant text,
  synced_at timestamptz default now()
);

-- ── Sale Items ─────────────────────────────────────────────
create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references public.sales(id) on delete cascade not null,
  shop_id uuid references public.shops(id) on delete cascade not null,
  product text not null,
  product_id uuid,
  qty integer not null,
  price numeric not null,
  total numeric not null
);

-- ── Expenses ───────────────────────────────────────────────
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  category text not null,
  amount numeric not null,
  date timestamptz default now(),
  payment text not null,
  desc text,
  created_at timestamptz default now()
);

-- ── Stock Movements ────────────────────────────────────────
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  product_id uuid,
  product_name text not null,
  type text not null,
  prev_qty integer not null,
  new_qty integer not null,
  reason text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ── Activity Log ───────────────────────────────────────────
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  action text not null,
  detail text,
  type text not null,
  created_at timestamptz default now()
);

-- ── Indexes ────────────────────────────────────────────────
create index idx_profiles_shop on public.profiles(shop_id);
create index idx_profiles_phone on public.profiles(phone);
create index idx_products_shop on public.products(shop_id);
create index idx_customers_shop on public.customers(shop_id);
create index idx_suppliers_shop on public.suppliers(shop_id);
create index idx_sales_shop on public.sales(shop_id);
create index idx_sales_time on public.sales(time desc);
create index idx_expenses_shop on public.expenses(shop_id);
create index idx_stock_shop on public.stock_movements(shop_id);
create index idx_activity_shop on public.activity_log(shop_id);

-- ── Enable Realtime ────────────────────────────────────────
alter publication supabase_realtime add table public.sales;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.customers;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.stock_movements;
