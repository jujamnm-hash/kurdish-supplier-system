// ===========================
// PRODUCTS MANAGEMENT
// Kurdish Supplier System — Supabase + localStorage cache
// ===========================
// Strategy:
//   READ  → always from localStorage (instant, synchronous)
//   WRITE → localStorage first, then Supabase async in background
//   INIT  → DB.init() in app.js loads Supabase data into localStorage
// ===========================

const Products = (() => {
  const PRODUCTS_KEY = 'kss_products';

  // ── Read helpers (synchronous) ─────────────────────

  function getAll() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  }

  function save(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  function getById(id) {
    return getAll().find(p => p.id === id) || null;
  }

  function getBySupplier(supplierId) {
    return getAll().filter(p => p.supplierId === supplierId);
  }

  function getByCategory(categoryId) {
    if (categoryId === 'all') return getAll().filter(p => p.active);
    return getAll().filter(p => p.category === categoryId && p.active);
  }

  function search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return getAll().filter(p => p.active);
    return getAll().filter(p =>
      p.active && (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.supplierName || '').toLowerCase().includes(q) ||
        getCategoryName(p.category).toLowerCase().includes(q)
      )
    );
  }

  function getFeatured(limit = 8) {
    const all = getAll().filter(p => p.active);
    return all
      .sort((a, b) =>
        (b.views * 2 + new Date(b.createdAt).getTime() / 1e12) -
        (a.views * 2 + new Date(a.createdAt).getTime() / 1e12)
      )
      .slice(0, limit);
  }

  function getRecent(limit = 12) {
    return getAll()
      .filter(p => p.active)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  function getCategoryCounts() {
    const all = getAll().filter(p => p.active);
    const counts = {};
    for (const p of all) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }

  // ── Write operations (localStorage + Supabase async) ──

  function add({ name, description, price, currency, category, images, tags, stock, location, supplierInfo }) {
    const products = getAll();

    // Auto-categorize if needed
    let finalCategory = category;
    if (category === 'auto' || !category) {
      finalCategory = autoDetectCategory(name, description);
    }

    const product = {
      id: 'prd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      currency: currency || 'دینار',
      category: finalCategory,
      autoDetected: (category === 'auto' || !category),
      images: images || [],
      tags: tags || [],
      stock: parseInt(stock) || 0,
      location: location || '',
      supplierId: supplierInfo.id,
      supplierName: supplierInfo.name,
      supplierCompany: supplierInfo.company || '',
      supplierPhone: supplierInfo.phone || '',
      active: true,
      featured: false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(product); // newest first
    save(products);

    // Update supplier stats in localStorage session
    _updateSupplierProductCount(supplierInfo.id, +1);

    // Async push to Supabase (don't await — UI stays instant)
    if (typeof DB !== 'undefined') {
      DB.pushProduct(product);
    }

    return { success: true, product };
  }

  function update(id, updates, supplierId) {
    const products = getAll();
    const idx = products.findIndex(p => p.id === id && p.supplierId === supplierId);
    if (idx === -1) return { success: false, msg: 'کالاکە نەدۆزرایەوە' };

    // Re-categorize if auto
    if ((updates.name || updates.description) && updates.category === 'auto') {
      updates.category = autoDetectCategory(
        updates.name || products[idx].name,
        updates.description || products[idx].description
      );
      updates.autoDetected = true;
    }

    Object.assign(products[idx], updates, { updatedAt: new Date().toISOString() });
    save(products);

    // Async push to Supabase
    if (typeof DB !== 'undefined') {
      DB.pushProduct(products[idx]);
    }

    return { success: true, product: products[idx] };
  }

  function remove(id, supplierId) {
    const products = getAll();
    const idx = products.findIndex(p => p.id === id && p.supplierId === supplierId);
    if (idx === -1) return { success: false, msg: 'کالاکە نەدۆزرایەوە' };
    products.splice(idx, 1);
    save(products);

    // Update supplier stats
    _updateSupplierProductCount(supplierId, -1);

    // Async delete from Supabase
    if (typeof DB !== 'undefined') {
      DB.deleteProduct(id);
    }

    return { success: true };
  }

  function toggleActive(id, supplierId) {
    const products = getAll();
    const product = products.find(p => p.id === id && p.supplierId === supplierId);
    if (!product) return { success: false };
    product.active = !product.active;
    product.updatedAt = new Date().toISOString();
    save(products);

    // Async sync to Supabase
    if (typeof DB !== 'undefined') {
      DB.pushProduct(product);
    }

    return { success: true, active: product.active };
  }

  function incrementViews(id) {
    const products = getAll();
    const product = products.find(p => p.id === id);
    if (product) {
      product.views = (product.views || 0) + 1;
      save(products);
    }
    // Async increment in Supabase
    if (typeof DB !== 'undefined') {
      DB.incrementViews(id);
    }
  }

  // ── Supplier stats helper ──────────────────────────

  function _updateSupplierProductCount(supplierId, delta) {
    // Update kss_users array (legacy offline mode)
    const users = JSON.parse(localStorage.getItem('kss_users') || '[]');
    const sIdx = users.findIndex(u => u.id === supplierId);
    if (sIdx !== -1) {
      users[sIdx].stats = users[sIdx].stats || {};
      users[sIdx].stats.products = Math.max(0, (users[sIdx].stats.products || 0) + delta);
      localStorage.setItem('kss_users', JSON.stringify(users));
    }
    // Update live session stats
    const sess = JSON.parse(localStorage.getItem('kss_session') || 'null');
    if (sess && sess.id === supplierId) {
      sess.stats = sess.stats || {};
      sess.stats.products = Math.max(0, (sess.stats.products || 0) + delta);
      localStorage.setItem('kss_session', JSON.stringify(sess));
    }
  }

  // ── Demo seed data ─────────────────────────────────

  function getSeedData() {
    const now = Date.now();
    return [
      {
        id: 'prd_demo1', name: 'ئایفۆن ١٥ پرۆ مەکس',
        description: 'نوێترین مۆبایلی ئەپڵ، چیپی A17 Pro، دوربینی ٤٨ میگاپیکسل، ٢٥٦ گیگا حەفیزە',
        price: 1200000, currency: 'دینار', category: 'tech', autoDetected: false,
        images: [], tags: ['موبایل', 'ئەپڵ', 'ئایفۆن'], stock: 15, location: 'هەولێر',
        supplierId: 'demo', supplierName: 'کەمال ئەحمەد', supplierCompany: 'تەکنۆ شۆپ',
        supplierPhone: '07501234567', active: true, featured: true, views: 245,
        createdAt: new Date(now - 86400000).toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: 'prd_demo2', name: 'نایک ئایر مەکس ٢٠٢٤',
        description: 'پێڵاوی وەرزشی نایک، مۆدێلی نوێ، هەموو قەبارەکان بەردەستن، قووڵی زۆر',
        price: 185000, currency: 'دینار', category: 'sports', autoDetected: false,
        images: [], tags: ['پێڵاو', 'نایک', 'وەرزش'], stock: 30, location: 'سلێمانی',
        supplierId: 'demo', supplierName: 'سارا حەمەدی', supplierCompany: 'سپۆرت وایرلد',
        supplierPhone: '07701234567', active: true, featured: false, views: 178,
        createdAt: new Date(now - 172800000).toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: 'prd_demo3', name: 'بیریانی مریشک نایاب',
        description: 'بیریانی مریشکی ئامادەکراو بە بهاراتی سروشتی، بۆ مامەڵەی کۆمەڵی و شادیەکان',
        price: 25000, currency: 'دینار', category: 'food', autoDetected: false,
        images: [], tags: ['خواردن', 'بیریانی', 'مریشک'], stock: 100, location: 'کەرکووک',
        supplierId: 'demo', supplierName: 'فاتیمە عومەر', supplierCompany: 'ماتبەخی نایاب',
        supplierPhone: '07901234567', active: true, featured: true, views: 312,
        createdAt: new Date(now - 259200000).toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: 'prd_demo4', name: 'سێت مێز و کورسی ئۆفیس',
        description: 'سێتی مێز و کورسی ئۆفیسی مۆدیرن، جووتی کورسی، ماتریاڵی باکووالیتی، ئەرگۆنۆمیک',
        price: 450000, currency: 'دینار', category: 'home', autoDetected: false,
        images: [], tags: ['مێز', 'کورسی', 'ئۆفیس'], stock: 8, location: 'دهۆک',
        supplierId: 'demo', supplierName: 'هێمن جەلیل', supplierCompany: 'مۆبیلیا هێمن',
        supplierPhone: '07401234567', active: true, featured: false, views: 95,
        createdAt: new Date(now - 345600000).toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: 'prd_demo5', name: 'کریمی رووخسارە ئۆرگانیک',
        description: 'کریمی رووخسارەی سروشتی، بێ کیمیاوی زیانبەخش، مناسب بۆ هەموو جۆرە پێستێک',
        price: 45000, currency: 'دینار', category: 'health', autoDetected: false,
        images: [], tags: ['کریم', 'جوانی', 'پێست'], stock: 50, location: 'هەولێر',
        supplierId: 'demo', supplierName: 'لێیلا تاهیر', supplierCompany: 'بیوتی ستۆر',
        supplierPhone: '07801234567', active: true, featured: false, views: 203,
        createdAt: new Date(now - 432000000).toISOString(), updatedAt: new Date().toISOString()
      },
      {
        id: 'prd_demo6', name: 'کتێبی فێربوونی Python',
        description: 'کتێبی تایبەت بە فێربوونی پرۆگرامنووسی Python، لە سفر بۆ پیشەسازی، بە زمانی کوردی',
        price: 35000, currency: 'دینار', category: 'education', autoDetected: false,
        images: [], tags: ['کتێب', 'Python', 'کۆمپیوتەر'], stock: 200, location: 'سلێمانی',
        supplierId: 'demo', supplierName: 'زانکۆ ئەحمەد', supplierCompany: 'کتێبخانەی دانش',
        supplierPhone: '07601234567', active: true, featured: false, views: 156,
        createdAt: new Date(now - 518400000).toISOString(), updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * seedIfEmpty() — Seeds demo data into localStorage ONLY (not Supabase).
   * Only called when there are no products at all (first visit).
   * Real supplier products from Supabase are loaded by DB.init() before this runs.
   */
  function seedIfEmpty() {
    if (getAll().length === 0) {
      save(getSeedData());
    }
  }

  // ── Expose ────────────────────────────────────────

  return {
    getAll, getById, getBySupplier, getByCategory, search,
    add, update, remove, toggleActive, incrementViews,
    getFeatured, getRecent, getCategoryCounts, seedIfEmpty
  };
})();
