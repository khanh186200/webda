/* ============================================================
   ADMIN PANEL – Supabase Version
   Tinh Hoa Đá Quý
   Features:
   • Supabase Auth (email/password)
   • Dynamic Categories CRUD
   • Products CRUD + Real-time
   • Storage upload (product-images bucket)
============================================================ */

import { supabase, STORAGE_BUCKET } from './supabase-config.js';

// ──────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────

let products = [];
let categories = [];
let consultations = [];
let reviews = [];
let deleteTargetId = null;
let deleteTargetImages = [];
let deleteCatTargetId = null;
let uploadedFile = null;
let currentStar = 5;
let realtimeChannel = null;


// ──────────────────────────────────────────────────────────
// AUTH – Supabase Authentication
// ──────────────────────────────────────────────────────────

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) showDashboard(session.user);
  else showLoginPage();
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) showDashboard(session.user);
  else showLoginPage();
});

function showDashboard(user) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');
  const emailEl = document.getElementById('adminEmail');
  if (emailEl) emailEl.textContent = user.email;
  initDashboard();
}

function showLoginPage() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('adminApp').classList.add('hidden');
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');
  const btnText = document.getElementById('loginBtnText');
  const errEl = document.getElementById('loginError');

  errEl.classList.add('hidden');
  btnText.textContent = 'Đang đăng nhập...';
  btn.disabled = true;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msgs = {
      'Invalid login credentials': '⚠️ Email hoặc mật khẩu không đúng.',
      'Email not confirmed': '⚠️ Email chưa được xác nhận.',
      'Too many requests': '⚠️ Quá nhiều lần thử. Thử lại sau.',
    };
    errEl.textContent = msgs[error.message] || `⚠️ ${error.message}`;
    errEl.classList.remove('hidden');
    btnText.textContent = 'Đăng Nhập';
    btn.disabled = false;
    document.getElementById('password').value = '';
    const card = document.querySelector('.login-card');
    card.style.animation = 'none'; card.offsetHeight;
    card.style.animation = 'shake 0.4s ease';
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  document.getElementById('loginForm')?.reset();
}

function togglePassword() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;

// ──────────────────────────────────────────────────────────
// DASHBOARD INIT
// ──────────────────────────────────────────────────────────

function initDashboard() {
  loadCategories().then(() => {
    loadProducts();
    loadConsultations();
    loadAdminReviews();
    subscribeRealtime();
  });
  startClock();
}

function startClock() {
  const tick = () => {
    const el = document.getElementById('topbarTime');
    if (el) el.textContent = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  tick(); setInterval(tick, 1000);
}

// ──────────────────────────────────────────────────────────
// CATEGORIES – Load, CRUD, Populate Selects
// ──────────────────────────────────────────────────────────

async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[Categories] Load error:', error.message);
    return;
  }
  categories = data || [];
  populateCategorySelects();
}

function populateCategorySelects() {
  // Inject options into catFilter (product list) and category (product form)
  const selects = ['catFilter', 'category'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    // Keep first option, replace the rest
    const firstOpt = sel.options[0];
    sel.innerHTML = '';
    sel.appendChild(firstOpt);
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.slug;
      opt.textContent = `${c.icon || ''} ${c.name_vi}`.trim();
      sel.appendChild(opt);
    });
  });
}

