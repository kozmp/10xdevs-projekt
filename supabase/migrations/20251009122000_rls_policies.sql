-- migration: dodaje row level security dla tabel ze shop_id
-- cel: zabezpieczenie dostępu tylko dla zalogowanych użytkowników
-- uwagi: anonimowi mają domyślnie odmowę dostępu

alter table shops enable row level security;
-- pozwala tylko zalogowanym na select z warunkiem shop_id = auth.uid()
create policy authenticated_select on shops
  for select
  to authenticated
  using (shop_id = auth.uid());
-- pozwala tylko zalogowanym na insert z warunkiem shop_id = auth.uid()
create policy authenticated_insert on shops
  for insert
  to authenticated
  with check (shop_id = auth.uid());
-- pozwala tylko zalogowanym na update
create policy authenticated_update on shops
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
-- pozwala tylko zalogowanym na delete
create policy authenticated_delete on shops
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table products enable row level security;
create policy authenticated_select on products
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on products
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on products
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on products
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table categories enable row level security;
create policy authenticated_select on categories
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on categories
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on categories
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on categories
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table collections enable row level security;
create policy authenticated_select on collections
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on collections
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on collections
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on collections
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table prompt_templates enable row level security;
create policy authenticated_select on prompt_templates
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on prompt_templates
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on prompt_templates
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on prompt_templates
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table jobs enable row level security;
create policy authenticated_select on jobs
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on jobs
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on jobs
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on jobs
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table api_rate_limits enable row level security;
create policy authenticated_select on api_rate_limits
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on api_rate_limits
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on api_rate_limits
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on api_rate_limits
  for delete
  to authenticated
  using (shop_id = auth.uid());

alter table audit_logs enable row level security;
create policy authenticated_select on audit_logs
  for select
  to authenticated
  using (shop_id = auth.uid());
create policy authenticated_insert on audit_logs
  for insert
  to authenticated
  with check (shop_id = auth.uid());
create policy authenticated_update on audit_logs
  for update
  to authenticated
  using (shop_id = auth.uid())
  with check (shop_id = auth.uid());
create policy authenticated_delete on audit_logs
  for delete
  to authenticated
  using (shop_id = auth.uid());
