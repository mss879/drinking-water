-- =============================================================================
-- LUSAKO · 4/7 · Web analytics
-- -----------------------------------------------------------------------------
-- First-party, cookie-free analytics. The website's tracker sends visits to
-- /api/visit, which validates them and calls public.analytics_ingest() with the
-- secret key. Visitors are random ids kept in the browser; no IP address or raw
-- user agent is stored. Admins read the numbers through the report functions
-- at the bottom.
--
-- Needs 1/7 (admin access). Safe to run more than once.
-- =============================================================================

-- --------------------------------------------------------------- tables ----

create table if not exists public.analytics_sessions (
  id             uuid primary key,              -- made in the browser; 30 minutes of inactivity starts a new one
  visitor_id     uuid not null,                 -- random id kept in the browser (no cookies)
  started_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  entry_path     text not null,
  exit_path      text not null,
  pageviews      integer not null default 0,
  engaged_ms     bigint not null default 0,     -- time the pages were actually visible
  has_conversion boolean not null default false,
  is_new_visitor boolean not null default false,
  referrer       text,
  referrer_host  text,
  channel        text not null default 'direct'
                 check (channel in ('direct', 'organic', 'social', 'referral', 'email', 'paid', 'ai')),
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text,
  country        text,                          -- ISO 3166-1 alpha-2
  region         text,
  city           text,
  geo_source     text check (geo_source in ('header', 'timezone')),
  device         text check (device in ('mobile', 'tablet', 'desktop')),
  browser        text,
  os             text,
  language       text,
  screen         text,
  timezone       text
);

create table if not exists public.analytics_pageviews (
  id           uuid primary key,                -- made in the browser, so engagement updates find their page view
  session_id   uuid not null references public.analytics_sessions (id) on delete cascade,
  visitor_id   uuid not null,
  created_at   timestamptz not null default now(),
  path         text not null,
  title        text,
  engaged_ms   integer not null default 0,
  scroll_depth smallint not null default 0 check (scroll_depth between 0 and 100)
);

create table if not exists public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references public.analytics_sessions (id) on delete cascade,
  visitor_id uuid,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 64),
  path       text,
  props      jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_vitals (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references public.analytics_sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  path       text,
  name       text not null check (name in ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')),
  value      double precision not null,
  rating     text check (rating in ('good', 'needs-improvement', 'poor')),
  device     text
);

comment on table public.analytics_sessions is 'One row per visit. Written only by public.analytics_ingest().';
comment on table public.analytics_pageviews is 'Page views with visible time and scroll depth.';
comment on table public.analytics_events is 'Clicks and conversions: WhatsApp, phone, email, leads, product views, outbound links, 404s.';
comment on table public.analytics_vitals is 'Core Web Vitals from real visitors.';

create index if not exists analytics_sessions_started_idx on public.analytics_sessions (started_at);
create index if not exists analytics_sessions_last_seen_idx on public.analytics_sessions (last_seen_at);
create index if not exists analytics_sessions_visitor_idx on public.analytics_sessions (visitor_id);
create index if not exists analytics_pageviews_created_idx on public.analytics_pageviews (created_at);
create index if not exists analytics_pageviews_session_idx on public.analytics_pageviews (session_id);
create index if not exists analytics_pageviews_path_idx on public.analytics_pageviews (path, created_at);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_name_idx on public.analytics_events (name, created_at);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id);
create index if not exists analytics_vitals_created_idx on public.analytics_vitals (created_at);
create index if not exists analytics_vitals_session_idx on public.analytics_vitals (session_id);

-- -------------------------------------------------------------- access ----
-- Admins read (and can clear) the data. Nobody writes to these tables directly:
-- the website goes through analytics_ingest() below.

alter table public.analytics_sessions enable row level security;
alter table public.analytics_pageviews enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_vitals enable row level security;

grant select, delete on table public.analytics_sessions to authenticated;
grant select, delete on table public.analytics_pageviews to authenticated;
grant select, delete on table public.analytics_events to authenticated;
grant select, delete on table public.analytics_vitals to authenticated;

