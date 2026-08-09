-- ═════════════════════════════════════════════════════════════════
-- FILE: create_products.sql
-- Chạy đoạn SQL này trong Supabase -> SQL Editor -> Run
-- ═════════════════════════════════════════════════════════════════

-- 1. Tạo bảng products lưu sản phẩm
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name_vi     text not null,
  name_en     text,
  element_vi  text,
  element_en  text,
  price_vi    text not null,
  price_en    text,
  desc_vi     text,
  desc_en     text,
  category    text not null,
  badge       text,
  stars       int default 5,
  reviews     int default 0,
  img_url     text,
  created_at  timestamptz default now()
);

-- 2. Bật Row Level Security (RLS)
alter table products enable row level security;

-- Xóa policy cũ nếu có để chạy nhiều lần không bị trùng lỗi
drop policy if exists "Public read products" on products;
drop policy if exists "Auth manage products" on products;

-- 3. Cho phép tất cả mọi người đọc danh sách sản phẩm
create policy "Public read products" on products
  for select using (true);

-- 4. Chỉ Admin đã đăng nhập mới được thêm, sửa, xóa sản phẩm
create policy "Auth manage products" on products
  for all using (auth.role() = 'authenticated');
