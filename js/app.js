// ===========================
// MAIN APP UTILITIES
// Kurdish Supplier System
// ===========================

// Toast notifications
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toast-container') || (() => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.className = 'toast-container';
    document.body.appendChild(div);
    return div;
  })();

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Format currency
function formatPrice(price, currency = 'دینار') {
  return new Intl.NumberFormat('ar-IQ').format(price) + ' ' + currency;
}

// Relative time in Kurdish
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'ئێستا';
  if (minutes < 60) return `${minutes} خولەک لەمەوپێش`;
  if (hours < 24) return `${hours} کاتژمێر لەمەوپێش`;
  if (days < 7) return `${days} رۆژ لەمەوپێش`;
  if (weeks < 4) return `${weeks} هەفتە لەمەوپێش`;
  return `${months} مانگ لەمەوپێش`;
}

// Date format
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-IQ', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}

// Build product card HTML
function buildProductCard(product, showBadgeNew = false) {
  const img = product.images && product.images[0]
    ? `<img src="${product.images[0]}" alt="${product.name}" onerror="this.parentElement.innerHTML='<div class=\\"img-placeholder\\">${getCategoryIcon(product.category)}</div>'">`
    : `<div class="img-placeholder">${getCategoryIcon(product.category)}</div>`;

  const isNew = (Date.now() - new Date(product.createdAt).getTime()) < 3 * 24 * 3600 * 1000;
  const isFaved = typeof Favorites !== 'undefined' && Favorites.isFav(product.id);
  const isCompared = typeof Compare !== 'undefined' && Compare.has(product.id);

  // Star rating summary
  let starsRow = '';
  if (typeof Reviews !== 'undefined') {
    const stats = Reviews.getStats(product.id);
    if (stats.count > 0) {
      starsRow = `<div style="display:flex;align-items:center;gap:0.35rem;margin-bottom:0.35rem">
        ${Reviews.starsHTML(Math.round(stats.avg), '0.85rem')}
        <span style="font-size:0.75rem;color:var(--text-muted)">(${stats.count})</span>
      </div>`;
    }
  }

  return `
    <div class="product-card fade-in">
      <div class="card-image" onclick="location.href='product.html?id=${product.id}'" style="cursor:pointer">
        ${img}
        <span class="badge-category">${getCategoryIcon(product.category)} ${getCategoryName(product.category)}</span>
        ${isNew ? '<span class="badge-new">✨ نوێ</span>' : ''}
        <button class="fav-btn ${isFaved ? 'active' : ''}"
          onclick="event.stopPropagation();toggleFav('${product.id}',this)"
          title="${isFaved ? 'لابردن لە پاشەکەوتەکان' : 'زیادکردن بۆ پاشەکەوتەکان'}"
          style="position:absolute;bottom:10px;left:10px;background:rgba(26,26,46,0.85);border:none;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;z-index:2;font-size:1rem">
          ${isFaved ? '❤️' : '🤍'}
        </button>
        ${typeof Compare !== 'undefined' ? `
        <button
          onclick="event.stopPropagation();toggleCompareCard('${product.id}',this)"
          title="بەراورد"
          style="position:absolute;bottom:10px;right:10px;background:${isCompared ? 'var(--primary)' : 'rgba(26,26,46,0.85)'};border:none;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;z-index:2;font-size:0.8rem;color:white">
          ⚖️
        </button>` : ''}
      </div>
      <div class="card-body" onclick="location.href='product.html?id=${product.id}'" style="cursor:pointer">
        <div class="product-name">${product.name}</div>
        ${starsRow}
        <div class="product-desc">${product.description}</div>
        <div class="product-price">
          ${formatPrice(product.price, product.currency)}
        </div>
        <div class="supplier-info">
          <a href="supplier.html?id=${product.supplierId}" onclick="event.stopPropagation()"
            style="display:flex;align-items:center;gap:0.5rem;text-decoration:none;flex:1">
            <div class="supplier-avatar">${(product.supplierCompany || product.supplierName || '?').charAt(0)}</div>
            <div>
              <div class="supplier-name">${product.supplierCompany || product.supplierName}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${product.location || ''}</div>
            </div>
          </a>
          <div style="font-size:0.75rem;color:var(--text-muted)">
            👁 ${product.views || 0}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Toggle compare from card
function toggleCompareCard(productId, btn) {
  if (typeof Compare === 'undefined') return;
  const result = Compare.toggle(productId);
  if (result.full) {
    showToast('⚖️ زیاتر لە ٣ کالا دەتوانیت بەراورد بکەی', 'warning', 2500);
    return;
  }
  btn.style.background = result.added ? 'var(--primary)' : 'rgba(26,26,46,0.85)';
  if (typeof renderCompareBar !== 'undefined') renderCompareBar();
}

// Toggle favorite
function toggleFav(productId, btn) {
  if (typeof Favorites === 'undefined') return;
  const added = Favorites.toggle(productId);
  btn.innerHTML = added ? '❤️' : '🤍';
  btn.classList.toggle('active', added);
  showToast(added ? '❤️ زیادکرا بۆ پاشەکەوتەکان' : '🤍 لابرا لە پاشەکەوتەکان', added ? 'success' : 'info', 2000);
  updateFavBadge();
}

// Update favorites badge in nav
function updateFavBadge() {
  const badge = document.getElementById('fav-badge');
  if (!badge || typeof Favorites === 'undefined') return;
  const cnt = Favorites.count();
  badge.textContent = cnt;
  badge.style.display = cnt > 0 ? 'inline-flex' : 'none';
}

// Ads marquee builder
function buildAdsMarquee(products) {
  if (!products || products.length === 0) return '';
  const items = [...products, ...products]; // duplicate for seamless loop
  return items.map(p =>
    `<span class="ads-item">🏷️ <strong>${p.name}</strong> — ${formatPrice(p.price, p.currency)} | ${p.supplierCompany || p.supplierName}</span>`
  ).join('');
}

// Loading state
function showLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'flex';
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}

// Update nav auth state
function updateNavAuth() {
  const user = Auth.getCurrentUser();
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  if (!navAuth || !navUser) return;

  if (user) {
    navAuth.style.display = 'none';
    navUser.style.display = 'flex';
    const nameEl = document.getElementById('nav-user-name');
    const avatarEl = document.getElementById('nav-user-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.avatar || user.name.charAt(0);
  } else {
    navAuth.style.display = 'flex';
    navUser.style.display = 'none';
  }
}

// Pagination
function paginate(items, page, perPage = 12) {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    pages: Math.ceil(items.length / perPage),
    current: page
  };
}

function buildPagination(paginationData, onPage) {
  if (paginationData.pages <= 1) return '';
  const { current, pages } = paginationData;
  let html = '<div class="d-flex justify-content-center gap-2 mt-4 flex-wrap">';
  
  if (current > 1) {
    html += `<button class="filter-btn" onclick="${onPage}(${current - 1})">← پێشتر</button>`;
  }
  
  for (let i = 1; i <= pages; i++) {
    html += `<button class="filter-btn ${i === current ? 'active' : ''}" onclick="${onPage}(${i})">${i}</button>`;
  }
  
  if (current < pages) {
    html += `<button class="filter-btn" onclick="${onPage}(${current + 1})">دواتر →</button>`;
  }
  
  html += '</div>';
  return html;
}

// Shared navbar HTML
function getNavbarHTML(activePage = '') {
  return `
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <a class="navbar-brand" href="index.html">
        <span>✦</span> دابینکەر <span style="-webkit-text-fill-color:var(--accent);color:var(--accent)">مارکێت</span>
      </a>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link ${activePage==='home'?'active':''}" href="index.html">🏠 سەرەکی</a></li>
          <li class="nav-item"><a class="nav-link ${activePage==='products'?'active':''}" href="index.html#products">📦 کالاکان</a></li>
          <li class="nav-item"><a class="nav-link ${activePage==='categories'?'active':''}" href="index.html#categories">📂 پۆلەکان</a></li>
          <li class="nav-item">
            <a class="nav-link ${activePage==='favorites'?'active':''}" href="favorites.html" style="position:relative">
              ❤️ پاشەکەوتەکان
              <span id="fav-badge" style="position:absolute;top:4px;right:6px;background:var(--secondary);color:white;border-radius:50%;width:16px;height:16px;font-size:0.65rem;display:none;align-items:center;justify-content:center;font-weight:700"></span>
            </a>
          </li>
        </ul>
        <div class="d-flex align-items-center gap-2" id="nav-auth">
          <a href="login.html" class="btn-outline-custom" style="padding:0.5rem 1.25rem;font-size:0.9rem">چوونەژوورەوە</a>
          <a href="register.html" class="btn-primary-custom" style="padding:0.5rem 1.25rem;font-size:0.9rem">تۆمارکردن</a>
        </div>
        <div class="d-flex align-items-center gap-2" id="nav-user" style="display:none!important">
          <div class="supplier-avatar" id="nav-user-avatar" style="width:36px;height:36px;font-size:1rem"></div>
          <span id="nav-user-name" style="font-size:0.9rem;color:var(--text-main)"></span>
          <a href="dashboard.html" class="btn-primary-custom" style="padding:0.4rem 1rem;font-size:0.85rem">داشبۆرد</a>
          <button class="btn-outline-custom" style="padding:0.4rem 1rem;font-size:0.85rem" onclick="Auth.logout()">دەرچوون</button>
        </div>
      </div>
    </div>
  </nav>`;
}

// Scroll animations (IntersectionObserver)
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Sync from Supabase cloud → localStorage cache
  if (typeof DB !== 'undefined') {
    await DB.init();
    // Check Supabase auth session validity in background
    if (typeof Auth !== 'undefined') Auth.initAuth();
  }

  // 2. Seed demo data only if cache is still empty after cloud sync
  Products.seedIfEmpty();
  updateNavAuth();
  initScrollAnimations();
  
  // Insert navbar if placeholder exists
  const navPlaceholder = document.getElementById('navbar-placeholder');
  if (navPlaceholder) {
    const active = navPlaceholder.dataset.active || '';
    navPlaceholder.outerHTML = getNavbarHTML(active);
    updateNavAuth();
  }

  // Update favorites badge after navbar rendered
  if (typeof Favorites !== 'undefined') updateFavBadge();
});
