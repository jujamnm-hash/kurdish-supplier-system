// ===========================
// FAVORITES / WISHLIST
// Kurdish Supplier System
// ===========================

const Favorites = (() => {
  const KEY = 'kss_favorites';

  function get() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }

  function save(favs) {
    localStorage.setItem(KEY, JSON.stringify(favs));
  }

  function isFav(productId) {
    return get().includes(productId);
  }

  function toggle(productId) {
    const favs = get();
    const idx = favs.indexOf(productId);
    if (idx === -1) {
      favs.push(productId);
      save(favs);
      return true; // added
    } else {
      favs.splice(idx, 1);
      save(favs);
      return false; // removed
    }
  }

  function getProducts() {
    const ids = get();
    return ids.map(id => Products.getById(id)).filter(Boolean);
  }

  function count() {
    return get().length;
  }

  function clear() {
    save([]);
  }

  return { get, isFav, toggle, getProducts, count, clear };
})();
