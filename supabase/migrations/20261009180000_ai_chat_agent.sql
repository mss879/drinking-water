-- =============================================================================
-- LUSAKO · 10/10 · AI chat agent
-- -----------------------------------------------------------------------------
-- The website's chat assistant. Visitors ask about purifiers, renting, AMC plans and prices; the assistant answers
-- from what the admin publishes, collects their details and puts qualified leads straight into the CRM. Every
-- conversation is kept so the team can read exactly what each visitor asked, and any chat can be taken over by a
-- person, which switches the assistant off for that chat until it is handed back.
--
--   1. chat_settings: the assistant's settings, one row (on or off, its name and greeting, which prices it may
--      quote, extra instructions, where alerts go). Only admins and the website's server can read it.
--   2. chat_sessions: one row per conversation, with what the assistant learned about the visitor, whether the
--      assistant or a team member is answering, and the CRM lead the chat became.
--   3. chat_messages: every message in order: the visitor's, the assistant's and the team's.
--   4. CRM: leads can come from "Website chat"; chat_save_lead() adds (or updates) a chat's lead in New Leads.
--
-- The website's server reads and writes chats with the secret key, and only ever shows visitors their own
-- conversation (each browser holds a secret; the database keeps only its hash). Admins read everything here.
--
-- Needs 1/7 (admin access) and 3/7 (CRM). Safe to run more than once.
-- =============================================================================

-- ------------------------------------------------------------- settings ----

create table if not exists public.chat_settings (
  -- There is only ever one row.
  id             boolean primary key default true check (id),
  -- Show the chat button on the website.
  widget_enabled boolean not null default true,
  -- The assistant answers. Off: chats wait for a team member (live chat only).
  ai_enabled     boolean not null default true,
  assistant_name text not null default 'LUSAKO Assistant' check (char_length(assistant_name) between 1 and 40),
  greeting       text not null default 'Hi! I’m the LUSAKO assistant. I can help you choose a water purifier, compare buying and renting, explain AMC plans and prices, or arrange a quote or a call back. What can I help you with?'
                 check (char_length(greeting) between 1 and 400),
  -- The short line beside the chat button on computers, once per visit. Empty: no line.
  teaser         text not null default 'Questions about purifiers, renting or prices? Ask me.' check (char_length(teaser) <= 90),
  -- The suggested first questions under the greeting.
  quick_replies  text[] not null default array[
                   'Which purifier suits my home?',
                   'How much is it to rent for an office?',
                   'Tell me about AMC plans',
                   'I need water for my company'
                 ]::text[] check (cardinality(quick_replies) <= 4),
  -- Which prices the assistant may quote: every amount in Prices & quotes (shown on the website or not), only the
  -- ones shown on the website, or no purifier prices at all (it arranges a quote; AMC and filter prices are public).
  price_mode     text not null default 'all' check (price_mode in ('all', 'shown', 'none')),
  -- Ask for a name and phone number before quoting purifier prices.
  contact_first  boolean not null default false,
  -- Email the visitor a copy of their quote when they ask for one (needs RESEND_API_KEY).
  email_quotes   boolean not null default true,
  -- Extra knowledge and rules from the team: offers, delivery areas, anything to say or avoid.
  instructions   text not null default '' check (char_length(instructions) <= 4000),
  -- Where new chat leads and requests for a person are emailed. Empty: the sales email in Contact & social.
  alert_email    text check (alert_email is null or alert_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(alert_email) <= 160),
  updated_at     timestamptz not null default now()
);

comment on table public.chat_settings is 'The website chat assistant''s settings (one row). Admins and the website''s server only.';

drop trigger if exists chat_settings_set_updated_at on public.chat_settings;
create trigger chat_settings_set_updated_at
  before update on public.chat_settings
  for each row execute function private.set_updated_at();

insert into public.chat_settings (id) values (true) on conflict (id) do nothing;

-- -------------------------------------------------------------- sessions ----

