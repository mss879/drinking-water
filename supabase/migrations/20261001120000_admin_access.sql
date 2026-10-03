-- =============================================================================
-- LUSAKO · 1/7 · Admin access
-- -----------------------------------------------------------------------------
-- Who may use /admin. Accounts live in Supabase Auth; this table says which of
-- them are admins. Anyone else who manages to sign in sees nothing: every table
-- in the following migrations checks private.is_admin() in its policies.
--
-- After running all seven migrations:
--   1. Authentication → Users → Add user (email + password, tick "Auto Confirm User").
--   2. Put that email in supabase/setup-admin.sql and run it.
--
-- Safe to run more than once.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is 'Supabase Auth users who may use the LUSAKO admin. Add rows with supabase/setup-admin.sql.';

alter table public.admin_users enable row level security;

grant select on table public.admin_users to authenticated;
grant select, insert, update, delete on table public.admin_users to service_role;

-- Each admin can read their own row; the app uses this to check access after sign-in.
drop policy if exists "Users can see their own admin row" on public.admin_users;
create policy "Users can see their own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- True when the signed-in user is on the list. Used by every policy that follows.
-- It lives in the private schema, so it isn't exposed as an API endpoint.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

-- Keeps updated_at current on every table that has one.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;
