-- ═════════════════════════════════════════════════════════════════
-- FILE CẤU HÌNH KHO ẢNH STORAGE
-- Chạy đoạn này để tự động tạo kho ảnh và cấp quyền upload ảnh
-- ═════════════════════════════════════════════════════════════════

-- 1. Tạo bucket 'product-images' nếu chưa có, và set public
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- 2. Xóa các policy cũ nếu có (để chạy lại không bị lỗi)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Auth Insert" on storage.objects;
drop policy if exists "Auth Update" on storage.objects;
drop policy if exists "Auth Delete" on storage.objects;

-- 3. Cấp quyền: Mọi người đều có thể XEM ảnh
create policy "Public Access" on storage.objects 
for select using ( bucket_id = 'product-images' );

-- 4. Cấp quyền: Chỉ Admin (đã đăng nhập) mới được THÊM, SỬA, XÓA ảnh
create policy "Auth Insert" on storage.objects 
for insert with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Auth Update" on storage.objects 
for update using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Auth Delete" on storage.objects 
for delete using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );
