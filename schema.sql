-- ============================================================
-- MediShop Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal not null,
  mrp decimal,
  category text not null,
  image_url text,
  stock integer default 0,
  requires_prescription boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  city text default 'Indore',
  pincode text not null,
  total_amount decimal not null,
  delivery_charge decimal default 0,
  status text default 'pending',
  payment_method text default 'COD',
  notes text,
  created_at timestamp with time zone default now()
);

-- Order items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders on delete cascade,
  product_id uuid references products,
  product_name text not null,
  quantity integer not null,
  price decimal not null
);

-- Admin users table
create table if not exists admin_users (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  email text not null,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_users enable row level security;

-- Products policies
create policy "Public can read active products" on products
  for select using (is_active = true);

create policy "Admin full access to products" on products
  for all using (
    auth.uid() in (select user_id from admin_users)
  );

-- Orders policies
create policy "Users can read own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can create orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Admin full access to orders" on orders
  for all using (
    auth.uid() in (select user_id from admin_users)
  );

-- Order items policies
create policy "Users can read own order items" on order_items
  for select using (
    order_id in (select id from orders where user_id = auth.uid())
  );

create policy "Users can create order items" on order_items
  for insert with check (true);

create policy "Admin full access to order items" on order_items
  for all using (
    auth.uid() in (select user_id from admin_users)
  );

-- Admin users policies
create policy "Admin only for admin_users" on admin_users
  for all using (
    auth.uid() in (select user_id from admin_users)
  );

-- ============================================================
-- Storage bucket for product images
-- Run this separately in Supabase dashboard or SQL editor
-- ============================================================

-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true);

-- create policy "Public can view product images" on storage.objects
--   for select using (bucket_id = 'product-images');

-- create policy "Admin can upload product images" on storage.objects
--   for insert with check (bucket_id = 'product-images');

-- create policy "Admin can delete product images" on storage.objects
--   for delete using (bucket_id = 'product-images');
