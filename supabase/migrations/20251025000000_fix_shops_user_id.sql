-- migration: naprawia architekturę shops - dodaje user_id i poprawia RLS
-- cel: umożliwienie modelu 1 user = wiele sklepów
-- kontext: kod ShopService używa user_id, ale kolumna nie istniała w DB

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
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY authenticated_insert ON shops
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY authenticated_update ON shops
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY authenticated_delete ON shops
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 7. Usuń stare RLS policies dla products (też używają shop_id zamiast user_id)
DROP POLICY IF EXISTS authenticated_select ON products;
DROP POLICY IF EXISTS authenticated_insert ON products;
DROP POLICY IF EXISTS authenticated_update ON products;
DROP POLICY IF EXISTS authenticated_delete ON products;

-- 8. Utwórz nowe RLS policies dla products (JOIN przez shops.user_id)
CREATE POLICY authenticated_select ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.shop_id = products.shop_id
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY authenticated_insert ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.shop_id = products.shop_id
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY authenticated_update ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.shop_id = products.shop_id
      AND shops.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.shop_id = products.shop_id
      AND shops.user_id = auth.uid()
    )
  );

CREATE POLICY authenticated_delete ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.shop_id = products.shop_id
      AND shops.user_id = auth.uid()
    )
  );

-- 9. Podobnie dla categories, collections, jobs (wszystkie zależą od shop_id)
-- Categories
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

-- Collections
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

-- Jobs
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

-- Prompt Templates
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

-- API Rate Limits
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

-- Audit Logs
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
