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

    const { supabaseBrowser } = await import("./browser");

    expect(() => supabaseBrowser.auth).toThrow("Missing NEXT_PUBLIC_SUPABASE_URL");
  });

  it("browser client creates a Supabase client", async () => {
    const createClient = vi.fn(() => ({ client: "browser" }));
    vi.doMock("@supabase/supabase-js", () => ({ createClient }));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "pk_test");
    vi.doUnmock("@/lib/supabase/browser");

    const browserModule = await import("./browser");

    expect(browserModule.getSupabaseBrowser()).toEqual({ client: "browser" });
    expect(createClient).toHaveBeenCalledWith("https://example.supabase.co", "pk_test");
  });

  it("browser proxy forwards getters and binds methods to the real client", async () => {
    const client = {
      get requiresClientReceiver() {
        if (this !== client) {
          throw new Error("expected real browser client receiver");
        }
        return "browser receiver";
      },
      from() {
        return this === client ? "browser bound" : "browser unbound";
      },
    };
    const createClient = vi.fn(() => client);
    vi.doMock("@supabase/supabase-js", () => ({ createClient }));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "pk_test");
    vi.doUnmock("@/lib/supabase/browser");

    const { supabaseBrowser } = await import("./browser");

    expect((supabaseBrowser as any).requiresClientReceiver).toBe("browser receiver");
    expect((supabaseBrowser as any).from()).toBe("browser bound");
  });

  it("server client requires private Supabase env vars", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.doUnmock("@/lib/supabase/server");

    const { supabaseAdmin } = await import("./server");

    expect(() => supabaseAdmin.auth).toThrow("Missing NEXT_PUBLIC_SUPABASE_URL");
  });

  it("server client creates an admin Supabase client without persisted auth", async () => {
    const createClient = vi.fn(() => ({ client: "server" }));
    vi.doMock("@supabase/supabase-js", () => ({ createClient }));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret");
    vi.doUnmock("@/lib/supabase/server");

    const serverModule = await import("./server");

    expect(serverModule.getSupabaseAdmin()).toEqual({ client: "server" });
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

  it("server proxy forwards getters and binds methods to the real client", async () => {
    const client = {
      get requiresClientReceiver() {
        if (this !== client) {
          throw new Error("expected real server client receiver");
        }
        return "server receiver";
      },
      from() {
        return this === client ? "server bound" : "server unbound";
      },
    };
    const createClient = vi.fn(() => client);
    vi.doMock("@supabase/supabase-js", () => ({ createClient }));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret");
    vi.doUnmock("@/lib/supabase/server");

    const { supabaseAdmin } = await import("./server");

    expect((supabaseAdmin as any).requiresClientReceiver).toBe("server receiver");
    expect((supabaseAdmin as any).from()).toBe("server bound");
  });
});
