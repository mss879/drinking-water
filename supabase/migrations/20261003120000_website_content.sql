-- =============================================================================
-- LUSAKO · 7/7 · Website content
-- -----------------------------------------------------------------------------
-- What the client edits in the admin's Website section: the product catalogue
-- (with each purification option's buy and rental price), filters, parts and
-- accessories, client logos, and site settings (contact details, social links,
-- replacement photos and AMC plan prices). Plus a public `site-media` bucket for
-- their images.
--
-- Anyone can read what is published (the website shows it); only admins can see
-- drafts or change anything. The catalogue and the parts list start with what the
-- website showed before, so nothing disappears when this runs.
--
-- Needs 1/7 (admin access). Safe to run more than once.
-- =============================================================================

-- ------------------------------------------------------------- products ----

create table if not exists public.cms_products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name              text not null check (char_length(name) between 1 and 80),
  family            text not null default '' check (char_length(family) <= 60),
  tagline           text not null default '' check (char_length(tagline) <= 120),
  -- Categories, first one primary: countertop, freestanding, under-sink, wall-mount, sparkling.
  types             text[] not null default '{}'
                    check (types <@ array['countertop', 'freestanding', 'under-sink', 'wall-mount', 'sparkling']::text[]),
  -- Purification options: [{ filtration: "UF" | "RO", label, code, price, rent }], prices in LKR excluding VAT.
  variants          jsonb not null default '[]'::jsonb check (jsonb_typeof(variants) = 'array'),
  purification      text not null default '' check (char_length(purification) <= 60),
  temperatures      text[] not null default '{}',
  installation      text not null default '' check (char_length(installation) <= 80),
  warranty          text not null default '' check (char_length(warranty) <= 60),
  image_url         text check (image_url is null or char_length(image_url) <= 500),
  summary           text not null default '' check (char_length(summary) <= 600),
  highlights        text[] not null default '{}',
  -- [{ title, body }]
  features          jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  who_for           jsonb not null default '[]'::jsonb check (jsonb_typeof(who_for) = 'array'),
  filtration_note   text not null default '' check (char_length(filtration_note) <= 600),
  installation_note text not null default '' check (char_length(installation_note) <= 600),
  maintenance_note  text check (maintenance_note is null or char_length(maintenance_note) <= 600),
  published         boolean not null default false,
  position          integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.cms_products is 'The water purifier catalogue shown on the website, edited in the admin.';

create index if not exists cms_products_order_idx on public.cms_products (published, position);

drop trigger if exists cms_products_set_updated_at on public.cms_products;
create trigger cms_products_set_updated_at
  before update on public.cms_products
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------- parts ----

create table if not exists public.cms_parts (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('filters', 'spare-parts', 'accessories')),
  name        text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 300),
  image_url   text check (image_url is null or char_length(image_url) <= 500),
  -- Standard price in LKR, excluding applicable taxes; empty shows "Ask for a price".
  price       numeric(12, 2) check (price is null or price > 0),
  -- Typical life in months (filters), shown as a guide.
  life_months integer check (life_months is null or life_months between 1 and 120),
  published   boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.cms_parts is 'Filters, spare parts and accessories listed on the website.';

-- For a database that ran an earlier version of this migration.
alter table public.cms_parts
  add column if not exists life_months integer check (life_months is null or life_months between 1 and 120);

create index if not exists cms_parts_order_idx on public.cms_parts (published, category, position);

drop trigger if exists cms_parts_set_updated_at on public.cms_parts;
create trigger cms_parts_set_updated_at
  before update on public.cms_parts
  for each row execute function private.set_updated_at();

-- --------------------------------------------------------- client logos ----

