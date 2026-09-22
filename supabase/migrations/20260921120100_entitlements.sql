-- Premium entitlement state, synced from RevenueCat webhook events
-- (supabase/functions/revenuecat-webhook). This table, not the client SDK's own
-- entitlement check, is the source of truth the solve function trusts — a client-
-- supplied "I'm premium" flag would be trivially spoofable (same mistake class as
-- the pre-KI-R8 bundled OpenAI key).
--
-- Keyed by Supabase auth uid. Premium requires an account (RevenueCat purchases are
-- tied to an Apple ID, and we need a stable key to check server-side) — anonymous
-- guests can browse the paywall and start a trial, but completing a purchase implies
-- being signed in so this row has somewhere to live.

create table if not exists public.user_entitlements (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  revenuecat_user_id text not null,
  is_premium         boolean not null default false,
  product_id         text,
  expires_at         timestamptz,
  will_renew         boolean not null default false,
  updated_at         timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

-- Users can read their own entitlement row directly (used for optimistic UI /
-- Profile screen display) — but only the service role (webhook + solve function)
-- can write it.
create policy "Users can read their own entitlement"
  on public.user_entitlements for select
  using (auth.uid() = user_id);

create index if not exists user_entitlements_revenuecat_user_id_idx
  on public.user_entitlements (revenuecat_user_id);

create or replace function public.is_user_premium(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_premium and (expires_at is null or expires_at > now())
     from public.user_entitlements
     where user_id = p_user_id),
    false
  );
$$;

revoke all on function public.is_user_premium(uuid) from public, anon, authenticated;
grant execute on function public.is_user_premium(uuid) to service_role;
