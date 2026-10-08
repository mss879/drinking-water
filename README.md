# LUSAKO — drinkingwater.lk

Marketing and lead-generation website for LUSAKO, Water Purification & Hydration Solutions (Sri Lanka).
Built with Next.js 16 (App Router), React 19 and Tailwind CSS 4.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Copy `.env.example` to `.env.local` to configure the site URL, lead delivery, analytics and Supabase (the admin). The
site runs without any of them.

## Where things live

| Path | What it is |
|---|---|
| `DESIGN.md` | The design system: colour tokens, type scale, primitives, motion and content rules. Read it before changing any UI. |
| `app/` | Routes. Public pages live in the `app/(site)` route group, which wraps them in the site chrome; `app/admin` is the admin. `app/actions/leads.ts` is the server action behind every form; `app/api/visit` receives the analytics beacons; `app/og` renders the social card. |
| `supabase/` | The database: one migration per feature, `setup-admin.sql` and the setup guide (`supabase/README.md`). |
| `components/admin`, `lib/admin`, `lib/supabase` | The admin: its shell, screens, charts and helpers, and the Supabase clients (browser, server, public, service). `proxy.ts` guards `/admin`. |
| `components/blog`, `lib/blog` | The blog: post cards, the article view, the Tiptap schema shared by the editor and the renderer, cached queries and uploads. |
| `content/` | All copy and data: products, rental terms, FAQs, services, AMC plans (`amc.ts`), parts, functional water, clients, forms, navigation. Edit content here, not in components. Products, parts, AMC prices, client logos, website images and the contact details are the defaults for the admin's Website section (below). |
| `lib/cms` | The Website section's layer: cached public reads with fallback to `content/` (`content.ts`), row parsing (`map.ts`), the `site-media` bucket rules and browser uploads. |
| `components/ui` | Primitives: buttons, pills and tags, highlight, icon badge and 3D brand icons, section heading, accordion, marquee, snap row, wave-line decor. |
| `components/motion` | The motion system: `MotionRoot` (scroll reveals, parallax and scroll-scrubbed moments with GSAP ScrollTrigger, re-run on every route), `SmoothScroll` (Lenis), `PageTransition` (used by `app/template.tsx`), `createVideoScrub` (the scroll-played film in the stats band) and `splitWords` for word-by-word headlines. See `DESIGN.md` §7. |
| `components/preloader` | The home page intro ("Drop"): `intro-script.ts` decides before the first paint whether a visit gets it, `preloader.tsx` holds its markup and opens it onto the page; the animation itself is CSS in `app/globals.css`. Add `?intro` to the address to replay it. See `DESIGN.md` §7. |
| `components/sections` | Reusable sections: the inner-page hero card and the strip under it, buy vs rent, how it works, UF/RO chooser, rental inclusions, the black FAQ block, the closing CTA band. |
| `components/home`, `products`, `rental`, `forms`, `layout` | Page-specific components and the site chrome. |
| `lib/` | SEO metadata (`seo.ts`) and structured data (`local-business.ts`, `jsonld.tsx`), analytics, lead delivery, formatting, Find My Solution logic. |
| `public/images` | Black & white photography, product renders, 3D icons and the water ribbon (see Brand imagery below). |
| `public/video` | The home hero film and its phone crop (see Hero film below), and the scroll film behind the home stats band with its phone crop and posters (see Scroll film below). |

## Editing content

