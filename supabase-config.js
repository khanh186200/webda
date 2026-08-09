/**
 * supabase-config.js
 * ─────────────────────────────────────────────────────────
 * HƯỚNG DẪN SETUP:
 *
 * 1. Vào https://supabase.com → tạo project mới
 * 2. Sidebar → Project Settings → API
 * 3. Copy "Project URL" và "anon public" key
 * 4. Dán vào 2 biến bên dưới (thay chữ YOUR_...)
 * ─────────────────────────────────────────────────────────
 */

// ── SUPABASE CONFIG ───────────────────────────────────────
const SUPABASE_URL = 'https://mdzwwfpexwaksqfgfdwy.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kend3ZnBleHdha3NxZmdmZHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODY2MzUsImV4cCI6MjEwMTg2MjYzNX0.BCWs3_jfbptrSFKwkGNqbuhEU8PIV0R5t_bO9qoSuxI';

// ── Khởi tạo Supabase Client (CDN, không cần npm) ────────
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Tên bucket Storage ────────────────────────────────────
export const STORAGE_BUCKET = 'product-images';

// ── Web3Forms Key (Nhận Email về Gmail miễn phí) ─────────
// Nhập key lấy tại https://web3forms.com (Miễn phí 100%)
export const WEB3FORMS_ACCESS_KEY = 'ea0a00bc-cb8e-4d29-9195-db84cf790b19';

