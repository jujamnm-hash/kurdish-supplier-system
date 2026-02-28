-- =====================================================
-- Kurdish Supplier System - Supabase Schema
-- =====================================================
-- چۆنیەتی بەکارهێنان:
-- 1. بچۆ بۆ: https://supabase.com → پرۆژەکەت بکەرەوە
-- 2. کلیک بکە لەسەر: SQL Editor
-- 3. کۆدی خوارەوە کۆپی بکە و بیخەرە ناو SQL Editor
-- 4. کلیک بکە لەسەر RUN
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE (هاوپێچ بەکاری Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  description TEXT DEFAULT '',
  city TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PRODUCTS TABLE (کالاکان)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'دینار',
  category TEXT DEFAULT 'other',
  auto_detected BOOLEAN DEFAULT FALSE,
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  location TEXT DEFAULT '',
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_name TEXT DEFAULT '',
  supplier_company TEXT DEFAULT '',
  supplier_phone TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. INDEXES (بۆ خێرایی)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (چاودێری مافەکان)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- هەموو کەس دەتوانێت بخوێنێتەوە
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- تەنها خاوەن ئەکاونت دەتوانێت پرۆفایلەکەی ببینێت و دەستکاری بکات
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- هەموو کەس دەتوانێت کالا بخوێنێتەوە
CREATE POLICY "products_select_all" ON products
  FOR SELECT USING (true);

-- تەنها دابینکەر دەتوانێت کالاکانی خۆی زیاد بکات
CREATE POLICY "products_insert_own" ON products
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

-- تەنها دابینکەر دەتوانێت کالاکانی خۆی دەستکاری بکات
CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (auth.uid() = supplier_id);

-- تەنها دابینکەر دەتوانێت کالاکانی خۆی بسڕێتەوە
CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (auth.uid() = supplier_id);

-- =====================================================
-- 5. AUTO-UPDATE TRIGGER (نوێکردنەوەی updated_at)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INCREMENT VIEWS FUNCTION (زیادکردنی بینینەکان)
-- =====================================================
CREATE OR REPLACE FUNCTION increment_views(product_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET views = views + 1 WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- دامەزراندن تەواو بوو! ✓
-- =====================================================
