-- ===========================================================================
-- Close the RPC surface on server-only functions.
--
-- Postgres grants EXECUTE on new functions to PUBLIC, and Supabase exposes
-- every public-schema function at /rest/v1/rpc/<name>. apply_competency and
-- touch_streak are security definer and take a user id, so until now anyone,
-- signed in or not, could rewrite any player's competency scores or streak.
-- Only the grading route (service role) should call them.
--
-- handle_new_user only runs as a trigger, which needs no EXECUTE grant.
-- ===========================================================================

revoke execute on function public.apply_competency(uuid, public.competency_kind, numeric, numeric)
  from public, anon, authenticated;
revoke execute on function public.touch_streak(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.apply_competency(uuid, public.competency_kind, numeric, numeric) to service_role;
grant execute on function public.touch_streak(uuid) to service_role;

-- Pin name resolution, as handle_new_user already does. Their bodies use
-- unqualified names from public, so pin to that rather than to ''.
alter function public.apply_competency(uuid, public.competency_kind, numeric, numeric) set search_path = public;
alter function public.touch_streak(uuid) set search_path = public;
