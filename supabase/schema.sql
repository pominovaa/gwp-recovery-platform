-- Initial backend scaffold for Get Whole Project.
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_initials text,
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

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;

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