drop policy if exists "Admins read sessions" on public.analytics_sessions;
create policy "Admins read sessions" on public.analytics_sessions for select to authenticated using ((select private.is_admin()));
drop policy if exists "Admins clear sessions" on public.analytics_sessions;
create policy "Admins clear sessions" on public.analytics_sessions for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins read page views" on public.analytics_pageviews;
create policy "Admins read page views" on public.analytics_pageviews for select to authenticated using ((select private.is_admin()));
drop policy if exists "Admins clear page views" on public.analytics_pageviews;
create policy "Admins clear page views" on public.analytics_pageviews for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins read events" on public.analytics_events;
create policy "Admins read events" on public.analytics_events for select to authenticated using ((select private.is_admin()));
drop policy if exists "Admins clear events" on public.analytics_events;
create policy "Admins clear events" on public.analytics_events for delete to authenticated using ((select private.is_admin()));

drop policy if exists "Admins read vitals" on public.analytics_vitals;
create policy "Admins read vitals" on public.analytics_vitals for select to authenticated using ((select private.is_admin()));
drop policy if exists "Admins clear vitals" on public.analytics_vitals;
create policy "Admins clear vitals" on public.analytics_vitals for delete to authenticated using ((select private.is_admin()));

-- -------------------------------------------------------------- ingest ----
-- One call per beacon: { session: {...}, items: [ {type: pageview|engagement|event|vital, ...} ] }.
-- /api/visit has already validated and enriched it (channel, device, location). A bad item is
-- skipped without losing the rest. Only the secret key (service_role) may call it.

