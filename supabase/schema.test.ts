import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("supabase schema", () => {
  it("includes profile and journal RLS policies", () => {
    const schema = fs.readFileSync("supabase/schema.sql", "utf8");

    expect(schema).toContain("alter table public.profiles enable row level security");
    expect(schema).toContain("alter table public.journal_entries enable row level security");
    expect(schema).toContain("Users can read their own journal entries");
  });

  it("includes billing subscription storage", () => {
    const schema = fs.readFileSync("supabase/billing.sql", "utf8");

    expect(schema).toContain("stripe_customer_id");
    expect(schema).toContain("create table if not exists public.subscriptions");
    expect(schema).toContain("Users can read their own subscriptions");
  });
});
