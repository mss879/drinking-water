-- =============================================================================
-- LUSAKO · 9/9 · Everything on the website editable in the admin
-- -----------------------------------------------------------------------------
-- The owner asked that the website's prices "and everything" can be changed from the admin. This adds:
--
--   1. cms_prices: every price the website can show, one row each (a purifier option's buy or rent-from price, the
--      rental plans' from-prices, the rental initial payment and Regional Hydration Service charge, the AMC on-call
--      fee), each with its own "show on the website" switch. Hidden prices stay private: the public can only read a
--      price that is switched on. Every price starts hidden, so the website keeps asking for a quote (the client's
--      October 2026 request) until the admin decides otherwise. The amounts the website used to show are filled in
--      (hidden) so they're there to switch back on.
--   2. cms_copy: the website's text, one row per block of a page (headings, paragraphs, lists, button labels, search
--      titles and descriptions). Only what the admin changed is stored; everything else is the website's own wording.
--   3. cms_faqs: the questions and answers, starting with the ones on the website today.
--   4. cms_case_studies: the client stories on Our clients, starting with today's three samples.
--   5. Products gain extra specification rows, extra questions, and their own search title and description.
--   6. Two more settings: "pricing" (the KOKO badge and whether prices may show on the home page) and "picks"
--      (which products Find my solution recommends and the home page features).
--
-- Needs 7/7 (website content). Safe to run more than once.
-- =============================================================================

-- --------------------------------------------------------------- prices ----

