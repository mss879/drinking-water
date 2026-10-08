-- =============================================================================
-- LUSAKO · 8/8 · Final website changes (October 2026)
-- -----------------------------------------------------------------------------
-- From the client's "Final website changes":
--
--   1. Social media links. LUSAKO's Facebook, Instagram, LinkedIn and TikTok profiles become the website's social
--      links, unless someone has already added links in the admin (Contact & social), which are kept as they are.
--
--   2. No prices. The website now asks for a quote to buy or rent every purifier, so the buy and rental prices are
--      taken out of the product catalogue too. The catalogue can be read by anyone (it's what the website shows), so
--      prices left in it would still be public. Each purification option keeps its name and model number.
--
-- Website images (the image at the top of each page as well as the lifestyle photos) need no database change: they
-- are saved in the existing "photos" setting, under new names.
--
-- And for going live:
--
--   3. A rate limit on the website's forms: at most a few quote requests from one connection in ten minutes, so a
--      script can't flood the inquiries. Only the website's server can use it; it stores a one-way hash of the
--      address, never the address itself, and forgets it after a day.
--
-- Needs 7/7 (website content). Safe to run more than once.
-- =============================================================================

-- --------------------------------------------------------------- social ----

insert into public.cms_settings (key, value)
values (
  'social',
  $j$[
    {"network": "facebook", "url": "https://www.facebook.com/LusakoHoldings/"},
    {"network": "instagram", "url": "https://www.instagram.com/lusako.holdings/"},
    {"network": "linkedin", "url": "https://www.linkedin.com/company/lusako/"},
    {"network": "tiktok", "url": "https://www.tiktok.com/@lusakoholdings"}
  ]$j$::jsonb
)
on conflict (key) do update
  set value = excluded.value
  where public.cms_settings.value = '[]'::jsonb or jsonb_typeof(public.cms_settings.value) <> 'array';

-- --------------------------------------------------------------- prices ----

update public.cms_products as p
set variants = (
  select coalesce(
    jsonb_agg(case when jsonb_typeof(option) = 'object' then option - 'price' - 'rent' else option end order by ordinality),
    '[]'::jsonb
  )
  from jsonb_array_elements(p.variants) with ordinality as options (option, ordinality)
)
where exists (
  select 1
  from jsonb_array_elements(p.variants) as options (option)
  where jsonb_typeof(option) = 'object' and (option ? 'price' or option ? 'rent')
);

comment on column public.cms_products.variants is
  'Purification options: [{ filtration: "UF" | "RO", label, code }]. No prices: the website asks for a quote.';

-- ----------------------------------------------------------- rate limit ----

create table if not exists private.rate_limits (
  bucket       text not null check (char_length(bucket) <= 120),
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);

comment on table private.rate_limits is 'Hit counts per window for public.rate_limit_hit(). Rows older than a day are removed.';

-- Counts one hit for p_bucket in the current window of p_window_seconds and says whether it is still within p_limit.
create or replace function public.rate_limit_hit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  this_window timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / greatest(p_window_seconds, 1)) * greatest(p_window_seconds, 1));
  total integer;
begin
  insert into private.rate_limits as r (bucket, window_start, hits)
  values (left(p_bucket, 120), this_window, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning r.hits into total;

  -- Housekeeping now and then, so the table never grows.
  if random() < 0.05 then
    delete from private.rate_limits as old where old.window_start < now() - interval '1 day';
  end if;

  return total <= p_limit;
end;
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
