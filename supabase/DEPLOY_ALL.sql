-- ==============================================================
-- KOMPLETNA MIGRACJA + SEED DATA
-- Uruchom TEN PLIK w Supabase Dashboard SQL Editor
-- ==============================================================

-- CZĘŚĆ 1: MIGRACJA - Naprawa architektury shops (user_id + RLS)
-- ==============================================================

-- 1. Dodaj kolumnę user_id do shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Dla istniejących rekordów: ustaw user_id = shop_id (zakładamy że wcześniej shop_id = auth.uid)
UPDATE shops SET user_id = shop_id WHERE user_id IS NULL;

-- 3. Ustaw kolumnę jako NOT NULL (po wypełnieniu istniejących rekordów)
ALTER TABLE shops ALTER COLUMN user_id SET NOT NULL;

-- 4. Dodaj index dla wydajności
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);

-- 5. Usuń stare RLS policies dla shops
DROP POLICY IF EXISTS authenticated_select ON shops;
DROP POLICY IF EXISTS authenticated_insert ON shops;
DROP POLICY IF EXISTS authenticated_update ON shops;
DROP POLICY IF EXISTS authenticated_delete ON shops;

-- 6. Utwórz nowe RLS policies używające user_id
CREATE POLICY authenticated_select ON shops
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY authenticated_insert ON shops
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY authenticated_update ON shops
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY authenticated_delete ON shops
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 7. Usuń stare RLS policies dla products
DROP POLICY IF EXISTS authenticated_select ON products;
DROP POLICY IF EXISTS authenticated_insert ON products;
DROP POLICY IF EXISTS authenticated_update ON products;
DROP POLICY IF EXISTS authenticated_delete ON products;

-- 8. Utwórz nowe RLS policies dla products (JOIN przez shops.user_id)
CREATE POLICY authenticated_select ON products
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = products.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON products
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = products.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON products
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = products.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = products.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON products
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = products.shop_id AND shops.user_id = auth.uid()));

-- 9. Categories
DROP POLICY IF EXISTS authenticated_select ON categories;
DROP POLICY IF EXISTS authenticated_insert ON categories;
DROP POLICY IF EXISTS authenticated_update ON categories;
DROP POLICY IF EXISTS authenticated_delete ON categories;

CREATE POLICY authenticated_select ON categories
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = categories.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON categories
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = categories.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON categories
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = categories.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = categories.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON categories
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = categories.shop_id AND shops.user_id = auth.uid()));

-- 10. Collections
DROP POLICY IF EXISTS authenticated_select ON collections;
DROP POLICY IF EXISTS authenticated_insert ON collections;
DROP POLICY IF EXISTS authenticated_update ON collections;
DROP POLICY IF EXISTS authenticated_delete ON collections;

CREATE POLICY authenticated_select ON collections
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = collections.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON collections
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = collections.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON collections
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = collections.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = collections.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON collections
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = collections.shop_id AND shops.user_id = auth.uid()));

-- 11. Jobs
DROP POLICY IF EXISTS authenticated_select ON jobs;
DROP POLICY IF EXISTS authenticated_insert ON jobs;
DROP POLICY IF EXISTS authenticated_update ON jobs;
DROP POLICY IF EXISTS authenticated_delete ON jobs;

CREATE POLICY authenticated_select ON jobs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = jobs.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON jobs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = jobs.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON jobs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = jobs.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = jobs.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON jobs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = jobs.shop_id AND shops.user_id = auth.uid()));

-- 12. Prompt Templates
DROP POLICY IF EXISTS authenticated_select ON prompt_templates;
DROP POLICY IF EXISTS authenticated_insert ON prompt_templates;
DROP POLICY IF EXISTS authenticated_update ON prompt_templates;
DROP POLICY IF EXISTS authenticated_delete ON prompt_templates;

CREATE POLICY authenticated_select ON prompt_templates
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = prompt_templates.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON prompt_templates
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = prompt_templates.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON prompt_templates
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = prompt_templates.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = prompt_templates.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON prompt_templates
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = prompt_templates.shop_id AND shops.user_id = auth.uid()));

-- 13. API Rate Limits
DROP POLICY IF EXISTS authenticated_select ON api_rate_limits;
DROP POLICY IF EXISTS authenticated_insert ON api_rate_limits;
DROP POLICY IF EXISTS authenticated_update ON api_rate_limits;
DROP POLICY IF EXISTS authenticated_delete ON api_rate_limits;

