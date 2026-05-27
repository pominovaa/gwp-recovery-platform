import { vi } from "vitest";

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";
process.env.SUPABASE_SECRET_KEY ||= "test-secret-key";
process.env.NEXT_PUBLIC_SITE_URL ||= "http://localhost:3000";

const createTableQuery = () => ({
  select: vi.fn(() => createTableQuery()),
  eq: vi.fn(() => createTableQuery()),
  maybeSingle: vi.fn(async () => ({ data: null, error: null })),
  update: vi.fn(() => createTableQuery()),
});

vi.mock("@/lib/supabase/browser", () => ({
  supabaseBrowser: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signInWithPassword: vi.fn(async () => ({ data: { session: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: null }, error: null })),
    },
    from: vi.fn(() => createTableQuery()),
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => createTableQuery()),
  },
}));