- **Everything is editable in the admin (Website section):** every price (with its own show switch), every page's text and search title / description, the FAQs, client stories, products (with extra specifications, questions and search fields), which products Find my solution recommends, parts, AMC plans, client logos, every website image, and the contact details, social links and WhatsApp greeting. Saves show on the website straight away. Until Supabase and the migrations are set up, the site shows the defaults in `content/`.
- **How page text works:** each page declares its text as blocks in `content/copy/<page>.ts` (`content/copy/schema.ts` explains the format: fields, length limits, `*highlight*` marks and `{tokens}`). The defaults are the website's own wording; `getCopy()` in `lib/cms/content.ts` lays the admin's changes (table `cms_copy`, only the changed fields) over them, and the admin's **Page text** section builds its forms from the same declarations. Link destinations, icons, ids and figures worked out from data stay in the code. To make new text editable, add a field to a block and render it from `getCopy()`; the admin form appears by itself.
- **Prices & quotes:** every purifier option's buy and rent-from price, the rental plans' from-prices, the initial payment, the Regional Hydration Service (with optional per-province charges) and the AMC on-call fee live in `cms_prices`, one row each with its own **Show on the website** switch. They start hidden (client, October 2026: "Remove prices & add Get a quote for buy and rent both"), so every card and product page reads **Get a quote** and the rental quote builder lists its lines without amounts. Switch a price on and it appears where the website showed it before (cards, product page, Product structured data, rental page and quote builder, Hydration solutions, Find my solution, Why LUSAKO); hidden amounts can't be read by the public. The amounts the site used before (PureFlow UF 4,990, RO 5,990, initial payment 6,000) are stored, hidden, ready to switch back on. AMC plan prices and filter prices are shown as before.
- **KOKO:** product pages show KOKO's "Pay in 3 instalments" badge on the Buy option (`components/products/koko-badge.tsx`, logo in `public/brand/partners/koko.png`, from the client's change list, in KOKO's own colours). With a buy price shown it reads "or 3 × LKR … with KOKO", like the client's reference. Prices & quotes can turn it off.
- **AMC plans:** names, descriptions, terms and the warranty / rental / AMC / on-call comparison are in `content/amc.ts`, from LUSAKO's AMC proposal (October 2026). Every AMC amount on the site (plan cards, both comparison tables, the Complete Annual Care savings, the filter discount table and the AMC FAQs) is worked out from the prices saved in the admin, so they always agree.
- **FAQs, services, functional water, case studies:** `content/faqs.ts`, `content/services.ts`, `content/functional-water.ts`, `content/clients.ts`.
- Search for `TODO(client)` to find every value waiting for LUSAKO's confirmation.

## Leads

Four purpose-specific forms (Buy / Quote, Office Rental, Corporate Hydration, Service Request) post to one validated server action. Each lead gets a reference number and is tagged with its source: direct purchase, rental, corporate hydration or service. With Supabase connected, every lead is saved as an inquiry in the admin first, with the page it came from and how that visit arrived. Set `LEAD_WEBHOOK_URL` as well to keep forwarding leads as JSON to a CRM or automation tool. Without either, leads are written to the server log.

## Admin (`/admin`)

Supabase-backed and signed-in only; accounts are created in Supabase and listed as admins with `supabase/setup-admin.sql` (full guide: `supabase/README.md`).

