-- migration: tworzy tabele powiązań (association tables)
-- cel: utworzenie tabel product_categories, product_collections, job_products
-- uwagi: wszystkie polecenia i identyfikatory w lower-case, bez rls

create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists product_collections (
  product_id uuid not null references products(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

create table if not exists job_products (
  job_id uuid not null references jobs(id) on delete cascade,
  product_id uuid not null references products(id),
  status varchar(50) not null default 'pending' check (status in ('pending','processing','completed','failed')),
  token_usage_details jsonb default '{}',
  cost numeric(12,6),
  created_at timestamptz not null default now(),
  primary key (job_id, product_id)
  -- enforcement of max 50 job_products per job must be handled via trigger or application logic (postgres does not allow subquery in check constraint)
);
create index on job_products using btree (job_id, status);
create index on job_products using gin (token_usage_details);
