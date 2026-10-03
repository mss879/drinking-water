-- =============================================================================
-- LUSAKO · 2/7 · Inquiries
-- -----------------------------------------------------------------------------
-- Every request sent through the website's forms (buy, rental, corporate,
-- service). The website writes rows from the server with the secret key; only
-- admins can read or change them.
--
-- Needs 1/7 (admin access). Safe to run more than once.
-- =============================================================================

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  form_type   text not null check (form_type in ('buy', 'rental', 'corporate', 'service')),
  status      text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  read_at     timestamptz,
  name        text not null check (char_length(name) between 1 and 200),
  email       text,
  phone       text,
  company     text,
  location    text,
  message     text,
  -- Every other field the form collected, keyed by its name in content/forms.ts.
  details     jsonb not null default '{}'::jsonb,
  -- Where the visitor came from (page they sent it from, first referrer, UTM tags, analytics ids).
  page_path   text,
  referrer    text,
  utm         jsonb,
  visitor_id  uuid,
  session_id  uuid,
  admin_notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.inquiries is 'Requests from the website forms. Written by the server, read by admins.';

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status, created_at desc);
create index if not exists inquiries_unread_idx on public.inquiries (created_at desc) where read_at is null;
create index if not exists inquiries_session_idx on public.inquiries (session_id) where session_id is not null;

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function private.set_updated_at();

alter table public.inquiries enable row level security;

grant select, insert, update, delete on table public.inquiries to authenticated;
-- The website inserts with the secret key; `returning` needs select.
grant select, insert on table public.inquiries to service_role;

drop policy if exists "Admins read inquiries" on public.inquiries;
create policy "Admins read inquiries"
  on public.inquiries for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins add inquiries" on public.inquiries;
create policy "Admins add inquiries"
  on public.inquiries for insert
  to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins update inquiries" on public.inquiries;
create policy "Admins update inquiries"
  on public.inquiries for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins delete inquiries" on public.inquiries;
create policy "Admins delete inquiries"
  on public.inquiries for delete
  to authenticated
  using ((select private.is_admin()));

-- Live updates for the admin's unread badge (Supabase Realtime respects the policies above).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inquiries'
     ) then
    alter publication supabase_realtime add table public.inquiries;
  end if;
end;
$$;