async function renderCatTable() {
  await loadCategories();
  const tbody = document.getElementById('catTableBody');
  if (!tbody) return;

  if (categories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-light)">
      Chưa có danh mục nào. <button onclick="openCatForm()">Thêm ngay</button>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = categories.map(c => {
    const count = products.filter(p => p.category === c.slug).length;
    return `<tr>
      <td style="font-size:1.4rem;text-align:center">${escHtml(c.icon || '—')}</td>
      <td><strong>${escHtml(c.name_vi)}</strong></td>
      <td style="color:var(--text-light)">${escHtml(c.name_en || '—')}</td>
      <td><code style="background:var(--bg);padding:2px 8px;border-radius:4px;font-size:0.8rem">${escHtml(c.slug)}</code></td>
      <td style="text-align:center">${count}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit"   onclick="openCatEdit('${c.id}')">✏️</button>
          <button class="btn-delete" onclick="openCatDeleteModal('${c.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openCatForm() {
  document.getElementById('catEditId').value = '';
  document.getElementById('catForm').reset();
  document.getElementById('catFormTitle').textContent = '➕ Thêm Danh Mục Mới';
  document.getElementById('catSaveBtn').querySelector('span').textContent = '💾 Lưu Danh Mục';
  document.getElementById('catSlug').readOnly = false;
  document.getElementById('catFormWrap').classList.remove('hidden');
  document.getElementById('btnOpenCatForm').classList.add('hidden');
}

function closeCatForm() {
  document.getElementById('catFormWrap').classList.add('hidden');
  document.getElementById('btnOpenCatForm').classList.remove('hidden');
}

function openCatEdit(id) {
  const c = categories.find(x => String(x.id) === String(id));
  if (!c) return;
  document.getElementById('catEditId').value = c.id;
  document.getElementById('catNameVi').value = c.name_vi || '';
  document.getElementById('catNameEn').value = c.name_en || '';
  document.getElementById('catSlug').value = c.slug || '';
  document.getElementById('catSlug').readOnly = true; // slug không đổi khi edit
  document.getElementById('catIcon').value = c.icon || '';
  document.getElementById('catFormTitle').textContent = '✏️ Chỉnh Sửa Danh Mục';
  document.getElementById('catSaveBtn').querySelector('span').textContent = '💾 Cập Nhật';
  document.getElementById('catFormWrap').classList.remove('hidden');
  document.getElementById('btnOpenCatForm').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleCatSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('catSaveBtn');
  btn.querySelector('span').textContent = '⏳ Đang lưu...';
  btn.disabled = true;

  const editId = document.getElementById('catEditId').value;
  const record = {
    name_vi: document.getElementById('catNameVi').value.trim(),
    name_en: document.getElementById('catNameEn').value.trim(),
    slug: document.getElementById('catSlug').value.trim().toLowerCase(),
    icon: document.getElementById('catIcon').value.trim(),
    sort_order: categories.length + 1,
  };

  try {
    let error;
    if (editId) {
      const update = { name_vi: record.name_vi, name_en: record.name_en, icon: record.icon };
      ({ error } = await supabase.from('categories').update(update).eq('id', editId));
    } else {
      ({ error } = await supabase.from('categories').insert([record]));
    }
    if (error) throw error;
    showToast(editId ? '✅ Đã cập nhật danh mục!' : '✅ Đã thêm danh mục mới!', 'success');
    closeCatForm();
    await renderCatTable();
  } catch (err) {
    showToast('❌ Lỗi: ' + err.message, 'error');
  } finally {
    btn.querySelector('span').textContent = '💾 Lưu Danh Mục';
    btn.disabled = false;
  }
}

function openCatDeleteModal(id) {
  const c = categories.find(x => String(x.id) === String(id));
  if (!c) return;
  deleteCatTargetId = id;
  document.getElementById('deleteCatName').textContent = c.name_vi;
  document.getElementById('deleteCatModal').classList.add('open');
}

function closeCatDeleteModal() {
  document.getElementById('deleteCatModal').classList.remove('open');
  deleteCatTargetId = null;
}

async function confirmDeleteCat() {
  if (!deleteCatTargetId) return;
  const btn = document.getElementById('confirmDeleteCatBtn');
  btn.textContent = 'Đang xóa...';
  btn.disabled = true;
  try {
    const { error } = await supabase.from('categories').delete().eq('id', deleteCatTargetId);
    if (error) throw error;
    closeCatDeleteModal();
    showToast('🗑️ Đã xóa danh mục!', 'success');
    await renderCatTable();
  } catch (err) {
    showToast('❌ Lỗi xóa: ' + err.message, 'error');
  } finally {
    btn.textContent = 'Xóa';
    btn.disabled = false;
  }
}

window.openCatForm = openCatForm;
window.closeCatForm = closeCatForm;
window.openCatEdit = openCatEdit;
window.handleCatSubmit = handleCatSubmit;
window.openCatDeleteModal = openCatDeleteModal;
window.closeCatDeleteModal = closeCatDeleteModal;
window.confirmDeleteCat = confirmDeleteCat;

// ──────────────────────────────────────────────────────────
// SUPABASE – Load Products & Real-time
// ──────────────────────────────────────────────────────────

async function loadProducts() {
  showTableLoading(true);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('❌ Lỗi tải sản phẩm: ' + error.message, 'error');
    showTableLoading(false);
    return;
  }
  products = data || [];
  renderProductTable();
  renderStats();
  showTableLoading(false);
}

function subscribeRealtime() {
  realtimeChannel = supabase
    .channel('admin-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadProducts())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => loadConsultations())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => loadAdminReviews())
    .subscribe();
}

function showTableLoading(show) {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;
  if (show) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-light)">
      <div style="font-size:1.5rem;margin-bottom:8px">⏳</div>Đang tải dữ liệu...
    </td></tr>`;
  }
}

// ──────────────────────────────────────────────────────────
// TAB NAVIGATION
// ──────────────────────────────────────────────────────────

const TAB_TITLES = {
  products: 'Quản Lý Sản Phẩm',
  add: 'Thêm Sản Phẩm',
  categories: 'Quản Lý Danh Mục',
  consultations: 'Yêu Cầu Tư Vấn Từ Khách Hàng',
  reviews: 'Quản Lý Đánh Giá Từ Khách Hàng',
  stats: 'Thống Kê Tổng Quan'
};

function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name)?.classList.add('active');
  document.getElementById('tab-btn-' + name)?.classList.add('active');
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = TAB_TITLES[name] || '';
  if (name === 'stats') renderStats();
  if (name === 'categories') renderCatTable();
  if (name === 'consultations') renderConsultationTable();
  if (name === 'reviews') renderReviewAdminTable();
}

