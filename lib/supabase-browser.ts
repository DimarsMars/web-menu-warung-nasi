"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase untuk komponen di sisi browser (Client Component).
 * Session login disimpan di cookie, dikelola otomatis oleh @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
