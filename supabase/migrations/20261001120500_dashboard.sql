-- =============================================================================
-- LUSAKO · 6/7 · Dashboard
-- -----------------------------------------------------------------------------
-- One call that gathers the admin dashboard's business numbers: inquiries, the
-- CRM pipeline, follow-ups, blog posts and visitors for a period. It runs as the
-- caller, so only admins get numbers back.
--
-- Needs 1/7 to 5/7. Safe to run more than once.
-- =============================================================================

create or replace function public.dashboard_summary(
  p_from timestamptz,
  p_to timestamptz,
  p_tz text default 'Asia/Colombo'
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with
  today as (
    select (now() at time zone p_tz)::date as d
  ),
  period as (
    select * from public.inquiries where created_at >= p_from and created_at < p_to
  ),
  open_leads as (
    select l.*
    from public.crm_leads l
    join public.crm_stages s on s.id = l.stage_id
    where s.outcome = 'open'
  ),
  closed as (
    select l.value, s.outcome
    from public.crm_leads l
    join public.crm_stages s on s.id = l.stage_id
    where l.closed_at >= p_from and l.closed_at < p_to and s.outcome <> 'open'
  )
  select jsonb_build_object(
    'inquiries', jsonb_build_object(
      'total',    (select count(*) from period where status <> 'spam'),
      'previous', (
        select count(*) from public.inquiries
        where created_at >= p_from - (p_to - p_from) and created_at < p_from and status <> 'spam'
      ),
      'unread',   (select count(*) from public.inquiries where read_at is null and status <> 'spam'),
      'by_status', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) as n from period group by status) t), '{}'::jsonb),
      'by_form',   coalesce((select jsonb_object_agg(form_type, n) from (select form_type, count(*) as n from period where status <> 'spam' group by form_type) t), '{}'::jsonb)
    ),
    'crm', jsonb_build_object(
      'open_leads',         (select count(*) from open_leads),
      'pipeline_value',     (select coalesce(sum(value), 0) from open_leads),
      'won',                (select count(*) from closed where outcome = 'won'),
      'won_value',          (select coalesce(sum(value), 0) from closed where outcome = 'won'),
      'lost',               (select count(*) from closed where outcome = 'lost'),
      'follow_ups_due',     (select count(*) from open_leads, today where follow_up_on between today.d and today.d + 7),
      'follow_ups_overdue', (select count(*) from open_leads, today where follow_up_on < today.d)
    ),
    'blog', jsonb_build_object(
      'published', (select count(*) from public.blog_posts where status = 'published' and published_at <= now()),
      'scheduled', (select count(*) from public.blog_posts where status = 'published' and published_at > now()),
      'drafts',    (select count(*) from public.blog_posts where status = 'draft')
    ),
    'visitors', (
      select count(distinct visitor_id) from public.analytics_sessions
      where started_at >= p_from and started_at < p_to
    )
  );
$$;

revoke execute on function public.dashboard_summary(timestamptz, timestamptz, text) from public, anon;
grant execute on function public.dashboard_summary(timestamptz, timestamptz, text) to authenticated;
