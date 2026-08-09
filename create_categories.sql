-- Tạo table categories
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name_vi     text not null,
  name_en     text,
  slug        text not null unique,
  icon        text,
  sort_order  int  default 0,
  created_at  timestamptz default now()
);

-- Bỏ ràng buộc danh mục cứng cũ trên bảng products để cho phép chọn danh mục động mới
alter table products drop constraint if exists products_category_check;

-- Bật RLS
alter table categories enable row level security;

-- Xóa policy cũ nếu có để tránh lỗi "already exists"
drop policy if exists "Public read categories" on categories;
drop policy if exists "Auth write categories" on categories;

-- Mọi người đọc được (filter trang chủ)
create policy "Public read categories" on categories
  for select using (true);

-- Chỉ admin mới sửa/xóa
create policy "Auth write categories" on categories
  for all using (auth.role() = 'authenticated');

-- Thêm 3 danh mục mặc định (giống như cũ)
insert into categories (name_vi, name_en, slug, icon, sort_order) values
  ('Vòng Tay',         'Bracelets',         'vong',    '📿', 1),
  ('Đá Rời',           'Loose Stones',      'da-roi',  '🪨', 2),
  ('Tượng Phong Thủy', 'Feng Shui Statues', 'tuong',   '🏺', 3)
on conflict (slug) do nothing;
