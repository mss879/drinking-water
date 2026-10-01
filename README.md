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
| `components/ui` | Primitives: buttons, pills and tags, highlight, icon badge and 3D brand icons, section heading, accordion, marquee, snap row, wave-line decor. |
| `components/motion` | The motion system: `MotionRoot` (scroll reveals, parallax and scroll-scrubbed moments with GSAP ScrollTrigger, re-run on every route), `SmoothScroll` (Lenis), `PageTransition` (used by `app/template.tsx`), `createVideoScrub` (the scroll-played film in the stats band) and `splitWords` for word-by-word headlines. See `DESIGN.md` §7. |
| `components/preloader` | The home page intro ("Drop"): `intro-script.ts` decides before the first paint whether a visit gets it, `preloader.tsx` holds its markup and opens it onto the page; the animation itself is CSS in `app/globals.css`. Add `?intro` to the address to replay it. See `DESIGN.md` §7. |
| `components/sections` | Reusable sections: page hero and hero media, buy vs rent, how it works, UF/RO chooser, rental inclusions, the black FAQ block, the closing CTA band. |
| `components/home`, `products`, `rental`, `forms`, `layout` | Page-specific components and the site chrome. |
| `lib/` | SEO metadata, JSON-LD, analytics, lead delivery, formatting, Find My Solution logic. |
| `public/images` | Black & white photography, product renders, 3D icons and the water ribbon (see Brand imagery below). |
| `public/video` | The scroll film behind the home stats band, its phone crop and poster (see Scroll film below). |

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

## Brand imagery

Every colour on the site comes from the LUSAKO brand sheet (`DESIGN.md` › Palette), and that includes the imagery. `scripts/brand-recolor.py` (Pillow + numpy) locks pictures to the sheet's blue strip `#0055A8 → #278CF0 → #FFFFFF`:

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
