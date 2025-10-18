-- Verification queries for RLS migration

-- 1. Check if RLS is enabled on all association tables
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('product_categories', 'product_collections', 'job_products')
ORDER BY tablename;

-- 2. Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('product_categories', 'product_collections', 'job_products', 'jobs')
GROUP BY tablename
ORDER BY tablename;

-- 3. List all policies for association tables
SELECT
  tablename,
  policyname,
  cmd as "Command",
  CASE
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Modify'
    WHEN cmd = 'DELETE' THEN 'Remove'
  END as "Operation"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('product_categories', 'product_collections', 'job_products')
ORDER BY tablename, cmd;

-- 4. Check if indexes were created
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('product_categories', 'product_collections', 'job_products')
ORDER BY tablename, indexname;

-- 5. Detailed policy information
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual IS NOT NULL as "Has USING clause",
  with_check IS NOT NULL as "Has WITH CHECK clause"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('product_categories', 'product_collections', 'job_products')
ORDER BY tablename, cmd;
