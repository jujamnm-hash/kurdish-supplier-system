// ===========================
// RECENTLY VIEWED MODULE
// Kurdish Supplier System
// ===========================

const RecentlyViewed = (() => {
  const KEY = 'kss_recent';
  const MAX = 12;

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }

  function add(productId) {
    let ids = get().filter(id => id !== productId);
    ids.unshift(productId);
    if (ids.length > MAX) ids = ids.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  function getProducts() {
    const ids = get();
    // Products module must be loaded
    if (typeof Products === 'undefined') return [];
    return ids.map(id => Products.getById(id)).filter(Boolean);
  }

  function clear() { localStorage.removeItem(KEY); }

  return { add, get, getProducts, clear };
})();
