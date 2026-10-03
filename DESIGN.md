# LUSAKO — Design System

The contract for every page and component. If a colour, size or radius isn't here, add it here first.

## 1. Identity

- **Product:** LUSAKO — Water Purification & Hydration Solutions (Sri Lanka, drinkingwater.lk).
- **Brand line:** Better Water. Better Way. — pillars **BUY • RENT • HYDRATE • CARE**.
- **Audiences:** homes (buy), offices & companies (rent), multi-site organisations (corporate hydration), existing customers (service).
- **Single job of the site:** guide every visitor to one clear next action — Buy, Rent, Request a Corporate Solution, or Contact Service. It is a sales tool, not a catalogue.

## 2. Style direction

The client kept every word of the copy and asked for a new look, built from two references and the LUSAKO brand sheet (`Lusako Branding Palate.pdf`):

| Reference | What we took | Where |
|---|---|---|
| GrowSphere CRM landing | An airy canvas (ours is a faint brand tint); split hero (big headline left; tag, intro and pill buttons right); a glossy 3D centrepiece with floating callouts; ✓ check chips; a rounded stats band on a blue fluid background with big light numbers; the "capabilities" list (sticky title, icon │ title + text rows, hairline dividers); a full-width blue statement band | Home hero, stats band, rental inclusions, page heroes, CTA band |
| StomDent clinic | Bold blue display type and uppercase section labels; thin blue-outlined cards with one solid-blue feature and a big blue circle CTA in the grid; numerals 01–07 in thin weight strung along a wave; carousel arrows (outlined ← / filled →); the black FAQ block with the open row in solid blue; underlined-field forms beside a map; black & white photos | Choose your way, how it works, product rail, FAQ, forms, contact, photos |

Mood: clean, confident, premium, watery. White space first; blue does the talking; black only for the FAQ block and footer.

### Logo

- The client's LUSAKO logo (geometric lowercase "lusako", a water drop cut into the "o", tagline "Technology for better life"), rebuilt as exact vectors from their artwork.
- Colours (brand sheet): logo blue `#278CF0`, tagline `#545454`. White versions for dark surfaces.
- Files in `public/brand`: `lusako-logo.svg` / `-white.svg` (with tagline), `lusako-wordmark.svg` / `-white.svg`, `lusako-mark.svg` (the drop "o"), `lusako-logo.png` (1600px). The favicon (`app/icon.svg`) and `app/apple-icon.png` use the mark.
- In code: `<Logo />` (`components/ui/logo.tsx`) draws the wordmark from `content/brand-logo.ts`; `inverted` makes it white.
- Leave clear space of at least the height of the "o" around the logo. Don't recolour, stretch, outline or add effects.

## 3. Palette — locked to the brand sheet

