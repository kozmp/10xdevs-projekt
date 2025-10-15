/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface User {
  id: string;
  email: string | null;
}

declare namespace App {
  interface Locals {
    user: User | null;
    supabase: import('@supabase/supabase-js').SupabaseClient;
  }
}