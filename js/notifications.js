// ===========================
// NOTIFICATIONS MODULE
// Kurdish Supplier System
// ===========================

const Notifs = (() => {
  const KEY = 'kss_notifs';
  const MSG_KEY = 'kss_messages';

  // ===== NOTIFICATIONS =====
  function getAll(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(KEY)) || {};
      return all[userId] || [];
    } catch { return []; }
  }

  function add(userId, msg, type = 'info') {
    try {
      const all = JSON.parse(localStorage.getItem(KEY)) || {};
      if (!all[userId]) all[userId] = [];
      all[userId].unshift({
        id: Date.now() + Math.random(),
        msg, type,
        time: new Date().toISOString(),
        read: false
      });
      if (all[userId].length > 50) all[userId] = all[userId].slice(0, 50);
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {}
  }

  function unreadCount(userId) {
    return getAll(userId).filter(n => !n.read).length;
  }

  function markAllRead(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(KEY)) || {};
      if (all[userId]) {
        all[userId] = all[userId].map(n => ({ ...n, read: true }));
        localStorage.setItem(KEY, JSON.stringify(all));
      }
    } catch {}
  }

  function deleteNotif(userId, notifId) {
    try {
      const all = JSON.parse(localStorage.getItem(KEY)) || {};
      if (all[userId]) {
        all[userId] = all[userId].filter(n => n.id !== notifId);
        localStorage.setItem(KEY, JSON.stringify(all));
      }
    } catch {}
  }

  // Check & fire view milestone notifications for supplier
  function checkViewMilestones(product) {
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    const v = product.views || 0;
    milestones.forEach(m => {
      if (v === m) {
        add(product.supplierId,
          `👁 کالاکەت "${product.name.slice(0, 25)}${product.name.length > 25 ? '...' : ''}" گەیشتە ${m} بینین!`,
          'success');
      }
    });
  }

  // ===== MESSAGES =====
  function getMessages(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
      return all[userId] || [];
    } catch { return []; }
  }

  function sendMessage({ toSupplierId, fromName, fromPhone, message, productId, productName }) {
    try {
      const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
      if (!all[toSupplierId]) all[toSupplierId] = [];
      const msg = {
        id: Date.now() + Math.random(),
        fromName, fromPhone, message,
        productId, productName,
        time: new Date().toISOString(),
        read: false
      };
      all[toSupplierId].unshift(msg);
      localStorage.setItem(MSG_KEY, JSON.stringify(all));

      // Also fire a notification for the supplier
      add(toSupplierId,
        `📩 پەیامی نوێت هەیە لە ${fromName} دەربارەی "${(productName || '').slice(0, 20)}..."`,
        'info');

      return true;
    } catch { return false; }
  }

  function unreadMessages(userId) {
    return getMessages(userId).filter(m => !m.read).length;
  }

  function markMessageRead(userId, msgId) {
    try {
      const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
      if (all[userId]) {
        all[userId] = all[userId].map(m => m.id === msgId ? { ...m, read: true } : m);
        localStorage.setItem(MSG_KEY, JSON.stringify(all));
      }
    } catch {}
  }

  function markAllMessagesRead(userId) {
    try {
      const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
      if (all[userId]) {
        all[userId] = all[userId].map(m => ({ ...m, read: true }));
        localStorage.setItem(MSG_KEY, JSON.stringify(all));
      }
    } catch {}
  }

  function deleteMessage(userId, msgId) {
    try {
      const all = JSON.parse(localStorage.getItem(MSG_KEY)) || {};
      if (all[userId]) {
        all[userId] = all[userId].filter(m => m.id !== msgId);
        localStorage.setItem(MSG_KEY, JSON.stringify(all));
      }
    } catch {}
  }

  return {
    getAll, add, unreadCount, markAllRead, deleteNotif, checkViewMilestones,
    getMessages, sendMessage, unreadMessages, markMessageRead, markAllMessagesRead, deleteMessage
  };
})();
