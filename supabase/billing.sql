-- Billing additions for Get Whole Project.
-- Run this once in the Supabase SQL editor after the initial schema.

alter table public.profiles
add column if not exists stripe_customer_id text;

create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  plan_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'Users can read their own subscriptions'
  ) then
    create policy "Users can read their own subscriptions"
    on public.subscriptions for select
    using (auth.uid() = user_id);
  end if;
end;
$$;
