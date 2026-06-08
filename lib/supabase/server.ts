import { createClient } from "@supabase/supabase-js";

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  return createClient<any>(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

let supabaseAdminClient: SupabaseAdminClient | null = null;

export function getSupabaseAdmin() {
  supabaseAdminClient ??= createSupabaseAdminClient();
  return supabaseAdminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseAdminClient, {
  get(_target, property) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
