import { createClient } from "@supabase/supabase-js";

function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return createClient(supabaseUrl, supabasePublishableKey);
}

type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

let supabaseBrowserClient: SupabaseBrowserClient | null = null;

export function getSupabaseBrowser() {
  supabaseBrowserClient ??= createSupabaseBrowserClient();
  return supabaseBrowserClient;
}

export const supabaseBrowser = new Proxy({} as SupabaseBrowserClient, {
  get(_target, property) {
    const client = getSupabaseBrowser();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