create table if not exists public.cms_client_logos (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  image_url   text not null check (char_length(image_url) <= 500),
  website_url text check (website_url is null or (website_url ~ '^https?://' and char_length(website_url) <= 300)),
  published   boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.cms_client_logos is 'Client logos on the website, shown only with the client''s written approval.';

create index if not exists cms_client_logos_order_idx on public.cms_client_logos (published, position);

drop trigger if exists cms_client_logos_set_updated_at on public.cms_client_logos;
create trigger cms_client_logos_set_updated_at
  before update on public.cms_client_logos
  for each row execute function private.set_updated_at();

-- ------------------------------------------------------------- settings ----
-- One row per group. Anything not saved here falls back to the website's defaults.
--   contact: { phones[], hotline, whatsappSales, whatsappEmergency, salesEmail, operationsEmail, hours, address }
--   social:  [{ network, url }]
--   photos:  { <photo key>: { src, alt } }  (only the replaced photos)
--   amc:     { plans: { essential|complete|maximum: { monthly, visits, sanitations, priority, filterDiscount,
--              partsDiscount } }, fees: { visit, sanitation } }

create table if not exists public.cms_settings (
  key        text primary key check (key in ('contact', 'social', 'photos', 'amc')),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.cms_settings is 'Website settings edited in the admin: contact details, social links, replacement photos, AMC plan prices.';

-- For a database that ran an earlier version of this migration (before AMC prices were editable).
alter table public.cms_settings drop constraint if exists cms_settings_key_check;
alter table public.cms_settings add constraint cms_settings_key_check check (key in ('contact', 'social', 'photos', 'amc'));

drop trigger if exists cms_settings_set_updated_at on public.cms_settings;
create trigger cms_settings_set_updated_at
  before update on public.cms_settings
  for each row execute function private.set_updated_at();

-- --------------------------------------------------------------- access ----

alter table public.cms_products enable row level security;
alter table public.cms_parts enable row level security;
alter table public.cms_client_logos enable row level security;
alter table public.cms_settings enable row level security;

grant select on table public.cms_products, public.cms_parts, public.cms_client_logos, public.cms_settings to anon, authenticated;
grant insert, update, delete on table public.cms_products, public.cms_parts, public.cms_client_logos, public.cms_settings to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['cms_products', 'cms_parts', 'cms_client_logos'] loop
    execute format('drop policy if exists "Anyone can read what is published" on public.%I', t);
    execute format(
      'create policy "Anyone can read what is published" on public.%I for select to anon, authenticated using (published)', t);
    execute format('drop policy if exists "Admins read everything" on public.%I', t);
    execute format(
      'create policy "Admins read everything" on public.%I for select to authenticated using ((select private.is_admin()))', t);
  end loop;

  foreach t in array array['cms_products', 'cms_parts', 'cms_client_logos', 'cms_settings'] loop
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

-- The settings hold only what the website shows publicly anyway.
drop policy if exists "Anyone can read settings" on public.cms_settings;
create policy "Anyone can read settings"
  on public.cms_settings for select
  to anon, authenticated
  using (true);

-- --------------------------------------------------------------- images ----
-- Product photos, part photos, client logos and replacement site photos. Anyone can view them (they are on the
-- website); only admins can upload, replace or delete. Files go in <products|parts|logos|photos>/<random id>.<ext>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload site media" on storage.objects;
create policy "Admins upload site media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and (select private.is_admin()));

drop policy if exists "Admins update site media" on storage.objects;
create policy "Admins update site media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and (select private.is_admin()))
  with check (bucket_id = 'site-media' and (select private.is_admin()));

drop policy if exists "Admins delete site media" on storage.objects;
create policy "Admins delete site media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and (select private.is_admin()));

drop policy if exists "Admins list site media" on storage.objects;
create policy "Admins list site media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'site-media' and (select private.is_admin()));

-- ---------------------------------------------------------------- start ----
-- The catalogue and parts the website showed before, so the admin starts from them.

insert into public.cms_products
  (slug, name, family, tagline, types, variants, purification, temperatures, installation, warranty, image_url, summary,
   highlights, features, who_for, filtration_note, installation_note, maintenance_note, published, position)
values
  ($q$aquaelite-3x$q$, $q$AquaElite 3X$q$, $q$AquaElite$q$, $q$Premium Countertop Water Purifier$q$, array[$q$countertop$q$]::text[], $j$[{"filtration":"UF","label":"4-Stage UF","code":"W2905-3CF","price":null,"rent":4990},{"filtration":"RO","label":"4-Stage RO","code":"W2905-3CR","price":null,"rent":5990}]$j$::jsonb, $q$UF / RO$q$, array[$q$Hot$q$, $q$Normal$q$, $q$Cold$q$]::text[], $q$Professional installation$q$, $q$2 years$q$, $q$/images/products/aquaelite-3x.webp$q$, $q$Hot, normal and cold purified water from one compact countertop system, with UF or RO purification matched to your water source.$q$, array[$q$Hot · Normal · Cold$q$, $q$UF or RO$q$, $q$Countertop$q$]::text[], $j$[{"title":"Three temperatures on tap","body":"Hot, normal and cold purified water from one system, ready whenever you are."},{"title":"Matched to your water","body":"UF for treated city water, RO for well water and higher TDS. We recommend the right one for you."},{"title":"Compact countertop design","body":"Made for kitchens, pantries and reception counters where space matters."},{"title":"Bottleless by design","body":"No more bottled-water deliveries, heavy bottles or storage space."}]$j$::jsonb, $j$[{"title":"Homes & apartments","body":"Families who want pure water on tap without the bottles."},{"title":"Small offices","body":"Teams that need hot, normal and cold water from one compact unit."},{"title":"Reception areas","body":"A clean, quiet hydration point for guests and customers."}]$j$::jsonb, $q$Choose the UF model (W2905-3CF) for treated city water, or the RO model (W2905-3CR) for well water and water with higher dissolved solids.$q$, $q$A trained LUSAKO technician connects the system to your existing water supply, sets it up and checks everything is working before handing over.$q$, null, true, 0),
  ($q$aquaspark-elite$q$, $q$AquaSpark Elite$q$, $q$AquaSpark$q$, $q$Premium Sparkling Water Purifier$q$, array[$q$sparkling$q$, $q$countertop$q$]::text[], $j$[{"filtration":"UF","label":"UF + Sparkling","code":"W29Q1","price":null,"rent":null}]$j$::jsonb, $q$UF + Sparkling$q$, array[$q$Sparkling$q$, $q$Still$q$]::text[], $q$Professional installation$q$, $q$2 years$q$, $q$/images/products/aquaspark-elite.webp$q$, $q$Purified sparkling water at the touch of a button, from a premium countertop system. Hydration without a single bottle or can.$q$, array[$q$Sparkling on tap$q$, $q$UF purification$q$, $q$Countertop$q$]::text[], $j$[{"title":"Sparkling on demand","body":"Crisp sparkling purified water at the touch of a button, with no bottles or cans."},{"title":"UF purification built in","body":"Ultrafiltration for treated city water, in the same compact unit."},{"title":"A premium statement","body":"A design made for kitchens, executive floors and hospitality spaces."},{"title":"Bottleless by design","body":"No more bottled-water deliveries, heavy bottles or storage space."}]$j$::jsonb, $j$[{"title":"Homes that love sparkling","body":"Swap cans and bottles for sparkling water on tap."},{"title":"Executive floors","body":"A premium touch for boardrooms and client areas."},{"title":"Hospitality","body":"Hotels, cafés and restaurants serving still and sparkling water."}]$j$::jsonb, $q$AquaSpark Elite (W29Q1) combines UF purification with built-in carbonation. UF is best suited to treated city water.$q$, $q$A trained LUSAKO technician connects the system to your existing water supply, sets it up and checks everything is working before handing over.$q$, null, true, 10),
  ($q$aquaelite-floor-pro$q$, $q$AquaElite Floor Pro$q$, $q$AquaElite$q$, $q$Freestanding Water Purifier$q$, array[$q$freestanding$q$]::text[], $j$[{"filtration":"UF","label":"4-Stage UF","code":"W2905-3F","price":null,"rent":null},{"filtration":"RO","label":"4-Stage RO","code":"W2905-3R","price":null,"rent":null}]$j$::jsonb, $q$UF / RO$q$, array[$q$Hot$q$, $q$Normal$q$, $q$Cold$q$]::text[], $q$Professional installation$q$, $q$2 years$q$, $q$/images/products/aquaelite-floor-pro.webp$q$, $q$The AquaElite experience in a freestanding tower: purified hot, normal and cold water for busy homes and workplaces.$q$, array[$q$Freestanding$q$, $q$UF or RO$q$, $q$Hot · Normal · Cold$q$]::text[], $j$[{"title":"Freestanding convenience","body":"A floor-standing tower that frees up your counter space."},{"title":"Three temperatures on tap","body":"Hot, normal and cold purified water for everyone who uses it."},{"title":"Matched to your water","body":"UF for treated city water, RO for well water and higher TDS. We recommend the right one for you."},{"title":"Bottleless by design","body":"No more bottled-water deliveries, heavy bottles or storage space."}]$j$::jsonb, $j$[{"title":"Busy homes","body":"Larger households that drink a lot of water."},{"title":"Offices & meeting floors","body":"A central hydration point for growing teams."},{"title":"Clinics & waiting rooms","body":"Clean, reliable water for visitors all day."}]$j$::jsonb, $q$Choose the UF model (W2905-3F) for treated city water, or the RO model (W2905-3R) for well water and water with higher dissolved solids.$q$, $q$A trained LUSAKO technician connects the system to your existing water supply, sets it up and checks everything is working before handing over.$q$, null, true, 20),
  ($q$aquaprime-pro$q$, $q$AquaPrime Pro$q$, $q$AquaPrime$q$, $q$Freestanding Office Water Purifier$q$, array[$q$freestanding$q$]::text[], $j$[{"filtration":"UF","label":"4-Stage UF","code":"W2904-3F","price":null,"rent":null},{"filtration":"RO","label":"4-Stage RO","code":"W2904-3R","price":null,"rent":null}]$j$::jsonb, $q$UF / RO$q$, array[$q$Hot$q$, $q$Normal$q$, $q$Cold$q$]::text[], $q$Professional installation$q$, $q$2 years$q$, $q$/images/products/aquaprime-pro.webp$q$, $q$A robust freestanding purifier built for everyday shared use, with pure water for whole teams and UF or RO purification.$q$, array[$q$Built for daily use$q$, $q$UF or RO$q$, $q$Freestanding$q$]::text[], $j$[{"title":"Built for everyday use","body":"A robust freestanding purifier designed for busy shared spaces."},{"title":"Matched to your water","body":"UF for treated city water, RO for well water and higher TDS. We recommend the right one for you."},{"title":"Simple for everyone","body":"Straightforward controls that anyone in the building can use."},{"title":"Bottleless by design","body":"No more bottled-water deliveries, heavy bottles or storage space."}]$j$::jsonb, $j$[{"title":"Offices & workplaces","body":"Reliable water for teams of every size."},{"title":"Factories & canteens","body":"A hard-working hydration point for shift teams."},{"title":"Schools & institutions","body":"Pure water for students, staff and visitors."}]$j$::jsonb, $q$Choose the UF model (W2904-3F) for treated city water, or the RO model (W2904-3R) for well water and water with higher dissolved solids.$q$, $q$A trained LUSAKO technician connects the system to your existing water supply, sets it up and checks everything is working before handing over.$q$, null, true, 30),
  ($q$aquasignature-pro$q$, $q$AquaSignature Pro$q$, $q$AquaSignature$q$, $q$Signature Freestanding Water Purifier$q$, array[$q$freestanding$q$]::text[], $j$[{"filtration":"UF","label":"4-Stage UF","code":"W2908-3UF","price":null,"rent":null},{"filtration":"RO","label":"4-Stage RO","code":"W2908-3RO","price":null,"rent":null}]$j$::jsonb, $q$UF / RO$q$, array[$q$Hot$q$, $q$Normal$q$, $q$Cold$q$]::text[], $q$Professional installation$q$, $q$2 years$q$, $q$/images/products/aquasignature-pro.webp$q$, $q$Our signature freestanding purifier. A refined design with UF or RO purification, for spaces that make an impression.$q$, array[$q$Signature design$q$, $q$UF or RO$q$, $q$Freestanding$q$]::text[], $j$[{"title":"Signature design","body":"Refined finishes that belong in premium interiors."},{"title":"Matched to your water","body":"UF for treated city water, RO for well water and higher TDS. We recommend the right one for you."},{"title":"A floor-standing presence","body":"A purifier that becomes part of the space, not an afterthought."},{"title":"Bottleless by design","body":"No more bottled-water deliveries, heavy bottles or storage space."}]$j$::jsonb, $j$[{"title":"Executive offices","body":"Hydration that matches the standard of the room."},{"title":"Premium homes","body":"A statement purifier for design-led interiors."},{"title":"Hotels & showrooms","body":"Pure water where first impressions count."}]$j$::jsonb, $q$Choose the UF model (W2908-3UF) for treated city water, or the RO model (W2908-3RO) for well water and water with higher dissolved solids.$q$, $q$A trained LUSAKO technician connects the system to your existing water supply, sets it up and checks everything is working before handing over.$q$, null, true, 40)
on conflict (slug) do nothing;

insert into public.cms_parts (category, name, description, image_url, price, life_months, published, position)
select * from (
  values
    ($q$filters$q$, $q$PP / Sediment filter$q$, $q$The first stage: captures sand, rust and silt before they reach the finer stages.$q$, null::text, 2850::numeric, 10, true, 0),
    ($q$filters$q$, $q$CTO / Pre-carbon filter$q$, $q$A carbon block that reduces chlorine, taste and odour, and protects the membrane.$q$, null::text, 3600::numeric, 12, true, 10),
    ($q$filters$q$, $q$T33 / Post-carbon filter$q$, $q$The final polishing stage, for fresh-tasting water at the tap.$q$, null::text, 3600::numeric, 18, true, 20),
    ($q$filters$q$, $q$UF filter$q$, $q$The ultrafiltration membrane in UF purifiers.$q$, null::text, 8990::numeric, 30, true, 30),
    ($q$filters$q$, $q$RO filter$q$, $q$The reverse osmosis membrane in RO purifiers.$q$, null::text, 16950::numeric, 24, true, 40),
    ($q$filters$q$, $q$Mineral filter$q$, $q$Adds minerals back for a rounded taste.$q$, null::text, 4400::numeric, 12, true, 50),
    ($q$spare-parts$q$, $q$Water purifier pumps$q$, $q$Booster and pressure pumps for RO systems.$q$, null::text, null::numeric, null::integer, true, 60),
    ($q$spare-parts$q$, $q$Pressure switches$q$, $q$Start and stop the system at the right pressure.$q$, null::text, null::numeric, null::integer, true, 70),
    ($q$spare-parts$q$, $q$Solenoid valves$q$, $q$Control the flow of water through the system.$q$, null::text, null::numeric, null::integer, true, 80),
    ($q$spare-parts$q$, $q$Storage tanks$q$, $q$Hold purified water ready to dispense.$q$, null::text, null::numeric, null::integer, true, 90),
    ($q$spare-parts$q$, $q$Electrical components$q$, $q$Boards, sensors and wiring for LUSAKO systems.$q$, null::text, null::numeric, null::integer, true, 100),
    ($q$accessories$q$, $q$Faucets & taps$q$, $q$Dispensing taps for countertop and under-sink systems.$q$, null::text, null::numeric, null::integer, true, 110),
    ($q$accessories$q$, $q$Connectors & fittings$q$, $q$Tubing, connectors and installation kits.$q$, null::text, null::numeric, null::integer, true, 120),
    ($q$accessories$q$, $q$Pre-filter housings$q$, $q$Extra protection where the supply carries more sediment.$q$, null::text, null::numeric, null::integer, true, 130)
) as defaults (category, name, description, image_url, price, life_months, published, position)
where not exists (select 1 from public.cms_parts);

-- A database that ran an earlier version of this migration has placeholder filters without prices. Swap the ones
-- nobody has edited for LUSAKO's priced range; anything the admin changed is left alone.
with placeholders as (
  delete from public.cms_parts
  where category = 'filters' and price is null and image_url is null
    and name in ('Sediment filters', 'Carbon filters', 'UF membranes', 'RO membranes', 'Mineral cartridges')
  returning id
)
insert into public.cms_parts (category, name, description, price, life_months, published, position)
select 'filters', f.name, f.description, f.price, f.life_months, true, f.position
from (
  values
    ($q$PP / Sediment filter$q$, $q$The first stage: captures sand, rust and silt before they reach the finer stages.$q$, 2850::numeric, 10, -60),
    ($q$CTO / Pre-carbon filter$q$, $q$A carbon block that reduces chlorine, taste and odour, and protects the membrane.$q$, 3600::numeric, 12, -50),
    ($q$T33 / Post-carbon filter$q$, $q$The final polishing stage, for fresh-tasting water at the tap.$q$, 3600::numeric, 18, -40),
    ($q$UF filter$q$, $q$The ultrafiltration membrane in UF purifiers.$q$, 8990::numeric, 30, -30),
    ($q$RO filter$q$, $q$The reverse osmosis membrane in RO purifiers.$q$, 16950::numeric, 24, -20),
    ($q$Mineral filter$q$, $q$Adds minerals back for a rounded taste.$q$, 4400::numeric, 12, -10)
) as f (name, description, price, life_months, position)
where exists (select 1 from placeholders)
  and not exists (select 1 from public.cms_parts p where p.category = 'filters' and p.name = f.name);
