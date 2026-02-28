// =====================================================
// DATABASE SYNC LAYER
// Kurdish Supplier System — Supabase ↔ localStorage
// =====================================================
// Strategy:
//   - Reads: always from localStorage (fast, instant UI)
//   - Writes: localStorage first (instant), then Supabase async (cloud)
//   - Init: on page load fetch all products from Supabase → populate cache
// =====================================================

const DB = (() => {
  const PRODUCTS_KEY = 'kss_products';
  const SYNC_KEY = 'kss_last_sync';

  // ── Helpers ──────────────────────────────────────

  function isConfigured() {
    return _supabase !== null && SUPABASE_URL !== 'YOUR_SUPABASE_URL';
  }

  // Convert Supabase DB row → local JS object
  function rowToProduct(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: parseFloat(row.price) || 0,
      currency: row.currency || 'دینار',
      category: row.category || 'other',
      autoDetected: row.auto_detected || false,
      images: Array.isArray(row.images) ? row.images : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      stock: parseInt(row.stock) || 0,
      location: row.location || '',
      supplierId: row.supplier_id,
      supplierName: row.supplier_name || '',
      supplierCompany: row.supplier_company || '',
      supplierPhone: row.supplier_phone || '',
      active: row.active !== false,
      featured: row.featured || false,
      views: row.views || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Convert local JS object → Supabase DB row
  function productToRow(p) {
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price || 0,
      currency: p.currency || 'دینار',
      category: p.category || 'other',
      auto_detected: p.autoDetected || false,
      images: p.images || [],
      tags: p.tags || [],
      stock: p.stock || 0,
      location: p.location || '',
      supplier_id: p.supplierId,
      supplier_name: p.supplierName || '',
      supplier_company: p.supplierCompany || '',
      supplier_phone: p.supplierPhone || '',
      active: p.active !== false,
      featured: p.featured || false,
      views: p.views || 0,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    };
  }

  // ── Sync Status UI ────────────────────────────────

  function showSyncBadge(text, state = 'info') {
    // state: 'info' | 'ok' | 'warn' | 'error'
    const el = document.getElementById('sync-status');
    if (!el) return;
    const colors = {
      info: 'var(--primary)',
      ok: '#22c55e',
      warn: '#f59e0b',
      error: 'var(--danger)'
    };
    el.textContent = text;
    el.style.cssText = `
      display:inline-block;
      padding:0.15rem 0.5rem;
      border-radius:0.6rem;
      font-size:0.7rem;
      font-weight:600;
      background:${colors[state] || colors.info}22;
      color:${colors[state] || colors.info};
      border:1px solid ${colors[state] || colors.info}55;
      transition:opacity 0.3s;
    `;
    if (state === 'ok') {
      setTimeout(() => { if (el) el.style.opacity = '0'; }, 1800);
    }
  }

  // ── Core Operations ───────────────────────────────

  /**
   * init() — Fetch all products from Supabase into localStorage cache.
   * Called once per page load from app.js DOMContentLoaded.
   */
  async function init() {
    if (!isConfigured()) return;

    try {
      showSyncBadge('⟳ sync...', 'info');

      const { data, error } = await _supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Merge: Supabase products take priority over localStorage
        const cloudProducts = data.map(rowToProduct);

        // Keep any demo/local-only products that have no Supabase record
        const local = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
        const cloudIds = new Set(cloudProducts.map(p => p.id));
        const localOnly = local.filter(p => !cloudIds.has(p.id) && p.supplierId === 'demo');

        const merged = [...cloudProducts, ...localOnly];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(merged));
        localStorage.setItem(SYNC_KEY, new Date().toISOString());
        showSyncBadge('✓ sync', 'ok');
      } else {
        showSyncBadge('✓ sync', 'ok');
      }

      // Notify all listeners that cloud data is ready
      window.dispatchEvent(new CustomEvent('kss:synced'));
    } catch (err) {
      console.warn('DB.init error:', err.message || err);
      showSyncBadge('⚠ offline', 'warn');
    }
  }

  /**
   * pushProduct(product) — Upsert a product to Supabase (background).
   * Only called for real supplier products (not demo data).
   */
  async function pushProduct(product) {
    if (!isConfigured()) return;
    if (!product.supplierId || product.supplierId === 'demo') return;

    try {
      const row = productToRow(product);
      const { error } = await _supabase.from('products').upsert(row);
      if (error) throw error;
    } catch (err) {
      console.warn('DB.pushProduct error:', err.message || err);
    }
  }

  /**
   * deleteProduct(id) — Delete a product from Supabase (background).
   */
  async function deleteProduct(id) {
    if (!isConfigured()) return;
    try {
      const { error } = await _supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn('DB.deleteProduct error:', err.message || err);
    }
  }

  /**
   * syncProfile(userId, data) — Upsert a supplier profile.
   */
  async function syncProfile(userId, profileData) {
    if (!isConfigured()) return;
    try {
      const { error } = await _supabase.from('profiles').upsert({
        id: userId,
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        company: profileData.company || '',
        description: profileData.description || '',
        city: profileData.city || '',
        avatar: profileData.avatar || '',
        verified: profileData.verified || false,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
    } catch (err) {
      console.warn('DB.syncProfile error:', err.message || err);
    }
  }

  /**
   * getProfile(userId) — Fetch a supplier profile by ID.
   */
  async function getProfile(userId) {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * incrementViews(id) — Increment product view counter in Supabase.
   * Non-blocking, uses server-side function for atomic increment.
   */
  async function incrementViews(id) {
    if (!isConfigured()) return;
    try {
      // Try RPC first (atomic)
      const { error } = await _supabase.rpc('increment_views', { product_id: id });
      if (error) {
        // Fallback: read then write
        const { data } = await _supabase
          .from('products').select('views').eq('id', id).single();
        if (data) {
          await _supabase
            .from('products')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', id);
        }
      }
    } catch {
      // Silent fail — view count is not critical
    }
  }

  /**
   * syncNow() — Force full re-sync from cloud to localStorage.
   * Useful for a manual "Refresh" button.
   */
  async function syncNow() {
    await init();
    if (typeof showToast === 'function') {
      showToast('☁ دیتاکان لە کلاود نوێکرایەوە ✓', 'success', 2500);
    }
  }

  /**
   * getLastSync() — Return the last sync timestamp string.
   */
  function getLastSync() {
    const ts = localStorage.getItem(SYNC_KEY);
    return ts ? new Date(ts).toLocaleTimeString('ar-IQ') : 'هەرگیز';
  }

  return {
    init,
    pushProduct,
    deleteProduct,
    syncProfile,
    getProfile,
    incrementViews,
    syncNow,
    getLastSync,
    isConfigured
  };
})();
