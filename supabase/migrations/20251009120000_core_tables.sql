-- migration: tworzy podstawowe tabele (core tables)
-- cel: utworzenie tabel shops, products, categories, collections, prompt_templates, jobs, api_rate_limits, audit_logs
-- uwagi: wszystkie polecenia i identyfikatory w lower-case, bez rls

create table if not exists shops (
  shop_id uuid primary key default gen_random_uuid(),
  shopify_domain varchar(255) not null unique,
  api_key_encrypted text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(shop_id) on delete cascade,
  shopify_product_id bigint not null,
  name varchar(255) not null,
  sku varchar(100) not null,
  short_description varchar(500),
  long_description text,
  status varchar(50) not null check (status in ('published','draft')),
  metadata jsonb not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on products using btree (shop_id, shopify_product_id);
create index on products using btree (shop_id, sku);
create index on products using gin (metadata);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(shop_id) on delete cascade,
  name varchar(255) not null,
  created_at timestamptz not null default now()
);
create index on categories using btree (shop_id);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(shop_id) on delete cascade,
  name varchar(255) not null,
  created_at timestamptz not null default now()
);
create index on collections using btree (shop_id);

create table if not exists prompt_templates (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(shop_id) on delete cascade,
  name varchar(255) not null,
  template text not null,
  variables jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on prompt_templates using btree (shop_id);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(shop_id) on delete cascade,
  status varchar(50) not null default 'pending' check (status in ('pending','processing','completed','failed','cancelled')),
  style varchar(50) not null check (style in ('professional','casual','sales-focused')),
  language varchar(10) not null check (language in ('pl','en')),
  total_cost_estimate numeric(12,6),
  publication_mode varchar(50) not null default 'draft' check (publication_mode in ('draft','published')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index on jobs using btree (shop_id, status);

create table if not exists api_rate_limits (
  shop_id uuid not null references shops(shop_id) on delete cascade,
  service_name varchar(50) not null,
  last_request_at timestamptz not null,
  request_count int not null,
  primary key (shop_id, service_name)
);

create table if not exists audit_logs (
  id bigserial primary key,
  shop_id uuid not null references shops(shop_id),
  table_name text not null,
  record_id uuid not null,
  operation varchar(10) not null check (operation in ('insert','update','delete')),
  changed_by uuid not null,
  changed_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);
create index on audit_logs using btree (shop_id, table_name);
create index on audit_logs using btree (record_id);
create index on audit_logs using btree (changed_by);
