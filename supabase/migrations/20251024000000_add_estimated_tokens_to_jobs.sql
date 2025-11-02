-- migration: dodaje kolumnę estimated_tokens_total do tabeli jobs
-- cel: przechowywanie szacunkowej liczby tokenów dla asynchronicznej kalkulacji kosztów
-- kontekst: Funkcjonalność 2 (Pre-Generacyjna Kalkulacja Kosztów) - model asynchroniczny

-- Dodaj kolumnę estimated_tokens_total do tabeli jobs
alter table jobs
  add column if not exists estimated_tokens_total integer;

-- Dodaj comment dla dokumentacji
comment on column jobs.estimated_tokens_total is
  'Estimated total tokens (input + output) for job generation. Calculated asynchronously after job creation.';

-- Dodaj index dla szybkiego dostępu do jobów z kalkulacją kosztów
create index if not exists idx_jobs_cost_estimation
  on jobs(id)
  where total_cost_estimate is not null and estimated_tokens_total is not null;