CREATE POLICY authenticated_select ON api_rate_limits
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = api_rate_limits.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON api_rate_limits
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = api_rate_limits.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON api_rate_limits
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = api_rate_limits.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = api_rate_limits.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON api_rate_limits
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = api_rate_limits.shop_id AND shops.user_id = auth.uid()));

-- 14. Audit Logs
DROP POLICY IF EXISTS authenticated_select ON audit_logs;
DROP POLICY IF EXISTS authenticated_insert ON audit_logs;
DROP POLICY IF EXISTS authenticated_update ON audit_logs;
DROP POLICY IF EXISTS authenticated_delete ON audit_logs;

CREATE POLICY authenticated_select ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = audit_logs.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_insert ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = audit_logs.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_update ON audit_logs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = audit_logs.shop_id AND shops.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = audit_logs.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY authenticated_delete ON audit_logs
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM shops WHERE shops.shop_id = audit_logs.shop_id AND shops.user_id = auth.uid()));


-- ==============================================================
-- CZĘŚĆ 2: SEED DATA - Testowy użytkownik + sklep + produkty
-- ==============================================================

DO $$
DECLARE
  test_user_id UUID;
  test_shop_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  RAISE NOTICE 'Starting seed data...';

  -- 1. Sprawdź czy user kozmp.dev@gmail.com istnieje
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'kozmp.dev@gmail.com'
  LIMIT 1;

  IF test_user_id IS NULL THEN
    -- User nie istnieje - stwórz go
    RAISE NOTICE 'Creating test user: kozmp.dev@gmail.com';

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      aud,
      role
    )
    VALUES (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'kozmp.dev@gmail.com',
      crypt('Test1test1', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    test_user_id := '11111111-1111-1111-1111-111111111111'::uuid;
  ELSE
    RAISE NOTICE 'Test user already exists: %', test_user_id;
  END IF;

  -- 2. Utwórz testowy sklep
  RAISE NOTICE 'Creating test shop...';
  INSERT INTO shops (
    shop_id,
    user_id,
    shopify_domain,
    api_key_encrypted,
    created_at,
    updated_at
  )
  VALUES (
    test_shop_id,
    test_user_id,
    'test-shop-dev.myshopify.com',
    'ENCRYPTED_MOCK_KEY_FOR_DEV',
    NOW(),
    NOW()
  )
  ON CONFLICT (shop_id) DO UPDATE
  SET user_id = EXCLUDED.user_id;

  -- 3. Dodaj kategorie
  RAISE NOTICE 'Creating categories...';
  INSERT INTO categories (id, shop_id, name, created_at)
  VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, test_shop_id, 'Category 1', NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, test_shop_id, 'Category 2', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- 4. Dodaj kolekcje
  RAISE NOTICE 'Creating collections...';
  INSERT INTO collections (id, shop_id, name, created_at)
  VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, test_shop_id, 'Collection 1', NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, test_shop_id, 'Collection 2', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- 5. Dodaj produkty
  RAISE NOTICE 'Creating products...';
  INSERT INTO products (
    id,
    shop_id,
    shopify_product_id,
    name,
    sku,
    short_description,
    long_description,
    status,
    metadata,
    created_at,
    updated_at
  )
  VALUES
    (
      '11111111-1111-1111-1111-111111111111'::uuid,
      test_shop_id,
      1001,
      'Product Test 1',
      'TEST-001',
      'Short description for product 1',
      'Long description for product 1',
      'published',
      '{}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      '22222222-2222-2222-2222-222222222222'::uuid,
      test_shop_id,
      1002,
      'Product Test 2',
      'TEST-002',
      'Short description for product 2',
      'Long description for product 2',
      'draft',
      '{}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      '33333333-3333-3333-3333-333333333333'::uuid,
      test_shop_id,
      1003,
      'Product Test 3',
      'TEST-003',
      'Short description for product 3',
      NULL,
      'published',
      '{}'::jsonb,
      NOW(),
      NOW()
    )
  ON CONFLICT (id) DO NOTHING;

  -- 6. Połącz produkty z kategoriami
  RAISE NOTICE 'Linking products to categories...';
  INSERT INTO product_categories (product_id, category_id)
  VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid)
  ON CONFLICT DO NOTHING;

  -- 7. Połącz produkty z kolekcjami
  RAISE NOTICE 'Linking products to collections...';
  INSERT INTO product_collections (product_id, collection_id)
  VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Migration and seed data completed successfully!';
  RAISE NOTICE 'Test user: kozmp.dev@gmail.com / Test1test1';
  RAISE NOTICE 'Test shop: test-shop-dev.myshopify.com';
  RAISE NOTICE 'Products created: 3';
END $$;
