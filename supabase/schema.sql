-- Initial backend scaffold for Get Whole Project.
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_initials text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can read their own journal entries"
on public.journal_entries for select
using (auth.uid() = user_id);

create policy "Users can insert their own journal entries"
on public.journal_entries for insert
with check (auth.uid() = user_id);

create policy "Users can update their own journal entries"
on public.journal_entries for update
using (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
on public.journal_entries for delete
using (auth.uid() = user_id);

create policy "Users can read their own subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_initials)
  values (
    new.id,
    upper(left(coalesce(new.raw_user_meta_data->>'name', new.email, 'U'), 2))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
