create table if not exists public.campaign_reward_entries (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique
    check (wallet_address ~ '^0x[a-f0-9]{40}$'),
  x_post_id text not null unique
    check (x_post_id ~ '^[0-9]{8,25}$'),
  x_post_url text not null
    check (x_post_url ~ '^https://(www\.)?(x\.com|twitter\.com)/'),
  created_at timestamptz not null default now()
);

alter table public.campaign_reward_entries enable row level security;

revoke all on table public.campaign_reward_entries from anon, authenticated;
grant all on table public.campaign_reward_entries to service_role;
