# Schemat bazy danych PostgreSQL

## 1. Lista tabel

### users

- **Tabela `users`** zarządzana przez Supabase Auth; nie tworzyć migracji.
- Kolumny dostarczane przez Supabase Auth: `id UUID`, `email TEXT UNIQUE`, `encrypted_password TEXT`, `confirmed_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`.

### shops

- **shop_id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **shopify_domain** VARCHAR(255) NOT NULL UNIQUE
- **api_key_encrypted** TEXT NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### products

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **shop_id** UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
- **shopify_product_id** BIGINT NOT NULL
- **name** VARCHAR(255) NOT NULL
- **sku** VARCHAR(100) NOT NULL
- **short_description** VARCHAR(500)
- **long_description** TEXT
- **status** VARCHAR(50) NOT NULL CHECK (status IN ('published','draft'))
- **metadata** JSONB NOT NULL DEFAULT '{}' /_ CHECK via JSON Schema _/
- **last_synced_at** TIMESTAMPTZ
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### categories

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **shop_id** UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
- **name** VARCHAR(255) NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### collections

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **shop_id** UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
- **name** VARCHAR(255) NOT NULL
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### product_categories

- **product_id** UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
- **category_id** UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE
- PRIMARY KEY (product_id, category_id)

### product_collections

- **product_id** UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
- **collection_id** UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE
- PRIMARY KEY (product_id, collection_id)

### prompt_templates

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **shop_id** UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
- **name** VARCHAR(255) NOT NULL
- **template** TEXT NOT NULL
- **variables** JSONB NOT NULL DEFAULT '[]' /_ dostępne zmienne _/
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at** TIMESTAMPTZ NOT NULL DEFAULT now()

### jobs

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **shop_id** UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
- **status** VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled'))
- **style** VARCHAR(50) NOT NULL CHECK (style IN ('Professional','Casual','Sales-focused'))
- **language** VARCHAR(10) NOT NULL CHECK (language IN ('pl','en'))
- **total_cost_estimate** NUMERIC(12,6)
- **publication_mode** VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (publication_mode IN ('draft','published'))
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **started_at** TIMESTAMPTZ
- **completed_at** TIMESTAMPTZ

### job_products

- **job_id** UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE
- **product_id** UUID NOT NULL REFERENCES products(id)
- **status** VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed'))
- **token_usage_details** JSONB DEFAULT '{}' /_ GIN index _/
- **cost** NUMERIC(12,6)
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- PRIMARY KEY (job_id, product_id)
- CHECK ( (SELECT COUNT(\*) FROM job_products jp WHERE jp.job_id = job_id) <= 50 )

### descriptions

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **job_id** UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE
- **product_id** UUID NOT NULL REFERENCES products(id)
- **html_content** TEXT NOT NULL
- **meta_description** VARCHAR(160)
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE (job_id, product_id)

### description_versions

- **id** UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **description_id** UUID NOT NULL REFERENCES descriptions(id) ON DELETE CASCADE
- **version_number** INT NOT NULL
- **html_content** TEXT NOT NULL
- **meta_description** VARCHAR(160)
- **created_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE (description_id, version_number)

### audit_logs

- **id** BIGSERIAL PRIMARY KEY
- **shop_id** UUID NOT NULL REFERENCES shops(shop_id)
- **table_name** TEXT NOT NULL
- **record_id** UUID NOT NULL
- **operation** VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE'))
- **changed_by** UUID NOT NULL
- **changed_at** TIMESTAMPTZ NOT NULL DEFAULT now()
- **old_data** JSONB
- **new_data** JSONB

### api_rate_limits

- **shop_id** UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE
- **service_name** VARCHAR(50) NOT NULL
- **last_request_at** TIMESTAMPTZ NOT NULL
- **request_count** INT NOT NULL
- PRIMARY KEY (shop_id, service_name)

## 2. Relacje między tabelami

- shops 1—N products
- shops 1—N categories
- shops 1—N collections
- shops 1—N prompt_templates
- shops 1—N jobs
- jobs 1—N job_products
- products M—N categories via product_categories
- products M—N collections via product_collections
- job_products 1—1 descriptions
- descriptions 1—N description_versions
- shops 1—N audit_logs

## 3. Indeksy

- **shops**: UNIQUE INDEX ON shopify_domain
- **products**: BTREE INDEX ON (shop_id, shopify_product_id), BTREE INDEX ON (shop_id, sku), GIN INDEX ON metadata
- **categories**, **collections**: BTREE INDEX ON (shop_id)
- **prompt_templates**: BTREE INDEX ON (shop_id)
- **jobs**: BTREE INDEX ON (shop_id, status)
- **job_products**: BTREE INDEX ON (job_id, status), GIN INDEX ON token_usage_details
- **descriptions**: BTREE INDEX ON (job_id, product_id)
- **description_versions**: BTREE INDEX ON (description_id), BTREE INDEX ON (created_at)
- **audit_logs**: BTREE INDEX ON (shop_id, table_name), BTREE INDEX ON (record_id), BTREE INDEX ON (changed_by)
- **api_rate_limits**: PRIMARY KEY (shop_id, service_name)

## 4. Zasady PostgreSQL (RLS)

- Włącz RLS dla wszystkich tabel zawierających kolumnę shop_id:
  ```sql
  ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "owner_access" ON <table>
    USING (shop_id = auth.uid());
  ```
- Dla audit_logs użyć policy:
  ```sql
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "audit_owner" ON audit_logs
    USING (shop_id = auth.uid());
  ```

## 5. Dodatkowe uwagi

- Transakcje batch update wykonywane w izolacji READ COMMITTED.
- Mechanizm pub/sub: `pg_notify('job_queue', payload)` dla workerów.
- Historyczne wersje w `description_versions`: archiwizacja >30 dni planowana w partycjach w przyszłych etapach.
- Backup i retencja danych: zaplanowane do implementacji w fazie produkcyjnej.
