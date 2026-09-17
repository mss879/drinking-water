# LUSAKO — Design System

The contract for every page and component. If a colour, size or radius isn't here, add it here first.

## 1. Identity

- **Product:** LUSAKO — Water Purification & Hydration Solutions (Sri Lanka, drinkingwater.lk).
- **Brand line:** Better Water. Better Way. — pillars **BUY • RENT • HYDRATE • CARE**.
- **Audiences:** homes (buy), offices & companies (rent), multi-site organisations (corporate hydration), existing customers (service).
- **Single job of the site:** guide every visitor to one clear next action — Buy, Rent, Request a Corporate Solution, or Contact Service. It is a sales tool, not a catalogue.

## 2. Style direction (reference-fidelity)

Source: client-approved reference ("GreenWorld" layout). We keep its structure and re-skin it in blue.

| Reference element | LUSAKO translation |
|---|---|
| Pill nav with icons, dark pill CTA | Pill nav + persistent **Buy / Rent / Get a quote** pills |
| Huge centred headline, one word in a pastel pill | `Highlight` primitive on the key phrase |
| Floating circular icon badges | `IconBadge` in content grids |
| Hero with a mixed-shape card row | Replaced at the client's request by a full-bleed underwater film under a see-through header, played by scroll (§7) |
| White label tabs cut into card corners ("inverse radius") | `.corner-tab` + `.corner-action` utilities |
| Pastel marquee band | `Marquee` |
| Horizontal project cards, title in white pill, arrow circle | `SnapRow` + feature cards |
| Giant outline word + circular photo + giant solid word | `BigType` band |
| Rounded accordion rows, one expanded in pastel | `Accordion` |
| Pastel arch holding an oval photo with a round centre button | `ArchCTA` |
| Scattered pixel squares | `PixelCluster` motif |

Mood: clean, calm, premium, trustworthy. Lots of white space. No gradients-for-decoration except very soft water tints.

### Logo

- The client's LUSAKO logo (geometric lowercase "lusako", a water drop cut into the "o", tagline "Technology for better life"), rebuilt as exact vectors from their artwork: measured from the supplied image and redrawn with clean lines, arcs and superellipses. It overlaps the original by 98% and stays sharp at every size.
- Colours: logo blue `#268CF1`, tagline `#444444`. White versions for dark surfaces and over photography or video.
- Files in `public/brand`: `lusako-logo.svg` and `lusako-logo-white.svg` (with tagline), `lusako-wordmark.svg` and `lusako-wordmark-white.svg`, `lusako-mark.svg` (the drop "o"), `lusako-logo.png` (1600px). The favicon (`app/icon.svg`) and `app/apple-icon.png` use the mark.
- In code: `<Logo />` (`components/ui/logo.tsx`) draws the wordmark from `content/brand-logo.ts`; `inverted` makes it white. The header uses it at 30px (34px from lg); the footer uses the white lockup.
- The tagline is Barlow Semi Condensed SemiBold (the closest open-licensed match), converted to outlines.
- Leave clear space of at least the height of the "o" around the logo. Don't recolour, stretch, outline or add effects, and don't set "LUSAKO" in another typeface as a logo.

## 3. Colour tokens (Tailwind `@theme`, `--color-*`)

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0A1F3D` | Primary text, dark pills, headings |
| `abyss` | `#06142B` | Footer, deepest surfaces |
| `ocean` | `#0E3A70` | Deep accent: icon badges, dark feature cards |
| `brand` | `#1B66C9` | Primary blue: links, focus, key accents (white text passes 5.5:1) |
| `brand-bright` | `#2F80ED` | Hover of brand, graphic accents |
| `logo` | `#268CF1` | The LUSAKO logo blue, from the client's artwork. Logo only |
| `sky` | `#9CC7F5` | Rings, illustrations, large decorative marks |
| `mist` | `#C4DEF9` | Decorative circles inside pastel cards |
| `pastel` | `#DDEBFC` | **Signature pastel** — highlights, pastel cards, marquee band |
| `ice` | `#EEF5FE` | Tinted surface |
| `frost` | `#F4F7FB` | Neutral card background (reference grey) |
| `aqua` | `#4CC3E8` | Sparkle accent (icons on dark only, never text on white) |
| `line` | `#DCE5F0` | Hairlines, pill borders |
| `muted` | `#4B5D75` | Secondary text (6.7:1 on white, 5.5:1 on pastel) |
| `subtle` | `#5E6F86` | Tertiary text (5.2:1 on white) |

