-- Dodanie kolumny api_key_iv do tabeli shops
ALTER TABLE shops
ADD COLUMN api_key_iv text NOT NULL DEFAULT '';
