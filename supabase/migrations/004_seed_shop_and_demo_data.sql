-- ============================================================
-- MYDUUKA — Bootstrap first shop and demo data for the app
-- This is the exact next step after the fresh schema reset.
-- ============================================================

-- 1) Bootstrap a shop and attach the currently logged-in user as owner
create or replace function public.bootstrap_shop(
  p_owner_id uuid,
  p_shop_name text,
  p_owner_name text default null,
  p_phone text default null,
  p_location text default null,
  p_currency text default 'UGX',
  p_shop_type text default 'Retail Shop'
)
returns public.shops
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_shop public.shops;
begin
  v_slug := lower(regexp_replace(p_shop_name, '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := 'myduuka-shop';
  end if;

  insert into public.shops (name, slug, shop_type, location, currency, owner_id)
  values (p_shop_name, v_slug, p_shop_type, coalesce(p_location, 'Kampala'), p_currency, p_owner_id)
  on conflict (slug) do nothing
  returning * into v_shop;

  if v_shop.id is null then
    select id into v_shop.id
    from public.shops
    where owner_id = p_owner_id
    limit 1;
  end if;

  insert into public.profiles (id, shop_id, name, phone, role, color, active)
  values (
    p_owner_id,
    v_shop.id,
    coalesce(p_owner_name, 'Shop Owner'),
    p_phone,
    'Owner',
    '#1A6B4A',
    true
  )
  on conflict (id) do update
  set shop_id = excluded.shop_id,
      name = excluded.name,
      phone = excluded.phone,
      role = excluded.role,
      color = excluded.color,
      active = true;

  return v_shop;
end;
$$;

-- 2) Seed the first shop with sample products that match the frontend
create or replace function public.seed_demo_products(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.products (
    shop_id, name, category, emoji, buying_unit, selling_unit, conversion,
    buying_price, selling_price, stock, min_stock, status, brand, barcode
  ) values
    (p_shop_id, 'HP Laptop 15', 'Electronics', '💻', 'piece', 'piece', 1, 650000, 980000, 8, 2, 'good', 'HP', 'HP-LAP-15'),
    (p_shop_id, 'Dell Mouse', 'Accessories', '🖱️', 'piece', 'piece', 1, 15000, 25000, 18, 5, 'good', 'Dell', 'D-ML-01'),
    (p_shop_id, 'USB Cable', 'Accessories', '🔌', 'piece', 'piece', 1, 8000, 12000, 30, 10, 'good', 'Generic', 'USB-001'),
    (p_shop_id, 'Office Chair', 'Furniture', '🪑', 'piece', 'piece', 1, 180000, 260000, 4, 2, 'good', 'Flex', 'CHAIR-09'),
    (p_shop_id, 'Printer Ink', 'Supplies', '🖨️', 'pack', 'pack', 1, 70000, 95000, 7, 3, 'good', 'Canon', 'INK-PRN'),
    (p_shop_id, 'Monitor 24', 'Electronics', '🖥️', 'piece', 'piece', 1, 420000, 590000, 6, 2, 'good', 'LG', 'MON-24'),
    (p_shop_id, 'Keyboard', 'Accessories', '⌨️', 'piece', 'piece', 1, 25000, 42000, 12, 4, 'good', 'Logitech', 'KB-101'),
    (p_shop_id, 'Power Bank', 'Electronics', '🔋', 'piece', 'piece', 1, 55000, 82000, 10, 3, 'good', 'Anker', 'PB-88');
end;
$$;

-- 3) Seed default customers and suppliers
create or replace function public.seed_demo_customers_and_suppliers(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (shop_id, name, phone, balance, notes)
  values
    (p_shop_id, 'Jane Nakato', '0772001001', 180000, 'Regular customer'),
    (p_shop_id, 'Peter Kato', '0772001002', 0, 'Cash buyer'),
    (p_shop_id, 'Sarah Mutesa', '0772001003', 95000, 'Buys monthly products'),
    (p_shop_id, 'Daniel Mugisha', '0772001004', 0, 'No credit history');

  insert into public.suppliers (shop_id, name, phone, location, contact, products, balance, rating)
  values
    (p_shop_id, 'Bentech Wholesale', '0774002001', 'Kampala', 'Samuel', '[]'::jsonb, 0, 5),
    (p_shop_id, 'Mbarara Gadgets', '0774002002', 'Mbarara', 'Grace', '[]'::jsonb, 0, 4),
    (p_shop_id, 'Office Essentials', '0774002003', 'Kampala', 'Ruth', '[]'::jsonb, 0, 5);
end;
$$;

-- 4) Seed starter expense and sales records
create or replace function public.seed_demo_sales_and_expenses(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
begin
  insert into public.expenses (shop_id, category, amount, payment, description)
  values
    (p_shop_id, 'Rent', 350000, 'Cash', 'Shop rent payment'),
    (p_shop_id, 'Utilities', 120000, 'Mobile Money', 'Power and internet'),
    (p_shop_id, 'Transport', 60000, 'Cash', 'Supplier delivery');

  insert into public.sales (shop_id, receipt_no, time, total, payment, customer_name, attendant)
  values
    (p_shop_id, 'RCP100001', now() - interval '1 day', 980000, 'Cash', 'Jane Nakato', 'Owner'),
    (p_shop_id, 'RCP100002', now() - interval '12 hours', 590000, 'Mobile Money', 'Peter Kato', 'Owner');

  select id into v_sale_id
  from public.sales
  where shop_id = p_shop_id
  order by time desc
  limit 1;

  insert into public.sale_items (sale_id, shop_id, product, product_id, qty, price, total)
  values
    (v_sale_id, p_shop_id, 'HP Laptop 15', null, 1, 980000, 980000),
    (v_sale_id, p_shop_id, 'Monitor 24', null, 1, 590000, 590000);
end;
$$;

-- 5) Run the full bootstrap in one step
create or replace function public.run_demo_bootstrap(
  p_owner_id uuid,
  p_shop_name text,
  p_owner_name text default null,
  p_phone text default null,
  p_location text default null,
  p_currency text default 'UGX',
  p_shop_type text default 'Retail Shop'
)
returns public.shops
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shop public.shops;
begin
  select * into v_shop from public.bootstrap_shop(
    p_owner_id,
    p_shop_name,
    p_owner_name,
    p_phone,
    p_location,
    p_currency,
    p_shop_type
  );

  perform public.seed_demo_products(v_shop.id);
  perform public.seed_demo_customers_and_suppliers(v_shop.id);
  perform public.seed_demo_sales_and_expenses(v_shop.id);

  return v_shop;
end;
$$;

-- Example usage after you log in:
-- select public.run_demo_bootstrap(
--   '00000000-0000-0000-0000-000000000000',
--   'Bentech Computers UG',
--   'Benedict Ahumuza',
--   '0772123456',
--   'Rutooma, Mbarara',
--   'UGX',
--   'Retail Shop'
-- );

-- Replace the placeholder UUID above with the real authenticated user ID.