create table if not exists public.chat_sessions (
  id                      uuid primary key default gen_random_uuid(),
  -- SHA-256 of the secret the visitor's browser holds: only that browser can read or continue the chat.
  token_hash              text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  -- Closed chats leave the inbox's open list; they reopen when the visitor writes again.
  status                  text not null default 'open' check (status in ('open', 'closed')),
  -- False once a team member takes over: the assistant stays quiet in this chat until it is handed back.
  ai_enabled              boolean not null default true,
  -- When the visitor (or the assistant) asked for a person. Cleared when someone takes over.
  handover_requested_at   timestamptz,
  handover_reason         text check (handover_reason is null or char_length(handover_reason) <= 300),
  -- The team member answering, and the name the visitor sees.
  agent_id                uuid references auth.users (id) on delete set null,
  agent_name              text check (agent_name is null or char_length(agent_name) <= 60),
  -- What the assistant learned about the visitor.
  visitor_name            text check (visitor_name is null or char_length(visitor_name) <= 120),
  phone                   text check (phone is null or char_length(phone) <= 40),
  email                   text check (email is null or char_length(email) <= 160),
  company                 text check (company is null or char_length(company) <= 160),
  location                text check (location is null or char_length(location) <= 160),
  -- The rest: interest, products, units, water source, timeline, the latest quote and so on.
  profile                 jsonb not null default '{}'::jsonb check (jsonb_typeof(profile) = 'object'),
  -- The assistant's note for the sales team.
  summary                 text check (summary is null or char_length(summary) <= 2000),
  qualified_at            timestamptz,
  lead_id                 uuid references public.crm_leads (id) on delete set null,
  -- Where the chat started and how the visit arrived (the same attribution the website's forms send).
  page_path               text check (page_path is null or char_length(page_path) <= 300),
  referrer                text check (referrer is null or char_length(referrer) <= 500),
  utm                     jsonb,
  visitor_id              uuid,
  analytics_session_id    uuid,
  -- Device, browser and approximate location, for the team's context. No IP address is stored.
  context                 jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object'),
  -- Kept up to date by chat_messages' trigger, for the inbox.
  message_count           integer not null default 0,
  last_message_at         timestamptz not null default now(),
  last_message_preview    text,
  last_visitor_message_at timestamptz,
  -- The visitor wrote since a team member last opened the chat.
  admin_unread            boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.chat_sessions is 'Website chat conversations. Written by the website''s server, read by admins.';

create index if not exists chat_sessions_recent_idx on public.chat_sessions (last_message_at desc);
create index if not exists chat_sessions_status_idx on public.chat_sessions (status, last_message_at desc);
create index if not exists chat_sessions_waiting_idx on public.chat_sessions (handover_requested_at)
  where handover_requested_at is not null and status = 'open';
create index if not exists chat_sessions_lead_idx on public.chat_sessions (lead_id) where lead_id is not null;
create index if not exists chat_sessions_agent_idx on public.chat_sessions (agent_id) where agent_id is not null;

drop trigger if exists chat_sessions_set_updated_at on public.chat_sessions;
create trigger chat_sessions_set_updated_at
  before update on public.chat_sessions
  for each row execute function private.set_updated_at();

-- -------------------------------------------------------------- messages ----

create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions (id) on delete cascade,
  -- user: the visitor. assistant: the AI. agent: a team member. system: notices such as "Anjali joined the chat".
  role        text not null check (role in ('user', 'assistant', 'agent', 'system')),
  content     text not null check (char_length(content) between 1 and 8000),
  -- The team member who wrote it (agent messages).
  author_id   uuid references auth.users (id) on delete set null,
  author_name text check (author_name is null or char_length(author_name) <= 60),
  -- What the assistant did for this reply (quotes, saved leads, requests for a person), the model and its usage.
  -- Never shown to the visitor.
  meta        jsonb not null default '{}'::jsonb check (jsonb_typeof(meta) = 'object'),
  -- clock_timestamp(): messages written in one transaction still keep their order.
  created_at  timestamptz not null default clock_timestamp()
);

comment on table public.chat_messages is 'Every message of every website chat, in order.';

create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);
create index if not exists chat_messages_author_idx on public.chat_messages (author_id) where author_id is not null;

