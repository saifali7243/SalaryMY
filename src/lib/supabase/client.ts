"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Browser-side Supabase client. Use this inside Client Components
 * (e.g. the salary submission form).
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
