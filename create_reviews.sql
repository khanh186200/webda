-- ═════════════════════════════════════════════════════════════════
-- FILE: create_reviews.sql
-- Chạy đoạn SQL này trong Supabase -> SQL Editor -> Run
-- ═════════════════════════════════════════════════════════════════

-- 1. Tạo bảng reviews lưu đánh giá từ khách hàng
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  stars       int default 5 check (stars between 1 and 5),
  comment     text not null,
  status      text default 'approved', -- 'approved' (hiển thị), 'pending' (chờ duyệt)
  created_at  timestamptz default now()
);

-- 2. Bật Row Level Security (RLS)
alter table reviews enable row level security;

-- Xóa policy cũ nếu có để chạy nhiều lần không bị trùng lỗi
drop policy if exists "Public read reviews" on reviews;
drop policy if exists "Public insert reviews" on reviews;
drop policy if exists "Auth manage reviews" on reviews;

-- 3. Cho phép tất cả mọi người đọc đánh giá
create policy "Public read reviews" on reviews
  for select using (true);

-- 4. Cho phép khách hàng gửi đánh giá mới từ website
create policy "Public insert reviews" on reviews
  for insert with check (true);

-- 5. Chỉ Admin đã đăng nhập mới được sửa, xóa đánh giá
create policy "Auth manage reviews" on reviews
  for all using (auth.role() = 'authenticated');
