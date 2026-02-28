// ===========================
// PRODUCT COMPARE MODULE
// Kurdish Supplier System
// ===========================

const Compare = (() => {
  const KEY = 'kss_compare';
  const MAX = 3;

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }

  function toggle(productId) {
    let ids = get();
    if (ids.includes(productId)) {
      ids = ids.filter(id => id !== productId);
      localStorage.setItem(KEY, JSON.stringify(ids));
      return { added: false, full: false };
    }
    if (ids.length >= MAX) {
      return { added: false, full: true };
    }
    ids.push(productId);
    localStorage.setItem(KEY, JSON.stringify(ids));
    return { added: true, full: false };
  }

  function has(productId) { return get().includes(productId); }

  function clear() { localStorage.removeItem(KEY); }

  function count() { return get().length; }

  function getProducts() {
    const ids = get();
    if (typeof Products === 'undefined') return [];
    return ids.map(id => Products.getById(id)).filter(Boolean);
  }

  return { toggle, has, clear, count, get, getProducts };
})();
