// =====================================================
// SUPABASE CONFIGURATION
// Kurdish Supplier System
// =====================================================
//
// ⚠️  پێویستە تۆ ئەم دوو زنجیرەیە پڕ بکەیتەوە:
//
//  چۆن: 
//  1. سەردانی https://supabase.com بکە
//  2. پرۆژەکەت بکەرەوە (یان پرۆژەیەکی نوێ دروست بکە)
//  3. لە مێنیوی لاتەوە کلیک بکە لەسەر: Settings → API
//  4. "Project URL" کۆپی بکە → بیخە شوێنی SUPABASE_URL
//  5. "anon / public" کۆپی بکە → بیخە شوێنی SUPABASE_ANON_KEY
//
// =====================================================

const SUPABASE_URL = 'https://yjvzmudmeccieudjgtxk.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_ED2WqR3tGYtFsuxyC4cK1Q_CLadGEdg';

// =====================================================
// دروست کردنی کلایەنتی Supabase
// =====================================================
let _supabase = null;

try {
  if (
    SUPABASE_URL &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
    typeof window !== 'undefined' &&
    window.supabase
  ) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    console.log('✓ Supabase connected');
  } else if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.warn('⚠ Supabase not configured — running in offline/localStorage mode');
  }
} catch (e) {
  console.warn('Supabase init error:', e.message);
}