-- Keeps each conversation's counters, preview and unread flag in step with its messages (notices such as "Anjali
-- joined the chat" don't replace the preview). A visitor writing again reopens a closed chat; a team member's reply
-- marks it read.
create or replace function private.chat_message_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_sessions s
     set message_count           = s.message_count + 1,
         last_message_at         = new.created_at,
         last_message_preview    = case when new.role = 'system' then s.last_message_preview
                                        else left(regexp_replace(btrim(new.content), '\s+', ' ', 'g'), 160) end,
         last_visitor_message_at = case when new.role = 'user' then new.created_at else s.last_visitor_message_at end,
         admin_unread            = case when new.role = 'user' then true when new.role = 'agent' then false else s.admin_unread end,
         status                  = case when new.role = 'user' then 'open' else s.status end
   where s.id = new.session_id;
  return null;
end;
$$;

revoke execute on function private.chat_message_stats() from public, anon, authenticated;

drop trigger if exists chat_messages_stats on public.chat_messages;
create trigger chat_messages_stats
  after insert on public.chat_messages
  for each row execute function private.chat_message_stats();

-- ------------------------------------------------------------------- CRM ----

-- "Website chat" joins the lead sources.
alter table public.crm_leads drop constraint if exists crm_leads_source_check;
alter table public.crm_leads
  add constraint crm_leads_source_check
  check (source in ('website', 'chat', 'manual', 'phone', 'whatsapp', 'referral', 'walk_in', 'event', 'other'));

-- The lead timeline's automatic entries (from 3/7), now saying when the chat assistant added a lead.
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
      case
        when new.inquiry_id is not null then 'Moved in from a website inquiry'
        when new.source = 'chat' then 'Added by the website chat assistant'
        else 'Lead added'
      end,
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

revoke execute on function private.crm_lead_log() from public, anon, authenticated;