- **Dashboard:** website numbers first (visitors on the site now, visitors, page views, visit length, traffic, sources), then inquiries, the pipeline, follow-ups due and the blog.
- **Inquiries:** everything sent through the forms, with filters, search, the visitor's journey, call / WhatsApp / email shortcuts, notes, statuses, CSV export and **Move to CRM**. A live badge counts unread ones.
- **CRM pipeline:** a drag-and-drop board (mouse, touch or keyboard). Stages can be added, renamed, reordered, marked won or lost and deleted, except **New Leads**, which is fixed first and is where inquiries arrive. Each lead has a sheet with its details, follow-up date, value and a timeline of calls and notes. CSV export.
- **Web analytics:** first-party and cookie-free. Visitors, visits, page views, bounce rate, engagement time, live visitors, pages (top, entry, exit), channels (search, social, AI assistants, campaigns…), countries and cities, devices, browsers, screens and languages, form submissions and clicks (WhatsApp, phone, email, outbound), product views, 404s, a weekday × hour heatmap and Core Web Vitals.
- **Website** (the control panel the client asked for, after the TechNurture admin):
  - **Products:** add, edit, reorder, hide or delete water purifiers; upload the photo; choose categories (countertop, freestanding, under-sink, wall-mount, sparkling); name each purification option and its model number; edit every line of the product page, plus extra specification rows, extra questions and the product's own search title and description. **Recommended products** on the same screen picks what Find my solution recommends for homes, offices and companies, and the product on the home page's Buy card.
  - **Prices & quotes:** every price with its show switch (see Editing content), the KOKO badge, whether shown prices also appear on the home page's cards, and **Hide every price**.
  - **Page text:** every page's wording, page by page and section by section, with each field's length limit and a **Use the original** button; plus the shared sections (closing call to action, questions block, how it works, LUSAKO Care services, functional water types, rental inclusions) and the header, footer and contact panels. Each page's **Search & sharing** block sets the title and description Google shows.
  - **FAQs:** add, edit, reorder, hide or delete the questions by topic, and choose which ones the home page and Corporate hydration show. The AMC questions are worked out from the AMC plans; the warranty question (repeated on every product page) can be edited but not deleted.
  - **Client stories:** the success stories on Our clients (the three samples to start with); name a client only with their written approval.
  - **Parts & accessories:** filter cartridges, spare parts and accessories, with photos, optional prices and each filter's typical life. Filter prices also feed the AMC page's discount table.
  - **AMC plans:** the monthly price, preventive visits, tank sanitations, priority service and filter / spare-parts discounts for Essential Maintenance, Complete Annual Care and Maximum Protection, plus the standalone visit and sanitation prices the savings are measured against.
  - **Client logos:** add, replace, reorder, hide or remove; no limit on the number. Shown in greyscale on the site.
  - **Website images:** replace the header image of any page (About, Why LUSAKO, Hydration solutions, Functional water, AMC plans, Parts, Our clients, Blog, FAQs, Contact) and any of the six lifestyle photos (numbered as in the client's change list, and also the header images of the Rental, Corporate, Service & support, Find my solution and Water purifiers pages); uploads are resized and turned black & white to match the site, and "Use the original" puts the built-in image back.
  - **Contact & social:** phone numbers, emergency hotline, WhatsApp (sales and emergency), emails, hours, address, and LinkedIn / Facebook / Instagram / YouTube / TikTok links. LUSAKO's Facebook, Instagram, LinkedIn and TikTok profiles are set by default and show in the header's contact panel, the mobile menu, the contact page and the footer. Also the message WhatsApp chats open with, and whether the floating WhatsApp button shows.
  - **Blog:** a rich-text editor (headings, lists, links, quotes, code, images by button, paste or drop) with cover images, categories, scheduling, SEO fields and a preview. Posts appear on `/blog` straight away; renaming a published post redirects its old address.

## Analytics

The site's own analytics (`components/analytics/tracker.tsx`) record page views, time on page, scroll depth, clicks on phone / WhatsApp / email / outside links, the site's events and Core Web Vitals, and report them in the admin. They use no cookies and store no IP addresses. Admins' browsers, bots and local development aren't counted.

`lib/analytics.ts` also pushes `product_view`, `generate_lead`, `rental_quote_calculated` and `find_solution_completed` events to `window.dataLayer`. Set `NEXT_PUBLIC_GTM_ID` to load Google Tag Manager as well.

## Search (SEO)

- **Every page:** its own title (under 60 characters; long ones drop the " | LUSAKO" suffix), description (under 160), canonical address and social card. Product pages get their own card (`app/og/products/[slug]`), blog posts their cover. `lang="en-LK"`, a web manifest, favicon and app icons.
- **Structured data:** LUSAKO as a `LocalBusiness` (address with postcode, opening hours read from the hours in the admin, phone numbers, emails, social profiles) and the `WebSite` on every page; `BreadcrumbList` on inner pages; no `Product` data on product pages, because Google treats a product without a price as an error and LUSAKO doesn't publish prices; `Service` for rental and corporate hydration, with priced offers for the AMC plans; `ItemList` on the catalogue; `FAQPage` on the FAQs; `BlogPosting` on articles.
- **`/robots.txt`:** allows the site, keeps crawlers out of `/admin` and `/api`, and points to the sitemap. Netlify deploy previews and branch deploys (or `NEXT_PUBLIC_NOINDEX=1`) ask crawlers to stay away entirely; the admin also sends `noindex`.
- **`/sitemap.xml`:** every public page, product and published post, rebuilt hourly and whenever the admin saves. Products and posts carry their real last-changed date, and products their photo for image search.
- **At launch:** add `GOOGLE_SITE_VERIFICATION` (and `BING_SITE_VERIFICATION`) to verify the site in Google Search Console and Bing Webmaster Tools, then submit `https://drinkingwater.lk/sitemap.xml` in both.

## Security

- **Headers** (`next.config.ts`, on every response): a Content Security Policy that only allows the site's own files, the Supabase project (images, admin sign-in, data, live updates) and, when `NEXT_PUBLIC_GTM_ID` is set, Google Tag Manager and Analytics; nothing may frame the site and forms only post back to it. Plus HSTS (one year; add `includeSubDomains; preload` once every drinkingwater.lk subdomain is on HTTPS), `nosniff`, `X-Frame-Options: DENY`, a strict referrer policy, `Cross-Origin-Opener-Policy` and a Permissions-Policy that turns off camera, microphone, location and payment APIs. No `X-Powered-By`. If you add a third-party script or embed, add its host to the policy there.
- **Forms:** validated on the server, with a honeypot, a time trap and a rate limit of 5 quote requests per connection per 10 minutes (`public.rate_limit_hit`, migration 8; it stores a hash of the address, never the address, and lets everything through if the check itself fails).
- **Admin:** `proxy.ts` sends signed-out visitors to the login; every admin page, server action and CSV export checks the admin list again (`requireAdmin`), and row level security has the final say in the database. The secret key is only used on the server.
- **Dependencies:** `npm audit --omit=dev` is clean. The remaining advisory is in ESLint's tooling (dev only, not shipped).

## Going live (Netlify)

`netlify.toml` pins the build (`npm run build`, Node 22); Netlify's Next.js runtime handles the rest (server rendering, image optimisation, caching and revalidation when the admin saves).

1. **Supabase:** run the migrations in `supabase/migrations` in order, including `20261008120000_final_changes.sql` (social links, prices out of the catalogue, the form rate limit) and `20261009120000_editable_website.sql` (prices with show switches, page text, FAQs, client stories, product extras). See `supabase/README.md`.
2. **Environment variables** (Site configuration → Environment variables): `NEXT_PUBLIC_SITE_URL=https://drinkingwater.lk`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (scope it to Functions/runtime), and optionally `LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_GTM_ID`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`. Redeploy after changing any `NEXT_PUBLIC_` value: they're built into the pages.
3. **Domain:** add drinkingwater.lk (and www, redirecting to it) under Domain management and let Netlify issue the HTTPS certificate.
4. **Admin:** create the admin account, run `supabase/setup-admin.sql`, and turn off public sign-ups in Supabase.
5. **Check:** open `/robots.txt` (it should allow the site and list the sitemap) and `/sitemap.xml`, send a test quote request and see it arrive in the admin's Inquiries.
6. **Search:** verify the site in Google Search Console and Bing Webmaster Tools and submit the sitemap.

## Brand imagery

Every colour on the site comes from the LUSAKO brand sheet (`DESIGN.md` › Palette), and that includes the imagery.

Each inner page opens on its own hero image. Ten are minimal black & white still lifes in `public/images/heroes` (the `page…` entries in `content/images.ts`, each replaceable in the admin's Website images), composed with the subject on the right and the left half near-black so the hero text always reads; the other five pages use one lifestyle photo each. They were generated three at a time on 2×2 sheets (gpt_image_2_5, medium, 4k, 16:9) and sliced, which costs about a third of a credit per image. `scripts/brand-recolor.py` (Pillow + numpy) locks pictures to the sheet's blue strip `#0055A8 → #278CF0 → #FFFFFF`:

```bash
python3 scripts/brand-recolor.py strip in.png out.webp --range 0.10,0.97 --mid 0.5   # 3D icons and renders
```

```bash
python3 scripts/brand-recolor.py mono in.jpg out.jpg                                # black & white photos
```

- **Photos** (`public/images/*.jpg`) were generated with Higgsfield for the design build and are shown in black & white (the StomDent reference): run `mono` on any replacement photography.
- **Product renders** (`public/images/products/*.webp`) are stand-ins, not LUSAKO's real machines, and stay in natural colour. Replace them with approved product photography before launch (same file names, transparent background).
- **3D icons** (`public/images/brand-icons/*.webp`) were generated as 4×4 sheets and then strip-mapped with the `strip` command above, so they share one brightness range (`--range 0.10,0.97`). `content/brand-icons.ts` maps Lucide icons to them, so `<IconBadge><Droplets /></IconBadge>` shows the 3D drop automatically; add a line there to upgrade another icon, pass `brandIcon="…"` to choose one directly, or `brand={false}` to keep the line icon.
- **The water ribbon** (`public/images/3d/water-ribbon.webp`), used in PURE ∞ HYDRATION and the FAQ block, was generated with Higgsfield (`gpt_image_2_5`, transparent background) and strip-mapped with `--mid 0.42`.

Icons and the film are referenced by string path, so give replacements new file names (Next caches optimized images by URL).

### Logo

`public/brand` holds the LUSAKO logo rebuilt as clean vectors from the client's artwork: the full logo with its tagline (blue and white SVG, plus a 1600px PNG), the wordmark on its own, and the drop mark used for the favicon, the Apple touch icon and the 404 page. The site draws the wordmark from `content/brand-logo.ts` through `components/ui/logo.tsx`, so it stays crisp at any size and can turn white over dark backgrounds. Usage rules are in `DESIGN.md` › Logo.

### Hero film

The home hero plays the client's Google Flow film (1280×720, 8 seconds) as its background: `public/video/hero-membrane.mp4` is the supplied file frame for frame, with its silent audio track dropped and its index moved to the front so it starts while it downloads (a remux, not a re-encode). Phones get `hero-membrane-phone.mp4`, the 576×720 part of it they actually show at the same framing, at a quarter of the size. `public/video/hero-poster.jpg` is its first frame, shown until the film starts and to visitors who prefer reduced motion. To swap the film, run these on the new file and re-export the poster:

```bash
ffmpeg -i new.mp4 -map 0:v:0 -c copy -movflags +faststart public/video/hero-membrane.mp4
```

```bash
ffmpeg -i new.mp4 -map 0:v:0 -vf "crop=576:720:211:0" -c:v libx264 -preset slow -crf 25 -profile:v high -pix_fmt yuv420p -movflags +faststart -an public/video/hero-membrane-phone.mp4
```

```bash
ffmpeg -i public/video/hero-membrane.mp4 -frames:v 1 -q:v 3 public/video/hero-poster.jpg
```

### Scroll film

The home stats band plays `public/video/water-1280.mp4` as it scrolls past (phones get `water-portrait.mp4`, a 406×720 centre crop), over `water-poster.jpg`. The footage is the client's underwater clip, recoloured onto the brand strip with a Hald colour table and re-encoded for scrubbing: no audio, a keyframe every 4 frames, no B-frames. For a 1280×720 source:

```bash
python3 scripts/brand-recolor.py hald hald.png --lo 0.34 --hi 0.94 --mid 0.62
```

```bash
ffmpeg -i source.mp4 -i hald.png -filter_complex "[0:v][1:v]haldclut" -an -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 25 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -movflags +faststart public/video/water-1280.mp4
```

```bash
ffmpeg -i source.mp4 -i hald.png -filter_complex "[0:v]crop=406:720:(iw-406)/2:0[c];[c][1:v]haldclut" -an -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 24 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -movflags +faststart public/video/water-portrait.mp4
```

```bash
ffmpeg -i public/video/water-1280.mp4 -frames:v 1 -q:v 2 public/video/water-poster.jpg
```

## Needed from LUSAKO before launch

From the developer brief (§19):

- Final product names, warranty terms and full specifications. These can all be entered in the admin.
- The under-sink and wall-mount models, and the hydrogen and alkaline systems (the categories and the Functional water page are ready for them).
- The on-call inspection / call-out fee, if LUSAKO wants it shown (the AMC proposal describes the fee but gives no amount).
- Warranty terms for the comparison table's Warranty column, which currently reads "Covered defects".
- Rental contract terms for the quote (prices are no longer published).
- Exact maintenance and filter-replacement inclusions, plus termination, relocation and damage terms.
- Approved client logos and case studies (the logos can go straight into the admin). The three case studies on the site are marked as samples.
- The high-resolution product and lifestyle photos LUSAKO is sending (photos 1–4 in the change list map to the admin's Website images).

## Notes on the brief

- The developer brief's rental table marks the Regional Hydration Service "Applicable" for the Western Province, but its own text says Western Province customers must not see it. The site follows the text.
- The bottle water dispenser category (AquaServe Pro) was removed at the client's request (October 2026 change list), and under-sink and wall-mount categories added.
- The refundable domestic rental deposit was removed at the client's request; rentals now list only the one-time initial payment, the monthly rental and, outside the Western Province, the Regional Hydration Service.
- "Final website changes" (October 2026) removed every buy and rental price, including the initial payment's amount, in favour of Buy and Rent **Get a quote** buttons. Migration 8 also takes the prices out of the product catalogue in the database, which anyone can read.
- The change list named the AMC options "Comprehensive, Non-Comprehensive and On-Call"; LUSAKO's AMC proposal (October 2026) replaced them with Essential Maintenance, Complete Annual Care and Maximum Protection, with on-call service as the no-contract option. The site follows the proposal. Its filter sheet's cost column is internal and is not shown anywhere.
