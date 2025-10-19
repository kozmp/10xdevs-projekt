import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("PUBLIC_SUPABASE_URL is required");
if (!supabaseAnonKey) throw new Error("PUBLIC_SUPABASE_ANON_KEY is required");

// Klient dla przeglądarki
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Klient dla serwera
interface ServerClientOptions {
  cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options: any) => void;
  };
  headers: Headers;
}

export function createSupabaseServerInstance({ cookies, headers }: ServerClientOptions) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      storage: {
        getItem: (key: string) => {
          return cookies.get(key)?.value;
        },
        setItem: (key: string, value: string) => {
          cookies.set(key, value, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: import.meta.env.PROD,
          });
        },
        removeItem: (key: string) => {
          cookies.set(key, "", {
            path: "/",
            expires: new Date(0),
          });
        },
      },
    },
    global: {
      headers: {
        "X-Client-Info": "supabase-js/2.39.7",
      },
    },
  });
}