-- Puts a chat's visitor into the CRM, or updates the lead they already have, and links the chat to it.
--   1. The lead this chat already made, if it is still in the CRM.
--   2. Otherwise an open lead with the same phone number (its last nine digits), so a returning visitor isn't
--      added twice.
--   3. Otherwise a new lead at the top of New Leads, source "Website chat".
-- An existing lead only gains what it doesn't have yet: the team's own edits are never overwritten. p_note (the
-- assistant's summary, when it changed) is added to the lead's timeline.
-- p_lead: { name, email, phone, company, location, interest, priority, value }.
create or replace function public.chat_save_lead(p_session_id uuid, p_lead jsonb, p_note text default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_lead     uuid;
  v_stage    uuid;
  v_top      integer;
  v_digits   text;
  v_name     text := left(nullif(btrim(p_lead ->> 'name'), ''), 200);
  v_email    text := left(nullif(btrim(p_lead ->> 'email'), ''), 160);
  v_phone    text := left(nullif(btrim(p_lead ->> 'phone'), ''), 40);
  v_company  text := left(nullif(btrim(p_lead ->> 'company'), ''), 160);
  v_location text := left(nullif(btrim(p_lead ->> 'location'), ''), 160);
  v_interest text := left(nullif(btrim(p_lead ->> 'interest'), ''), 200);
  v_priority text := case when p_lead ->> 'priority' in ('low', 'medium', 'high') then p_lead ->> 'priority' else 'medium' end;
  v_value    numeric(12, 2);
  v_note     text := left(nullif(btrim(p_note), ''), 4900);
begin
  select s.lead_id into v_lead from public.chat_sessions s where s.id = p_session_id for update;
  if not found then
    raise exception 'That chat no longer exists.' using errcode = 'P0002';
  end if;

  begin
    v_value := nullif(p_lead ->> 'value', '')::numeric(12, 2);
    if v_value <= 0 then v_value := null; end if;
  exception when others then
    v_value := null;
  end;

  if v_lead is not null and not exists (select 1 from public.crm_leads l where l.id = v_lead) then
    v_lead := null;
  end if;

  v_digits := right(regexp_replace(coalesce(v_phone, ''), '\D', '', 'g'), 9);
  if v_lead is null and char_length(v_digits) = 9 then
    select l.id into v_lead
      from public.crm_leads l
     where l.closed_at is null
       and right(regexp_replace(coalesce(l.phone, ''), '\D', '', 'g'), 9) = v_digits
     order by l.created_at desc
     limit 1;
  end if;

  if v_lead is null then
    if v_name is null then
      raise exception 'A lead needs a name.' using errcode = '22023';
    end if;
    select st.id into v_stage from public.crm_stages st where st.is_locked;
    if v_stage is null then
      raise exception 'The New Leads stage is missing. Run the CRM migration again.' using errcode = 'P0002';
    end if;

    perform pg_advisory_xact_lock(hashtext('crm_stage:' || v_stage::text));
    select coalesce(min(l.position), 1) - 1 into v_top from public.crm_leads l where l.stage_id = v_stage;

    insert into public.crm_leads (stage_id, position, name, email, phone, company, location, interest, source, priority, value, notes)
    values (v_stage, v_top, v_name, v_email, v_phone, v_company, v_location, v_interest, 'chat', v_priority, v_value, v_note)
    returning id into v_lead;
  else
    update public.crm_leads l
       set email    = coalesce(nullif(l.email, ''), v_email),
           phone    = coalesce(nullif(l.phone, ''), v_phone),
           company  = coalesce(nullif(l.company, ''), v_company),
           location = coalesce(nullif(l.location, ''), v_location),
           interest = coalesce(nullif(l.interest, ''), v_interest),
           value    = coalesce(l.value, v_value)
     where l.id = v_lead;

    if v_note is not null then
      insert into public.crm_activities (lead_id, kind, body, meta)
      values (v_lead, 'note', 'From the website chat: ' || v_note, jsonb_build_object('chat_session_id', p_session_id));
    end if;
  end if;

  update public.chat_sessions s
     set lead_id = v_lead,
         qualified_at = coalesce(s.qualified_at, now())
   where s.id = p_session_id;

  return v_lead;
end;
$$;

revoke execute on function public.chat_save_lead(uuid, jsonb, text) from public, anon;
grant execute on function public.chat_save_lead(uuid, jsonb, text) to authenticated, service_role;

-- The website's server adds chat leads with the secret key, so it needs the CRM tables too (admins already have them).
grant select on table public.crm_stages to service_role;
grant select, insert, update on table public.crm_leads to service_role;
grant select, insert on table public.crm_activities to service_role;

-- The assistant may quote prices that are hidden on the website (its "Every price in Prices & quotes" setting). Only
-- the website's server can read those: the public still sees only the prices that are switched on.
grant select on table public.cms_prices to service_role;

-- ---------------------------------------------------------------- access ----

alter table public.chat_settings enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

grant select, update on table public.chat_settings to authenticated;
grant select, insert, update, delete on table public.chat_sessions, public.chat_messages to authenticated;
-- The website's server (secret key) writes the chats and reads the settings.
grant select, insert, update on table public.chat_settings to service_role;
grant select, insert, update, delete on table public.chat_sessions, public.chat_messages to service_role;

do $$
declare
  t text;
begin
  foreach t in array array['chat_settings', 'chat_sessions', 'chat_messages'] loop
    execute format('drop policy if exists "Admins manage chats" on public.%I', t);
    execute format(
      'create policy "Admins manage chats" on public.%I for all to authenticated '
      'using ((select private.is_admin())) with check ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- -------------------------------------------------------------- realtime ----
-- The admin's chat inbox updates live (Supabase Realtime respects the policies above).

do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['chat_sessions', 'chat_messages'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end;
$$;