Page background is pure white. Text is never pure black.

## 4. Typography

Single family: **Outfit** (Google, via `next/font`, variable `--font-outfit`). Geometric, close to the reference.

| Role | Desktop | Mobile | Weight / tracking |
|---|---|---|---|
| `display` (hero h1) | 76/1.02 | 42/1.05 | 500 / -0.035em |
| `mega` (BigType) | clamp(64px, 12vw, 184px) | — | 700 / -0.045em, uppercase |
| `h2` | 48/1.08 | 32/1.12 | 500 / -0.03em |
| `h3` | 26/1.2 | 21/1.25 | 500 / -0.02em |
| `lead` | 20/1.5 | 18/1.5 | 400 |
| body | 16/1.6 | 16/1.6 | 400 |
| small | 14/1.5 | 14/1.5 | 400 |
| micro / pill | 12–13/1.3 | same | 500 |

Sentence case for headlines ("Pure water without the hassle"). Uppercase only for BigType and micro labels.

## 5. Shape, depth, spacing

- Radius: `pill` 9999px · `card-xl` 36px · `card` 28px · `card-sm` 20px · `chip` 12px.
- Depth is tonal (pastel/frost surfaces). Shadows only on floating elements: `0 12px 32px -12px rgb(10 31 61 / 0.25)`.
- Spacing base 4px. Section rhythm: `py-14 lg:py-20` (56/80), so sections sit ~112px apart on mobile and ~160px on desktop, close to the reference. Container max 1320px, gutters 20 / 32 / 48px.
- Grid: 12 columns desktop, 6 tablet, 4 mobile (implemented with CSS grid utilities).

## 6. Primitives (all states required)

| Primitive | Variants | States |
|---|---|---|
| `ButtonLink` / `Button` | `dark` (ink), `brand`, `pastel`, `outline`, `ghost`; sizes `sm` `md` `lg`; optional trailing `ArrowUpRight` | hover (lift 2px + arrow rotates 45°), active (scale .98), focus-visible (2px brand ring, 3px offset), disabled (40% opacity, no pointer), loading (spinner, `aria-busy`) |
| `Pill` (tag) | `outline`, `pastel`, `glass` (on photos) | static |
| `Highlight` | pastel pill behind inline words | — |
| `IconBadge` | `pastel`, `ocean`, `ink`, `outline`, `white`; sizes 40/48/56. Lucide icons with a match in `content/brand-icons.ts` render as the 3D brand icon instead (bare, 44/56/64px); `framed` keeps the circle and puts the 3D icon inside (dark surfaces); `brand={false}` keeps the line icon (timelines, contact rows, hero floaters, location pins) | 3D icon lifts and tilts while its card is hovered |
| `ArrowCircle` | `white`, `ink`, `pastel` | rotates on parent hover / open |
| `Accordion` | `rows` (reference list), `faq` | closed, open (pastel), hover, focus-visible; keyboard: Enter/Space |
| `Marquee` | `pastel`, `ink` | pauses on hover; static under reduced motion |
| Cards | `frost`, `pastel`, `ocean`, `white` + `.corner-tab`, `.corner-action`, `.notch-top` cut-outs | hover lift on linked cards |
| Form fields | text, email, tel, select, textarea, segmented choice | default, focus, invalid (+ message, `aria-invalid`), disabled, submitting, success, error |

