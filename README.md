# LUSAKO — drinkingwater.lk

Marketing and lead-generation website for LUSAKO, Water Purification & Hydration Solutions (Sri Lanka).
Built with Next.js 16 (App Router), React 19 and Tailwind CSS 4.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Copy `.env.example` to `.env.local` to configure the site URL, lead delivery and analytics.

## Where things live

| Path | What it is |
|---|---|
| `DESIGN.md` | The design system: colour tokens, type scale, primitives, motion and content rules. Read it before changing any UI. |
| `app/` | Routes. `app/actions/leads.ts` is the server action behind every form; `app/og` renders the social card. |
| `content/` | All copy and data: products, rental pricing, FAQs, services, clients, forms, navigation. Edit content here, not in components. |
| `components/ui` | Primitives: buttons, pills, highlight, icon badge and 3D brand icons, accordion, marquee, snap row, decor. |
| `components/motion` | The motion system: `MotionRoot` (scroll reveals, parallax and scroll-scrubbed moments with GSAP ScrollTrigger, re-run on every route), `SmoothScroll` (Lenis), `PageTransition` (used by `app/template.tsx`), `createVideoScrub` (the scroll-played hero film) and `splitWords` for word-by-word headlines. See `DESIGN.md` §7. |
| `components/sections` | Reusable sections: page hero, buy vs rent, how it works, UF/RO chooser, FAQs, the closing arch CTA. |
| `components/home`, `products`, `rental`, `forms`, `layout` | Page-specific components and the site chrome. |
| `lib/` | SEO metadata, JSON-LD, analytics, lead delivery, formatting, Find My Solution logic. |
| `public/images` | Photography and product renders (see Images below). |
| `public/video` | The home hero film, its phone crop and poster (see Hero video below). |

## Editing prices and content

- **Rental pricing:** `content/pricing.ts` holds the monthly rental per model × filtration × contract term, the Rs. 6,000 initial payment, the Rs. 25,000 domestic deposit and the Regional Hydration Service charge. The calculator, product pages and cards all read from it.
- **Products:** `content/products.ts` (names, model numbers, purification, warranty, purchase price). A `null` price shows "Price on request".
- **FAQs, services, clients:** `content/faqs.ts`, `content/services.ts`, `content/clients.ts`.
- Search for `TODO(client)` to find every value waiting for LUSAKO's confirmation.

The content layer is plain TypeScript, so it can move into a CMS (Sanity, Payload, Contentful) later without touching the page designs.

## Leads

Four purpose-specific forms (Buy / Quote, Office Rental, Corporate Hydration, Service Request) post to one validated server action. Each lead gets a reference number and is tagged with its source: direct purchase, rental, corporate hydration or service. Set `LEAD_WEBHOOK_URL` to forward leads as JSON to a CRM or automation tool; without it, leads are written to the server log.

## Analytics

`lib/analytics.ts` pushes `product_view`, `generate_lead`, `rental_quote_calculated` and `find_solution_completed` events to `window.dataLayer`. Set `NEXT_PUBLIC_GTM_ID` to load Google Tag Manager.

## Images

The photography and product renders in `public/images` were generated with Higgsfield for the design build. The product images are stand-ins, not LUSAKO's real machines: replace them with approved product photography before launch (`public/images/products/*.webp`, same file names, transparent background).

The 3D icons in `public/images/icons` were generated the same way, as 4×4 sheets in the site palette. `content/brand-icons.ts` maps Lucide icons to them, so `<IconBadge><Droplets /></IconBadge>` shows the 3D drop automatically. Add a line there to upgrade another icon, pass `brandIcon="…"` to choose one directly, or `brand={false}` to keep the line icon.

### Logo

`public/brand` holds the LUSAKO logo rebuilt as clean vectors from the client's artwork: the full logo with its tagline (blue and white SVG, plus a 1600px PNG), the wordmark on its own, and the drop mark used for the favicon and Apple touch icon. The site draws the wordmark from `content/brand-logo.ts` through `components/ui/logo.tsx`, so it stays crisp at any size and can turn white over dark backgrounds. Usage rules are in `DESIGN.md` › Logo.

### Hero video

The home hero plays `public/video/hero-1280.mp4` as the visitor scrolls (phones get `hero-portrait.mp4`, a 406×720 centre crop), over `hero-poster.jpg`. Scrubbing only stays smooth with short keyframe intervals, so re-encode any replacement film the same way: no audio, a keyframe every 4 frames, no B-frames. For a 1280×720 source:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 25 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -movflags +faststart public/video/hero-1280.mp4
```

```bash
ffmpeg -i source.mp4 -vf "crop=406:720:(iw-406)/2:0" -an -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 24 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -movflags +faststart public/video/hero-portrait.mp4
```

```bash
ffmpeg -i public/video/hero-1280.mp4 -frames:v 1 -q:v 2 public/video/hero-poster.jpg
```

The original upload, `public/flow-AB-nOUb76Qw5HNCamLZ5khRa.mp4`, isn't used by the site and can be removed.

## Needed from LUSAKO before launch

From the developer brief (§19):

- Final product names, purchase prices (and whether VAT is included), warranty terms and full specifications.
- Monthly rental prices for each model and filtration, contract terms, and the Regional Hydration Service charge.
- Exact maintenance and filter-replacement inclusions, plus termination, relocation and damage terms.
- Whether the Rs. 25,000 domestic deposit is per unit (as built) or per contract.
- Approved client logos, testimonials and case studies. The three case studies on the site are marked as samples.
- Approved product and installation photography.
- Official phone, WhatsApp, email, showroom/service locations and social links (`content/site.ts`).

## Notes on the brief

- The developer brief's rental table marks the Regional Hydration Service "Applicable" for the Western Province, but its own text says Western Province customers must not see it. The site follows the text.
- AquaServe Pro appears in the positioning notes but not in the developer brief's model table. It is included as a bottle water dispenser, with its model number still to be confirmed.
