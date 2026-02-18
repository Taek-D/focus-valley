-- Focus Valley: read-only subscription entitlements for authenticated users
-- This table should be updated by trusted backend/webhook logic using service role.

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_end timestamptz,
  provider text,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

-- Users can only read their own entitlement row.
create policy "Users can read own subscription data"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- Intentionally no insert/update/delete policies:
-- client sessions must not be able to grant or modify entitlements.

drop trigger if exists set_updated_at_user_subscriptions on public.user_subscriptions;
create trigger set_updated_at_user_subscriptions
  before update on public.user_subscriptions
  for each row
  execute function public.handle_updated_at();
