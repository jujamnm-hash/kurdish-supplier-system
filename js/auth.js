// ===========================
// AUTH SYSTEM
// Kurdish Supplier System
// ===========================

const Auth = (() => {
  const USERS_KEY = 'kss_users';
  const SESSION_KEY = 'kss_session';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  }

  function register({ name, email, phone, company, password, description, city }) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, msg: 'ئیمەیڵەکە پێشتر تۆمارکراوە' };
    }
    const user = {
      id: 'sup_' + Date.now(),
      name,
      email,
      phone,
      company,
      description: description || '',
      city: city || '',
      password: btoa(password),
      avatar: name.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
      verified: false,
      stats: { products: 0, views: 0, orders: 0 }
    };
    users.push(user);
    saveUsers(users);
    // Auto-login
    const safe = { ...user }; delete safe.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return { success: true, user: safe };
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { success: false, msg: 'ئیمەیڵ یان پاسوەرد هەڵەیە' };
    const safe = { ...user }; delete safe.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return { success: true, user: safe };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  function updateUser(updates) {
    const session = getCurrentUser();
    if (!session) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return;
    Object.assign(users[idx], updates);
    saveUsers(users);
    const safe = { ...users[idx] }; delete safe.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  }

  function requireAuth(redirectTo = 'login.html') {
    if (!getCurrentUser()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  function requireGuest(redirectTo = 'dashboard.html') {
    if (getCurrentUser()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  return {
    getUsers,
    getCurrentUser,
    register,
    login,
    logout,
    updateUser,
    requireAuth,
    requireGuest
  };
})();
