import { afterEach, describe, expect, it, vi } from "vitest";

describe("Supabase client configuration", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.doUnmock("@supabase/supabase-js");
    vi.doMock("@/lib/supabase/browser");
    vi.doMock("@/lib/supabase/server");
  });

  it("browser client requires public Supabase env vars", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.doUnmock("@/lib/supabase/browser");

    await expect(import("./browser")).rejects.toThrow("Missing NEXT_PUBLIC_SUPABASE_URL");
  });

  it("browser client creates a Supabase client", async () => {
    const createClient = vi.fn(() => ({ client: "browser" }));
    vi.doMock("@supabase/supabase-js", () => ({ createClient }));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "pk_test");
    vi.doUnmock("@/lib/supabase/browser");

    const module = await import("./browser");

    expect(module.supabaseBrowser).toEqual({ client: "browser" });
    expect(createClient).toHaveBeenCalledWith("https://example.supabase.co", "pk_test");
  });

  it("server client requires private Supabase env vars", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.doUnmock("@/lib/supabase/server");

    await expect(import("./server")).rejects.toThrow("Missing NEXT_PUBLIC_SUPABASE_URL");
  });

  it("server client creates an admin Supabase client without persisted auth", async () => {
    const createClient = vi.fn(() => ({ client: "server" }));
    vi.doMock("@supabase/supabase-js", () => ({ createClient }));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret");
    vi.doUnmock("@/lib/supabase/server");

    const module = await import("./server");

    expect(module.supabaseAdmin).toEqual({ client: "server" });
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "secret",
      expect.objectContaining({
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    );
  });
});
