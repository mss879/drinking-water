-- =============================================================================
-- LUSAKO · 3/7 · CRM pipeline
-- -----------------------------------------------------------------------------
-- A kanban pipeline: stages (the board's columns), leads (the cards) and each
-- lead's activity timeline. "New Leads" is the fixed first stage: it can't be
-- renamed, moved or deleted, and website inquiries arrive there when an admin
-- moves them into the CRM. Every other stage can be added, renamed, reordered,
-- marked won/lost or deleted (its leads move to another stage first).
--
-- Needs 1/7 (admin access) and 2/7 (inquiries). Safe to run more than once.
-- =============================================================================

-- ---------------------------------------------------------------- stages ----

create table if not exists public.crm_stages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 40),
  position   integer not null,
  outcome    text not null default 'open' check (outcome in ('open', 'won', 'lost')),
  is_locked  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The fixed stage is always first and always open; every other stage comes after it.
  constraint crm_stages_fixed_first check (
    (is_locked and position = 0 and outcome = 'open') or (not is_locked and position > 0)
  )
);

comment on table public.crm_stages is 'CRM pipeline stages (board columns). The locked row is the fixed "New Leads" stage.';

-- Only one stage can be the fixed one.
create unique index if not exists crm_stages_one_locked on public.crm_stages (is_locked) where is_locked;
create index if not exists crm_stages_position_idx on public.crm_stages (position);

-- Guards the fixed stage against edits from anywhere, including the Supabase table editor.
create or replace function private.crm_guard_stage()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_locked then
      raise exception 'The % stage is fixed and can''t be deleted.', old.name using errcode = '23514';
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if old.is_locked
       and (new.name, new.position, new.outcome, new.is_locked)
           is distinct from (old.name, old.position, old.outcome, old.is_locked) then
      raise exception 'The % stage is fixed and can''t be changed.', old.name using errcode = '23514';
    end if;
    if not old.is_locked and new.is_locked then
      raise exception 'Only the first stage can be fixed.' using errcode = '23514';
    end if;
  end if;

  new.name := btrim(new.name);
  return new;
end;
$$;

drop trigger if exists crm_stages_guard on public.crm_stages;
create trigger crm_stages_guard
  before insert or update or delete on public.crm_stages
  for each row execute function private.crm_guard_stage();

drop trigger if exists crm_stages_set_updated_at on public.crm_stages;
create trigger crm_stages_set_updated_at
  before update on public.crm_stages
  for each row execute function private.set_updated_at();

-- ----------------------------------------------------------------- leads ----

