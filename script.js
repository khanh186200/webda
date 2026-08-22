/* ===== JAVASCRIPT ===== */

// ─── Language System ───────────────────────────────────
let currentLang = 'vi';

function setLang(lang) {
  currentLang = lang;

  // Translate all data-vi / data-en elements
  document.querySelectorAll('[data-vi]').forEach(el => {
    const val = lang === 'vi' ? el.getAttribute('data-vi') : el.getAttribute('data-en');
    if (val !== null) el.innerHTML = val;
  });

  // Update filter buttons text content (not innerHTML)
  document.querySelectorAll('.filter-btn[data-vi]').forEach(btn => {
    btn.textContent = lang === 'vi' ? btn.getAttribute('data-vi') : btn.getAttribute('data-en');
  });

  // Translate placeholder attributes
  document.querySelectorAll('[data-placeholder-vi]').forEach(el => {
    el.placeholder = lang === 'vi'
      ? el.getAttribute('data-placeholder-vi')
      : el.getAttribute('data-placeholder-en');
  });

  // Toggle active language button
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + lang).classList.add('active');

  // Update nav links active class
  updateActiveNav();
}

// ─── Navbar: Scroll & Active Link ──────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  // Scrolled state
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top
  const btn = document.getElementById('backToTop');
  if (window.scrollY > 400) btn.classList.add('visible');
  else btn.classList.remove('visible');

  // Active nav
  updateActiveNav();
});