create or replace function public.analytics_ingest(p jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  s          jsonb := p -> 'session';
  v_session  uuid;
  v_visitor  uuid;
  v_exists   boolean;
  v_item     jsonb;
  v_type     text;
  v_path     text;
  v_page     uuid;
  v_old      integer;
  v_new      integer;
  v_inserted integer;
begin
  begin
    v_session := (s ->> 'id')::uuid;
    v_visitor := (s ->> 'visitor_id')::uuid;
  exception when others then
    return;
  end;
  if v_session is null or v_visitor is null then
    return;
  end if;

  select exists (select 1 from public.analytics_sessions where id = v_session) into v_exists;

  for v_item in
    select value from jsonb_array_elements(case when jsonb_typeof(p -> 'items') = 'array' then p -> 'items' else '[]'::jsonb end)
    limit 20
  loop
    begin
      v_type := v_item ->> 'type';
      v_path := left(v_item ->> 'path', 512);

      if v_type = 'pageview' then
        if not v_exists then
          insert into public.analytics_sessions (
            id, visitor_id, entry_path, exit_path, is_new_visitor,
            referrer, referrer_host, channel,
            utm_source, utm_medium, utm_campaign, utm_term, utm_content,
            country, region, city, geo_source,
            device, browser, os, language, screen, timezone
          )
          values (
            v_session, v_visitor, v_path, v_path, coalesce((s ->> 'is_new_visitor')::boolean, false),
            left(s ->> 'referrer', 512), left(s ->> 'referrer_host', 255), coalesce(s ->> 'channel', 'direct'),
            left(s ->> 'utm_source', 100), left(s ->> 'utm_medium', 100), left(s ->> 'utm_campaign', 150),
            left(s ->> 'utm_term', 150), left(s ->> 'utm_content', 150),
            left(s ->> 'country', 2), left(s ->> 'region', 100), left(s ->> 'city', 100), s ->> 'geo_source',
            s ->> 'device', left(s ->> 'browser', 40), left(s ->> 'os', 40), left(s ->> 'language', 35),
            left(s ->> 'screen', 20), left(s ->> 'timezone', 64)
          )
          on conflict (id) do nothing;
          v_exists := true;
        end if;

        insert into public.analytics_pageviews (id, session_id, visitor_id, path, title)
        values ((v_item ->> 'id')::uuid, v_session, v_visitor, v_path, left(v_item ->> 'title', 300))
        on conflict (id) do nothing;
        get diagnostics v_inserted = row_count;

        -- A repeated beacon must not count twice.
        if v_inserted > 0 then
          update public.analytics_sessions
             set pageviews = pageviews + 1, exit_path = v_path, last_seen_at = now()
           where id = v_session;
        end if;

      elsif v_type = 'engagement' then
        -- Totals so far for one page view; only the growth is added to the visit.
        v_page := (v_item ->> 'id')::uuid;
        v_new := least(greatest(coalesce((v_item ->> 'engaged_ms')::integer, 0), 0), 21600000);
        select engaged_ms into v_old
          from public.analytics_pageviews
         where id = v_page and session_id = v_session
           for update;
        if found then
          update public.analytics_pageviews
             set engaged_ms   = greatest(engaged_ms, v_new),
                 scroll_depth = greatest(scroll_depth, least(greatest(coalesce((v_item ->> 'scroll_depth')::integer, 0), 0), 100))
           where id = v_page;
          update public.analytics_sessions
             set engaged_ms = engaged_ms + greatest(v_new - v_old, 0), last_seen_at = now()
           where id = v_session;
        end if;

      elsif v_type = 'event' then
        insert into public.analytics_events (session_id, visitor_id, name, path, props)
        values (
          case when v_exists then v_session end,
          v_visitor,
          v_item ->> 'name',
          v_path,
          case when jsonb_typeof(v_item -> 'props') = 'object' then v_item -> 'props' else '{}'::jsonb end
        );
        if v_exists then
          update public.analytics_sessions
             set last_seen_at = now(),
                 has_conversion = has_conversion
                   or (v_item ->> 'name') in ('generate_lead', 'whatsapp_click', 'phone_click', 'email_click')
           where id = v_session;
        end if;

      elsif v_type = 'vital' then
        insert into public.analytics_vitals (session_id, path, name, value, rating, device)
        values (
          case when v_exists then v_session end,
          v_path,
          v_item ->> 'name',
          (v_item ->> 'value')::double precision,
          v_item ->> 'rating',
          s ->> 'device'
        );
      end if;
    exception when others then
      raise warning 'analytics_ingest skipped a % item: %', coalesce(v_type, 'unknown'), sqlerrm;
    end;
  end loop;
end;
$$;

revoke execute on function public.analytics_ingest(jsonb) from public, anon, authenticated;
grant execute on function public.analytics_ingest(jsonb) to service_role;

-- ------------------------------------------------------------- reports ----
-- All run as the caller, so only admins get numbers back. Ranges are [from, to).

-- Headline numbers for a period. Bounce rate = 1 - engaged / sessions, where an engaged
-- visit lasted 10s+, viewed 2+ pages or converted (the GA4 definition).
create or replace function public.analytics_overview(p_from timestamptz, p_to timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with s as (
    select * from public.analytics_sessions where started_at >= p_from and started_at < p_to
  ),
  v as (
    select * from public.analytics_pageviews where created_at >= p_from and created_at < p_to
  )
  select jsonb_build_object(
    'visitors',           (select count(distinct visitor_id) from s),
    'sessions',           (select count(*) from s),
    'pageviews',          (select count(*) from v),
    'engaged_sessions',   (select count(*) from s where pageviews >= 2 or engaged_ms >= 10000 or has_conversion),
    'converted_sessions', (select count(*) from s where has_conversion),
    'avg_session_ms',     (select coalesce(round(avg(engaged_ms)), 0) from s),
    'avg_page_ms',        (select coalesce(round(avg(engaged_ms)), 0) from v),
    'avg_scroll',         (select coalesce(round(avg(scroll_depth)), 0) from v),
    'new_visitors',       (select count(distinct visitor_id) from s where is_new_visitor),
    'returning_visitors', (select count(distinct visitor_id) from s where not is_new_visitor)
  );
$$;

-- Visitors, page views and visits per hour / day / week / month in a time zone, with empty
-- buckets filled in.
create or replace function public.analytics_timeseries(
  p_from timestamptz,
  p_to timestamptz,
  p_bucket text default 'day',
  p_tz text default 'Asia/Colombo'
)
returns table (bucket timestamptz, visitors bigint, pageviews bigint, sessions bigint)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_bucket not in ('hour', 'day', 'week', 'month') then
    raise exception 'Unknown bucket: %', p_bucket using errcode = '22023';
  end if;

  return query
  with series as (
    select generate_series(
      date_trunc(p_bucket, p_from at time zone p_tz),
      date_trunc(p_bucket, (p_to - interval '1 microsecond') at time zone p_tz),
      ('1 ' || p_bucket)::interval
    ) as local_start
  ),
  counted as (
    select date_trunc(p_bucket, pv.created_at at time zone p_tz) as local_start,
           count(distinct pv.visitor_id) as n_visitors,
           count(*) as n_pageviews,
           count(distinct pv.session_id) as n_sessions
    from public.analytics_pageviews pv
    where pv.created_at >= p_from and pv.created_at < p_to
    group by 1
  )
  select series.local_start at time zone p_tz,
         coalesce(counted.n_visitors, 0),
         coalesce(counted.n_pageviews, 0),
         coalesce(counted.n_sessions, 0)
  from series
  left join counted on counted.local_start = series.local_start
  order by 1;
end;
$$;

-- Top values of one dimension. 'path' counts page views; everything else counts visits.
create or replace function public.analytics_breakdown(
  p_from timestamptz,
  p_to timestamptz,
  p_dimension text,
  p_limit integer default 10
)
returns table (label text, visitors bigint, total bigint, avg_engaged_ms numeric)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 10), 1), 100);
begin
  if p_dimension = 'path' then
    return query
    select pv.path, count(distinct pv.visitor_id), count(*), round(avg(pv.engaged_ms))
    from public.analytics_pageviews pv
    where pv.created_at >= p_from and pv.created_at < p_to
    group by pv.path
    order by 3 desc, 2 desc, 1
    limit v_limit;
    return;
  end if;

  if p_dimension not in (
    'entry_path', 'exit_path', 'referrer_host', 'channel', 'utm_source', 'utm_medium', 'utm_campaign',
    'country', 'region', 'city', 'device', 'browser', 'os', 'language', 'screen'
  ) then
    raise exception 'Unknown dimension: %', p_dimension using errcode = '22023';
  end if;

  return query
  select grouped.label, count(distinct grouped.visitor_id), count(*), round(avg(grouped.engaged_ms))
  from (
    select
      case p_dimension
        when 'entry_path'    then s.entry_path
        when 'exit_path'     then s.exit_path
        when 'referrer_host' then s.referrer_host
        when 'channel'       then s.channel
        when 'utm_source'    then s.utm_source
        when 'utm_medium'    then s.utm_medium
        when 'utm_campaign'  then s.utm_campaign
        when 'country'       then s.country
        when 'region'        then s.region
        when 'city'          then case when s.city is not null then concat_ws(', ', s.city, s.country) end
        when 'device'        then s.device
        when 'browser'       then s.browser
        when 'os'            then s.os
        when 'language'      then s.language
        when 'screen'        then s.screen
      end as label,
      s.visitor_id,
      s.engaged_ms
    from public.analytics_sessions s
    where s.started_at >= p_from and s.started_at < p_to
  ) grouped
  where grouped.label is not null and grouped.label <> ''
  group by grouped.label
  order by 3 desc, 2 desc, 1
  limit v_limit;