create table if not exists public.crm_leads (
  id               uuid primary key default gen_random_uuid(),
  stage_id         uuid not null references public.crm_stages (id) on delete restrict,
  position         integer not null default 0,
  name             text not null check (char_length(name) between 1 and 200),
  email            text,
  phone            text,
  company          text,
  location         text,
  interest         text,
  source           text not null default 'manual'
                   check (source in ('website', 'manual', 'phone', 'whatsapp', 'referral', 'walk_in', 'event', 'other')),
  -- Estimated deal value in LKR.
  value            numeric(12, 2) check (value is null or value >= 0),
  priority         text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  follow_up_on     date,
  notes            text,
  inquiry_id       uuid unique references public.inquiries (id) on delete set null,
  stage_changed_at timestamptz not null default now(),
  -- Set when the lead enters a won or lost stage.
  closed_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.crm_leads is 'CRM leads (board cards). inquiry_id links a lead to the website inquiry it came from.';

create index if not exists crm_leads_stage_idx on public.crm_leads (stage_id, position);
create index if not exists crm_leads_follow_up_idx on public.crm_leads (follow_up_on) where follow_up_on is not null;
create index if not exists crm_leads_closed_idx on public.crm_leads (closed_at) where closed_at is not null;

-- Stamps when a lead enters a stage, and when it closes (won or lost).
create or replace function private.crm_lead_stage_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_outcome text;
begin
  if tg_op = 'INSERT' or new.stage_id is distinct from old.stage_id then
    select outcome into v_outcome from public.crm_stages where id = new.stage_id;
    new.stage_changed_at := now();
    new.closed_at := case when v_outcome in ('won', 'lost') then now() end;
  end if;
  new.name := btrim(new.name);
  return new;
end;
$$;

drop trigger if exists crm_leads_stage_fields on public.crm_leads;
create trigger crm_leads_stage_fields
  before insert or update of stage_id, name on public.crm_leads
  for each row execute function private.crm_lead_stage_fields();

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
  before update on public.crm_leads
  for each row execute function private.set_updated_at();

-- ------------------------------------------------------------ activities ----

create table if not exists public.crm_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.crm_leads (id) on delete cascade,
  kind       text not null check (kind in ('created', 'note', 'stage_change', 'call', 'email', 'whatsapp', 'meeting')),
  body       text check (body is null or char_length(body) <= 5000),
  meta       jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.crm_activities is 'Timeline of a lead: notes, calls and automatic entries for creation and stage moves.';

create index if not exists crm_activities_lead_idx on public.crm_activities (lead_id, created_at desc);
create index if not exists crm_activities_created_by_idx on public.crm_activities (created_by);

-- Writes the automatic timeline entries.
create or replace function private.crm_lead_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.crm_activities (lead_id, kind, body, meta)
    values (
      new.id,
      'created',
      case when new.inquiry_id is not null then 'Moved in from a website inquiry' else 'Lead added' end,
      jsonb_build_object('stage_id', new.stage_id)
    );
  elsif new.stage_id is distinct from old.stage_id then
    insert into public.crm_activities (lead_id, kind, body, meta)
    select new.id,
           'stage_change',
           'Moved from ' || f.name || ' to ' || t.name,
           jsonb_build_object('from', f.id, 'to', t.id, 'from_name', f.name, 'to_name', t.name)
    from public.crm_stages f, public.crm_stages t
    where f.id = old.stage_id and t.id = new.stage_id;
  end if;
  return null;
end;
$$;

drop trigger if exists crm_leads_log on public.crm_leads;
create trigger crm_leads_log
  after insert or update of stage_id on public.crm_leads
  for each row execute function private.crm_lead_log();

-- When a stage is switched between open / won / lost, its leads open or close with it.
create or replace function private.crm_stage_outcome_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.outcome is distinct from old.outcome then
    update public.crm_leads
       set closed_at = case when new.outcome = 'open' then null else coalesce(closed_at, now()) end
     where stage_id = new.id;
  end if;
  return null;
end;
$$;

drop trigger if exists crm_stages_outcome_sync on public.crm_stages;
create trigger crm_stages_outcome_sync
  after update of outcome on public.crm_stages
  for each row execute function private.crm_stage_outcome_sync();

revoke execute on function private.crm_guard_stage() from public, anon, authenticated;
revoke execute on function private.crm_lead_stage_fields() from public, anon, authenticated;
revoke execute on function private.crm_lead_log() from public, anon, authenticated;
revoke execute on function private.crm_stage_outcome_sync() from public, anon, authenticated;

-- ------------------------------------------------------- access (admins) ----

alter table public.crm_stages enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_activities enable row level security;

grant select, insert, update, delete on table public.crm_stages to authenticated;
grant select, insert, update, delete on table public.crm_leads to authenticated;
grant select, insert, update, delete on table public.crm_activities to authenticated;

drop policy if exists "Admins manage stages" on public.crm_stages;
create policy "Admins manage stages"
  on public.crm_stages for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins manage leads" on public.crm_leads;
create policy "Admins manage leads"
  on public.crm_leads for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins manage activities" on public.crm_activities;
create policy "Admins manage activities"
  on public.crm_activities for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ------------------------------------------------------------ board RPCs ----
-- These run as the caller (security invoker), so the policies above still apply.

-- Moves a lead into a stage, placed before another lead (or at the end), and renumbers that column.
create or replace function public.crm_move_lead(p_lead_id uuid, p_stage_id uuid, p_before_id uuid default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.crm_stages where id = p_stage_id) then
    raise exception 'That stage no longer exists. Refresh the board.' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.crm_leads where id = p_lead_id) then
    raise exception 'That lead no longer exists. Refresh the board.' using errcode = 'P0002';
  end if;

  -- One move per column at a time, so two open tabs can't interleave their renumbering.
  perform pg_advisory_xact_lock(hashtext('crm_stage:' || p_stage_id::text));

  update public.crm_leads set stage_id = p_stage_id where id = p_lead_id and stage_id <> p_stage_id;

  with others as (
    select id, row_number() over (order by position, created_at, id) as rn
    from public.crm_leads
    where stage_id = p_stage_id and id <> p_lead_id
  ),
  anchor as (
    select coalesce(
      (select rn from others where id = p_before_id),
      (select count(*) + 1 from others)
    ) as at
  ),
  placed as (
    select o.id, (case when o.rn >= a.at then o.rn + 1 else o.rn end)::integer as pos
    from others o cross join anchor a
    union all
    select p_lead_id, a.at::integer from anchor a
  )
  update public.crm_leads l
     set position = p.pos
    from placed p
   where l.id = p.id and l.position is distinct from p.pos;
end;
$$;