## 7. Motion & accessibility

- **Engine:** GSAP 3 + ScrollTrigger in `components/motion/motion-root.tsx` (mounted once in the layout, re-run on every route), plus CSS keyframes wherever scroll data isn't needed. Headlines are split into words on the server (`splitWords`), so hero titles animate with CSS alone.
- **Smooth scroll:** Lenis (`components/motion/smooth-scroll.tsx`) glides wheel and trackpad scrolling on GSAP's ticker; touch stays native. It pauses while the mobile menu locks the page (`data-lenis-prevent` keeps the menu itself scrollable).
- **Home hero film:** a 360lvh section with a sticky full-bleed stage under a see-through header. The underwater film (`public/video`, re-encoded with a keyframe every 4 frames so seeks are cheap) is played by scroll through `createVideoScrub`, which only starts a new seek once the last frame has decoded. Beats: the headline slips up out of its masks → the problem rises word by word and leaves → the promise rises as its highlight fills in → the rest of the page slides up over the film as one rounded sheet (`[data-hero-cover]`) while the film zooms and deepens. The header stays see-through until that sheet reaches it. Phones load a portrait centre crop; Save-Data visitors keep the poster.
- **Page transitions:** `app/template.tsx` → `PageTransition` fades each new page up 32px (750 ms, `power3.out`). The first page of a visit doesn't animate.
- **Reveals:** children of card grids (`main section .grid`), `[data-stagger]` children and `[data-reveal]` blocks rise 48px as they enter (900 ms, 75 ms stagger, capped at 6). Only content below the fold is prepared, after hydration, so nothing flashes and pages read fine without JS.
- **Headings:** `SectionHeading` and `PageHero` titles are word-split; words rise out of `clip-path` masks as they scroll in (`[data-split]`).
- **Scroll-scrubbed:** parallax on large `object-cover` photos (±6%; opt out with `[data-no-parallax]`); PURE ◯ HYDRATION words slide in from both sides as the orb spins in (`[data-bigtype]`); the arch CTA opens (`[data-arch]`); progress lines fill (`[data-progress]`); the footer wordmark rises into place; the marquee speeds up and follows scroll direction.
- **Ambient:** the hero "Scroll" cue; 3D icons lift on card hover; accordions glide open (grid-rows transition).
- Only `transform` and `opacity` are animated. Entrances use `cubic-bezier(0.2, 0.75, 0.15, 1)`; hovers 200 ms.
- `prefers-reduced-motion: reduce` switches all of it off: MotionRoot, PageTransition, Lenis and the hero timeline bail out (the hero becomes a normal-height still with no video download) and every CSS animation sits behind `no-preference`.
- Contrast: body ≥ 4.5:1, large text/UI ≥ 3:1. Touch targets ≥ 44px. Visible focus on everything. Semantic landmarks, one `h1` per page, labelled forms, `aria-expanded` on disclosures.
- Icons: 47 3D brand icons in the palette (`public/images/icons`, generated with Higgsfield; 5 are spares) for feature, service, sector and audience grids via `IconBadge` / `BrandIcon`; Lucide line icons for nav, inline chips, forms and UI chrome. No emoji as icons.

## 8. Content rules from the client brief

- Start with the customer's problem, never with a catalogue.
- BUY and RENT always visible (header on desktop, sticky bottom bar on mobile) + persistent **Get a quote**.
- Rental is sold to offices & companies; homes are guided to buy.
- Every product shows two CTAs side by side: **Buy** and **Rent / Ask about rental**.
- Rental pricing: base monthly + VAT; Regional Hydration Service only for non-Western Province, always a separate line; Rs. 6,000 initial payment per unit (first month only); Rs. 25,000 refundable deposit for domestic rentals. All values come from `content/pricing.ts`.
- Never invent client names, logos, testimonials or specs. Unconfirmed values are flagged `TODO(client)` in `content/`.
