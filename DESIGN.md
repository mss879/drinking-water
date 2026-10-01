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
| `PageHero` · `HeroMedia` · `Breadcrumbs` | Split inner-page hero; `HeroMedia` is the wide rounded black & white photo that opens out on scroll |
| `CtaBand` | Closing statement band (brand → deep gradient), last on a page |
| `FaqSection` | The black FAQ block; `Accordion tone="dark"` inside it, `tone="light"` elsewhere |
| `IconBadge` · `BrandIcon` | 3D brand icons (auto-swapped from Lucide icons) or line icons in round badges |
| `ArrowCircle`, `SnapRow` + `CarouselArrows`, `Marquee`, `Highlight`, `Logo`, `Container` | as named |

## 7. Motion & accessibility

- **Engine:** GSAP 3 + ScrollTrigger (`components/motion/motion-root.tsx`, re-run on every route) with Lenis smooth scrolling (`smooth-scroll.tsx`), plus CSS keyframes wherever scroll data isn't needed.
- **Intro ("Drop", `components/preloader`):** on the first full load of the home page in a browser tab, a drop falls onto the canvas, lands as the "o" of LUSAKO with ripples, the name unrolls out of it with the brand line beneath, then the page opens out from the drop in a growing circle while the navigation drops in and the hero film, headline and buttons come in. About 3.5s. It is CSS keyframes started before the first paint by an inline script, moving only transform and opacity, so it stays smooth while the page loads and hydrates underneath. The page opens 2.5s in, or on a later ripple (3.75s, 5s at most) if the fonts and the hero's first frame aren't in yet. Skipped for reduced motion, inner pages, `#section` links and repeat loads in the same tab; `?intro` replays it. If the app's scripts never load it fades out on its own.
- **Navigation:** a floating glass bar with 16px corners (`components/layout/header.tsx`), starting `--edge` from the left and right of the screen: logo, a capsule of links whose current item is a white pill, Buy / Rent and the quote button. It is smoked glass (`ink/55`, white type) while it sits on the home hero film and frosted white (`white/85`, ink type) once the film has scrolled away and on every other page. The header keeps `--header-h` of room in the flow; only the pill takes clicks. On phones the menu opens as a rounded sheet 5px from the screen edges over a dimmed page.
- **Home hero:** a rounded card (16px corners, 20px from lg) that fills the first screen, 5px in from all four edges (on phones it ends 5px above the bottom action bar), sliding up under the navigation pill. Its background is the client's film of water running through membrane fibres (`public/Water_flowing_through_membrane_f…mp4`, used as supplied, with its first frame as the poster). On large screens the film sits to the right and fades into `ink` on the left, where the tag, headline, intro and two buttons sit in white; on phones it fills the card under an `ink` shade. Nothing else shares the hero: the four "No …" lines are a strip of their own right below it (`components/home/problems.tsx`). The film only plays while the hero is on screen, and reduced-motion or data-saver visitors get the still frame. The headline rises out of line masks on load. The WhatsApp button waits until the hero has scrolled away.
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
- BUY and RENT always visible (header on desktop, sticky bottom bar on mobile) + persistent **Get a quote**.
- Rental is sold to offices & companies; homes are guided to buy.
- Every product shows two CTAs side by side: **Buy** and **Rent / Ask about rental**.
- Rental pricing: base monthly + VAT; Regional Hydration Service only for non-Western Province, always a separate line; Rs. 6,000 initial payment per unit (first month only); Rs. 25,000 refundable deposit for domestic rentals. All values come from `content/pricing.ts`.
- Never invent client names, logos, testimonials, stats or specs. The home stats band only shows figures derived from `content/` (rental from-price, 4-stage UF & RO, number of purifiers). Unconfirmed values are flagged `TODO(client)` in `content/`.
