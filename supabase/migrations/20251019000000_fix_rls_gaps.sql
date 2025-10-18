-- Migration: Fix RLS Security Gaps
-- Date: 2025-10-19
-- Purpose: Add missing RLS policies for association tables and fix jobs table conflict
-- Addresses: Critical security vulnerabilities in product_categories, product_collections, and job_products tables

-- ============================================================
-- PART 1: Enable RLS on Association Tables
-- ============================================================

-- Enable RLS for product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS for product_collections
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Enable RLS for job_products
ALTER TABLE job_products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 2: RLS Policies for product_categories
-- ============================================================

-- SELECT: Users can only see product-category relationships for their own products
CREATE POLICY "authenticated_select_product_categories"
  ON product_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_categories.product_id
        AND products.shop_id = auth.uid()
    )
  );

-- INSERT: Users can only create relationships for their own products and categories
CREATE POLICY "authenticated_insert_product_categories"
  ON product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_categories.product_id
        AND products.shop_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM categories
      WHERE categories.id = product_categories.category_id
        AND categories.shop_id = auth.uid()
    )
  );

-- UPDATE: Users can only update relationships for their own products
CREATE POLICY "authenticated_update_product_categories"
  ON product_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_categories.product_id
        AND products.shop_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_categories.product_id
        AND products.shop_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM categories
      WHERE categories.id = product_categories.category_id
        AND categories.shop_id = auth.uid()
    )
  );

-- DELETE: Users can only delete relationships for their own products
CREATE POLICY "authenticated_delete_product_categories"
  ON product_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_categories.product_id
        AND products.shop_id = auth.uid()
    )
  );

-- ============================================================
-- PART 3: RLS Policies for product_collections
-- ============================================================

-- SELECT: Users can only see product-collection relationships for their own products
CREATE POLICY "authenticated_select_product_collections"
  ON product_collections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_collections.product_id
        AND products.shop_id = auth.uid()
    )
  );

-- INSERT: Users can only create relationships for their own products and collections
CREATE POLICY "authenticated_insert_product_collections"
  ON product_collections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_collections.product_id
        AND products.shop_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = product_collections.collection_id
        AND collections.shop_id = auth.uid()
    )
  );

-- UPDATE: Users can only update relationships for their own products
CREATE POLICY "authenticated_update_product_collections"
  ON product_collections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_collections.product_id
        AND products.shop_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_collections.product_id
        AND products.shop_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = product_collections.collection_id
        AND collections.shop_id = auth.uid()
    )
  );

-- DELETE: Users can only delete relationships for their own products
CREATE POLICY "authenticated_delete_product_collections"
  ON product_collections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_collections.product_id
        AND products.shop_id = auth.uid()
    )
  );

-- ============================================================
-- PART 4: RLS Policies for job_products
-- ============================================================

-- SELECT: Users can only see job-product relationships for their own jobs
CREATE POLICY "authenticated_select_job_products"
  ON job_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_products.job_id
        AND jobs.shop_id = auth.uid()
    )
  );

-- INSERT: Users can only create relationships for their own jobs and products
CREATE POLICY "authenticated_insert_job_products"
  ON job_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_products.job_id
        AND jobs.shop_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM products
      WHERE products.id = job_products.product_id
        AND products.shop_id = auth.uid()
    )
  );

-- UPDATE: Users can only update relationships for their own jobs
CREATE POLICY "authenticated_update_job_products"
  ON job_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_products.job_id
        AND jobs.shop_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_products.job_id
        AND jobs.shop_id = auth.uid()
    )
  );

-- DELETE: Users can only delete relationships for their own jobs
CREATE POLICY "authenticated_delete_job_products"
  ON job_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_products.job_id
        AND jobs.shop_id = auth.uid()
    )
  );

-- ============================================================
-- PART 5: Removed - jobs table conflict resolved
-- ============================================================
-- Note: Duplicate jobs table migration (20251015224700) has been removed.
-- The correct jobs table definition is in 20251009120000_core_tables.sql with shop_id.
-- RLS policies for jobs table already exist in 20251009122000_rls_policies.sql.

-- ============================================================
-- PART 6: Create indexes for performance optimization
-- ============================================================
-- These indexes will improve the performance of RLS policy checks

-- Indexes for product_categories joins
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id
  ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
  ON product_categories(category_id);

-- Indexes for product_collections joins
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id
  ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id
  ON product_collections(collection_id);

-- Indexes for job_products joins (some may already exist from previous migration)
CREATE INDEX IF NOT EXISTS idx_job_products_job_id
  ON job_products(job_id);
CREATE INDEX IF NOT EXISTS idx_job_products_product_id
  ON job_products(product_id);

-- ============================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- ============================================================

-- Uncomment these to verify RLS is working correctly:

/*
-- 1. Verify RLS is enabled on all association tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('product_categories', 'product_collections', 'job_products');
-- Expected: All should show rowsecurity = true

-- 2. Count policies per table
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('product_categories', 'product_collections', 'job_products', 'jobs')
GROUP BY schemaname, tablename
ORDER BY tablename;
-- Expected: product_categories: 4, product_collections: 4, job_products: 4, jobs: 3 or 4

-- 3. List all policies for association tables
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('product_categories', 'product_collections', 'job_products')
ORDER BY tablename, cmd;

-- 4. Test as authenticated user (replace 'your-user-id' with actual UUID)
-- SET request.jwt.claim.sub = 'your-user-id';
-- SELECT * FROM product_categories; -- Should only return user's data
*/
