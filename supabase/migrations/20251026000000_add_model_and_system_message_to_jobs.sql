-- migration: dodaje kolumny model i system_message do tabeli jobs
-- cel: wsparcie dla F4 (Dynamiczny Wybór Modelu i Kontekst Generacji)
-- data: 2025-10-26

-- Dodaj kolumnę model (opcjonalna, domyślnie openai/gpt-4o-mini)
alter table jobs
  add column if not exists model varchar(100) default 'openai/gpt-4o-mini';

-- Dodaj kolumnę system_message (opcjonalna, maksymalnie 6000 znaków)
alter table jobs
  add column if not exists system_message varchar(6000);

-- Dodaj komentarze dla dokumentacji
comment on column jobs.model is 'LLM model used for generation (e.g., openai/gpt-4o, anthropic/claude-3-haiku)';
comment on column jobs.system_message is 'Custom system message/prompt for AI generation (max 6000 chars)';
