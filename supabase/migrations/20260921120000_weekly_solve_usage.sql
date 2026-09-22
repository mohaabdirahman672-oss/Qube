-- Product-facing weekly free-solve cap (10/week, resets Monday 00:00 UTC).
-- Deliberately separate from solve_rate_limits (20260921000000): that table is a
-- rolling-window HOURLY abuse backstop and keeps doing only that. This one is the
-- real product limit, calendar-week keyed so "resets Monday" is a fact we can state
-- in the paywall UI instead of a floating per-user window.
--
-- `key` is either an authenticated user's uid (as text) or an anonymous device id
-- (see src/lib/weeklyUsage.js) — same dual-purpose keying convention already used
-- by solve_rate_limits.user_id.

create table if not exists public.weekly_solve_usage (
  key          text primary key,
  week_start   date not null,
  solve_count  int not null default 0
);

alter table public.weekly_solve_usage enable row level security;
-- No policies: accessed only via the security-definer functions below (through the
-- service role from the solve Edge Function), never directly by anon/authenticated.

-- Monday-anchored week key. date_trunc('week', ...) is already ISO (Monday-start) in
-- Postgres regardless of server locale, so this needs no extra day-of-week math.
create or replace function public.current_week_start()
returns date
language sql
stable
as $$
  select date_trunc('week', now() at time zone 'utc')::date;
$$;

-- Returns remaining solves for this key this week, without consuming one.
create or replace function public.get_weekly_solve_remaining(
  p_key text,
  p_limit int
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date;
  v_count      int;
begin
  select week_start, solve_count into v_week_start, v_count
  from public.weekly_solve_usage
  where key = p_key;

  if not found or v_week_start < public.current_week_start() then
    return p_limit;
  end if;

  return greatest(0, p_limit - v_count);
end;
$$;

-- Atomically checks + consumes one solve against this week's cap. Returns true if
-- allowed (and increments), false if the cap is already hit.
create or replace function public.check_and_increment_weekly_solve(
  p_key text,
  p_limit int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date := public.current_week_start();
  v_count      int;
begin
  insert into public.weekly_solve_usage (key, week_start, solve_count)
  values (p_key, v_week_start, 1)
  on conflict (key) do nothing;

  if found then
    return true;
  end if;

  select solve_count into v_count
  from public.weekly_solve_usage
  where key = p_key
  for update;

  -- Stale row from a prior week — start this week fresh.
  if (select week_start from public.weekly_solve_usage where key = p_key) < v_week_start then
    update public.weekly_solve_usage
    set week_start = v_week_start, solve_count = 1
    where key = p_key;
    return true;
  end if;

  if v_count >= p_limit then
    return false;
  end if;

  update public.weekly_solve_usage
  set solve_count = solve_count + 1
  where key = p_key;
  return true;
end;
$$;

-- Merges an anonymous device's usage into an account on sign-in, capped at p_limit,
-- then clears the device-keyed row. Called once, client-triggered, right after sign-in
-- — closes the "use N as guest, sign in, get N more" loop now that signing in no
-- longer bypasses the cap on its own (see docs/plans/freemium-paywall-v2.md, decision 2/3).
create or replace function public.merge_weekly_solve_usage(
  p_device_key text,
  p_user_key text,
  p_limit int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date := public.current_week_start();
  v_device_count int := 0;
  v_user_count   int := 0;
begin
  select solve_count into v_device_count
  from public.weekly_solve_usage
  where key = p_device_key and week_start = v_week_start;

  select solve_count into v_user_count
  from public.weekly_solve_usage
  where key = p_user_key and week_start = v_week_start;

  insert into public.weekly_solve_usage (key, week_start, solve_count)
  values (p_user_key, v_week_start, least(p_limit, coalesce(v_user_count, 0) + coalesce(v_device_count, 0)))
  on conflict (key) do update
  set week_start = v_week_start,
      solve_count = least(p_limit, coalesce(v_user_count, 0) + coalesce(v_device_count, 0));

  delete from public.weekly_solve_usage where key = p_device_key;
end;
$$;

revoke all on function public.get_weekly_solve_remaining(text, int) from public, anon, authenticated;
revoke all on function public.check_and_increment_weekly_solve(text, int) from public, anon, authenticated;
revoke all on function public.merge_weekly_solve_usage(text, text, int) from public, anon, authenticated;
grant execute on function public.get_weekly_solve_remaining(text, int) to service_role;
grant execute on function public.check_and_increment_weekly_solve(text, int) to service_role;
grant execute on function public.merge_weekly_solve_usage(text, text, int) to service_role;
