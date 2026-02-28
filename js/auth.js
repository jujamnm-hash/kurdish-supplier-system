// ===========================
// AUTH SYSTEM
// Kurdish Supplier System — Supabase + localStorage fallback
// ===========================

const Auth = (() => {
  const SESSION_KEY = 'kss_session';
  // Legacy keys (kept for fallback / offline mode)
  const USERS_KEY = 'kss_users';

  // ── Session helpers ──────────────────────────────

  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  /**
   * getCurrentUser() — Synchronous. Reads cached session from localStorage.
   * Always fast — never waits for network.
   */
  function getCurrentUser() {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  }

  // ── Supabase Auth ────────────────────────────────

  /**
   * register() — Async. Creates Supabase Auth user + profile row.
   * Falls back to localStorage-only when Supabase is not configured.
   */
  async function register({ name, email, phone, company, password, description, city }) {
    if (!DB.isConfigured()) {
      return _localRegister({ name, email, phone, company, password, description, city });
    }

    try {
      const { data, error } = await _supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, company, description, city }
        }
      });

      if (error) {
        // Translate common errors to Kurdish
        if (error.message.includes('already registered')) {
          return { success: false, msg: 'ئیمەیڵەکە پێشتر تۆمارکراوە' };
        }
        return { success: false, msg: error.message };
      }

      if (!data.user) {
        return { success: false, msg: 'تۆمارکردن سەرکەوتوو نەبوو، دووبارە هەوڵ بدەرەوە' };
      }

      const userId = data.user.id;
      const profile = {
        name: name.trim(),
        email,
        phone: phone || '',
        company: company || '',
        description: description || '',
        city: city || '',
        avatar: name.trim().charAt(0).toUpperCase(),
        verified: false
      };

      // Push profile to Supabase (background — don't block UI)
      DB.syncProfile(userId, profile);

      const sessionUser = {
        id: userId,
        ...profile,
        stats: { products: 0, views: 0, orders: 0 },
        createdAt: new Date().toISOString()
      };
      saveSession(sessionUser);
      return { success: true, user: sessionUser };

    } catch (e) {
      console.warn('Auth.register error:', e);
      return { success: false, msg: 'هەڵەیەک ڕووی دا، دووبارە هەوڵ بدەرەوە' };
    }
  }

  /**
   * login() — Async. Signs in via Supabase. Falls back to localStorage.
   */
  async function login(email, password) {
    if (!DB.isConfigured()) {
      return _localLogin(email, password);
    }

    try {
      const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, msg: 'ئیمەیڵ یان پاسوەرد هەڵەیە' };
      }

      const userId = data.user.id;
      const meta = data.user.user_metadata || {};

      // Fetch full profile from DB
      const profile = await DB.getProfile(userId);

      const sessionUser = {
        id: userId,
        name: profile?.name || meta.name || email.split('@')[0],
        email,
        phone: profile?.phone || meta.phone || '',
        company: profile?.company || meta.company || '',
        description: profile?.description || meta.description || '',
        city: profile?.city || meta.city || '',
        avatar: (profile?.name || meta.name || email).charAt(0).toUpperCase(),
        verified: profile?.verified || false,
        stats: { products: 0, views: 0, orders: 0 },
        createdAt: profile?.created_at || new Date().toISOString()
      };

      saveSession(sessionUser);
      return { success: true, user: sessionUser };

    } catch (e) {
      console.warn('Auth.login error:', e);
      return { success: false, msg: 'هەڵەیەک ڕووی دا، دووبارە هەوڵ بدەرەوە' };
    }
  }

  /**
   * logout() — Async. Signs out from Supabase + clears localStorage session.
   */
  async function logout() {
    if (DB.isConfigured()) {
      await _supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  /**
   * updateUser(updates) — Async. Updates session cache + Supabase profile.
   */
  async function updateUser(updates) {
    const session = getCurrentUser();
    if (!session) return;
    const updated = { ...session, ...updates };
    saveSession(updated);
    if (DB.isConfigured()) {
      DB.syncProfile(session.id, updates);
    } else {
      // Update in local users array too
      const users = _getUsers();
      const idx = users.findIndex(u => u.id === session.id);
      if (idx !== -1) {
        Object.assign(users[idx], updates);
        _saveUsers(users);
      }
    }
  }

  /**
   * initAuth() — Call on page load to silently verify Supabase session.
   * Clears localStorage session if the Supabase session has expired.
   */
  async function initAuth() {
    if (!DB.isConfigured()) return;
    try {
      const { data } = await _supabase.auth.getSession();
      if (!data.session && getCurrentUser()) {
        // Supabase session expired — clear local cache
        localStorage.removeItem(SESSION_KEY);
        if (typeof updateNavAuth === 'function') updateNavAuth();
      }
    } catch { /* silent */ }
  }

  // ── Guards ────────────────────────────────────────

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

  // ── Offline / localStorage-only fallback ──────────

  function _getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }
  function _saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  }

  function _localRegister({ name, email, phone, company, password, description, city }) {
    const users = _getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, msg: 'ئیمەیڵەکە پێشتر تۆمارکراوە' };
    }
    const user = {
      id: 'sup_' + Date.now(),
      name: name.trim(),
      email,
      phone: phone || '',
      company: company || '',
      description: description || '',
      city: city || '',
      password: btoa(password),
      avatar: name.trim().charAt(0).toUpperCase(),
      createdAt: new Date().toISOString(),
      verified: false,
      stats: { products: 0, views: 0, orders: 0 }
    };
    users.push(user);
    _saveUsers(users);
    const safe = { ...user }; delete safe.password;
    saveSession(safe);
    return { success: true, user: safe };
  }

  function _localLogin(email, password) {
    const users = _getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { success: false, msg: 'ئیمەیڵ یان پاسوەرد هەڵەیە' };
    const safe = { ...user }; delete safe.password;
    saveSession(safe);
    return { success: true, user: safe };
  }

  // ── Expose ────────────────────────────────────────

  return {
    getCurrentUser,
    register,
    login,
    logout,
    updateUser,
    requireAuth,
    requireGuest,
    initAuth,
    // Legacy compatibility
    getUsers: _getUsers
  };
})();