**Every colour on the site comes from the brand sheet. Nothing else.** `app/globals.css` starts `@theme` with `--color-*: initial` (and resets Tailwind's black shadow tokens), so only these exist:

| Token | Value | Use |
|---|---|---|
| `brand` | `#278CF0` | Main blue: headline accents, icons, numerals, wave lines, large-type surfaces |
| `deep` | `#0055A8` | Dark end of the sheet's blue strip: **buttons**, links, small blue text, surfaces with small white text |
| `steel` | `#438CCF` | Gradients and secondary accents |
| `mist` | `#9DC4DF` | Light blue: secondary text on black, outlines on deep blue |
| `ink` | `#0A0A0D` | Headings, the FAQ block, the footer |
| `muted` | `#545454` | Body and secondary text (the sheet's grey swatch) |
| `white` | `#FFFFFF` | Cards, pills and controls — they sit a step lighter than the canvas |
| `canvas` | `#278CF0` mixed 4% into white | The page background and the header: a very faint blue, so white cards lift off it |
| `tint`, `tint-2`, `line` | `#278CF0` mixed 8%, 14%, 20% into white | Soft panels, chips, hairlines — points on the sheet's own white → blue strip, each a step up from the canvas |
| `deep-hover` | `#0055A8` 70% → `#278CF0` | Button hover |
| `danger` | `#EF554B` | Form errors only (border + icon; the message stays `ink`) |

- Tints and overlays are only these colours at reduced opacity (`bg-brand/10`, `text-white/85`, `border-white/20`) or mixes along the strip.
- No hex/rgb literals in components. The only literals live in `@theme`, the logo SVGs and `app/og/route.tsx` (which can't read CSS variables).
- **Contrast rules (WCAG AA):** white text on `brand` only for large type (≥24px, or ≥19px bold) and icons. Small text on a blue surface goes on `deep` (7.3:1). On `deep`: `white` or `white/85`, never `mist` for small text. On `ink`: secondary text `mist`, dividers `muted`. Small blue text on white is `deep`.
- **Imagery follows the palette too** (`scripts/brand-recolor.py`, README › Brand imagery): 3D icons, the 3D water ribbon and the scroll film are gradient-mapped onto the strip `#0055A8 → #278CF0 → #FFFFFF`; lifestyle photos are black & white (StomDent); product renders stay in natural colour so buyers see the real finish.

## 4. Typography

Brand sheet: **Raleway** for headings, **Montserrat** for body, UI and figures (both variable, `next/font/google` in `app/layout.tsx`; `--font-display`, `--font-sans`).

| Role | Style |
|---|---|
| Home hero h1 | Raleway 700, `clamp(2.1rem, 8.4vw, 4.25rem)`, two deliberate lines ("Pure water" / "without the hassle") |
| Page h1 (`text-display`) | Raleway 700, 40 → 68px, `-0.03em` |
| Section h2 (`text-h2`) | Raleway 600, 32 → 52px |
| Card titles (`text-h3`) | Raleway 700, 21 → 26px |
| Section label (`label` utility) | Raleway 700, 13px, uppercase, `0.16em`, `deep`, with a short `brand` rule (the sheet's "SUB HEADING") |
| Lead (`text-lead`) | Montserrat 17 → 19px, `muted` |
| Stats / numerals | Montserrat 200–300, `brand` or white, `tabular-nums` |

- Key phrases in headlines use `<Highlight>` (brand blue text). The home hero's "Pure water" uses `text-gradient` (deep → brand → steel).
- One idea per line: break multi-sentence statements on purpose (block spans + `whitespace-nowrap`), no orphaned words at 390 / 1280 / 1512px, statements ≤ ~52px.

## 5. Shape, depth, spacing

- Radii: `rounded-chip` 12px, `rounded-card-sm` 16px, `rounded-card` 24px, `rounded-card-xl` 32px; pills and buttons `rounded-full`.
- Cards: `card-line` (white, 1px `line` border, `rounded-card`; hover `border-brand` + `bg-tint` when it's a link). Feature cards: solid `brand` (large type only) or `deep`; the Corporate card and FAQ block are `ink`.
- Shadows are deep-blue only: `shadow-soft`, `shadow-float`, `drop-shadow-icon`, `drop-shadow-float`.
- Container 1320px; gutters 20 / 32 / 48px come from `--gutter` through the `px-gutter` utility, which also keeps content clear of an iPhone's notch in landscape (`viewport-fit=cover`). Sections `py-16 md:py-20 lg:py-28`. Header 72px (80px from lg) — `var(--header-h)`.
- Small screens: a `grid` with no column count gets one column that can shrink (`:where(.grid)` in `globals.css`), buttons and pills wrap rather than widen the page, headline phrases that should stay together are `inline-block` (never `whitespace-nowrap`), fixed card heights and tall spacers apply from `sm`/`md` up only, and forms jump to the first invalid field or the confirmation after a submit. Check 320, 390, 768 and 1024px.
- Decor: `WaveLines` (drifting wave strokes in `currentColor`) and `Rule` (a hairline that draws itself), both in `components/ui/decor.tsx`.

## 6. Primitives

| Component | Notes |
|---|---|
| `Button` / `ButtonLink` / `buttonClasses` | `primary` (deep, default) · `outline` · `ink` · `white` · `glass` · `ghost`; `sm` / `md` / `lg`; `arrow` puts the arrow in its own circle at the end of the pill |
| `Pill` · `Tag` | Pills: `outline` · `tint` · `white` · `glass` · `deep`. `Tag` is the GrowSphere "New \| …" announcement tag |
| `SectionHeading` | `eyebrow` (label), `title` (word-split), `description`, `action`, `layout="split"` (intro on the right), `tone="dark"` |
| `PageHero` · `HeroCard` · `HeroStrip` · `Breadcrumbs` | Inner-page hero: a compact version of the home hero card (see §7). `HeroCard` is the shell (also used by product pages and the 404); `HeroStrip` is the quiet strip under a hero for a page's summary line and pills |
| `CtaBand` | Closing statement band (brand → deep gradient), last on a page |
| `FaqSection` | The black FAQ block; `Accordion tone="dark"` inside it, `tone="light"` elsewhere |
| `IconBadge` · `BrandIcon` | 3D brand icons (auto-swapped from Lucide icons) or line icons in round badges |
| `ArrowCircle`, `SnapRow` + `CarouselArrows`, `Marquee`, `Highlight`, `Logo`, `Container` | as named |

## 7. Motion & accessibility

- **Engine:** GSAP 3 + ScrollTrigger (`components/motion/motion-root.tsx`, re-run on every route) with Lenis smooth scrolling (`smooth-scroll.tsx`), plus CSS keyframes wherever scroll data isn't needed.
- **Intro ("Drop", `components/preloader`):** on the first full load of the home page in a browser tab, a drop falls onto the canvas, lands as the "o" of LUSAKO with ripples, the name unrolls out of it with the brand line beneath, then the page opens out from the drop in a growing circle while the navigation drops in and the hero film, headline and buttons come in. About 3.5s. It is CSS keyframes started before the first paint by an inline script, moving only transform and opacity, so it stays smooth while the page loads and hydrates underneath. The page opens 2.5s in, or on a later ripple (3.75s, 5s at most) if the fonts and the hero's first frame aren't in yet. Skipped for reduced motion, inner pages, `#section` links and repeat loads in the same tab; `?intro` replays it. If the app's scripts never load it fades out on its own.
- **Navigation:** a floating glass bar with 16px corners (`components/layout/header.tsx`), starting `--edge` from the left and right of the screen: logo, a capsule of links whose current item is a white pill, Buy / Rent and the quote button. It is smoked glass (`ink/55`, white type) while it sits on a page's dark hero card and frosted white (`white/85`, ink type) once the card has scrolled away (`components/layout/hero-tone.ts`: every hero card registers itself and an IntersectionObserver reports when it is under the pill; the server renders smoked glass first). The header keeps `--header-h` of room in the flow; only the pill takes clicks. On phones the menu opens as a rounded sheet 5px from the screen edges over a dimmed page.
- **Home hero:** a rounded card (16px corners, 20px from lg) that fills the first screen, 5px in from all four edges (on phones it ends 5px above the bottom action bar), sliding up under the navigation pill. Its background is the client's film of water running through membrane fibres (`public/Water_flowing_through_membrane_f…mp4`, used as supplied, with its first frame as the poster). On large screens the film sits to the right and fades into `ink` on the left, where the tag, headline, intro and two buttons sit in white; on phones it fills the card under an `ink` shade. Nothing else shares the hero: the four "No …" lines are a strip of their own right below it (`components/home/problems.tsx`). The film only plays while the hero is on screen, and reduced-motion or data-saver visitors get the still frame. The headline rises out of line masks on load. The WhatsApp button waits until the hero has scrolled away.
- **Inner-page heroes** (`PageHero`): the same rounded dark card as the home hero, slid up under the navigation, but compact (about 64% of the screen on large screens, its content's height on phones) and quieter. In place of the film, the page's black & white photo sits on the right and melts into ink on the left (a 34% mask, plus a light ink veil); on phones it runs behind a top-to-bottom ink shade. Inside, only a glass label pill, the headline (each line rises out of its own mask, like the home headline; highlighted words take the brand → mist gradient), one intro line and at most two buttons (white, then glass). Breadcrumbs show on nested pages only (all pages carry BreadcrumbList data). Anything else a page used to show on its hero photo lives in the `HeroStrip` below. Blog posts use their cover, shown black & white; product pages show the render (in its own colours) on a soft blue glow; the 404 has the drop "o".
- **Focus on dark surfaces:** the focus ring turns white inside `[data-surface="dark"]` (hero cards, the smoked navigation, the FAQ block, the footer, the blue bands, the admin sidebar), where deep blue would fall below 3:1.
- **Hooks** (data attributes, all off under reduced motion):
  - `data-reveal="up|fade|scale"`, `data-stagger` (children in turn), and every `main section .grid`'s children rise in; `data-no-reveal` keeps a layout grid out of that.
  - `data-split` word-split headings.
  - `data-draw` SVG lines draw with the scroll (wave through the steps, dividers).
  - `data-count` figures count up once.
  - `data-expand` bands open out from an inset rounded card (`="full"` to full-bleed).
  - `data-parallax` / `data-rotate` drift and turn; `data-slide="left|right"` cards slide in towards each other.
  - `data-hscroll` pins a section on large screens while its track slides sideways (the purifier rail); below lg it is a swipe row.
  - Plus `data-bigtype` (PURE ∞ HYDRATION), `data-progress`, the footer `data-wordmark`, parallax on `object-cover` photos (`data-no-parallax` to opt out) and the scroll-reactive marquee.
- **Stats band film:** the recoloured underwater film scrubs with the band's pass through the screen (`createVideoScrub`, encoded with a keyframe every 4 frames); Save-Data and reduced motion keep the poster.
- **Page transitions:** `app/template.tsx` → `PageTransition` (fade up 32px, 750 ms; not on the first page of a visit).
- Pins use a tall section + CSS `sticky` stage (reliable with Lenis), never inside revealed or transformed ancestors.
- Only `transform`, `opacity` and `clip-path` are animated (the one exception is the intro's opening hole, a mask that grows for 0.9s). `prefers-reduced-motion: reduce` switches all of it off and every pinned section falls back to normal flow.
- Contrast per §3. Touch targets ≥ 44px. Visible focus on everything (2px `deep` outline; underlined fields thicken to deep). Semantic landmarks, one `h1` per page, labelled forms, `aria-expanded` on disclosures.

## 8. Content rules from the client brief

- Start with the customer's problem, never with a catalogue.
- BUY and RENT always visible (header on desktop, sticky bottom bar on mobile) + persistent **Contact / Get a quote**: on desktop it opens a panel with every number, the emergency hotline, WhatsApp, emails and hours; on phones the bar's Contact button opens the same details in a sheet (client: contact details must not need a scroll to the footer).
- Rental is sold to offices & companies; homes are guided to buy.
- Every product shows **Buy** and **Rent** side by side. On product pages the price selector puts each purification option (4-Stage UF, 4-Stage RO) on its own card with its buy price and rental-from price; the Buy and Rent buttons follow the chosen card. The hero leads with "Rent from LKR …".
- Rental pricing: base monthly + VAT; Regional Hydration Service only for non-Western Province, always a separate line; LKR 6,000 initial payment per unit (first month only). There is no deposit. Amounts are written "LKR 4,990" (`formatLKR`, with a no-break space so "LKR" never ends a line).
- The home page shows no rental prices, stage counts or product counts (client request); prices live on the product, rental and catalogue pages (`ProductCard showPrices={false}` on the home rail, `PurificationChooser` home context).
- AMC plans follow LUSAKO's AMC proposal: Essential Maintenance, Complete Annual Care (recommended, the deep-blue card and column everywhere) and Maximum Protection, with on-call service as the no-contract option. Prices read "LKR 699 / month" with the annual fee and daily cost under them; discounted prices and daily costs keep their cents ("2,137.50"), as in the proposal. Comparison tables become stacked rows on phones, the plan names held under the header.
- Never invent client names, logos, testimonials, stats or specs. Client logos come only from the admin and show in greyscale. Unconfirmed values are flagged `TODO(client)` in `content/`.

## 9. Admin (`/admin`)

The admin speaks the same language as the site, quieter:
- **Shell:** large screens get an ink sidebar (the hero card and footer surface) with the white logo, the sales sections in the client's order (Dashboard, Inquiries, CRM pipeline, Web analytics), then a **Website** group (Products, Parts & accessories, AMC plans, Client logos, Photos, Contact & social, Blog) and the account menu. The active item is a white pill like the navigation's current page; the unread badge is white on ink, deep on the white pill. Phones and tablets get a frosted top bar and a bottom tab bar in the style of the mobile action bar, whose fifth tab, Website, opens a hub of the Website sections.
- **Content:** the canvas background with white `card-line` panels, Raleway headings and Montserrat everywhere else; numbers in columns are `tabular-nums`, headline figures proportional.
- **Status:** chips from the tokens only (New = deep, In progress = tint-2 with deep text, Resolved = ink outline, Spam = muted). Coral stays for errors. Direction and good/bad are carried by arrows and words, not traffic-light colours.
- **Charts** (`components/admin/charts`, hand-rolled SVG): visitors in `brand` (2px line over a 10% wash) and page views in `deep`, on one count axis with solid hairline gridlines in `line`. A crosshair and tooltip follow the pointer or the arrow keys, and every chart has a table view. The weekday × hour heatmap uses one hue in four steps (`brand` 60% → 80% → 100% → `deep`), with empty hours in `tint`. The pair and the ramp were run through the data-viz palette validator: colour-blind separation, contrast and lightness steps all pass.
- **Forms:** boxed fields (16px text on phones so iOS doesn't zoom), the site's buttons, native `<dialog>` modals and side sheets.