function updateActiveNav() {
  const sections = ['home', 'about', 'products', 'why-us', 'testimonials', 'contact'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top <= 100) current = id;
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

// ─── Hamburger Menu ────────────────────────────────────
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Close menu when nav link clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// ─── Scroll Reveal Animation ───────────────────────────
function initReveal() {
  const elements = document.querySelectorAll(
    '.about-grid, .product-card, .why-card, .testi-card, .feat-item, .contact-grid, .footer-grid'
  );

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.1 + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

// ─── Product Search & Filter ─────────────────────────────
function handlePublicSearch() {
  const searchInput = document.getElementById('publicSearchInput');
  const catSelect = document.getElementById('publicCategorySelect');
  
  const searchText = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const category = catSelect ? catSelect.value : 'all';

  document.querySelectorAll('.product-card').forEach(card => {
    const catMatch = (category === 'all' || card.dataset.cat === category);
    
    const titleEl = card.querySelector('h3');
    const titleVi = titleEl ? (titleEl.getAttribute('data-vi') || titleEl.textContent) : '';
    const titleEn = titleEl ? (titleEl.getAttribute('data-en') || titleEl.textContent) : '';
    
    const searchMatch = !searchText 
      || titleVi.toLowerCase().includes(searchText) 
      || titleEn.toLowerCase().includes(searchText);

    if (catMatch && searchMatch) {
      card.classList.remove('hidden');
      card.style.animation = 'fadeInUp 0.4s ease both';
    } else {
      card.classList.add('hidden');
    }
  });
}

function filterProducts(category, btn) {
  const catSelect = document.getElementById('publicCategorySelect');
  if (catSelect) {
     catSelect.value = category;
     handlePublicSearch();
  }
}

// ─── Product Detail Modal (Multi-Image) ────────────────────────────────
let globalProductsCache = [];

function openProductDetailModal(index) {
  const p = globalProductsCache[index];
  if (!p) return;

  const title = document.getElementById('modalTitle');
  const desc = document.getElementById('modalDesc');
  const price = document.getElementById('modalPrice');
  const element = document.getElementById('modalElement');
  const stars = document.getElementById('modalStars');
  const reviews = document.getElementById('modalReviews');
  const badge = document.getElementById('modalBadge');
  const imgWrap = document.getElementById('modalImg');
  const thumbStrip = document.getElementById('modalThumbStrip');

  title.textContent = p.name_vi || '';
  title.dataset.vi = p.name_vi || '';
  title.dataset.en = p.name_en || '';

  desc.innerHTML = p.desc_vi || '';
  desc.dataset.vi = p.desc_vi || '';
  desc.dataset.en = p.desc_en || '';

  price.textContent = p.price_vi || '';
  price.dataset.vi = p.price_vi || '';
  price.dataset.en = p.price_en || '';

  element.textContent = p.element_vi || '';
  element.dataset.vi = p.element_vi || '';
  element.dataset.en = p.element_en || '';

  stars.textContent = '★'.repeat(p.stars || 5) + '☆'.repeat(5 - (p.stars || 5));
  reviews.textContent = `(${p.reviews || 0} Đánh giá)`;
  reviews.dataset.vi = `(${p.reviews || 0} Đánh giá)`;
  reviews.dataset.en = `(${p.reviews || 0} Reviews)`;

  const badgeVi = p.badge ? p.badge.split('|')[0] : '';
  const badgeEn = p.badge ? p.badge.split('|')[1] || badgeVi : '';
  if (badgeVi) {
    badge.textContent = badgeVi;
    badge.dataset.vi = badgeVi;
    badge.dataset.en = badgeEn;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  // Load images
  const rawImages = p.img_url ? p.img_url.split('|') : ['bracelet.png'];

  imgWrap.src = rawImages[0];
  imgWrap.alt = p.name_vi || '';

  thumbStrip.innerHTML = rawImages.map((src, i) => `
    <img src="${escHtmlPublic(src)}" class="modal-thumb ${i === 0 ? 'active' : ''}" 
         onclick="switchModalMainImg(this, '${escHtmlPublic(src)}')" alt="Thumbnail ${i + 1}" onerror="this.src='bracelet.png'"/>
  `).join('');

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchModalMainImg(thumbEl, src) {
  document.getElementById('modalImg').src = src;
  document.querySelectorAll('.modal-thumb').forEach(el => el.classList.remove('active'));
  thumbEl.classList.add('active');
}

function orderProductModal() {
  const title = document.getElementById('modalTitle').textContent;
  closeModal();
  document.getElementById('message').value = `Tôi muốn được tư vấn về sản phẩm: ${title}`;
  window.location.hash = '#contact';
}

window.switchModalMainImg = switchModalMainImg;
window.orderProductModal = orderProductModal;
window.openProductDetailModal = openProductDetailModal;

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
window.closeModal = closeModal;

// Keyboard close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Testimonials Slider ───────────────────────────────
let currentSlide = 0;
let sliderInterval;

function goToSlide(index) {
  const cards = document.querySelectorAll('.testi-card');
  const dots = document.querySelectorAll('.dot');

  cards[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = index;

  cards[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  const total = document.querySelectorAll('.testi-card').length;
  goToSlide((currentSlide + 1) % total);
}

function startSlider() {
  sliderInterval = setInterval(nextSlide, 5000);
}

function stopSlider() {
  clearInterval(sliderInterval);
}

// Pause on hover
const sliderEl = document.getElementById('testimonialsSlider');
if (sliderEl) {
  sliderEl.addEventListener('mouseenter', stopSlider);
  sliderEl.addEventListener('mouseleave', startSlider);
}

// ─── Contact Form ──────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = currentLang === 'vi' ? 'Đang gửi...' : 'Sending...';
  btn.disabled = true;

  const name = document.getElementById('name')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const email = document.getElementById('email')?.value || '';
  const birthyear = document.getElementById('birthyear')?.value || '';
  const message = document.getElementById('message')?.value || '';

  const payload = {
    name,
    phone,
    email,
    birthyear,
    message,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  // 1. Save to Supabase & Send Web3Forms Email
  try {
    const { supabase, WEB3FORMS_ACCESS_KEY } = await import('./supabase-config.js');

    // Save to Supabase consultations table
    const { error: dbError } = await supabase.from('consultations').insert([{
      name,
      phone,
      email,
      birthyear,
      message,
      status: 'pending'
    }]);

    if (dbError) {
      console.warn('[Consultation] Supabase insert error, fallback to localStorage:', dbError.message);
      saveConsultationToLocalStorage(payload);
    }

    // 2. Send email via Web3Forms to Gmail if Key is set
    if (WEB3FORMS_ACCESS_KEY) {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[Yêu Cầu Tư Vấn Mới] ${name} - ${phone}`,
          from_name: 'Đá Phong Thủy Website',
          name: name,
          phone: phone,
          email: email || 'Không có',
          birthyear: birthyear || 'Không có',
          message: message || 'Không có'
        })
      });
    }

  } catch (err) {
    console.warn('[Consultation] Fallback to localStorage:', err);
    saveConsultationToLocalStorage(payload);
  }

  // Show success state
  document.getElementById('contactForm').classList.add('hidden');
  document.getElementById('formSuccess').classList.remove('hidden');
}

function saveConsultationToLocalStorage(payload) {
  try {
    const raw = localStorage.getItem('tinhHoaDaQuy_consultations') || '[]';
    const list = JSON.parse(raw);
    list.unshift({ ...payload, id: 'local_' + Date.now() });
    localStorage.setItem('tinhHoaDaQuy_consultations', JSON.stringify(list));
  } catch (e) { }
}



// ─── Smooth scroll (with navbar offset) ────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const offset = 72; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── Number Counter Animation ──────────────────────────
function animateCounter(el, target, suffix = '') {
  let count = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = Math.floor(count).toLocaleString() + suffix;
    if (count >= target) clearInterval(timer);
  }, 20);
}

function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  const targets = [500, 10000, 20];
  const suffixes = ['+', '+', '+'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stats.forEach((stat, i) => {
          animateCounter(stat, targets[i], suffixes[i]);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  if (stats[0]) observer.observe(stats[0]);
}

// ─── Five Elements Tooltip ─────────────────────────────
document.querySelectorAll('.element').forEach(el => {
  el.addEventListener('mouseenter', () => {
    const name = el.getAttribute('title');
    el.setAttribute('data-tooltip', name);
  });
});

// ─── Load Products from Supabase (Admin sync) ──────────
// Falls back to hardcoded HTML products if Supabase not configured

async function initSupabaseProducts() {
  try {
    const { supabase } = await import('./supabase-config.js');

    // Initial load
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) renderProductsFromData(data);

    // Real-time: re-render whenever admin makes changes
    supabase
      .channel('public-products')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const { data: fresh } = await supabase
            .from('products').select('*')
            .order('created_at', { ascending: false });
          if (fresh) renderProductsFromData(fresh);
        }
      )
      .subscribe();

  } catch (err) {
    // Supabase not configured – try localStorage fallback
    console.info('[Products] Supabase not connected, using static products.');
    const raw = localStorage.getItem('tinhHoaDaQuy_products');
    if (raw) {
      try {
        // localStorage uses camelCase → convert to snake_case for renderer
        const products = JSON.parse(raw).map(p => ({
          id: p.id,
          name_vi: p.nameVi, name_en: p.nameEn,
          element_vi: p.elementVi, element_en: p.elementEn,
          price_vi: p.priceVi, price_en: p.priceEn,
          desc_vi: p.descVi, desc_en: p.descEn,
          category: p.category, badge: p.badge,
          stars: p.stars, reviews: p.reviews,
          img_url: p.img,
        }));
        renderProductsFromData(products);
      } catch (_) { }
    }
  }
}

function renderProductsFromData(products) {
  globalProductsCache = products;
  const grid = document.getElementById('productsGrid');
  if (!grid || products.length === 0) return;

  grid.innerHTML = products.map((p, i) => {
    const badgeVi = p.badge ? p.badge.split('|')[0] : '';
    const badgeEn = p.badge ? p.badge.split('|')[1] || badgeVi : '';
    const badgeClass = !badgeVi ? '' : badgeVi === 'Ưu Đãi' ? 'sale' : badgeVi === 'Mới' ? 'new' : 'default';
    const stars = '★'.repeat(p.stars || 5) + '☆'.repeat(5 - (p.stars || 5));
    const imgSrc = p.img_url ? p.img_url.split('|')[0] : 'bracelet.png';
    const badgeHtml = badgeVi
      ? `<div class="product-badge ${badgeClass}" data-vi="${escHtmlPublic(badgeVi)}" data-en="${escHtmlPublic(badgeEn)}">${escHtmlPublic(badgeVi)}</div>`
      : '';
    const nameVi = (p.name_vi || '').replace(/"/g, '&quot;');
    const nameEn = (p.name_en || '').replace(/"/g, '&quot;');
    const priceVi = (p.price_vi || '').replace(/"/g, '&quot;');
    const priceEn = (p.price_en || '').replace(/"/g, '&quot;');

    return `
      <div class="product-card" data-cat="${p.category}" style="animation-delay:${i * 0.08}s">
        <div class="product-img-wrap">
          <img src="${escHtmlPublic(imgSrc)}" alt="${nameVi}" onerror="this.src='bracelet.png'" />
          ${badgeHtml}
          <div class="product-overlay">
            <button class="overlay-btn" data-vi="Xem Chi Tiết" data-en="View Details"
              onclick="openProductDetailModal(${i})">Xem Chi Tiết</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-element" data-vi="${escHtmlPublic(p.element_vi)}" data-en="${escHtmlPublic(p.element_en)}">${escHtmlPublic(p.element_vi)}</div>
          <h3 data-vi="${nameVi}" data-en="${nameEn}">${escHtmlPublic(p.name_vi)}</h3>
          <div class="product-meta">
            <div class="stars">${stars}</div>
            <span class="review-count">(${p.reviews || 0})</span>
          </div>
          <div class="product-price">
            <span class="price" data-vi="${priceVi}" data-en="${priceEn}">${escHtmlPublic(p.price_vi)}</span>
            <button class="add-cart-btn">+</button>
          </div>
        </div>
      </div>`;
  }).join('');

  if (currentLang !== 'vi') setLang(currentLang);

  // Animate new cards
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = (i % 4) * 0.1 + 's';
    observer.observe(card);
  });
}

function escHtmlPublic(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Customer Review Modal & Handling ──────────────────
let selectedReviewStar = 5;

function openReviewModal() {
  document.getElementById('reviewForm')?.reset();
  document.getElementById('reviewForm')?.classList.remove('hidden');
  document.getElementById('reviewSuccess')?.classList.add('hidden');
  setReviewStar(5);
  document.getElementById('reviewModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
  document.getElementById('reviewModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function setReviewStar(n) {
  selectedReviewStar = n;
  const starVal = document.getElementById('reviewStarVal');
  if (starVal) starVal.value = n;

  for (let i = 1; i <= 5; i++) {
    const s = document.getElementById('revStar' + i);
    if (s) {
      s.style.opacity = i <= n ? '1' : '0.35';
    }
  }
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitReview');
  if (btn) {
    btn.textContent = currentLang === 'vi' ? 'Đang gửi...' : 'Submitting...';
    btn.disabled = true;
  }

  const name = document.getElementById('reviewName')?.value.trim() || '';
  const role = document.getElementById('reviewRole')?.value.trim() || 'Khách hàng';
  const stars = parseInt(document.getElementById('reviewStarVal')?.value) || 5;
  const comment = document.getElementById('reviewComment')?.value.trim() || '';

  const record = {
    name,
    role,
    stars,
    comment,
    status: 'approved',
    created_at: new Date().toISOString()
  };

  try {
    const { supabase } = await import('./supabase-config.js');
    const { error } = await supabase.from('reviews').insert([{ name, role, stars, comment, status: 'approved' }]);
    if (error) {
      console.warn('[Review] Supabase insert error, fallback to localStorage:', error.message);
      saveReviewToLocalStorage(record);
    }
  } catch (err) {
    saveReviewToLocalStorage(record);
  }

  if (btn) {
    btn.textContent = currentLang === 'vi' ? 'Gửi Đánh Giá' : 'Submit Review';
    btn.disabled = false;
  }

  document.getElementById('reviewForm')?.classList.add('hidden');
  document.getElementById('reviewSuccess')?.classList.remove('hidden');

  // Reload reviews in slider
  initSupabaseReviews();
}

function saveReviewToLocalStorage(record) {
  try {
    const raw = localStorage.getItem('tinhHoaDaQuy_reviews') || '[]';
    const list = JSON.parse(raw);
    list.unshift({ ...record, id: 'local_' + Date.now() });
    localStorage.setItem('tinhHoaDaQuy_reviews', JSON.stringify(list));
  } catch (_) { }
}

async function initSupabaseCategories() {
  try {
    const { supabase } = await import('./supabase-config.js');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      renderCategoriesFromData(data);
    }
  } catch (err) {
    console.warn("Failed to load categories from Supabase, using defaults.");
  }
}

function renderCategoriesFromData(categories) {
  const optionsContainer = document.getElementById('customCatOptions');
  if (!optionsContainer) return;

  const firstOpt = optionsContainer.querySelector('[data-value="all"]');
  optionsContainer.innerHTML = '';
  if (firstOpt) {
    optionsContainer.appendChild(firstOpt);
  }

  categories.forEach(c => {
    const div = document.createElement('div');
    div.className = 'custom-option';
    div.setAttribute('data-value', c.slug);
    div.setAttribute('onclick', `selectCustomCategory('${c.slug}', this)`);
    div.textContent = `${c.icon || ''} ${c.name_vi}`.trim();
    optionsContainer.appendChild(div);
  });
}

// ─── Dynamic Testimonials Slider from Supabase / localStorage ──
async function initSupabaseReviews() {
  let reviewsData = [];
  try {
    const { supabase } = await import('./supabase-config.js');
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) reviewsData = data;
  } catch (err) {
  }
  
  try {
    const raw = localStorage.getItem('tinhHoaDaQuy_reviews');
    if (raw) {
      const local = JSON.parse(raw).filter(r => String(r.id).startsWith('local_'));
      reviewsData = [...local, ...reviewsData];
    }
  } catch (_) { }

  if (reviewsData.length > 0) {
    renderReviewSlider(reviewsData);
  }
}

function renderReviewSlider(reviewsData) {
  const slider = document.getElementById('testimonialsSlider');
  const dots = document.getElementById('testiDots');
  if (!slider) return;

  const bgColors = ['var(--primary)', 'var(--accent-rose)', 'var(--accent-teal)', 'var(--accent-purple)', '#D4A017'];

  slider.innerHTML = reviewsData.map((r, i) => {
    const starsStr = '★'.repeat(r.stars || 5) + '☆'.repeat(5 - (r.stars || 5));
    const firstChar = (r.name || 'K').charAt(0).toUpperCase();
    const avatarBg = bgColors[i % bgColors.length];
    const activeClass = i === 0 ? 'active' : '';

    return `
      <div class="testi-card ${activeClass}">
        <div class="testi-stars">${starsStr}</div>
        <p>"${escHtmlPublic(r.comment)}"</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background: ${avatarBg}">${firstChar}</div>
          <div>
            <strong>${escHtmlPublic(r.name)}</strong>
            <small>${escHtmlPublic(r.role || 'Khách hàng')}</small>
          </div>
        </div>
      </div>`;
  }).join('');

  if (dots) {
    dots.innerHTML = reviewsData.map((_, i) =>
      `<button class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></button>`
    ).join('');
  }

  currentSlide = 0;
}

// ─── Initialize ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load products, categories & reviews from Supabase (or localStorage fallback)
  initSupabaseProducts();
  initSupabaseCategories();
  initSupabaseReviews();

  initReveal();
  initCounters();
  startSlider();

  // Add stagger to why cards
  document.querySelectorAll('.why-card').forEach((card, i) => {
    card.style.transitionDelay = i * 0.08 + 's';
  });
});

// ─── Parallax subtle effect on hero ────────────────────
window.addEventListener('scroll', () => {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const scrollY = window.scrollY;
    heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
  }
});

// ─── Expose functions to global scope (required for ES module) ──
window.setLang = setLang;
window.toggleMenu = toggleMenu;
window.filterProducts = filterProducts;
window.handlePublicSearch = handlePublicSearch;
window.showModal = showModal;
window.closeModal = closeModal;
window.goToSlide = goToSlide;
window.handleSubmit = handleSubmit;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.setReviewStar = setReviewStar;
window.handleReviewSubmit = handleReviewSubmit;

// ─── Custom Select Logic ─────────────────────────────
function toggleCustomSelect(forceOpen = false) {
  const wrap = document.querySelector('.custom-select-wrap');
  if(wrap) {
    if (forceOpen === true) {
      wrap.classList.add('open');
    } else {
      wrap.classList.toggle('open');
    }
  }
}

function selectCustomCategory(value, element) {
  const input = document.getElementById('publicCategorySelect');
  const textInput = document.getElementById('customCatInput');
  const wrap = document.querySelector('.custom-select-wrap');
  
  if(input) input.value = value;
  if(textInput) textInput.value = element.textContent;
  
  document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
  
  if(wrap) wrap.classList.remove('open');
  
  handlePublicSearch();
}

function filterCategoryOptions() {
  const textInput = document.getElementById('customCatInput');
  if(!textInput) return;
  const filterText = textInput.value.toLowerCase().trim();
  
  toggleCustomSelect(true);

  document.querySelectorAll('.custom-option').forEach(opt => {
    const text = opt.textContent.toLowerCase();
    if (text.includes(filterText)) {
      opt.style.display = 'block';
    } else {
      opt.style.display = 'none';
    }
  });
}

document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.custom-select-wrap');
  if (wrap && wrap.classList.contains('open') && !wrap.contains(e.target)) {
    wrap.classList.remove('open');
    const textInput = document.getElementById('customCatInput');
    const selectedOpt = document.querySelector('.custom-option.selected');
    if(textInput && selectedOpt) {
      textInput.value = selectedOpt.textContent;
    }
    document.querySelectorAll('.custom-option').forEach(opt => opt.style.display = 'block');
  }
});

window.toggleCustomSelect = toggleCustomSelect;
window.selectCustomCategory = selectCustomCategory;
window.filterCategoryOptions = filterCategoryOptions;
