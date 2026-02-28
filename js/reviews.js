// ===========================
// REVIEWS & RATINGS MODULE
// Kurdish Supplier System
// ===========================

const Reviews = (() => {
  const KEY = 'kss_reviews';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }

  function getByProduct(productId) {
    return (getAll()[productId] || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  function add(productId, { rating, text, name }) {
    const all = getAll();
    if (!all[productId]) all[productId] = [];
    all[productId].unshift({
      id: Date.now() + '' + Math.floor(Math.random() * 1000),
      rating: Math.max(1, Math.min(5, parseInt(rating))),
      text: (text || '').trim(),
      name: (name || '').trim() || 'ناناسراو',
      time: new Date().toISOString()
    });
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  }

  function remove(productId, reviewId) {
    const all = getAll();
    if (all[productId]) {
      all[productId] = all[productId].filter(r => String(r.id) !== String(reviewId));
      localStorage.setItem(KEY, JSON.stringify(all));
    }
  }

  function getStats(productId) {
    const reviews = getByProduct(productId);
    if (!reviews.length) return { avg: 0, count: 0, distribution: {5:0,4:0,3:0,2:0,1:0} };
    const total = reviews.reduce((s, r) => s + r.rating, 0);
    const dist = {5:0, 4:0, 3:0, 2:0, 1:0};
    reviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    return {
      avg: (total / reviews.length).toFixed(1),
      count: reviews.length,
      distribution: dist
    };
  }

  // Build star HTML (filled/half/empty)
  function starsHTML(rating, size = '1rem') {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<span style="color:${i <= rating ? '#f7971e' : 'var(--border)'};font-size:${size}">★</span>`;
    }
    return html;
  }

  return { add, getByProduct, getStats, remove, starsHTML };
})();
