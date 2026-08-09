# ◈ Tinh Hoa Đá Quý

<div align="center">

![Static Badge](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Static Badge](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Static Badge](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Static Badge](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Static Badge](https://img.shields.io/badge/License-MIT-green?style=flat)

**Website thương mại điện tử chuyên đá quý & đá phong thủy ngũ hành.**  
Tích hợp Admin Panel quản lý sản phẩm thời gian thực qua **Supabase**.

[🌐 Xem Demo](#) · [🐛 Báo lỗi](#) · [💡 Đề xuất tính năng](#)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc project](#-cấu-trúc-project)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu hình Supabase](#-cấu-hình-supabase)
- [Sử dụng Admin Panel](#-sử-dụng-admin-panel)
- [Deploy](#-deploy)
- [License](#-license)

---

## 🪨 Giới thiệu

**Tinh Hoa Đá Quý** là website thương mại điện tử chuyên về đá quý và đá phong thủy ngũ hành. Website được xây dựng hoàn toàn bằng **Vanilla HTML/CSS/JS** (không cần framework), tích hợp **Supabase** làm backend để quản lý sản phẩm, xác thực và lưu trữ ảnh theo thời gian thực.

**Điểm nổi bật:**
- 🌐 **Song ngữ** — Tiếng Việt / English, chuyển đổi tức thì không tải lại trang
- ⚡ **Real-time** — Thay đổi từ admin hiển thị ngay trên trang chủ qua Supabase Realtime
- 🔒 **Bảo mật** — Row Level Security (RLS) phân quyền rõ ràng: public chỉ đọc, admin mới được ghi
- 📱 **Responsive** — Tối ưu cho mọi thiết bị từ mobile đến desktop

---

## ✨ Tính năng

### 🌐 Trang chủ (`index.html`)

| Tính năng | Mô tả |
|---|---|
| **Đa ngôn ngữ** | Chuyển đổi VI / EN tức thì, không reload trang |
| **Sản phẩm động** | Tải từ Supabase, cập nhật real-time khi admin thay đổi |
| **Bộ lọc danh mục** | Vòng Tay / Đá Rời / Tượng Phong Thủy |
| **Modal xem chi tiết** | Popup thông tin chi tiết sản phẩm |
| **Slider testimonials** | Tự động chuyển, có dot navigation |
| **Scroll reveal** | Animation xuất hiện khi cuộn trang |
| **Parallax hero** | Hiệu ứng chiều sâu ở banner chính |
| **Marquee banner** | Băng chuyền tên đá quý nổi bật |
| **Form liên hệ** | Tư vấn theo năm sinh / cung mệnh |
| **Responsive** | Tối ưu mobile, tablet, desktop |

### ⚙️ Admin Panel (`admin.html`)

| Tính năng | Mô tả |
|---|---|
| **Xác thực** | Supabase Authentication (email/password) |
| **Thêm sản phẩm** | Form đầy đủ: tên VI/EN, ngũ hành, giá, mô tả, danh mục, badge, sao |
| **Sửa sản phẩm** | Inline edit, tải lại ảnh mới nếu cần |
| **Xóa sản phẩm** | Xóa kèm xóa ảnh khỏi Storage |
| **Upload ảnh** | Tải lên Supabase Storage, tự tạo public URL |
| **Real-time sync** | Mọi thay đổi hiển thị ngay trên trang chủ |
| **Thống kê** | Tổng sản phẩm theo từng danh mục |
| **Tìm kiếm & lọc** | Lọc theo tên / danh mục trong bảng quản lý |

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript (ES Modules) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Authentication | Supabase Auth (email/password) |
| Storage | Supabase Storage (public bucket) |
| Real-time | Supabase Realtime (`postgres_changes`) |
| Fonts | Google Fonts — Playfair Display, Inter |
| Icons | Unicode emoji, CSS pseudo-elements |
| Hosting | Static (GitHub Pages, Netlify, Vercel, v.v.) |

---

## 📁 Cấu trúc project

```
da-phong-thuy/
│
├── index.html               # Trang chủ (cửa hàng)
├── script.js                # Logic trang chủ: Supabase, UI, animations, i18n
├── style.css                # CSS trang chủ
│
├── admin.html               # Trang quản trị
├── admin-supabase.js        # Logic admin: Auth, CRUD sản phẩm, Storage upload
├── admin.css                # CSS trang admin
│
├── supabase-config.js       # ⚠️ Cấu hình kết nối Supabase (URL + anon key)
├── create_categories.sql    # SQL khởi tạo bảng categories
│
├── hero.png                 # Ảnh hero banner
├── bracelet.png             # Ảnh sản phẩm mẫu (vòng tay)
├── crystals.png             # Ảnh sản phẩm mẫu (đá rời)
└── product-stones.png       # Ảnh sản phẩm mẫu (bộ đá)
```

---

## 🚀 Hướng dẫn cài đặt

Project này là **static website** — không cần build tool, không cần Node.js cài sẵn để chạy.

### Yêu cầu

- Trình duyệt hiện đại (Chrome, Firefox, Edge, Safari)
- Tài khoản [Supabase](https://supabase.com) (miễn phí)
- Một static server khi chạy local (xem bên dưới)

### Clone project

```bash
git clone https://github.com/your-username/da-phong-thuy.git
cd da-phong-thuy
```

### Chạy local

> ⚠️ **Bắt buộc dùng server** — Không mở file trực tiếp (`file://`) vì script sử dụng ES Modules (`import/export`).

**Cách 1 — VS Code Live Server** (khuyến nghị):
- Cài extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- Click chuột phải `index.html` → **Open with Live Server**

**Cách 2 — `npx serve`**:
```bash
npx serve .
```

**Cách 3 — Python**:
```bash
python -m http.server 3000
```

Sau đó mở `http://localhost:3000` (hoặc port tương ứng) trên trình duyệt.

---

## 🔧 Cấu hình Supabase

### Bước 1 — Tạo project Supabase

1. Đăng ký / đăng nhập tại [supabase.com](https://supabase.com)
2. Nhấn **New Project**, đặt tên và chọn region **Southeast Asia (Singapore)** cho độ trễ thấp nhất tại Việt Nam
3. Chờ project khởi tạo (khoảng 1–2 phút)

### Bước 2 — Lấy API Key và điền vào `supabase-config.js`

1. Vào **Project Settings → API**
2. Copy **Project URL** và **anon public** key
3. Mở file `supabase-config.js` và thay thế:

```js
// supabase-config.js
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';  // ← dán Project URL
const SUPABASE_ANON = 'eyJhbGci...';                           // ← dán anon key
```

### Bước 3 — Tạo bảng `products`

Vào **SQL Editor** trong Supabase Dashboard, chạy đoạn SQL sau:

```sql
create table products (
  id          uuid primary key default gen_random_uuid(),
  name_vi     text not null,
  name_en     text,
  element_vi  text,
  element_en  text,
  price_vi    text,
  price_en    text,
  desc_vi     text,
  desc_en     text,
  category    text check (category in ('vong', 'da-roi', 'tuong')),
  badge       text,
  stars       int  default 5 check (stars between 1 and 5),
  reviews     int  default 0,
  img_url     text,
  created_at  timestamptz default now()
);

-- Bật Row Level Security
alter table products enable row level security;

-- Cho phép mọi người đọc (trang chủ không cần đăng nhập)
create policy "Public read" on products
  for select using (true);

-- Chỉ admin đã đăng nhập mới được thêm/sửa/xóa
create policy "Authenticated write" on products
  for all using (auth.role() = 'authenticated');
```

### Bước 4 — (Tuỳ chọn) Tạo bảng `categories`

Nếu muốn quản lý danh mục động, chạy file `create_categories.sql` có sẵn trong project:

```bash
# Dán nội dung file create_categories.sql vào SQL Editor của Supabase
```

File này tạo bảng `categories` với 3 danh mục mặc định: **Vòng Tay**, **Đá Rời**, **Tượng Phong Thủy**.

### Bước 5 — Tạo bảng `consultations` (Lưu Yêu Cầu Tư Vấn)

Chạy file `create_consultations.sql` có sẵn trong SQL Editor của Supabase để tạo bảng lưu thông tin tư vấn của khách hàng:

```bash
# Dán nội dung file create_consultations.sql vào SQL Editor của Supabase
```

### Bước 6 — Tạo bảng `reviews` (Lưu Đánh Giá Khách Hàng)

Chạy file `create_reviews.sql` có sẵn trong SQL Editor của Supabase để lưu và quản lý đánh giá của khách hàng:

```bash
# Dán nội dung file create_reviews.sql vào SQL Editor của Supabase
```

### Bước 7 — Cấu hình Nhận Email về Gmail (Web3Forms - Miễn phí)

1. Truy cập [web3forms.com](https://web3forms.com) -> nhập Gmail của bạn để nhận Key miễn phí
2. Mở file `supabase-config.js` -> dán key vào biến `WEB3FORMS_ACCESS_KEY`:
```javascript
export const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
```
Mỗi khi khách gửi form trên website, bạn sẽ nhận được email thông báo tức thì trong Gmail!


### Bước 5 — Tạo Storage bucket

1. Vào **Storage → New bucket**
2. Đặt tên: `product-images`
3. Chọn ✅ **Public bucket** (để ảnh có thể truy cập công khai)
4. Vào **Policies** của bucket → thêm policy:

```sql
-- Cho phép authenticated user upload ảnh
create policy "Auth upload" on storage.objects
  for insert to authenticated
  using (bucket_id = 'product-images');

-- Cho phép authenticated user xóa ảnh
create policy "Auth delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images');
```

### Bước 6 — Tạo tài khoản Admin

1. Vào **Authentication → Users → Invite user**
2. Nhập email của admin
3. Admin sẽ nhận email với link đặt mật khẩu
4. Dùng email & mật khẩu đó để đăng nhập vào `admin.html`

---

## 🎛 Sử dụng Admin Panel

Truy cập `http://localhost:3000/admin.html` (hoặc URL deploy của bạn).

### Đăng nhập

- Nhập **Email** và **Mật khẩu** đã tạo ở Bước 6
- Nhấn **Đăng Nhập**

### Các tab chức năng

| Tab | Chức năng |
|---|---|
| **Quản Lý** | Xem danh sách toàn bộ sản phẩm, tìm kiếm theo tên, lọc theo danh mục, xóa sản phẩm |
| **Thêm / Sửa** | Form thêm sản phẩm mới hoặc chỉnh sửa sản phẩm đã chọn, upload ảnh |
| **Thống Kê** | Tổng quan số lượng sản phẩm theo từng danh mục |

> 💡 Mọi thay đổi (thêm / sửa / xóa) sẽ **tự động cập nhật** trên trang chủ ngay lập tức nhờ **Supabase Realtime**, không cần tải lại trang.

---

## 🌍 Deploy

Project là static website nên có thể deploy lên bất kỳ nền tảng nào hỗ trợ hosting tĩnh:

| Nền tảng | Hướng dẫn |
|---|---|
| **GitHub Pages** | Push code lên repo → Settings → Pages → chọn branch `main` |
| **Netlify** | Kéo thả thư mục vào [netlify.com/drop](https://netlify.com/drop) |
| **Vercel** | `npx vercel` hoặc kết nối GitHub repo |
| **Cloudflare Pages** | Kết nối GitHub repo, không cần build command |

> ⚠️ Sau khi deploy, nhớ thêm domain của bạn vào **Supabase → Authentication → URL Configuration → Site URL & Redirect URLs** để tính năng Auth hoạt động đúng.

---

## 📄 License

© 2025 **Tinh Hoa Đá Quý**. All rights reserved.

---

<div align="center">
  <sub>Made with ❤️ using HTML · CSS · JavaScript · Supabase</sub>
</div>
