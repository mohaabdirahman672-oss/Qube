-- Splits "check eligibility" from "charge a solve" for the weekly free-tier cap.
-- check_and_increment_weekly_solve (20260921120000) does both atomically, which
-- meant solve/index.js had to call it BEFORE calling OpenAI — so a failed/errored
-- OpenAI request still consumed a solve. This RPC is increment-only (no limit
-- check, since solve/index.js already confirmed eligibility via
-- get_weekly_solve_remaining before making the OpenAI call) and is called only
-- after a successful AI response, so failures are never charged against the limit.
--
-- check_and_increment_weekly_solve is left in place (harmless, unused by the app
-- now) rather than dropped — no benefit to removing a working DB function.

create or replace function public.increment_weekly_solve(
  p_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date := public.current_week_start();
begin
  insert into public.weekly_solve_usage (key, week_start, solve_count)
  values (p_key, v_week_start, 1)
  on conflict (key) do update
  set solve_count = case
        when public.weekly_solve_usage.week_start < v_week_start then 1
        else public.weekly_solve_usage.solve_count + 1
      end,
      week_start = v_week_start;
end;
$$;

revoke all on function public.increment_weekly_solve(text) from public, anon, authenticated;
grant execute on function public.increment_weekly_solve(text) to service_role;
