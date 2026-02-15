-- Focus Valley: user_sync table for cloud sync
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

create table if not exists public.user_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.user_sync enable row level security;

-- Users can only read their own row
create policy "Users can read own sync data"
  on public.user_sync for select
  using (auth.uid() = user_id);

-- Users can insert their own row
create policy "Users can insert own sync data"
  on public.user_sync for insert
  with check (auth.uid() = user_id);

-- Users can update their own row
create policy "Users can update own sync data"
  on public.user_sync for update
  using (auth.uid() = user_id);

-- Users can delete their own row (GDPR right to erasure)
create policy "Users can delete own sync data"
  on public.user_sync for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.user_sync
  for each row
  execute function public.handle_updated_at();