// ──────────────────────────────────────────────────────────
// CONSULTATIONS – Load, Render, Status Toggle, Delete
// ──────────────────────────────────────────────────────────

async function loadConsultations() {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    consultations = data || [];
  } catch (err) {
    console.warn('[Consultations] Supabase load error, reading localStorage:', err.message);
    consultations = [];
  }
  try {
    const raw = localStorage.getItem('tinhHoaDaQuy_consultations');
    if (raw) {
      const local = JSON.parse(raw).filter(c => String(c.id).startsWith('local_'));
      consultations = [...local, ...consultations];
    }
  } catch (_) {}
  updatePendingConsultBadge();
  renderConsultationTable();
}

function updatePendingConsultBadge() {
  const pendingCount = consultations.filter(c => c.status === 'pending').length;
  const badge = document.getElementById('pendingConsultBadge');
  if (badge) {
    badge.textContent = pendingCount;
    if (pendingCount > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
  }
}

function renderConsultationTable() {
  const tbody = document.getElementById('consultTableBody');
  const empty = document.getElementById('consultEmptyState');
  if (!tbody) return;

  const search = (document.getElementById('consultSearchInput')?.value || '').toLowerCase();
  const filter = document.getElementById('consultFilter')?.value || '';

  const filtered = consultations.filter(c => {
    const matchSearch = (c.name || '').toLowerCase().includes(search) ||
      (c.phone || '').toLowerCase().includes(search) ||
      (c.message || '').toLowerCase().includes(search) ||
      (c.email || '').toLowerCase().includes(search);
    const matchFilter = !filter || c.status === filter;
    return matchSearch && matchFilter;
  });

  const totalEl = document.getElementById('consultTotalCount');
  if (totalEl) totalEl.textContent = consultations.length;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  tbody.innerHTML = filtered.map(c => {
    const dateStr = c.created_at
      ? new Date(c.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
      : '—';
    const isDone = c.status === 'done';
    const statusBadge = isDone
      ? `<span class="table-badge new" style="background:#4CAF50">✅ Đã xử lý</span>`
      : `<span class="table-badge sale" style="background:#FF9800">⏳ Chưa xử lý</span>`;

    const toggleBtn = isDone
      ? `<button class="btn-cancel" style="padding:4px 8px;font-size:0.75rem" onclick="toggleConsultStatus('${c.id}', 'pending')">↺ Mở lại</button>`
      : `<button class="btn-save" style="padding:4px 8px;font-size:0.75rem;background:#4CAF50" onclick="toggleConsultStatus('${c.id}', 'done')">✓ Đã xử lý</button>`;

    return `<tr>
      <td style="font-size:0.8rem;color:var(--text-light)">${dateStr}</td>
      <td><strong>${escHtml(c.name)}</strong></td>
      <td><a href="tel:${c.phone}" style="color:var(--primary);font-weight:600">${escHtml(c.phone)}</a></td>
      <td style="font-size:0.82rem;color:var(--text-light)">${escHtml(c.email || '—')}</td>
      <td style="text-align:center">${escHtml(c.birthyear || '—')}</td>
      <td style="font-size:0.85rem;max-width:250px;white-space:normal">${escHtml(c.message || '—')}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="action-btns" style="gap:6px">
          ${toggleBtn}
          <button class="btn-delete" onclick="deleteConsultation('${c.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function toggleConsultStatus(id, newStatus) {
  try {
    if (String(id).startsWith('local_')) {
      const raw = localStorage.getItem('tinhHoaDaQuy_consultations') || '[]';
      const localList = JSON.parse(raw).map(c => c.id === id ? { ...c, status: newStatus } : c);
      localStorage.setItem('tinhHoaDaQuy_consultations', JSON.stringify(localList));
    } else {
      const { error } = await supabase.from('consultations').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    }
    showToast(newStatus === 'done' ? '✅ Đã đánh dấu xử lý!' : '↺ Đã mở lại yêu cầu!', 'success');
    await loadConsultations();
  } catch (err) {
    showToast('❌ Lỗi: ' + err.message, 'error');
  }
}

async function deleteConsultation(id) {
  if (!confirm('Bạn có chắc muốn xóa yêu cầu tư vấn này?')) return;
  try {
    if (String(id).startsWith('local_')) {
      const raw = localStorage.getItem('tinhHoaDaQuy_consultations') || '[]';
      const localList = JSON.parse(raw).filter(c => c.id !== id);
      localStorage.setItem('tinhHoaDaQuy_consultations', JSON.stringify(localList));
    } else {
      const { error } = await supabase.from('consultations').delete().eq('id', id);
      if (error) throw error;
    }
    showToast('🗑️ Đã xóa yêu cầu tư vấn!', 'success');
    await loadConsultations();
  } catch (err) {
    showToast('❌ Lỗi xóa: ' + err.message, 'error');
  }
}

window.renderConsultationTable = renderConsultationTable;
window.toggleConsultStatus = toggleConsultStatus;
window.deleteConsultation = deleteConsultation;


function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

window.showTab = showTab;
window.toggleSidebar = toggleSidebar;

// ──────────────────────────────────────────────────────────
// PRODUCT TABLE RENDER
// ──────────────────────────────────────────────────────────

function renderProductTable() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const catFilter = document.getElementById('catFilter')?.value || '';

  const filtered = products.filter(p => {
    const matchSearch = (p.name_vi || '').toLowerCase().includes(search) ||
      (p.name_en || '').toLowerCase().includes(search);
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

  document.getElementById('productCount').textContent = products.length;

  const tbody = document.getElementById('productTableBody');
  const empty = document.getElementById('emptyState');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  // Build label map from dynamic categories
  const catLabels = Object.fromEntries(
    categories.map(c => [c.slug, `${c.icon || ''} ${c.name_vi}`.trim()])
  );

  tbody.innerHTML = filtered.map(p => {
    const badgeVi = p.badge ? p.badge.split('|')[0] : '';
    const badgeClass = !badgeVi ? '' : badgeVi === 'Ưu Đãi' ? 'sale' : badgeVi === 'Mới' ? 'new' : badgeVi === 'Hot' ? 'hot' : 'default';
    const stars = '★'.repeat(p.stars || 5) + '☆'.repeat(5 - (p.stars || 5));
    const imgSrc = p.img_url ? p.img_url.split('|')[0] : 'bracelet.png';
    return `
      <tr>
        <td><img src="${escHtml(imgSrc)}" class="table-img" onerror="this.src='bracelet.png'" /></td>
        <td>
          <div style="font-weight:600;color:var(--text-dark)">${escHtml(p.name_vi)}</div>
          <div style="font-size:0.75rem;color:var(--text-light)">${escHtml(p.name_en)}</div>
        </td>
        <td><span style="font-size:0.82rem">${catLabels[p.category] || p.category || '—'}</span></td>
        <td><span class="element-pill">${escHtml(p.element_vi)}</span></td>
        <td><span class="price-cell">${escHtml(p.price_vi)}</span></td>
        <td>${badgeVi
        ? `<span class="table-badge ${badgeClass}">${escHtml(badgeVi)}</span>`
        : '<span style="color:var(--text-light);font-size:0.78rem">—</span>'}</td>
        <td>
          <span class="stars-cell">${stars}</span><br/>
          <span style="font-size:0.72rem;color:var(--text-light)">(${p.reviews || 0})</span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-edit"   onclick="openEditForm('${p.id}')">✏️</button>
            <button class="btn-delete" onclick="openDeleteModal('${p.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

window.renderProductTable = renderProductTable;

// ──────────────────────────────────────────────────────────
// MULTI-IMAGE GALLERY STATE & MANAGEMENT
// ──────────────────────────────────────────────────────────

let productGallery = []; // [{ id, type: 'preset'|'url'|'file', src, file }]

function addPresetImage(src) {
  if (productGallery.some(item => item.src === src)) {
    showToast('💡 Ảnh này đã có trong bộ sưu tập!', 'info');
    return;
  }
  productGallery.push({
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    type: 'preset',
    src: src
  });
  renderGalleryGrid();
}

function handleMultipleImageUpload(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      showToast(`⚠️ File "${file.name}" quá lớn (>5MB)!`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      productGallery.push({
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'file',
        src: ev.target.result,
        file: file
      });
      renderGalleryGrid();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function removeGalleryItem(id, ev) {
  if (ev) ev.stopPropagation();
  productGallery = productGallery.filter(item => item.id !== id);
  renderGalleryGrid();
}

function setCoverImage(id) {
  const idx = productGallery.findIndex(item => item.id === id);
  if (idx > 0) {
    const [item] = productGallery.splice(idx, 1);
    productGallery.unshift(item); // đưa lên đầu làm cover
    renderGalleryGrid();
    showToast('⭐ Đã chọn làm ảnh đại diện!', 'success');
  }
}

function renderGalleryGrid() {
  const grid = document.getElementById('galleryGrid');
  const badge = document.getElementById('galleryCountBadge');
  if (badge) badge.textContent = `${productGallery.length} ảnh`;
  if (!grid) return;

  if (productGallery.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding: 20px; color: var(--text-light); font-size: 0.82rem;">
      📷 Chưa có ảnh nào trong bộ sưu tập. Hãy chọn từ mẫu hoặc upload bên trên.
    </div>`;
    return;
  }

  grid.innerHTML = productGallery.map((item, index) => {
    const isCover = index === 0;
    const coverTag = isCover ? `<span class="gallery-cover-badge">⭐ Bìa</span>` : '';
    return `
      <div class="gallery-item ${isCover ? 'is-cover' : ''}" onclick="setCoverImage('${item.id}')" title="${isCover ? 'Ảnh Đại Diện' : 'Bấm để chọn làm Ảnh Đại Diện'}">
        ${coverTag}
        <button type="button" class="gallery-remove-btn" onclick="removeGalleryItem('${item.id}', event)" title="Xóa ảnh">✕</button>
        <img src="${escHtml(item.src)}" alt="Product Image ${index + 1}" onerror="this.src='bracelet.png'" />
      </div>
    `;
  }).join('');
}

window.addPresetImage = addPresetImage;
window.handleMultipleImageUpload = handleMultipleImageUpload;
window.removeGalleryItem = removeGalleryItem;
window.setCoverImage = setCoverImage;

// ──────────────────────────────────────────────────────────
// ADD / EDIT PRODUCT
// ──────────────────────────────────────────────────────────

async function handleProductSubmit(e) {
  e.preventDefault();
  const saveBtn = document.getElementById('saveBtn');
  const saveTxt = saveBtn.querySelector('span');
  saveTxt.textContent = '⏳ Đang lưu...';
  saveBtn.disabled = true;

  try {
    const editId = document.getElementById('editId').value;

    if (productGallery.length === 0) {
      productGallery.push({ id: 'def_1', type: 'preset', src: 'bracelet.png' });
    }

    const finalImageUrls = [];
    for (const item of productGallery) {
      if (item.type === 'file' && item.file) {
        const ext = item.file.name.split('.').pop();
        const filePath = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, item.file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);
        finalImageUrls.push(urlData.publicUrl);
      } else {
        finalImageUrls.push(item.src);
      }
    }

    const record = {
      name_vi: document.getElementById('nameVi').value.trim(),
      name_en: document.getElementById('nameEn').value.trim(),
      element_vi: document.getElementById('elementVi').value.trim(),
      element_en: document.getElementById('elementEn').value.trim(),
      price_vi: document.getElementById('priceVi').value.trim(),
      price_en: document.getElementById('priceEn').value.trim(),
      desc_vi: document.getElementById('descVi').innerHTML.trim(),
      desc_en: document.getElementById('descEn').innerHTML.trim(),
      category: document.getElementById('category').value,
      badge: document.getElementById('badge').value,
      stars: parseInt(document.getElementById('starCount').value) || 5,
      reviews: parseInt(document.getElementById('reviewCount').value) || 0,
      img_url: finalImageUrls.join('|')
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('products').update(record).eq('id', editId));
    } else {
      ({ error } = await supabase.from('products').insert([record]));
    }
    if (error) throw error;

    showToast(editId ? '✅ Đã cập nhật sản phẩm!' : '✅ Đã thêm sản phẩm mới!', 'success');
    resetForm();
    showTab('products');

  } catch (err) {
    showToast('❌ Lỗi: ' + err.message, 'error');
  } finally {
    saveTxt.textContent = '💾 Lưu Sản Phẩm';
    saveBtn.disabled = false;
  }
}

window.handleProductSubmit = handleProductSubmit;

function openEditForm(id) {
  const p = products.find(pr => String(pr.id) === String(id));
  if (!p) return;

  document.getElementById('editId').value = p.id;
  document.getElementById('nameVi').value = p.name_vi || '';
  document.getElementById('nameEn').value = p.name_en || '';
  document.getElementById('elementVi').value = p.element_vi || '';
  document.getElementById('elementEn').value = p.element_en || '';
  document.getElementById('priceVi').value = p.price_vi || '';
  document.getElementById('priceEn').value = p.price_en || '';
  document.getElementById('descVi').innerHTML = DOMPurify.sanitize(p.desc_vi || '');
  document.getElementById('descEn').innerHTML = DOMPurify.sanitize(p.desc_en || '');
  document.getElementById('category').value = p.category || '';
  document.getElementById('badge').value = p.badge || '';
  document.getElementById('reviewCount').value = p.reviews || 0;
  setStar(p.stars || 5);

  productGallery = [];
  try {
    const rawImages = p.img_url ? p.img_url.split('|') : ['bracelet.png'];

    rawImages.forEach(src => {
      if (!src) return;
      const isUrl = typeof src === 'string' && src.startsWith('http');
      productGallery.push({
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: isUrl ? 'url' : 'preset',
        src: src
      });
    });
  } catch (err) {
    console.error('Lỗi khi đọc ảnh sản phẩm:', err);
  }

  renderGalleryGrid();

  document.getElementById('formTitle').textContent = '✏️ Chỉnh Sửa Sản Phẩm';
  document.getElementById('saveBtn').querySelector('span').textContent = '💾 Cập Nhật';
  showTab('add');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.openEditForm = openEditForm;

function resetForm() {
  document.getElementById('productForm')?.reset();
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').textContent = 'Thêm Sản Phẩm Mới';
  document.getElementById('saveBtn').querySelector('span').textContent = '💾 Lưu Sản Phẩm';
  // Clear rich text editors
  const descVi = document.getElementById('descVi');
  const descEn = document.getElementById('descEn');
  if (descVi) descVi.innerHTML = '';
  if (descEn) descEn.innerHTML = '';
  productGallery = [];
  renderGalleryGrid();
  setStar(5);
}

window.resetForm = resetForm;

// ──────────────────────────────────────────────────────────
// RICH TEXT EDITOR HELPERS
// ──────────────────────────────────────────────────────────

function rteCmd(editorId, command) {
  const editor = document.getElementById(editorId);
  if (!editor) return;
  editor.focus();
  document.execCommand(command, false, null);
  // Toggle active state on toolbar button
  const wrap = editor.closest('.rte-wrap');
  if (wrap) {
    wrap.querySelectorAll('.rte-btn').forEach(btn => {
      if (btn.title === (command === 'bold' ? 'In đậm' : command === 'italic' ? 'In nghiêng' : btn.title) ||
          btn.title === (command === 'bold' ? 'Bold' : command === 'italic' ? 'Italic' : btn.title)) {
        if (command === 'bold' || command === 'italic') {
          btn.classList.toggle('active', document.queryCommandState(command));
        }
      }
    });
  }
}

function rteFontSizePx(editorId, px) {
  const editor = document.getElementById(editorId);
  if (!editor) return;
  const size = parseInt(px);
  if (!size || size < 1) return;
  editor.focus();
  const sel = window.getSelection();
  // If nothing selected, select all content in editor
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    const range = document.createRange();
    range.selectNodeContents(editor);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.style.fontSize = size + 'px';
  try {
    range.surroundContents(span);
  } catch (e) {
    // Partial selection across elements – extract then wrap
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }
  // Xóa font-size lồng nhau trong span mới để cỡ chữ áp dụng đồng đều
  span.querySelectorAll('[style]').forEach(el => {
    el.style.removeProperty('font-size');
    if (!el.getAttribute('style').trim()) {
      el.removeAttribute('style');
    }
  });
  // Place cursor after the span
  const newRange = document.createRange();
  newRange.setStartAfter(span);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

function rteClear(editorId) {
  const editor = document.getElementById(editorId);
  if (!editor) return;
  editor.focus();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    const range = document.createRange();
    range.selectNodeContents(editor);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.execCommand('removeFormat', false, null);
  // Also remove list formatting
  document.execCommand('insertOrderedList', false, null);
  document.execCommand('insertOrderedList', false, null);
}

window.rteCmd = rteCmd;
window.rteFontSizePx = rteFontSizePx;
window.rteClear = rteClear;

function setStar(n) {
  currentStar = n;
  document.getElementById('starCount').value = n;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('star' + n)?.classList.add('active');
}
window.setStar = setStar;

function handleImageUpload(e) {
  handleMultipleImageUpload(e);
}
window.handleImageUpload = handleImageUpload;

function clearUpload() {
  const imgUpload = document.getElementById('imgUpload');
  if (imgUpload) imgUpload.value = '';
}
window.clearUpload = clearUpload;

// ──────────────────────────────────────────────────────────
// DELETE PRODUCT
// ──────────────────────────────────────────────────────────

function openDeleteModal(id) {
  const p = products.find(pr => String(pr.id) === String(id));
  if (!p) return;
  deleteTargetId = id;
  deleteTargetImages = p.img_url ? p.img_url.split('|') : [];
  document.getElementById('deleteProductName').textContent = p.name_vi;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  deleteTargetId = null;
  deleteTargetImages = [];
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const name = products.find(p => String(p.id) === String(deleteTargetId))?.name_vi || '';
  const btnConf = document.getElementById('confirmDeleteBtn');
  btnConf.textContent = 'Đang xóa...';
  btnConf.disabled = true;

  try {
    const { error } = await supabase.from('products').delete().eq('id', deleteTargetId);
    if (error) throw error;

    // Delete all images if exist
    if (deleteTargetImages.length > 0) {
      const paths = deleteTargetImages
        .filter(img => img.includes(STORAGE_BUCKET))
        .map(img => img.split(`/${STORAGE_BUCKET}/`)[1])
        .filter(Boolean);
      
      if (paths.length > 0) {
        await supabase.storage.from(STORAGE_BUCKET).remove(paths);
      }
    }
    
    closeDeleteModal();
    showToast(`🗑️ Đã xóa "${name}"`, 'success');
  } catch (err) {
    showToast('❌ Lỗi xóa: ' + err.message, 'error');
  } finally {
    btnConf.textContent = 'Xóa';
    btnConf.disabled = false;
  }
}

window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

// ──────────────────────────────────────────────────────────
// STATS
// ──────────────────────────────────────────────────────────

function renderStats() {
  const total = products.length;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('statsTotal', total);

  // Legacy hardcoded stat cards
  set('statsVong', products.filter(p => p.category === 'vong').length);
  set('statsDaRoi', products.filter(p => p.category === 'da-roi').length);
  set('statsTuong', products.filter(p => p.category === 'tuong').length);

  // Dynamic category bars
  const barsEl = document.getElementById('catBars');
  if (barsEl) {
    const barData = categories.length > 0
      ? categories.map(c => ({
        label: `${c.icon || ''} ${c.name_vi}`.trim(),
        count: products.filter(p => p.category === c.slug).length
      }))
      : [
        { label: '📿 Vòng Tay', count: products.filter(p => p.category === 'vong').length },
        { label: '🪨 Đá Rời', count: products.filter(p => p.category === 'da-roi').length },
        { label: '🏺 Tượng Phong Thủy', count: products.filter(p => p.category === 'tuong').length }
      ];
    barsEl.innerHTML = barData.map(b => {
      const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
      return `<div class="cat-bar-row">
        <span class="cat-bar-label">${b.label}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
        <span class="cat-bar-val">${b.count}</span>
      </div>`;
    }).join('');
  }

  const recentEl = document.getElementById('recentList');
  if (recentEl) {
    recentEl.innerHTML = products.slice(0, 5).map(p => `
      <li>
        <img class="recent-img" src="${escHtml(p.img_url || 'bracelet.png')}" onerror="this.src='bracelet.png'" />
        <div>
          <div class="recent-name">${escHtml(p.name_vi)}</div>
          <div class="recent-price">${escHtml(p.price_vi)}</div>
        </div>
      </li>`).join('');
  }
}

// ──────────────────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + type + ' show';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ──────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const _style = document.createElement('style');
_style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(6px)}}`;
document.head.appendChild(_style);

// ──────────────────────────────────────────────────────────
// REVIEWS MANAGEMENT (Admin)
// ──────────────────────────────────────────────────────────

async function loadAdminReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    reviews = data || [];
  } catch (err) {
    reviews = [];
  }
  try {
    const raw = localStorage.getItem('tinhHoaDaQuy_reviews');
    if (raw) {
      const local = JSON.parse(raw).filter(r => String(r.id).startsWith('local_'));
      reviews = [...local, ...reviews];
    }
  } catch (_) {}
  renderReviewAdminTable();
}

function renderReviewAdminTable() {
  const tbody = document.getElementById('reviewTableBody');
  const empty = document.getElementById('reviewEmptyState');
  if (!tbody) return;

  const totalEl = document.getElementById('reviewTotalCount');
  if (totalEl) totalEl.textContent = reviews.length;

  if (reviews.length === 0) {
    tbody.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  tbody.innerHTML = reviews.map(r => {
    const dateStr = r.created_at
      ? new Date(r.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
      : '—';
    const starsStr = '★'.repeat(r.stars || 5) + '☆'.repeat(5 - (r.stars || 5));

    return `<tr>
      <td style="font-size:0.8rem;color:var(--text-light)">${dateStr}</td>
      <td><strong>${escHtml(r.name)}</strong></td>
      <td style="font-size:0.82rem;color:var(--text-light)">${escHtml(r.role || '—')}</td>
      <td><span style="color:var(--accent-amber);font-size:1.1rem">${starsStr}</span></td>
      <td style="font-size:0.85rem;max-width:280px;white-space:normal">${escHtml(r.comment)}</td>
      <td>
        <button class="btn-delete" onclick="deleteReviewAdmin('${r.id}')" title="Xóa đánh giá">🗑️ Xóa</button>
      </td>
    </tr>`;
  }).join('');
}

async function deleteReviewAdmin(id) {
  if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
  try {
    if (String(id).startsWith('local_')) {
      const raw = localStorage.getItem('tinhHoaDaQuy_reviews') || '[]';
      const localList = JSON.parse(raw).filter(r => r.id !== id);
      localStorage.setItem('tinhHoaDaQuy_reviews', JSON.stringify(localList));
    } else {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    }
    showToast('🗑️ Đã xóa đánh giá!', 'success');
    await loadAdminReviews();
  } catch (err) {
    showToast('❌ Lỗi xóa đánh giá: ' + err.message, 'error');
  }
}

window.renderReviewAdminTable = renderReviewAdminTable;
window.deleteReviewAdmin = deleteReviewAdmin;


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('deleteModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeDeleteModal();
  });
  document.getElementById('deleteCatModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeCatDeleteModal();
  });
  document.addEventListener('click', e => {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 900 && sidebar?.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !e.target.closest('.sidebar-toggle')) {
        sidebar.classList.remove('open');
      }
    }
  });
});
