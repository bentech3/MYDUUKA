-- ============================================================
-- MYDUUKA — CRUD RPC Functions + Sync Queue
-- ============================================================

-- ── Sync Queue ──────────────────────────────────────────────
create table public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  entity text not null,
  action text not null,
  payload jsonb not null,
  created_at timestamptz default now(),
  processed_at timestamptz
);

create index idx_sync_queue_shop on public.sync_queue(shop_id);
create index idx_sync_queue_entity on public.sync_queue(entity);
create index idx_sync_queue_processed on public.sync_queue(processed_at);

-- ── Helper: enforce shop ownership ──────────────────────────
create or replace function public.current_shop_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select nullif(current_setting('app.shop_id', true), '')::uuid;
$$;

-- ── PRODUCTS ────────────────────────────────────────────────
create or replace function public.create_product(
  p_shop_id uuid,
  p_name text,
  p_category text default null,
  p_emoji text default '📦',
  p_buying_unit text default null,
  p_selling_unit text default 'piece',
  p_conversion integer default 1,
  p_buying_price numeric default 0,
  p_selling_price numeric default 0,
  p_stock integer default 0,
  p_min_stock integer default 0,
  p_status text default 'good',
  p_brand text default null,
  p_barcode text default null
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.products;
begin
  insert into public.products
    (shop_id, name, category, emoji, buying_unit, selling_unit, conversion, buying_price, selling_price, stock, min_stock, status, brand, barcode)
  values
    (p_shop_id, p_name, p_category, p_emoji, p_buying_unit, p_selling_unit, p_conversion, p_buying_price, p_selling_price, p_stock, p_min_stock, p_status, p_brand, p_barcode)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_products(p_shop_id uuid)
returns setof public.products
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.products where shop_id = p_shop_id order by created_at desc;
end;
$$;

create or replace function public.update_product(
  p_id uuid,
  p_shop_id uuid,
  p_name text default null,
  p_category text default null,
  p_emoji text default null,
  p_buying_unit text default null,
  p_selling_unit text default null,
  p_conversion integer default null,
  p_buying_price numeric default null,
  p_selling_price numeric default null,
  p_stock integer default null,
  p_min_stock integer default null,
  p_status text default null,
  p_brand text default null,
  p_barcode text default null
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.products;
begin
  update public.products set
    name = coalesce(p_name, name),
    category = coalesce(p_category, category),
    emoji = coalesce(p_emoji, emoji),
    buying_unit = coalesce(p_buying_unit, buying_unit),
    selling_unit = coalesce(p_selling_unit, selling_unit),
    conversion = coalesce(p_conversion, conversion),
    buying_price = coalesce(p_buying_price, buying_price),
    selling_price = coalesce(p_selling_price, selling_price),
    stock = coalesce(p_stock, stock),
    min_stock = coalesce(p_min_stock, min_stock),
    status = coalesce(p_status, status),
    brand = coalesce(p_brand, brand),
    barcode = coalesce(p_barcode, barcode),
    updated_at = now()
  where id = p_id and shop_id = p_shop_id
  returning * into result;
  return result;
end;
$$;

create or replace function public.delete_product(p_id uuid, p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.products where id = p_id and shop_id = p_shop_id;
end;
$$;

create or replace function public.adjust_stock(p_id uuid, p_shop_id uuid, p_delta integer)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.products;
begin
  update public.products set
    stock = stock + p_delta,
    updated_at = now()
  where id = p_id and shop_id = p_shop_id
  returning * into result;
  return result;
end;
$$;

-- ── CUSTOMERS ───────────────────────────────────────────────
create or replace function public.create_customer(
  p_shop_id uuid,
  p_name text,
  p_phone text default null,
  p_balance numeric default 0,
  p_notes text default null
)
returns public.customers
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.customers;
begin
  insert into public.customers (shop_id, name, phone, balance, notes)
  values (p_shop_id, p_name, p_phone, p_balance, p_notes)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_customers(p_shop_id uuid)
returns setof public.customers
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.customers where shop_id = p_shop_id order by created_at desc;
end;
$$;

create or replace function public.update_customer(
  p_id uuid,
  p_shop_id uuid,
  p_name text default null,
  p_phone text default null,
  p_balance numeric default null,
  p_notes text default null
)
returns public.customers
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.customers;
begin
  update public.customers set
    name = coalesce(p_name, name),
    phone = coalesce(p_phone, phone),
    balance = coalesce(p_balance, balance),
    notes = coalesce(p_notes, notes),
    last_tx = now()
  where id = p_id and shop_id = p_shop_id
  returning * into result;
  return result;
end;
$$;

create or replace function public.delete_customer(p_id uuid, p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.customers where id = p_id and shop_id = p_shop_id;
end;
$$;

create or replace function public.receive_customer_payment(
  p_customer_id uuid,
  p_shop_id uuid,
  p_amount numeric,
  p_type text default 'payment',
  p_sale_id uuid default null
)
returns public.customer_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.customer_transactions;
begin
  update public.customers set
    balance = balance - p_amount,
    last_tx = now()
  where id = p_customer_id and shop_id = p_shop_id;

  insert into public.customer_transactions
    (customer_id, shop_id, type, amount, "desc", sale_id)
  values
    (p_customer_id, p_shop_id, p_type, p_amount, 'Payment received', p_sale_id)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_customer_transactions(p_customer_id uuid, p_shop_id uuid)
returns setof public.customer_transactions
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.customer_transactions where customer_id = p_customer_id and shop_id = p_shop_id order by date desc;
end;
$$;

-- ── SUPPLIERS ───────────────────────────────────────────────
create or replace function public.create_supplier(
  p_shop_id uuid,
  p_name text,
  p_phone text default null,
  p_location text default null,
  p_contact text default null,
  p_products jsonb default '[]',
  p_balance numeric default 0,
  p_rating integer default 5
)
returns public.suppliers
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.suppliers;
begin
  insert into public.suppliers (shop_id, name, phone, location, contact, products, balance, rating)
  values (p_shop_id, p_name, p_phone, p_location, p_contact, p_products, p_balance, p_rating)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_suppliers(p_shop_id uuid)
returns setof public.suppliers
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.suppliers where shop_id = p_shop_id order by created_at desc;
end;
$$;

create or replace function public.update_supplier(
  p_id uuid,
  p_shop_id uuid,
  p_name text default null,
  p_phone text default null,
  p_location text default null,
  p_contact text default null,
  p_products jsonb default null,
  p_balance numeric default null,
  p_rating integer default null
)
returns public.suppliers
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.suppliers;
begin
  update public.suppliers set
    name = coalesce(p_name, name),
    phone = coalesce(p_phone, phone),
    location = coalesce(p_location, location),
    contact = coalesce(p_contact, contact),
    products = coalesce(p_products, products),
    balance = coalesce(p_balance, balance),
    rating = coalesce(p_rating, rating),
    last_order = now()
  where id = p_id and shop_id = p_shop_id
  returning * into result;
  return result;
end;
$$;

create or replace function public.delete_supplier(p_id uuid, p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.suppliers where id = p_id and shop_id = p_shop_id;
end;
$$;

-- ── PURCHASES ───────────────────────────────────────────────
create or replace function public.create_purchase(
  p_shop_id uuid,
  p_supplier_id uuid,
  p_items text,
  p_amount numeric
)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.purchases;
begin
  insert into public.purchases (shop_id, supplier_id, items, amount)
  values (p_shop_id, p_supplier_id, p_items, p_amount)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_purchases(p_shop_id uuid)
returns setof public.purchases
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.purchases where shop_id = p_shop_id order by date desc;
end;
$$;

-- ── SALES ───────────────────────────────────────────────────
create or replace function public.create_sale(
  p_shop_id uuid,
  p_receipt_no text,
  p_total numeric,
  p_payment text,
  p_customer_id uuid default null,
  p_customer_name text default null,
  p_attendant text default null
)
returns public.sales
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.sales;
begin
  insert into public.sales (shop_id, receipt_no, total, payment, customer_id, customer_name, attendant)
  values (p_shop_id, p_receipt_no, p_total, p_payment, p_customer_id, p_customer_name, p_attendant)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_sales(p_shop_id uuid)
returns setof public.sales
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.sales where shop_id = p_shop_id order by time desc;
end;
$$;

create or replace function public.delete_sale(p_id uuid, p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.sales where id = p_id and shop_id = p_shop_id;
end;
$$;

-- ── SALE ITEMS ──────────────────────────────────────────────
create or replace function public.create_sale_item(
  p_sale_id uuid,
  p_shop_id uuid,
  p_product text,
  p_qty integer,
  p_price numeric,
  p_total numeric,
  p_product_id uuid default null
)
returns public.sale_items
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.sale_items;
begin
  insert into public.sale_items (sale_id, shop_id, product, product_id, qty, price, total)
  values (p_sale_id, p_shop_id, p_product, p_product_id, p_qty, p_price, p_total)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_sale_items(p_sale_id uuid)
returns setof public.sale_items
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.sale_items where sale_id = p_sale_id;
end;
$$;

create or replace function public.delete_sale_items(p_sale_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.sale_items where sale_id = p_sale_id;
end;
$$;

-- ── EXPENSES ────────────────────────────────────────────────
create or replace function public.create_expense(
  p_shop_id uuid,
  p_category text,
  p_amount numeric,
  p_payment text,
  p_desc text default null
)
returns public.expenses
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.expenses;
begin
  insert into public.expenses (shop_id, category, amount, payment, "desc")
  values (p_shop_id, p_category, p_amount, p_payment, p_desc)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_expenses(p_shop_id uuid)
returns setof public.expenses
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.expenses where shop_id = p_shop_id order by date desc;
end;
$$;

create or replace function public.update_expense(
  p_id uuid,
  p_shop_id uuid,
  p_category text default null,
  p_amount numeric default null,
  p_payment text default null,
  p_desc text default null
)
returns public.expenses
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.expenses;
begin
  update public.expenses set
    category = coalesce(p_category, category),
    amount = coalesce(p_amount, amount),
    payment = coalesce(p_payment, payment),
    "desc" = coalesce(p_desc, "desc")
  where id = p_id and shop_id = p_shop_id
  returning * into result;
  return result;
end;
$$;

create or replace function public.delete_expense(p_id uuid, p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.expenses where id = p_id and shop_id = p_shop_id;
end;
$$;

-- ── STOCK MOVEMENTS ─────────────────────────────────────────
create or replace function public.create_stock_movement(
  p_shop_id uuid,
  p_product_id uuid,
  p_product_name text,
  p_type text,
  p_prev_qty integer,
  p_new_qty integer,
  p_reason text default null,
  p_user_id uuid default null
)
returns public.stock_movements
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.stock_movements;
begin
  insert into public.stock_movements
    (shop_id, product_id, product_name, type, prev_qty, new_qty, reason, user_id)
  values (p_shop_id, p_product_id, p_product_name, p_type, p_prev_qty, p_new_qty, p_reason, p_user_id)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_stock_movements(p_shop_id uuid)
returns setof public.stock_movements
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.stock_movements where shop_id = p_shop_id order by created_at desc;
end;
$$;

-- ── ACTIVITY LOG ────────────────────────────────────────────
create or replace function public.create_activity_log(
  p_shop_id uuid,
  p_user_name text,
  p_action text,
  p_detail text default null,
  p_type text,
  p_user_id uuid default null
)
returns public.activity_log
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.activity_log;
begin
  insert into public.activity_log (shop_id, user_id, user_name, action, detail, type)
  values (p_shop_id, p_user_id, p_user_name, p_action, p_detail, p_type)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_activity_log(p_shop_id uuid)
returns setof public.activity_log
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.activity_log where shop_id = p_shop_id order by created_at desc;
end;
$$;

-- ── SYNC QUEUE ──────────────────────────────────────────────
create or replace function public.enqueue_sync(
  p_shop_id uuid,
  p_entity text,
  p_action text,
  p_payload jsonb
)
returns public.sync_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.sync_queue;
begin
  insert into public.sync_queue (shop_id, entity, action, payload)
  values (p_shop_id, p_entity, p_action, p_payload)
  returning * into result;
  return result;
end;
$$;

create or replace function public.get_pending_sync(p_shop_id uuid)
returns setof public.sync_queue
language plpgsql
security definer
set search_path = public
as $$
begin
  return query select * from public.sync_queue where shop_id = p_shop_id and processed_at is null order by created_at asc;
end;
$$;

create or replace function public.mark_sync_processed(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.sync_queue set processed_at = now() where id = p_id;
end;
$$;

-- ── SHOPS ───────────────────────────────────────────────────
create or replace function public.update_shop(
  p_id uuid,
  p_name text default null,
  p_slug text default null,
  p_shop_type text default null,
  p_location text default null,
  p_currency text default null,
  p_opening_float numeric default null
)
returns public.shops
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.shops;
begin
  update public.shops set
    name = coalesce(p_name, name),
    slug = coalesce(p_slug, slug),
    shop_type = coalesce(p_shop_type, shop_type),
    location = coalesce(p_location, location),
    currency = coalesce(p_currency, currency),
    opening_float = coalesce(p_opening_float, opening_float),
    updated_at = now()
  where id = p_id
  returning * into result;
  return result;
end;
$$;

-- ── PROFILES ────────────────────────────────────────────────
create or replace function public.update_profile(
  p_id uuid,
  p_name text default null,
  p_phone text default null,
  p_role text default null,
  p_pin text default null,
  p_color text default null,
  p_active boolean default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  update public.profiles set
    name = coalesce(p_name, name),
    phone = coalesce(p_phone, phone),
    role = coalesce(p_role, role),
    pin = coalesce(p_pin, pin),
    color = coalesce(p_color, color),
    active = coalesce(p_active, active),
    last_login = now()
  where id = p_id
  returning * into result;
  return result;
end;
$$;
