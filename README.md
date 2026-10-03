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
| `content/` | All copy and data: products, rental pricing, FAQs, services, AMC plans (`amc.ts`), parts, functional water, clients, forms, navigation. Edit content here, not in components. Products, parts, AMC prices, client logos, photos and the contact details are the defaults for the admin's Website section (below). |
| `lib/cms` | The Website section's layer: cached public reads with fallback to `content/` (`content.ts`), row parsing (`map.ts`), the `site-media` bucket rules and browser uploads. |
| `components/ui` | Primitives: buttons, pills and tags, highlight, icon badge and 3D brand icons, section heading, accordion, marquee, snap row, wave-line decor. |
| `components/motion` | The motion system: `MotionRoot` (scroll reveals, parallax and scroll-scrubbed moments with GSAP ScrollTrigger, re-run on every route), `SmoothScroll` (Lenis), `PageTransition` (used by `app/template.tsx`), `createVideoScrub` (the scroll-played film in the stats band) and `splitWords` for word-by-word headlines. See `DESIGN.md` §7. |
| `components/preloader` | The home page intro ("Drop"): `intro-script.ts` decides before the first paint whether a visit gets it, `preloader.tsx` holds its markup and opens it onto the page; the animation itself is CSS in `app/globals.css`. Add `?intro` to the address to replay it. See `DESIGN.md` §7. |
| `components/sections` | Reusable sections: the inner-page hero card and the strip under it, buy vs rent, how it works, UF/RO chooser, rental inclusions, the black FAQ block, the closing CTA band. |
| `components/home`, `products`, `rental`, `forms`, `layout` | Page-specific components and the site chrome. |
| `lib/` | SEO metadata (`seo.ts`) and structured data (`local-business.ts`, `jsonld.tsx`), analytics, lead delivery, formatting, Find My Solution logic. |
| `public/images` | Black & white photography, product renders, 3D icons and the water ribbon (see Brand imagery below). |
| `public/video` | The scroll film behind the home stats band, its phone crop and poster (see Scroll film below). |

## Editing prices and content