-- Saves the order of the stages after New Leads (which always stays first).
create or replace function public.crm_set_stage_order(p_stage_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  with ordered as (
    select s.id, row_number() over (order by o.ord) as pos
    from unnest(p_stage_ids) with ordinality as o (id, ord)
    join public.crm_stages s on s.id = o.id and not s.is_locked
  )
  update public.crm_stages s
     set position = o.pos::integer
    from ordered o
   where s.id = o.id and s.position is distinct from o.pos::integer;
$$;

-- Deletes a stage after moving its leads to the end of another stage (New Leads by default).
create or replace function public.crm_delete_stage(p_stage_id uuid, p_move_to uuid default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_locked boolean;
  v_target uuid;
  v_offset integer;
begin
  select is_locked into v_locked from public.crm_stages where id = p_stage_id;
  if not found then
    raise exception 'That stage no longer exists.' using errcode = 'P0002';
  end if;
  if v_locked then
    raise exception 'The New Leads stage is fixed and can''t be deleted.' using errcode = '23514';
  end if;

  v_target := coalesce(p_move_to, (select id from public.crm_stages where is_locked));
  if v_target is null or v_target = p_stage_id
     or not exists (select 1 from public.crm_stages where id = v_target) then
    raise exception 'Choose another stage for these leads.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('crm_stage:' || v_target::text));
  select coalesce(max(position), 0) into v_offset from public.crm_leads where stage_id = v_target;

  update public.crm_leads l
     set stage_id = v_target,
         position = v_offset + r.rn::integer
    from (
      select id, row_number() over (order by position, created_at, id) as rn
      from public.crm_leads
      where stage_id = p_stage_id
    ) r
   where l.id = r.id;

  delete from public.crm_stages where id = p_stage_id;
end;
$$;

-- Moves website inquiries into New Leads (on top, first id topmost). Running it again for an
-- inquiry that's already in the CRM just returns its lead. p_interests lines up with p_inquiry_ids.
create or replace function public.crm_convert_inquiries(p_inquiry_ids uuid[], p_interests text[] default null)
returns table (inquiry_id uuid, lead_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_stage   uuid;
  v_top     integer;
  v_idx     integer;
  v_id      uuid;
  v_lead    uuid;
  v_inquiry public.inquiries%rowtype;
begin
  select id into v_stage from public.crm_stages where is_locked;
  if v_stage is null then
    raise exception 'The New Leads stage is missing. Run the CRM migration again.' using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(hashtext('crm_stage:' || v_stage::text));

  for v_idx in reverse coalesce(array_length(p_inquiry_ids, 1), 0) .. 1 loop
    v_id := p_inquiry_ids[v_idx];
    select l.id into v_lead from public.crm_leads l where l.inquiry_id = v_id;

    if v_lead is null then
      select * into v_inquiry from public.inquiries i where i.id = v_id;
      continue when not found;

      select coalesce(min(l.position), 1) - 1 into v_top from public.crm_leads l where l.stage_id = v_stage;

      insert into public.crm_leads (stage_id, position, name, email, phone, company, location, interest, source, notes, inquiry_id)
      values (v_stage, v_top, v_inquiry.name, v_inquiry.email, v_inquiry.phone, v_inquiry.company, v_inquiry.location,
              p_interests[v_idx], 'website', v_inquiry.message, v_inquiry.id)
      returning id into v_lead;

      update public.inquiries i
         set read_at = coalesce(i.read_at, now()),
             status  = case when i.status = 'new' then 'in_progress' else i.status end
       where i.id = v_id;
    end if;

    inquiry_id := v_id;
    lead_id := v_lead;
    return next;
  end loop;
end;
$$;

revoke execute on function public.crm_move_lead(uuid, uuid, uuid) from public, anon;
revoke execute on function public.crm_set_stage_order(uuid[]) from public, anon;
revoke execute on function public.crm_delete_stage(uuid, uuid) from public, anon;
revoke execute on function public.crm_convert_inquiries(uuid[], text[]) from public, anon;
grant execute on function public.crm_move_lead(uuid, uuid, uuid) to authenticated;
grant execute on function public.crm_set_stage_order(uuid[]) to authenticated;
grant execute on function public.crm_delete_stage(uuid, uuid) to authenticated;
grant execute on function public.crm_convert_inquiries(uuid[], text[]) to authenticated;

-- ---------------------------------------------------------- default board ----

-- Only on an empty board, so stages an admin deleted don't come back on a re-run.
insert into public.crm_stages (name, position, outcome, is_locked)
select defaults.name, defaults.position, defaults.outcome, defaults.is_locked
from (
  values
    ('New Leads', 0, 'open', true),
    ('Contacted', 1, 'open', false),
    ('Site Visit', 2, 'open', false),
    ('Quotation Sent', 3, 'open', false),
    ('Won', 4, 'won', false),
    ('Lost', 5, 'lost', false)
) as defaults (name, position, outcome, is_locked)
where not exists (select 1 from public.crm_stages);

-- The fixed first stage must always exist.
insert into public.crm_stages (name, position, outcome, is_locked)
select 'New Leads', 0, 'open', true
where not exists (select 1 from public.crm_stages where is_locked);