create table if not exists public.cms_prices (
  id          uuid primary key default gen_random_uuid(),
  -- The product for a purifier option's price; empty for the website-wide prices.
  product_id  uuid references public.cms_products (id) on delete cascade,
  -- buy-uf | buy-ro | rent-uf | rent-ro (a product's options), rental-plan-pureflow-uf | rental-plan-pureflow-ro |
  -- rental-plan-aquaspark, rental-initial, rental-regional, rental-regional-<province> (an override), oncall-fee
  item        text not null check (
    item in (
      'buy-uf', 'buy-ro', 'rent-uf', 'rent-ro',
      'rental-plan-pureflow-uf', 'rental-plan-pureflow-ro', 'rental-plan-aquaspark',
      'rental-initial', 'rental-regional', 'oncall-fee'
    )
    or item ~ '^rental-regional-(central|southern|northern|eastern|north-western|north-central|uva|sabaragamuwa)$'
  ),
  -- LKR, excluding VAT. Empty: no amount yet (the website asks for a quote).
  amount      numeric(12, 2) check (amount is null or (amount > 0 and amount < 100000000)),
  visible     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint cms_prices_product_items check ((product_id is not null) = (item ~ '^(buy|rent)-(uf|ro)$')),
  constraint cms_prices_one_each unique nulls not distinct (product_id, item)
);

comment on table public.cms_prices is
  'Every price the website can show, each with its own show switch. The public can only read prices that are switched on.';

drop trigger if exists cms_prices_set_updated_at on public.cms_prices;
create trigger cms_prices_set_updated_at
  before update on public.cms_prices
  for each row execute function private.set_updated_at();

alter table public.cms_prices enable row level security;

grant select on table public.cms_prices to anon, authenticated;
grant insert, update, delete on table public.cms_prices to authenticated;

drop policy if exists "Anyone can read shown prices" on public.cms_prices;
create policy "Anyone can read shown prices"
  on public.cms_prices for select
  to anon, authenticated
  using (
    visible
    and amount is not null
    -- A product's prices only while the product itself is on the website.
    and (product_id is null or exists (select 1 from public.cms_products p where p.id = product_id and p.published))
  );

drop policy if exists "Admins read every price" on public.cms_prices;
create policy "Admins read every price"
  on public.cms_prices for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins add prices" on public.cms_prices;
create policy "Admins add prices"
  on public.cms_prices for insert
  to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins update prices" on public.cms_prices;
create policy "Admins update prices"
  on public.cms_prices for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins delete prices" on public.cms_prices;
create policy "Admins delete prices"
  on public.cms_prices for delete
  to authenticated
  using ((select private.is_admin()));

-- The amounts the website showed before October 2026, kept hidden so they can be switched back on.
insert into public.cms_prices (product_id, item, amount, visible)
values
  (null, 'rental-plan-pureflow-uf', 4990, false),
  (null, 'rental-plan-pureflow-ro', 5990, false),
  (null, 'rental-initial', 6000, false)
on conflict on constraint cms_prices_one_each do nothing;

insert into public.cms_prices (product_id, item, amount, visible)
select p.id, prices.item, prices.amount, false
from public.cms_products p
cross join (values ('rent-uf', 4990::numeric), ('rent-ro', 5990::numeric)) as prices (item, amount)
where p.slug = 'aquaelite-3x'
on conflict on constraint cms_prices_one_each do nothing;

-- ----------------------------------------------------------------- text ----

create table if not exists public.cms_copy (
  -- "<page>.<block>", e.g. "home.hero" (content/copy in the website's code declares every block).
  key        text primary key check (key ~ '^[a-z][a-zA-Z]*(\.[a-zA-Z0-9]+)+$' and char_length(key) <= 80),
  -- Only the fields the admin changed.
  value      jsonb not null check (jsonb_typeof(value) = 'object' and pg_column_size(value) < 65536),
  updated_at timestamptz not null default now()
);

comment on table public.cms_copy is 'The website''s text that the admin changed, one row per block. Everything else is the website''s own wording.';

drop trigger if exists cms_copy_set_updated_at on public.cms_copy;
create trigger cms_copy_set_updated_at
  before update on public.cms_copy
  for each row execute function private.set_updated_at();

alter table public.cms_copy enable row level security;

grant select on table public.cms_copy to anon, authenticated;
grant insert, update, delete on table public.cms_copy to authenticated;

drop policy if exists "Anyone can read the text" on public.cms_copy;
create policy "Anyone can read the text"
  on public.cms_copy for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------- faqs ----

create table if not exists public.cms_faqs (
  id           uuid primary key default gen_random_uuid(),
  -- A question the website looks for by name ("warranty" is repeated on every product page).
  key          text unique check (key is null or key ~ '^[a-z][a-z-]*$'),
  topic        text not null check (topic in ('purification', 'buying', 'rental', 'service')),
  question     text not null check (char_length(question) between 1 and 200),
  answer       text not null check (char_length(answer) between 1 and 1200),
  on_home      boolean not null default false,
  on_corporate boolean not null default false,
  published    boolean not null default true,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.cms_faqs is 'The website''s questions and answers. The AMC questions are worked out from the AMC plans instead.';

create index if not exists cms_faqs_order_idx on public.cms_faqs (published, position);

drop trigger if exists cms_faqs_set_updated_at on public.cms_faqs;
create trigger cms_faqs_set_updated_at
  before update on public.cms_faqs
  for each row execute function private.set_updated_at();

-- --------------------------------------------------------- case studies ----

create table if not exists public.cms_case_studies (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  -- An illustrative story rather than a named client: the page says so.
  sample         boolean not null default false,
  industry       text not null check (char_length(industry) between 1 and 80),
  location       text not null default '' check (char_length(location) <= 80),
  -- The model pill; empty takes it from the solution ("Rental · PureFlow UF …").
  model          text not null default '' check (char_length(model) <= 60),
  challenge      text not null default '' check (char_length(challenge) <= 400),
  requirement    text not null default '' check (char_length(requirement) <= 400),
  solution       text not null default '' check (char_length(solution) <= 400),
  implementation text not null default '' check (char_length(implementation) <= 400),
  support        text not null default '' check (char_length(support) <= 400),
  result         text not null default '' check (char_length(result) <= 400),
  published      boolean not null default true,
  position       integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.cms_case_studies is 'Client stories on Our clients. Name a client only with their written approval.';

create index if not exists cms_case_studies_order_idx on public.cms_case_studies (published, position);

drop trigger if exists cms_case_studies_set_updated_at on public.cms_case_studies;
create trigger cms_case_studies_set_updated_at
  before update on public.cms_case_studies
  for each row execute function private.set_updated_at();

-- ------------------------------------------------- faqs & stories access ----

alter table public.cms_faqs enable row level security;
alter table public.cms_case_studies enable row level security;

grant select on table public.cms_faqs, public.cms_case_studies to anon, authenticated;
grant insert, update, delete on table public.cms_faqs, public.cms_case_studies, public.cms_copy to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['cms_faqs', 'cms_case_studies'] loop
    execute format('drop policy if exists "Anyone can read what is published" on public.%I', t);
    execute format(
      'create policy "Anyone can read what is published" on public.%I for select to anon, authenticated using (published)', t);
    execute format('drop policy if exists "Admins read everything" on public.%I', t);
    execute format(
      'create policy "Admins read everything" on public.%I for select to authenticated using ((select private.is_admin()))', t);
  end loop;

  foreach t in array array['cms_faqs', 'cms_case_studies', 'cms_copy'] loop
    execute format('drop policy if exists "Admins add" on public.%I', t);
    execute format(
      'create policy "Admins add" on public.%I for insert to authenticated with check ((select private.is_admin()))', t);
    execute format('drop policy if exists "Admins update" on public.%I', t);
    execute format(
      'create policy "Admins update" on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t);
    execute format('drop policy if exists "Admins delete" on public.%I', t);
    execute format(
      'create policy "Admins delete" on public.%I for delete to authenticated using ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- Today's questions and stories, so nothing disappears when this runs.
insert into public.cms_faqs (key, topic, question, answer, on_home, on_corporate, position)
select * from (
  values
  (null, $q$purification$q$, $q$What is the difference between UF and RO?$q$, $q$UF (ultrafiltration) passes water through a fine membrane that removes particles, sediment and microorganisms while keeping naturally occurring minerals, which makes it ideal for treated city water. RO (reverse osmosis) uses a much finer membrane that also reduces dissolved salts and other dissolved solids (TDS), so it suits well water and water with higher TDS. You never have to work this out alone: we recommend the right one for your water.$q$, true, false, 0),
  (null, $q$purification$q$, $q$Which purifier is suitable for city water?$q$, $q$For treated city water, a UF system such as PureFlow UF is usually the right choice. If your supply has high dissolved solids we may recommend RO instead. Use Find My Solution or ask us to check your water.$q$, false, false, 10),
  (null, $q$purification$q$, $q$Which purifier is suitable for well water?$q$, $q$Well water often carries higher dissolved solids, so we generally recommend RO, such as PureFlow RO. The final recommendation depends on your water condition, which our team can assess.$q$, false, false, 20),
  (null, $q$buying$q$, $q$Can I buy the machine instead of renting?$q$, $q$Yes. Every LUSAKO water purifier is available to buy outright, and for homes buying is usually the best long-term value. You own the system, it is covered by warranty, and LUSAKO after-sales service and maintenance plans are available.$q$, true, false, 30),
  (null, $q$rental$q$, $q$What is included in the monthly rental?$q$, $q$Your rental covers the LUSAKO purification system, professional installation, scheduled preventive maintenance, filter replacement and technical support, according to your rental agreement. The exact inclusions are set out in your agreement before you sign.$q$, true, false, 40),
  (null, $q$rental$q$, $q$What is the initial payment?$q$, $q$It is a one-time payment per rented unit, payable only in the first month together with the first month’s rental. From the second month onwards, you pay only the monthly rental. Your rental quote confirms the amount.$q$, false, false, 50),
  (null, $q$rental$q$, $q$Does the Regional Hydration Service apply in Western Province?$q$, $q$No. Customers in the Western Province pay the monthly rental only. There is no Regional Hydration Service charge.$q$, true, false, 60),
  (null, $q$rental$q$, $q$What is the Regional Hydration Service for Non-Western Province?$q$, $q$Outside the Western Province, a Regional Hydration Service charge covers the additional technical service, preventive maintenance and regional support needed to look after your system. It is always shown as a separate line item, never hidden inside the rental.$q$, true, false, 70),
  (null, $q$service$q$, $q$How does installation work?$q$, $q$Once you have chosen your system, a trained LUSAKO technician connects it to your existing water supply and checks that everything works as it should. Rentals start with a site assessment so the right machine goes in the right place.$q$, false, false, 80),
  (null, $q$service$q$, $q$What happens if the machine requires service?$q$, $q$Raise a service request online, by phone or on WhatsApp, or call the emergency breakdown hotline. Rental systems are maintained by LUSAKO throughout the rental period. Purchased systems are supported by their warranty and by an Annual Maintenance Contract or on-call service.$q$, false, false, 90),
  (null, $q$rental$q$, $q$What happens after the rental contract ends?$q$, $q$You can renew your rental, and upgrades are available at renewal, subject to your plan. Termination and relocation terms are set out in your rental agreement.$q$, false, false, 100),
  (null, $q$rental$q$, $q$Can companies rent multiple machines?$q$, $q$Yes. Companies can rent as many units as they need. For multiple units or sites we prepare a Corporate Hydration proposal, so you don’t have to pick machines one by one.$q$, true, true, 110),
  (null, $q$service$q$, $q$Can LUSAKO support multiple company locations?$q$, $q$Yes. Corporate Hydration Solutions cover single offices and multi-location organisations, with installation and service planning, preventive maintenance and centralised account management.$q$, false, true, 120),
  ('warranty', $q$buying$q$, $q$What warranty is provided for purchased products?$q$, $q$Every purchased LUSAKO system comes with a product warranty, shown on each product page, plus access to LUSAKO after-sales service and Annual Maintenance Contracts.$q$, false, false, 130)
) as defaults (key, topic, question, answer, on_home, on_corporate, position)
where not exists (select 1 from public.cms_faqs);

insert into public.cms_case_studies
  (slug, sample, industry, location, challenge, requirement, solution, implementation, support, result, position)
values
  ($q$multi-branch-office$q$, true, $q$Financial services · multi-branch$q$, $q$Western & Other Provinces$q$, $q$Branches depended on bottled-water deliveries: heavy bottles, storage space and uneven supply.$q$, $q$Reliable drinking water for staff and customers at every branch, with one point of contact.$q$, $q$Rental · PureFlow UF for city branches, PureFlow RO where sites use well water.$q$, $q$Site assessment at each branch, followed by scheduled installations.$q$, $q$Preventive maintenance and technical support under one corporate agreement.$q$, $q$No more deliveries, one monthly invoice and one account manager for every location.$q$, 0),
  ($q$manufacturing-facility$q$, true, $q$Manufacturing$q$, $q$Uva Province$q$, $q$Large shift teams and a well-water supply with high dissolved solids.$q$, $q$Safe, great-tasting water on every floor without a maintenance burden for the facility team.$q$, $q$Rental · AquaPrime Pro (RO).$q$, $q$Units placed by expected consumption on each production floor.$q$, $q$Scheduled preventive maintenance plus the Regional Hydration Service.$q$, $q$Consistent purified water across the site, maintained entirely by LUSAKO.$q$, 10),
  ($q$boutique-hotel$q$, true, $q$Hospitality$q$, $q$Southern Province$q$, $q$Guests expected still and sparkling water, and the property wanted to cut single-use plastic.$q$, $q$A premium, bottleless hydration experience for guests and staff.$q$, $q$Purchase · AquaSpark Elite and AquaSignature Pro with an AMC.$q$, $q$Installed in the restaurant, lounge and staff areas.$q$, $q$Annual Maintenance Contract with scheduled filter replacement.$q$, $q$A premium water service with far fewer plastic bottles.$q$, 20)
on conflict (slug) do nothing;

-- ------------------------------------------------------------- products ----

alter table public.cms_products
  add column if not exists specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  add column if not exists faqs jsonb not null default '[]'::jsonb check (jsonb_typeof(faqs) = 'array'),
  add column if not exists seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  add column if not exists seo_description text check (seo_description is null or char_length(seo_description) <= 170);

comment on column public.cms_products.specs is 'Extra specification rows after the standard ones: [{ label, value }].';
comment on column public.cms_products.faqs is 'Extra questions after the standard ones on the product page: [{ q, a }].';

-- ------------------------------------------------------------- settings ----
--   pricing: { koko: boolean, showOnHome: boolean }   (switches only; amounts live in cms_prices)
--   picks:   { finder: { home, office, commercial }, homeBuyCard }   (product slugs)

alter table public.cms_settings drop constraint if exists cms_settings_key_check;
alter table public.cms_settings
  add constraint cms_settings_key_check check (key in ('contact', 'social', 'photos', 'amc', 'pricing', 'picks'));
