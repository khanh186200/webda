-- ═════════════════════════════════════════════════════════════════
-- FILE: create_consultations.sql
-- Chạy đoạn SQL này trong Supabase -> SQL Editor -> Run
-- ═════════════════════════════════════════════════════════════════

-- 1. Tạo bảng consultations lưu yêu cầu tư vấn
create table if not exists consultations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  birthyear   text,
  message     text,
  status      text default 'pending', -- 'pending' (chưa xử lý), 'done' (đã xử lý)
  created_at  timestamptz default now()
);

-- 2. Bật Row Level Security (RLS)
alter table consultations enable row level security;

-- Xóa policy cũ nếu có để chạy nhiều lần không lỗi
drop policy if exists "Public insert consultations" on consultations;
drop policy if exists "Auth manage consultations" on consultations;

-- 3. Cho phép tất cả mọi người gửi tư vấn từ website
create policy "Public insert consultations" on consultations
  for insert with check (true);

-- 4. Chỉ Admin đã đăng nhập mới được xem, sửa, xóa yêu cầu tư vấn
create policy "Auth manage consultations" on consultations
  for all using (auth.role() = 'authenticated');