end;
$$;

-- How many times each event fired, and by how many visitors.
create or replace function public.analytics_events_summary(p_from timestamptz, p_to timestamptz)
returns table (name text, events bigint, visitors bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.name, count(*), count(distinct e.visitor_id)
  from public.analytics_events e
  where e.created_at >= p_from and e.created_at < p_to
  group by e.name
  order by 2 desc, 1;
$$;

-- Top values of one property of one event, e.g. ('product_view', 'product_name') or ('page_not_found', 'path').
create or replace function public.analytics_event_breakdown(
  p_from timestamptz,
  p_to timestamptz,
  p_name text,
  p_prop text,
  p_limit integer default 10
)
returns table (label text, events bigint, visitors bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.props ->> p_prop, count(*), count(distinct e.visitor_id)
  from public.analytics_events e
  where e.created_at >= p_from and e.created_at < p_to
    and e.name = p_name
    and coalesce(e.props ->> p_prop, '') <> ''
  group by 1
  order by 2 desc, 1
  limit least(greatest(coalesce(p_limit, 10), 1), 100);
$$;

-- Visitors by weekday (1 = Monday) and hour, in local time.
create or replace function public.analytics_heatmap(p_from timestamptz, p_to timestamptz, p_tz text default 'Asia/Colombo')
returns table (weekday integer, hour integer, visitors bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select extract(isodow from pv.created_at at time zone p_tz)::integer,
         extract(hour from pv.created_at at time zone p_tz)::integer,
         count(distinct pv.visitor_id)
  from public.analytics_pageviews pv
  where pv.created_at >= p_from and pv.created_at < p_to
  group by 1, 2
  order by 1, 2;
$$;

-- Core Web Vitals: the 75th percentile and how many readings were good / need work / poor.
create or replace function public.analytics_vitals_summary(p_from timestamptz, p_to timestamptz)
returns table (name text, p75 double precision, good bigint, needs_improvement bigint, poor bigint, samples bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select v.name,
         percentile_cont(0.75) within group (order by v.value),
         count(*) filter (where v.rating = 'good'),
         count(*) filter (where v.rating = 'needs-improvement'),
         count(*) filter (where v.rating = 'poor'),
         count(*)
  from public.analytics_vitals v
  where v.created_at >= p_from and v.created_at < p_to
  group by v.name
  order by v.name;
$$;

-- Who is on the site right now (active in the last 5 minutes) and on which pages.
create or replace function public.analytics_live()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with active as (
    select visitor_id, exit_path
    from public.analytics_sessions
    where last_seen_at > now() - interval '5 minutes'
  )
  select jsonb_build_object(
    'visitors', (select count(distinct visitor_id) from active),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', exit_path, 'visitors', n) order by n desc, exit_path)
      from (
        select exit_path, count(distinct visitor_id) as n
        from active
        group by exit_path
        order by n desc, exit_path
        limit 6
      ) top
    ), '[]'::jsonb)
  );
$$;

-- Deletes everything recorded before a date. Returns the number of visits removed.
-- Optional: schedule it with pg_cron, e.g. keep 13 months:
--   select cron.schedule('analytics-purge', '0 3 * * 0',
--     $cron$ select public.analytics_purge(now() - interval '13 months') $cron$);
-- (A scheduled job runs as its owner, so call it from the postgres role, not through the API.)
create or replace function public.analytics_purge(p_before timestamptz)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.analytics_events where created_at < p_before;
  delete from public.analytics_vitals where created_at < p_before;
  delete from public.analytics_sessions where started_at < p_before;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.analytics_overview(timestamptz, timestamptz) from public, anon;
revoke execute on function public.analytics_timeseries(timestamptz, timestamptz, text, text) from public, anon;
revoke execute on function public.analytics_breakdown(timestamptz, timestamptz, text, integer) from public, anon;
revoke execute on function public.analytics_events_summary(timestamptz, timestamptz) from public, anon;
revoke execute on function public.analytics_event_breakdown(timestamptz, timestamptz, text, text, integer) from public, anon;
revoke execute on function public.analytics_heatmap(timestamptz, timestamptz, text) from public, anon;
revoke execute on function public.analytics_vitals_summary(timestamptz, timestamptz) from public, anon;
revoke execute on function public.analytics_live() from public, anon;
revoke execute on function public.analytics_purge(timestamptz) from public, anon;

grant execute on function public.analytics_overview(timestamptz, timestamptz) to authenticated;
grant execute on function public.analytics_timeseries(timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.analytics_breakdown(timestamptz, timestamptz, text, integer) to authenticated;
grant execute on function public.analytics_events_summary(timestamptz, timestamptz) to authenticated;
grant execute on function public.analytics_event_breakdown(timestamptz, timestamptz, text, text, integer) to authenticated;
grant execute on function public.analytics_heatmap(timestamptz, timestamptz, text) to authenticated;
grant execute on function public.analytics_vitals_summary(timestamptz, timestamptz) to authenticated;
grant execute on function public.analytics_live() to authenticated;
grant execute on function public.analytics_purge(timestamptz) to authenticated;