- **In the admin (Website section):** products (photo, categories, each UF / RO option's model number, buy price and rental-from price, and the page text), filters, parts & accessories (prices and typical filter life), AMC plan prices, visits and discounts, client logos, the six lifestyle photos, and the contact details and social links. Saves show on the website straight away. Until Supabase and the website content migration are set up, the site shows the defaults in `content/`.
- **Rental plans:** `content/pricing.ts` holds the PureFlow UF / RO from-prices used by the rental page and calculator, the LKR 6,000 initial payment and the Regional Hydration Service charge.
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
  - **Products:** add, edit, reorder, hide or delete water purifiers; upload the photo; choose categories (countertop, freestanding, under-sink, wall-mount, sparkling); set each purification option's buy price and rental-from price; edit every line of the product page.
  - **Parts & accessories:** filter cartridges, spare parts and accessories, with photos, optional prices and each filter's typical life. Filter prices also feed the AMC page's discount table.
  - **AMC plans:** the monthly price, preventive visits, tank sanitations, priority service and filter / spare-parts discounts for Essential Maintenance, Complete Annual Care and Maximum Protection, plus the standalone visit and sanitation prices the savings are measured against.
  - **Client logos:** add, replace, reorder, hide or remove; no limit on the number. Shown in greyscale on the site.
  - **Photos:** replace any of the six lifestyle photos (numbered as in the client's change list); uploads are turned black & white to match the site.
  - **Contact & social:** phone numbers, emergency hotline, WhatsApp (sales and emergency), emails, hours, address, and LinkedIn / Facebook / Instagram / YouTube / TikTok links.
  - **Blog:** a rich-text editor (headings, lists, links, quotes, code, images by button, paste or drop) with cover images, categories, scheduling, SEO fields and a preview. Posts appear on `/blog` straight away; renaming a published post redirects its old address.

## Analytics

The site's own analytics (`components/analytics/tracker.tsx`) record page views, time on page, scroll depth, clicks on phone / WhatsApp / email / outside links, the site's events and Core Web Vitals, and report them in the admin. They use no cookies and store no IP addresses. Admins' browsers, bots and local development aren't counted.

`lib/analytics.ts` also pushes `product_view`, `generate_lead`, `rental_quote_calculated` and `find_solution_completed` events to `window.dataLayer`. Set `NEXT_PUBLIC_GTM_ID` to load Google Tag Manager as well.

## Search (SEO)

- **Every page:** its own title (under 60 characters; long ones drop the " | LUSAKO" suffix), description (under 160), canonical address and social card. Product pages get their own card (`app/og/products/[slug]`), blog posts their cover. `lang="en-LK"`, a web manifest, favicon and app icons.
- **Structured data:** LUSAKO as a `LocalBusiness` (address with postcode, opening hours read from the hours in the admin, phone numbers, emails, social profiles) and the `WebSite` on every page; `BreadcrumbList` on inner pages; `Product` with offers on product pages once a purchase price is entered (none is shown without one); `Service` with priced offers for the AMC plans, rental and corporate hydration; `ItemList` on the catalogue; `FAQPage` on the FAQs; `BlogPosting` on articles.
- **`/robots.txt`:** allows the site, keeps crawlers out of `/admin` and `/api`, and points to the sitemap. Netlify deploy previews and branch deploys (or `NEXT_PUBLIC_NOINDEX=1`) ask crawlers to stay away entirely; the admin also sends `noindex`.
- **`/sitemap.xml`:** every public page, product and published post, rebuilt hourly and whenever the admin saves. Products and posts carry their real last-changed date.
- **At launch:** add `GOOGLE_SITE_VERIFICATION` (and `BING_SITE_VERIFICATION`) to verify the site in Google Search Console and Bing Webmaster Tools, then submit `https://drinkingwater.lk/sitemap.xml` in both.

## Brand imagery

Every colour on the site comes from the LUSAKO brand sheet (`DESIGN.md` › Palette), and that includes the imagery.

Each inner page opens on its own hero image. Ten are minimal black & white still lifes in `public/images/heroes` (`heroImages` in `content/images.ts`), composed with the subject on the right and the left half near-black so the hero text always reads; the other five pages use one lifestyle photo each. They were generated three at a time on 2×2 sheets (gpt_image_2_5, medium, 4k, 16:9) and sliced, which costs about a third of a credit per image. `scripts/brand-recolor.py` (Pillow + numpy) locks pictures to the sheet's blue strip `#0055A8 → #278CF0 → #FFFFFF`:

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

The home hero plays `public/Water_flowing_through_membrane_f…_20260930142633.mp4` (generated in Google Flow, 1280×720, 8 seconds) as its background, exactly as supplied. `public/video/hero-poster.jpg` is its first frame, shown until the film starts and to visitors who prefer reduced motion. To swap the film, put the new file in `public/`, point `film.src` in `components/home/hero.tsx` at it and re-export the poster:

```bash
ffmpeg -i public/<film>.mp4 -frames:v 1 -q:v 3 public/video/hero-poster.jpg
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

- Final product names, 4-Stage UF and 4-Stage RO purchase prices (and whether VAT is included), rental-from prices, warranty terms and full specifications. These can all be entered in the admin.
- The under-sink and wall-mount models, and the hydrogen and alkaline systems (the categories and the Functional water page are ready for them).
- The on-call inspection / call-out fee, if LUSAKO wants it shown (the AMC proposal describes the fee but gives no amount).
- Warranty terms for the comparison table's Warranty column, which currently reads "Covered defects".
- PureFlow plan prices for every model, contract terms, and the Regional Hydration Service charge.
- Exact maintenance and filter-replacement inclusions, plus termination, relocation and damage terms.
- Approved client logos and case studies (the logos can go straight into the admin). The three case studies on the site are marked as samples.
- The high-resolution product and lifestyle photos LUSAKO is sending (photos 1–4 in the change list map to the admin's Photos section).
- The LinkedIn and other social media addresses (Contact & social in the admin).

## Notes on the brief

- The developer brief's rental table marks the Regional Hydration Service "Applicable" for the Western Province, but its own text says Western Province customers must not see it. The site follows the text.
- The bottle water dispenser category (AquaServe Pro) was removed at the client's request (October 2026 change list), and under-sink and wall-mount categories added.
- The refundable domestic rental deposit was removed at the client's request; rentals now show only the LKR 6,000 initial payment, the monthly rental and, outside the Western Province, the Regional Hydration Service.
- The change list named the AMC options "Comprehensive, Non-Comprehensive and On-Call"; LUSAKO's AMC proposal (October 2026) replaced them with Essential Maintenance, Complete Annual Care and Maximum Protection, with on-call service as the no-contract option. The site follows the proposal. Its filter sheet's cost column is internal and is not shown anywhere.
