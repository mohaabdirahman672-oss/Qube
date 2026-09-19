-- Per-user rate limiting for the solve Edge Function.
-- Fixed window per user: N requests per window, reset when the window expires.

create table if not exists public.solve_rate_limits (
  user_id       uuid primary key,
  window_start  timestamptz not null default now(),
  request_count int not null default 0
);

alter table public.solve_rate_limits enable row level security;
-- No policies: only accessed via the security definer function below (through the
-- service role, which bypasses RLS) or directly as service_role, never via the
-- client anon/authenticated roles.

create or replace function public.check_and_increment_rate_limit(
  p_user_id uuid,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count        int;
begin
  insert into public.solve_rate_limits (user_id, window_start, request_count)
  values (p_user_id, now(), 1)
  on conflict (user_id) do nothing;

  if found then
    return true;
  end if;

  select window_start, request_count into v_window_start, v_count
  from public.solve_rate_limits
  where user_id = p_user_id
  for update;

  if now() - v_window_start > make_interval(secs => p_window_seconds) then
    update public.solve_rate_limits
    set window_start = now(), request_count = 1
    where user_id = p_user_id;
    return true;
  end if;

  if v_count >= p_limit then
    return false;
  end if;

  update public.solve_rate_limits
  set request_count = request_count + 1
  where user_id = p_user_id;
  return true;
end;
$$;

revoke all on function public.check_and_increment_rate_limit(uuid, int, int) from public, anon, authenticated;
grant execute on function public.check_and_increment_rate_limit(uuid, int, int) to service_role;
