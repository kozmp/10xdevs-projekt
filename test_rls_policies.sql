-- RLS Functional Test Script
-- This script tests that RLS policies are working correctly

-- Setup: Create test data for two different shops
BEGIN;

-- Create two test shops (using known UUIDs for testing)
INSERT INTO shops (shop_id, shopify_domain, api_key_encrypted, api_key_iv)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'shop1.myshopify.com', 'encrypted_key_1', 'iv_1'),
  ('22222222-2222-2222-2222-222222222222', 'shop2.myshopify.com', 'encrypted_key_2', 'iv_2');

-- Create products for Shop 1
INSERT INTO products (id, shop_id, shopify_product_id, name, sku, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1001, 'Product A1', 'SKU-A1', 'published'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1002, 'Product A2', 'SKU-A2', 'published');

-- Create products for Shop 2
INSERT INTO products (id, shop_id, shopify_product_id, name, sku, status)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 2001, 'Product B1', 'SKU-B1', 'published'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 2002, 'Product B2', 'SKU-B2', 'published');

-- Create categories for Shop 1
INSERT INTO categories (id, shop_id, name)
VALUES
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', '11111111-1111-1111-1111-111111111111', 'Category A1'),
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '11111111-1111-1111-1111-111111111111', 'Category A2');

-- Create categories for Shop 2
INSERT INTO categories (id, shop_id, name)
VALUES
  ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', '22222222-2222-2222-2222-222222222222', 'Category B1'),
  ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '22222222-2222-2222-2222-222222222222', 'Category B2');

-- Create collections for Shop 1
INSERT INTO collections (id, shop_id, name)
VALUES
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '11111111-1111-1111-1111-111111111111', 'Collection A1');

-- Create collections for Shop 2
INSERT INTO collections (id, shop_id, name)
VALUES
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', '22222222-2222-2222-2222-222222222222', 'Collection B1');

-- Create jobs for Shop 1
INSERT INTO jobs (id, shop_id, style, language)
VALUES
  ('j1j1j1j1-j1j1-j1j1-j1j1-j1j1j1j1j1j1', '11111111-1111-1111-1111-111111111111', 'professional', 'en');

-- Create jobs for Shop 2
INSERT INTO jobs (id, shop_id, style, language)
VALUES
  ('j2j2j2j2-j2j2-j2j2-j2j2-j2j2j2j2j2j2', '22222222-2222-2222-2222-222222222222', 'casual', 'pl');

-- Create association records (these are BEFORE RLS, so they insert successfully)
-- Shop 1 associations
INSERT INTO product_categories (product_id, category_id)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1');

INSERT INTO product_collections (product_id, collection_id)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1');

INSERT INTO job_products (job_id, product_id)
VALUES
  ('j1j1j1j1-j1j1-j1j1-j1j1-j1j1j1j1j1j1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Shop 2 associations
INSERT INTO product_categories (product_id, category_id)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2');

INSERT INTO product_collections (product_id, collection_id)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2');

INSERT INTO job_products (job_id, product_id)
VALUES
  ('j2j2j2j2-j2j2-j2j2-j2j2-j2j2j2j2j2j2', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

COMMIT;

-- ========================================
-- TEST 1: Verify data was inserted
-- ========================================
SELECT 'TEST 1: Total data inserted' as test;
SELECT 'Shops: ' || COUNT(*) FROM shops;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Collections: ' || COUNT(*) FROM collections;
SELECT 'Jobs: ' || COUNT(*) FROM jobs;
SELECT 'Product_Categories: ' || COUNT(*) FROM product_categories;
SELECT 'Product_Collections: ' || COUNT(*) FROM product_collections;
SELECT 'Job_Products: ' || COUNT(*) FROM job_products;

-- ========================================
-- TEST 2: Simulate authenticated user from Shop 1
-- ========================================
SELECT 'TEST 2: Authenticated as Shop 1 (11111111-1111-1111-1111-111111111111)' as test;

-- Set current user to Shop 1 owner
SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
SET ROLE authenticated;

-- Shop 1 should only see their own product_categories
SELECT 'Product_Categories visible: ' || COUNT(*) || ' (Expected: 1)'
FROM product_categories;

-- Shop 1 should only see their own product_collections
SELECT 'Product_Collections visible: ' || COUNT(*) || ' (Expected: 1)'
FROM product_collections;

-- Shop 1 should only see their own job_products
SELECT 'Job_Products visible: ' || COUNT(*) || ' (Expected: 1)'
FROM job_products;

-- Details of what Shop 1 can see
SELECT 'Visible Product-Category relationships:' as detail;
SELECT pc.product_id, pc.category_id, p.name as product_name, c.name as category_name
FROM product_categories pc
JOIN products p ON p.id = pc.product_id
JOIN categories c ON c.id = pc.category_id;

-- ========================================
-- TEST 3: Simulate authenticated user from Shop 2
-- ========================================
SELECT 'TEST 3: Authenticated as Shop 2 (22222222-2222-2222-2222-222222222222)' as test;

-- Reset and set to Shop 2 owner
RESET ROLE;
SET request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
SET ROLE authenticated;

-- Shop 2 should only see their own associations
SELECT 'Product_Categories visible: ' || COUNT(*) || ' (Expected: 1)'
FROM product_categories;

SELECT 'Product_Collections visible: ' || COUNT(*) || ' (Expected: 1)'
FROM product_collections;

SELECT 'Job_Products visible: ' || COUNT(*) || ' (Expected: 1)'
FROM job_products;

-- Details of what Shop 2 can see
SELECT 'Visible Product-Category relationships:' as detail;
SELECT pc.product_id, pc.category_id, p.name as product_name, c.name as category_name
FROM product_categories pc
JOIN products p ON p.id = pc.product_id
JOIN categories c ON c.id = pc.category_id;

-- ========================================
-- TEST 4: Test INSERT policy - Try to insert Shop 2 data while authenticated as Shop 1
-- ========================================
SELECT 'TEST 4: INSERT Policy Test - Shop 1 trying to insert Shop 2 data' as test;

RESET ROLE;
SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
SET ROLE authenticated;

-- This should FAIL because Shop 1 cannot insert relationships for Shop 2's products
DO $$
BEGIN
  INSERT INTO product_categories (product_id, category_id)
  VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2');
  RAISE NOTICE 'FAIL: Shop 1 was able to insert Shop 2 data (RLS NOT WORKING!)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Shop 1 blocked from inserting Shop 2 data (RLS working correctly)';
END $$;

-- This should SUCCEED because Shop 1 is inserting their own data
DO $$
BEGIN
  INSERT INTO product_categories (product_id, category_id)
  VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1');
  RAISE NOTICE 'SUCCESS: Shop 1 can insert their own data (RLS working correctly)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'FAIL: Shop 1 blocked from inserting their own data (RLS TOO RESTRICTIVE!)';
END $$;

-- ========================================
-- TEST 5: Test DELETE policy
-- ========================================
SELECT 'TEST 5: DELETE Policy Test' as test;

RESET ROLE;
SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
SET ROLE authenticated;

-- Shop 1 should be able to delete their own association
DELETE FROM product_categories
WHERE product_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  AND category_id = 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1';

SELECT CASE
  WHEN FOUND THEN 'SUCCESS: Shop 1 can delete their own data'
  ELSE 'FAIL: Shop 1 cannot delete their own data'
END;

-- ========================================
-- CLEANUP
-- ========================================
RESET ROLE;
RESET request.jwt.claim.sub;

SELECT '========================================' as separator;
SELECT 'RLS TESTS COMPLETED' as result;
SELECT '========================================' as separator;
