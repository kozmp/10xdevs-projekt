-- seed.dev.sql
-- Seed data dla środowiska DEV/LOCAL
-- NIE URUCHAMIAJ NA PRODUKCJI!

-- Sprawdź czy to środowisko DEV
DO $$
BEGIN
  -- Możesz dodać sprawdzenie czy to lokalna baza (np. po nazwie hosta)
  RAISE NOTICE 'Running DEV seed data...';
END $$;

-- 1. Utwórz testowego użytkownika w auth.users (jeśli nie istnieje)
-- UWAGA: To wymaga uprawnień do tabeli auth.users
-- W Supabase lokalnym (Docker) możesz to zrobić, na produkcji NIE!

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
  crypt('Test1test1', gen_salt('bf')), -- Hasło: Test1test1
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Utwórz testowy sklep dla tego użytkownika
INSERT INTO shops (
  shop_id,
  user_id,
  shopify_domain,
  api_key_encrypted,
  created_at,
  updated_at
)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid, -- user_id testowego użytkownika
  'test-shop-dev.myshopify.com',
  'ENCRYPTED_MOCK_KEY_FOR_DEV', -- Mock klucz, nie prawdziwy
  NOW(),
  NOW()
)
ON CONFLICT (shop_id) DO NOTHING;

-- 3. Dodaj kategorie testowe
INSERT INTO categories (id, shop_id, name, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Category 1', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Category 2', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Dodaj kolekcje testowe
INSERT INTO collections (id, shop_id, name, created_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Collection 1', NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Collection 2', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Dodaj testowe produkty (te same ID co w GET /api/products mock)
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
    '22222222-2222-2222-2222-222222222222'::uuid,
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
    '22222222-2222-2222-2222-222222222222'::uuid,
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
    '22222222-2222-2222-2222-222222222222'::uuid,
    1003,
    'Product Test 3',
    'TEST-003',
    'Short description for product 3',
    NULL, -- long_description może być NULL
    'published',
    '{}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Połącz produkty z kategoriami
INSERT INTO product_categories (product_id, category_id)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid)
ON CONFLICT DO NOTHING;

-- 7. Połącz produkty z kolekcjami
INSERT INTO product_collections (product_id, collection_id)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'DEV seed data loaded successfully!';
