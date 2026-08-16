# Purelane → Shopify: Technical Analysis

**Status:** analysis only. No theme, no code, no dependencies created.
**Sources:** `docs/ASSIGNMENT.md` (what to build), `reference/purelane-homepage.html` (how it must look).
**Reference file:** 1,716 lines / 151,229 bytes / zero external dependencies except two Google Fonts families.

---

# PART 1 — Assignment requirements

Extracted verbatim in substance from `docs/ASSIGNMENT.md`. Nothing added.

### Objective
Take `purelane-homepage.html` — a fast design prototype for a plant-based homecare brand, not written with Shopify in mind — and turn it into **production sections a merchant's marketing team can run without a developer**.

### Required five sections
| # | Section | Anchor in prototype |
|---|---------|---------------------|
| 01 | Hero | `section.hero` |
| 02 | Shop / product grid | `#shop` |
| 03 | Best-selling combos | `#combos` |
| 04 | Bundles | `#bundles` |
| 05 | Reviews rail | `#reviews` |

Everything else in the file is **bonus**. Get these five right first.

### Shopify setup requirements
- Shopify Partner account + development store (both free).
- **Clean install of stock Dawn.** Not a premium theme, explicitly so the evaluation is of our work and not another section framework.

### Product / data requirements
- Seed the store with **at least eight products** that suit the brand.
- Must include: **one sold out**, **one with no image**, **one with a very long title**.

### Pixel-accuracy requirements
- Match the file **exactly**: layout, spacing, type, colour and behaviour.
- **At every width from 375px up.**
- "This is a build, not a redesign."

### Merchant-editability requirements
- **Nothing hardcoded that a marketing team would want to change.**

### Real Shopify data requirements
- Products, prices and content come **from the platform, not from our Liquid**.
- **Where a native field doesn't exist, solve it properly.**

### Reusability requirements
- **Several sections render similar cards. Build accordingly.**

### Theme editor requirements
- Adding, removing, reordering and reconfiguring **should never break anything, including the animations.**

### Performance requirements
- **Core Web Vitals are what we get paid to move.** Performance is a requirement, not a cleanup task.

### Accessibility requirements
- **Keyboard, focus states, contrast, reduced motion.**

### Code quality requirements
- **Clean and reviewable — code and commit history both.**

### Git / commit-history requirements
- Commit history is explicitly reviewed (same sentence as code quality). No further specification given.

### AI usage expectations
- "Use AI however you normally would. We build with agents here." No restriction, no mandated disclosure format stated in the brief.

### The governing rule
> **The design is the spec. The code is not.** Reproduce the visual output exactly. But where the underlying HTML or CSS is wrong for production — semantics, accessibility, performance, breakpoint logic — **fix it and tell us what you changed.** Rebuilding it to look how you'd have designed it is an **automatic no**.

This creates a documentation deliverable: a **changelog of deviations** with justification for each.

### Bonus scope
Every non-required section in the file: ticker, progress rail, ingredients (`#ingredients`), pillars / how it works (`#how`), proof + rotator + stats (`#proof`), full range strip (`#range`), why bundles (`#whybundles`), bundle categories (`#categories`), trust bar, signup, footer, mobile sticky CTA, and the fixed scene/water background system.

### Not specified by the brief (do not invent)
Deadline, submission mechanism, Dawn version pin, currency/market config, browser support matrix, hosting of screenshots, and whether a preview/theme-access link is expected. **Open questions for the user.**

---

# PART 2 — Purelane reference analysis

## 2.1 Overall page architecture

```
<head>  Google Fonts (Outfit 500–800, Inter 400–700), preconnect
        <style> #1  lines 12–633   V1 "dark" system  (full design system)
        <style> #2  lines 634–823  V2 "brand light"  (token + surface overrides)
<body>
  .scenes#scenes[data-d]      fixed, z0 — 4 gradient scenes + 4 water layers + 16 bubbles + vignette
  .ticker                     aria-hidden marquee, 8 spans (4 unique ×2), 30s
  header#hdr                  fixed pill nav, .up state after 90px scroll
  nav.rail                    fixed right dot rail, ≥1180px only, 7 links
  main#top
    section.hero          [data-scene=1]  ← REQUIRED 01
    section#reviews       [data-scene=1]  ← REQUIRED 05
    section#ingredients   [data-scene=2]     bonus
    section#how           [data-scene=2]     bonus
    section#proof         [data-scene=3]     bonus (stats + rotator)
    section#combos        [data-scene=3]  ← REQUIRED 03
    section#bundles       [data-scene=3]  ← REQUIRED 04
    section#shop          [data-scene=3]  ← REQUIRED 02
    section#range         [data-scene=3]     bonus
    section#whybundles    [data-scene=4]     bonus
    section#categories    [data-scene=4]     bonus
    section (trust)       [data-scene=4]     bonus
    section (signup)      [data-scene=4]     bonus
  footer                  [data-scene=4]
  .sticky                     mobile-only bottom CTA (<960px)
  <script>                    one IIFE, lines 1567–1713
```

**Critical finding — the page renders in the LIGHT palette.** Style block #2 re-declares `:root` and overrides every surface. V1's dark tokens are almost entirely dead. A line-by-line port would carry ~190 lines of overridden CSS and produce confusing theme settings. The production build should ship **one resolved token set** (the V2 values) and document the collapse.

## 2.2 Header / navigation
- `header#hdr` fixed, `top:38px`, drops to `top:10px` (`.up`) once `scrollY > 90`. Sits under the ticker.
- `.navpill.glass` — max-width 1180px, pill radius, backdrop blur.
- Brand: hex-leaf SVG mark + "Purelane" / "Clean, simply".
- `.nav` links: Home, Ingredients, How it works, Shop, Bundles. **`display:none` below 1024px.**
- `.navtools`: Search, Account (both `.hide-s`, hidden ≤600px), Cart (with `.dot` count badge `0`), Burger (hidden ≥1024px).
- Underline hover: `::after` animating `right:100% → 0` over .35s.
- **The burger opens nothing. There is no mobile menu in the file at all.** Below 1024px the site has no navigation.

## 2.3 Hero (`section.hero`)
- `min-height:100svh`, `display:flex; align-items:flex-end`, `padding:150px 0 34px`.
- `::before` diagonal scrim, `102deg` white 0.80→transparent at 68%; swaps to a vertical scrim ≤900px.
- Left: `.hero-copy` (max 600px) — `h1.d1` "Clean / That / **Lasts**" (`.lime` on the third word), leaf rule, lede, two CTAs (`#shop`, `#how`), then `.badgestrip` (3 glass chips, mobile-only ≥901px hidden).
- Right rail: `.badges.glass-2` — 3 promise badges, absolutely positioned, `display:none` ≤900px.
- Right: `.hero-prod#heroProd` → `.hstage#hstage` — **a 3-slide product carousel**:
  - Slide 1 `hs1`: 1 bottle, price tag "Single bottle ₹200 / ~~₹299~~ / 33% off"
  - Slide 2 `hs2`: 2 bottles, "Any 2 products ₹349 / ~~₹598~~ / Save ₹249"
  - Slide 3 `hs3`: 3 bottles, "Any 3 products ₹499 / ~~₹897~~ / Save ₹398"
  - Height-driven sizing (`.a/.b/.c` at 75–100% of stage height, negative margins for overlap, explicit z-index and `order`).
  - Staggered entry: `.d1/.d2/.d3` transition delays .06/.30/.54s; `.ptag` at .62s.
  - `.hdots#hdots` — 3 buttons, active dot widens to 20px.
- Stage height `clamp(380px,74svh,680px)` desktop, `clamp(300px,44svh,430px)` ≤900px — **fixed box, no CLS.**

## 2.4 Shop / product grid (`#shop`)
- `.panel-head`: kicker "Bestsellers", `h2.d2` "Loved by 30,000 homes", leaf rule.
- `.shelf` grid: **2 columns; 4 columns ≥860px**, gap 14px.
- **8 `.card` items — but only 4 unique products.** Cards 1–4 use `.pimg` base64 background classes; cards 5–8 repeat the same four products as **inline `<svg>` bottle illustrations**. Pure prototype padding.
- Card anatomy: `.shot` (150px tall, radius 14, gradient, `overflow:hidden`) containing `.pill` badge (Best seller / Top rated / New) + artwork → `h4` title → `.rate` (★ 4.8 · N reviews) → `.pr` (price / compare-at / "33% off") pinned by `margin-top:auto` → full-width `.btn.btn-ghost.btn-sm` "Add to cart".
- Hover: `translateY(-5px)`, .4s.
- Reveal delays `rv-d1..d3` staggered across the row.

## 2.5 Best-selling combos (`#combos`)
- `.comborail`: horizontal flex, `overflow-x:auto`, `scroll-snap-type:x mandatory`, scrollbars hidden, bleeds `-18px` into the gutter (`-14px` ≤760px).
- **5 `.combo` cards**, `flex:0 0 302px` (268px ≤760px), `scroll-snap-align:start`.
- Card anatomy: `.tray` (gradient header) with `.save` pill + optional `.flag` ("Most popular" / "Best value"), then `.stack` — the component products separated by `+` glyphs, each with a micro-benefit caption; then `.body` — `h3`, `.cnt` "3 products", `.inc` includes-sentence, `.prow` (price / compare-at / save badge), `.fine` "Inclusive of all taxes · COD available", full-width CTA.
- One card carries `.hero-combo` (accent border + ring).
- `.stack .it .tile` — **a dashed placeholder tile with a leaf icon, used where a component has no artwork.** This is the prototype's own no-image pattern and is the right basis for the missing-image edge case.
- Stack shows **max 3 items even for the "5 products" combo** — the count text and the artwork already disagree.
- `.swipecue` (aria-hidden) + `.railnote` beneath.

## 2.6 Bundles (`#bundles`)
- Intro panel (`.glass.sec-pad`) with kicker / `h2` "One box. Every room." / lede.
- `.tiers` grid: 1 column; **3 columns ≥760px**.
- Each `.tier`: `.tag` label → `.tierpix` product strip (1, 3 or 5 mini bottles; `.five` shrinks them to 54px) → `.qty` big numeral + "Products" → `.price` (₹499 ~~₹897~~) → per-unit line → `<ul>` of checkmark features → full-width CTA.
- Middle tier `.best` — accent border, extra ring, primary button.
- Hover `translateY(-5px)`.

## 2.7 Reviews rail (`#reviews`)
- `.revhead`: kicker "That's what they said", aggregate "★★★★★ **4.8** from 8,000+ reviews", "Loved by **12 lakh+** homes".
- `.revrail`: `overflow:hidden` + CSS mask fading both edges (7% / 93%).
- `.revtrack`: `width:max-content`, `animation:marq 52s linear infinite` translating `-50%` (40s ≤760px).
- **10 `.rcard` articles = 5 unique reviews duplicated once** — the duplication is what makes the `-50%` loop seamless.
- Card: `.st` stars → `h5` headline → `p` body → `.who` (check icon + name + "· product").
- `.revrail:hover, :focus-within` → `animation-play-state:paused`.
- Cards 284px (250px ≤760px).

## 2.8 Other sections (bonus)
Ingredients (5 hand-drawn botanical SVGs, 2-col → 5-col ≥760px, divider pseudo-elements); Pillars (3 glass cards ≥820px); Proof (copy + `#rot` 6-image auto-rotator + 4-stat ring row); Full range (10-bottle shelf strip, horizontally scrollable ≤760px); Why bundles (4 icon cells); Bundle categories (4 linked cards); Trust bar (4 cells); Signup (email form, `onsubmit="return false"`); Footer (4-column, `1.3fr 1fr 1fr 1fr` ≥760px); Sticky mobile CTA.

## 2.9 Background / scenes
- `.scenes` fixed, `z-index:0`, 4 stacked `.scene` divs cross-fading on `opacity` over **1.5s**.
- Light palette: mint gradients `#fbfffb → #bfe8ca` (s1) darkening through to `#e9f8ec → #8ecdaa` (s4).
- `.water` holds 4 SVG layers, each full-bleed `inset:-14% -10%`:
  - `wl-a` caustic lines, `mix-blend-mode:soft-light`, `drift-a` 34s
  - `wl-b` finer caustics, `overlay`, `drift-b` 23s (**hidden ≤760px**)
  - `wl-c` light shafts, `overlay`, `shaft-sway` 19s
  - `wl-s` surface band, `overlay`, `surface` 11s (visible only at depth 1)
  - `wl-a`/`wl-b`/`wl-s` run **`feTurbulence` + `feDisplacementMap`** filters.
- `.bub` — 16 spans, each with inline `--x/--s/--dur/--dly/--drift`, rising 116vh on loop. **Hidden ≤760px.**
- `.vig` radial + linear vignette.
- `[data-d="1..4"]` scales overall water opacity 1 → .9 → .76 → .58.

## 2.10 Product visuals
- **14 base64 `image/svg+xml` data URIs** declared once as custom properties (`--p-kitchen`, `--p-tap`, …), lines 252–265, **15.2 KB total**.
- Consumed via `.pimg.p-*` classes: `background-image` + a per-asset `aspect-ratio` (0.32–1.32), `background-size:contain`, `background-position:center bottom`.
- Sizing is **height-driven everywhere** — each context sets a height and the aspect ratio derives the width.
- Four bottle illustrations are additionally inlined as raw `<svg>` in shop cards 5–8, each ~2.5 KB, with brand text drawn as `<text>` (PURELANE / product name / 500 ML).

## 2.11 Typography
- Display: **Outfit** 800 (`.d1`–`.d4`), uppercase, `letter-spacing:-.018em`, `line-height:.87`.
  - `.d1 clamp(48px,8.6vw,112px)` → `clamp(44px,13.5vw,64px)` ≤760px
  - `.d2 clamp(30px,4.6vw,54px)/.94` · `.d3 clamp(21px,2.5vw,30px)` 700 · `.d4 clamp(16px,1.6vw,19px)` 700
- Body: **Inter**, `line-height:1.62`.
  - `.lede clamp(15px,1.35vw,17.5px)`, `max-width:44ch` · `.body-s 14.5px/1.66` · `.kicker 11px/700/.22em uppercase`
- Card/tier/rcard headings all use Outfit 700 uppercase at 12–16px with bespoke tracking.

## 2.12 Colours (resolved, V2 light)
| Token | Value | Role |
|---|---|---|
| `--ink` | `#f4f0fb` | page background |
| `--deep` | `#e2daf3` | (unused after override) |
| `--brand` | `#4b3a8f` | violet structural |
| `--brand-lt` | `#6b55b8` | |
| `--paper` | `#241a3d` | body ink |
| `--paper-2` | `rgba(36,26,61,.78)` | secondary text |
| `--paper-3` | `rgba(36,26,61,.56)` | tertiary text |
| `--accent` | `#b8701c` | accent (amber) |
| `--accent-2` | `#c9761d` | accent 2 |
| `--surface` | `#17102b` | headings |
| `--g-bg` | `linear-gradient(158deg,#fff .80,#ece6f7 .56,#ded4f0 .50)` | glass fill |
| `--g-line` | `rgba(75,58,143,.16)` | glass border |
| `--g-shadow` | `0 22px 54px rgba(58,44,112,.13)` | glass shadow |
| `--g-inset` | `inset 0 1px 0 rgba(255,255,255,.92)` | glass highlight |

Off-token literals used in V2 (must become tokens): `#4f7d10` (olive, ~20 uses), `#7a9c1e` (stars), `#01423b` (ghost-button ink), `#00706a → #004b46` (primary button), `#0d5b52` (botanical stroke), scene gradient stops.

## 2.13 Spacing, containers, radii, shadows
- `--sec-y:34px` → **22px ≤760px**. `.sec{padding:var(--sec-y) 0}`.
- `--maxw:1180px`; `.wrap{max-width:1180px;padding:0 18px}`.
- `.sec-pad{padding:clamp(26px,3.4vw,40px)}` → flat `22px 18px` ≤760px.
- `--r:26px`, `--r-sm:16px`; ad-hoc: 14px (`.shot`, `.tierpix`), 18px (`.rcard`), 20px (`.badges`), 999px (pills/buttons), 15px (`.pillar .pi`), 9px (`.tile`).
- Shadows: `--g-shadow`, `--g-inset`, plus product `drop-shadow(… rgba(0,74,66,.13–.16))` at seven different scales.
- Grid gaps: 14px (shelf/tiers/cats/combos), 16px (pillars), 12px (revtrack), 2px (trust/badges).

## 2.14 Buttons
`.btn` 46px pill, 12.5px/700/.13em uppercase, `.35s cubic-bezier(.2,.7,.2,1)`, `.btn-sm` 38px/11px.
- `.btn-primary` teal gradient `#00706a → #004b46`, ink `#f4fdf6`; hover `translateY(-2px)` + deeper shadow.
- `.btn-ghost` `rgba(255,255,255,.66)` + violet hairline, ink `#01423b`; hover → `.9` white + lift.

## 2.15 Cards — the reuse surface
Five distinct card shapes share one glass shell: `.card` (shop), `.combo` (rail), `.tier` (bundles), `.rcard` (reviews), `.cat` (categories). Shared primitives: `.glass` / `.glass-2` shell, `translateY(-5px)` hover, `.pill`/`.tag`/`.save`/`.flag` badge family, `.pr`/`.prow`/`.price` price rows, full-width CTA, `.pimg` artwork.

## 2.16 Animations
| Name | Target | Duration | Notes |
|---|---|---|---|
| `drift-a` | wl-a | 34s linear ∞ | translate + scale |
| `drift-b` | wl-b | 23s linear ∞ | hidden ≤760px |
| `shaft-sway` | wl-c | 19s ease ∞ | skew + opacity |
| `surface` | wl-s | 11s ease ∞ | scaleY |
| `rise` | 16 bubbles | 21–27s linear ∞ | staggered delays |
| `tick` | ticker | 30s linear ∞ | `-50%` |
| `marq` | reviews | 52s / 40s ≤760px | `-50%`, pause on hover/focus |
| scene fade | `.scene` | 1.5s opacity | JS-toggled |
| `.rv` reveal | ~30 elements | .95s | opacity + 30px + blur(7px), delays .09–.45s |
| hero slide | `.hslide` | .85s | opacity |
| hero product | `.hp` | .8s | +28px, scale .94, delays .06/.30/.54 |
| price tag | `.ptag` | .8s @ .62s | +16px |
| rotator | `.rot .pimg` | .75s | translate + scale, 2.9s interval |
| hero shadow | `#heroProd` | 7s WAAPI ∞ | drop-shadow breathe |

## 2.17 Scroll behaviour
- `html{scroll-behavior:smooth}` for the in-page anchors.
- Single rAF-throttled scroll handler drives: header `.up`, water parallax (`--px/--py` per layer, factors .05/.09/.03/.02), hero product transform (`translate3d`, `scale(1 - f*.06)`, `opacity(1 - f*.55)` over the first 700px), rail sync, scene pick.
- `pickScene()` walks `offsetTop/offsetParent` for **every** `[data-scene]` node **on every frame**; `syncRail()` reads `offsetTop` for 7 targets on every frame. Layout is forced each frame.
- Mouse parallax: `mousemove` (≥1024px, non-reduced) calls the same handler.

## 2.18 Hover behaviour
Cards/tiers/combos/cats lift 5px; buttons lift 2px; nav underline sweeps; `.ico` gets a tint; footer links shift 3px; review rail pauses; hero stage pauses its timer on `mouseenter`.

## 2.19 JavaScript inventory (lines 1567–1713)
1. `reduce` — one-shot `matchMedia` read (never re-evaluated).
2. IntersectionObserver reveal (`rootMargin 0 0 -12% 0`, threshold .12, unobserve after) with a non-IO fallback that adds `.in` to everything.
3. Scene crossfade + `data-d`.
4. Rail sync.
5. rAF scroll frame: header state, parallax, hero product transform.
6. Mouse parallax (≥1024px).
7. WAAPI shadow breathe on the hero product.
8. Hero stage carousel: 3.8s interval, dot clicks, pause on hover, IO-gated play/pause.
9. Proof rotator: 2.9s interval, IO-gated, writes caption via `innerHTML` for the name and `textContent` for the note.

**No event delegation, no teardown, no re-init hooks.** Every handler binds once at parse time against elements queried once.

## 2.20 Responsive breakpoints
`max-width`: 420, 600, 760 (×2), 900 (×5), 1200 · `min-width`: 640, 720, 760 (×4), 820 (×2), 860, 880, 900 (×3), 901, 960 (×2), 1024, 1040, 1180.

**17 distinct breakpoints, mixing `min-` and `max-` in the same document.** `900/901` is a hand-patched pair (badge rail vs badge strip). This is the "breakpoint logic" the brief invites us to fix — a normalised ladder (600 / 760 / 900 / 1024 / 1180) reproducing identical output is the target.

## 2.21 Mobile-specific behaviour (≤760px unless noted)
`--sec-y:22px`; blur radii reduced (24→16px, 18→12px); `wl-b` and bubbles removed; range strip becomes a scroller; combo rail bleeds 14px; card/tier/rcard sizes step down; `.hero` padding-top 118px; `body{padding-bottom:74px}` reserves the sticky CTA (removed ≥960px); `.badges` swap to `.badgestrip` at 900/901; nav links vanish <1024px; rail dots appear ≥1180px; `.ico.hide-s` hidden ≤600px; `.hero-prod` 92vw ≤420px.

## 2.22 Accessibility-related behaviour present
`:focus-visible{outline:2px solid #4f7d10;offset:3px}` · `aria-label` on nav, rail, rail links, icon buttons, hero dots, badges, review rail · `role="img"` + `aria-label` on every `.pimg` · ticker `aria-hidden` · `.swipecue`, `.plus`, `.tierpix`, `#rot` `aria-hidden` · semantic `<article>` for cards, `<h1>/<h2>/<h3>/<h4>/<h5>` present · `<button>` for actions, `<a>` for navigation (mostly).

## 2.23 Reduced motion
```css
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .rv{opacity:1;transform:none;filter:none}
  .wl-a,.wl-b,.wl-c,.wl-s,.bub span{animation:none}
  html{scroll-behavior:auto}
}
```
JS additionally skips parallax, hero autoplay, rotator autoplay and the WAAPI shadow. **Gap:** the preference is read once at load; changing it mid-session does nothing.

## 2.24 Assets and how they are represented
| Asset | Representation | Weight |
|---|---|---|
| 14 product bottles | base64 SVG in `:root` custom properties | 15.2 KB |
| 4 bottles (again) | inline `<svg>` inside shop cards 5–8 | ~10 KB |
| 4 water layers | inline `<svg>` with turbulence filters | ~25 KB |
| ~60 UI icons | inline `<svg>`, repeated per use (leaf ≈ 12×, arrow ≈ 6×, check ≈ 15×) | — |
| 5 botanical illustrations | inline `<svg>` | ~3 KB |
| Fonts | Google Fonts CSS2, 8 weights across 2 families | external |
| Photography | **none** | — |

## 2.25 Hardcoded content (everything a merchant would want to change)
Ticker copy · nav labels · brand name/tagline · all headings, kickers, ledes · hero headline + accent word + both CTA labels/targets · 3 hero price tiers (₹200/349/499 with compare-at and save copy) · 3 badge promises ×2 (rail + strip) · 5 ingredient names/descriptions · 3 pillar cards · proof copy + 4 stats + 6 rotator captions · **5 combos** (titles, counts, includes-sentences, prices, savings, flags, fine print, CTA) · **3 bundle tiers** (tags, counts, prices, per-unit maths, feature bullets) · **8 shop cards** (titles, badges, ratings, review counts, prices, discount %) · **10 reviews (5 unique)** + aggregate rating + review count + "12 lakh+" · 4 why-bundles cells · 4 category cards · 4 trust cells · signup copy/offer · full footer + contact details + legal line · sticky CTA copy. Currency symbol `₹` is written into every price. Every saving (`₹398`, `45%`, `33% off`, "Flat ₹166 per product") is typed, not derived.

## 2.26 Reusable patterns already visible
Glass shell (`.glass` / `.glass-2`) · badge/pill family (`.pill`, `.tag`, `.save`, `.flag`, `.cut`, `.prow em`) · price row (three variants of the same money/compare/save trio) · `.pimg` artwork with aspect-ratio · `.tile` no-artwork placeholder · `.panel-head` (kicker + heading + rule + lede) · `.rule` leaf divider · `.btn` family · `.rv` reveal with `-d1..d5` stagger · `.stack` "A + B + C" composition · dot-controls (`.hdots`, `.rot .dots`, `.rail`) — three near-identical implementations · two `-50%` marquees (ticker, reviews) — one mechanism.

## 2.27 Prototype defects found (candidates for "fix it and tell us")
1. **`.card .shot .pimg` has no height above 760px.** Height is only set inside `@media(max-width:760px)`. The `.pimg` is a background-image span with `aspect-ratio` in a `place-items:center` grid, so above 760px it computes to zero size — **shop cards 1–4 render no artwork on desktop.** Cards 5–8 (inline `<svg>`, `height:122px`) do render. Needs a decision: reproduce the empty box, or reproduce the evident intent. **Ask before choosing.**
2. **Duplicate SVG `id`s** — `cg`, `wf`, `wf2` each defined twice (water layers a and b). Invalid HTML; `url(#…)` resolves to first-in-document.
3. **Dangling anchor `#voices`** — linked from the progress rail and the footer; **no such element exists.** `.voices` CSS (lines 424–431) is dead.
4. **~45 lines of PDP CSS** (`.crumb`, `.gal-main`, `.thumb`, `.vopt`, `.qty`, `.pin`, `.acc`, `.cmp`, `.rscore`, `.stickybuy`, …) styling markup that is not in this file.
5. **`.striphint` is never hidden** — `display:block` is declared only inside the ≤760px block, but the element is a `<p>`, so "Swipe to see the full shelf" shows at every width.
6. **`.hero-prod .pimg` rule is dead** — the hero now uses `.hp`, not `.pimg`.
7. **Whole V1 dark palette is dead code** (~190 lines overridden).
8. **Burger button opens nothing; nav is absent below 1024px.**
9. **Combo "5 products" shows 3 tiles** — data and artwork disagree.
10. **Shop grid is 4 products shown twice.**
11. **Duplicate review cards are exposed to assistive tech** — the loop clone is not `aria-hidden`.
12. `aria-label` on `<div class="revrail">` and `<div class="badges">` — no role, so the label is ignored.
13. `.rot` is `aria-hidden="true"` yet contains the only description of six products.
14. Signup form is `onsubmit="return false"` with no action.
15. Star ratings are literal `★★★★★` glyphs with no accessible value.
16. `rcapB.innerHTML = …` — needless HTML sink in the rotator.
17. `resize` listener is not passive; `mousemove` triggers a full layout-reading frame.

---

# PART 3 — The five required sections, mapped

Legend: **P** = prototype behaviour, **S** = Shopify implementation, **⚠** = do not copy directly.

---

## 01 — Hero → `sections/purelane-hero.liquid`

**1. Source** — HTML 945–997 (+ 994 stage); CSS 206–332 (hero, badges, badgestrip, hstage, hp, ptag, hdots), 690–706 (light overrides); JS 1613–1682.

**2. Visual behaviour** — Full-viewport bottom-aligned split. Copy left with staggered reveal; product stage right cycling 1→2→3 bottles every 3.8s with per-bottle stagger and a glass price flag; badge rail right (desktop) / badge strip under the CTAs (mobile); diagonal scrim; product parallaxes up, shrinks and fades over the first 700px; shadow breathes on a 7s loop.

**3. Shopify data** — Each slide's products (product picker per block) → title, featured image, price, `compare_at_price`, availability, URL. Saving amounts computed from the sum of component prices vs the bundle price. Currency via `money` filters.

**4. Merchant settings** — Section: heading (rich text so the accent word is authored, not string-split), lede, primary/secondary CTA label+link, badge rail on/off, autoplay on/off, autoplay interval, scrim opacity, min-height mode, image position. Blocks: `slide` (1–3 product pickers, label, price source [auto from products | manual], badge text), `badge` (icon picker, one/two-line label).

**5. Reusable components** — `purelane-product-media` (image + placeholder), `purelane-price` (money/compare/save trio), `purelane-badge`, `purelane-icon`, `purelane-carousel.js`, `purelane-reveal.js`.

**6. Edge cases** — 1 block / 0 blocks (hide dots, no timer); a slide product sold out (price tag still renders, CTA state); slide product with no image (placeholder must preserve the height-driven layout); very long headline at 375px (`.d1` is 44px min — must not overflow); missing `compare_at_price` (suppress `<s>` and the save chip rather than printing "Save ₹0"); 3 bottles at 375px.

**7. Accessibility** — Dots become a real tablist (`role="tablist"`/`tab`/`tabpanel`, `aria-selected`, arrow-key support) or `aria-pressed` buttons at minimum; autoplay pauses on hover **and focus**; inactive slides `aria-hidden` + `inert` so the other two price tags aren't announced; `h1` once per page; product images get real `alt`; 44px minimum dot hit area (visual size can stay 6px via padding).

**8. Responsive** — ≤1200px copy 470px / product 44vw; ≤900px stacks, product goes static and centred, badge rail → strip, stage 300–430px; ≤420px product 92vw.

**9. Animations** — slide crossfade .85s; `.hp` .8s stagger; `.ptag` .8s @ .62s; dot morph; reveal `-d1..d4`; scroll parallax; 7s shadow.

**10. ⚠ Do not copy** — hardcoded ₹ prices and savings; the shadow-breathe WAAPI on every load (gate it); the one-shot reduced-motion read; the parallax's per-frame layout reads; `role="img"` background spans (use real `<img>` with `srcset`); `<br>`-split headline (blocks the merchant from editing it).

---

## 02 — Shop / product grid → `sections/purelane-product-grid.liquid`

**1. Source** — HTML 1248–1432; CSS 404–421, 614–615, 735–737; reveal JS.

**2. Visual behaviour** — Centred panel head, then a 2→4 column grid of glass cards that lift on hover; each card is badge + artwork tile + title + rating + price row + full-width Add to cart, with price pinned to the bottom by `margin-top:auto`.

**3. Shopify data** — Collection (or hand-picked products): title, URL, featured image, price, `compare_at_price`, `available`, first available variant id, `variants.size`. Discount % computed. Rating + count from metafields.

**4. Merchant settings** — Section: kicker, heading, show rule, collection picker, product limit, columns (desktop/mobile), show rating / price / compare-at / discount badge, badge source (metafield | tag | manual per block), CTA behaviour (add to cart | view product), sold-out label, enable reveal. Blocks: optional `product` blocks for manual curation.

**5. Reusable components** — **`snippets/purelane-product-card.liquid` — the central reuse artifact**, consumed here, in combos' `.stack`, in bundles' `.tierpix`, and in categories. Plus `purelane-product-media`, `purelane-price`, `purelane-rating`, `purelane-badge`, `purelane-add-to-cart`.

**6. Edge cases** — **all four required test products land here**: sold out (disabled button + "Sold out" pill, price still visible), no image (dashed `.tile` placeholder at `.shot` dimensions), very long title (2-line clamp with tooltip/full text for AT; card heights stay equal), plus: no compare-at (hide `<s>` + %), no rating metafield (hide `.rate`, don't print "★ 0"), multi-variant product (route to PDP instead of ATC), collection with fewer products than the limit, empty collection (editor-only empty state), price on request / zero price.

**7. Accessibility** — Card title is the link (whole-card click via a `::after` overlay, not nested interactives); "Add to cart" needs an accessible name that includes the product ("Add Kitchen cleaner to cart"); rating exposed as text ("Rated 4.8 out of 5 from 237 reviews"), not bare glyphs; sold-out state uses `disabled` + `aria-disabled`, not colour alone; live region for cart feedback; focus ring must survive `overflow:hidden` on `.shot`.

**8. Responsive** — 2 cols <860px, 4 cols ≥860px; `.shot` 150→126px and card artwork 108px ≤760px. **Reproduce exactly, including the 375px 2-up.**

**9. Animations** — `translateY(-5px)` hover .4s; reveal stagger `rv-d1..d3` — must be **computed from `forloop.index`**, not hand-authored, so it survives any product count.

**10. ⚠ Do not copy** — the duplicate 4-products-twice grid; inline per-card bottle SVGs with duplicate gradient ids; the desktop zero-height `.pimg` bug (item 2.27 #1); typed "33% off"; `<button>Add to cart</button>` with no form; hardcoded review counts.

---

## 03 — Best-selling combos → `sections/purelane-combos.liquid`

**1. Source** — HTML 1181–1193; CSS 510–546, 580–594, 741–745.

**2. Visual behaviour** — Panel head, then a horizontally snapping rail of 302px glass cards bleeding into the gutters. Each card: gradient tray with saving pill (+ optional flag), a `A + B + C` product stack with micro-benefit captions, then title, count, includes-sentence, price row, fine print, CTA. One card is visually promoted.

**3. Shopify data** — Each combo is best modelled as **a real bundle product** (so it has a price, an image, a URL and can be bought) **plus a component list**. Component products supply the stack artwork and captions. Saving = Σ(component prices) − combo price, computed in Liquid. Count = component list size.

**4. Merchant settings** — Section: kicker, heading, lede, rail note, swipe cue text, card width, snap on/off, source (metaobject list | blocks). Blocks/metaobject `combo`: bundle product, component product list, title override, includes-sentence, badge/flag text, fine print, CTA label+link, promote-this-card toggle.

**5. Reusable components** — `purelane-product-card` in a compact "stack item" variant; `purelane-price`; `purelane-badge`; `purelane-rail.js` (shared with any other snapping rail); `.tile` placeholder snippet.

**6. Edge cases** — Combos of 2 / 3 / 5 components (prototype only ever draws 3 → need an explicit "show first N, then +N more" rule); a component with no image → `.tile`; a component sold out → does the combo stay buyable?; single-block section (rail with one card must not look broken); more blocks than fit; combo price ≥ component sum (suppress the saving pill rather than showing a negative); missing benefit caption; RTL/overflow of long combo titles.

**7. Accessibility** — The rail needs keyboard access — a scroll container with `tabindex="0"` and a label, or real prev/next buttons; `scroll-snap` must not trap focus; `+` glyphs stay `aria-hidden`; the saving must be in text, not only colour; the whole card must not be a link wrapping a link.

**8. Responsive** — 302px cards / 18px bleed ≥760px; 268px / 14px bleed below; stack artwork 66→56px; tiles 66×44 → 56×38.

**9. Animations** — hover lift; reveal on the rail; smooth snap; no autoplay in the prototype (**do not add one**).

**10. ⚠ Do not copy** — typed savings and prices; the includes-sentence duplicating the stack data; the count/artwork mismatch; overflow scrolling with no keyboard path; `.railnote` describing a bundle picker that does not exist.

---

## 04 — Bundles → `sections/purelane-bundles.liquid`

**1. Source** — HTML 1196–1245; CSS 387–402, 572–577, 738–748.

**2. Visual behaviour** — Intro glass panel, then a 1→3 column tier grid. Each tier: tag, mini product strip, giant quantity numeral, price with compare-at, per-unit line, checkmark feature list, full-width CTA. Middle tier is promoted with an accent border and a primary button. Tiers lift on hover.

**3. Shopify data** — Each tier maps to **a bundle product or variant** (2-pack / 3-pack / 5-pack) → price, compare-at, availability, URL. Per-unit price = price ÷ quantity, computed. The strip renders the products the tier represents (product list). Quantity from the variant option or a metafield.

**4. Merchant settings** — Section: kicker, heading, lede, columns, show intro panel. Blocks `tier`: product/variant picker, tag label, quantity, strip product list, feature list (repeatable or line-separated), CTA label+link, "promote this tier" toggle, per-unit line on/off.

**5. Reusable components** — `purelane-price` (third consumer), `purelane-badge`, `purelane-product-media` in strip variant, checkmark icon snippet, `purelane-product-card` shell.

**6. Edge cases** — Two tiers or four tiers (grid is hardcoded to 3 → make columns respond to block count); more than five strip products (`.five` shrink rule generalised); tier sold out; no compare-at; quantity of 1; non-integer per-unit price (rounding — and rounding must not contradict the displayed total); zero blocks; two tiers both flagged "promote".

**7. Accessibility** — `<ul>` semantics kept, check icons `aria-hidden`; the "most popular" promotion must be conveyed in text; heading level under the section h2; price and compare-at need `<s>` plus a visually-hidden "was"; CTA names must differ per tier ("Build the 3-product box"), not three identical "Build this box".

**8. Responsive** — 1 col <760px, 3 ≥760px; `.qty` 52→44px; strip 78→70px, images 62→54 (46 for `.five`).

**9. Animations** — hover lift .4s; reveal `rv-d2`/`rv-d3` — again, derive delays from block index.

**10. ⚠ Do not copy** — typed "Flat ₹166 per product" and every price; `.best` hardcoded to the middle child; three-column grid that breaks at other block counts; identical CTA labels.

---

## 05 — Reviews rail → `sections/purelane-reviews.liquid`

**1. Source** — HTML 1000–1013; CSS 470–488, 581–582; no JS (pure CSS marquee).

**2. Visual behaviour** — Header with kicker and two aggregate stats, then an edge-masked infinite marquee of 284px glass review cards scrolling right-to-left over 52s, pausing on hover or focus-within.

**3. Shopify data** — Reviews have **no native Shopify object**. Two defensible routes: (a) a `review` **metaobject** definition — rating, title, body, author, product reference, verified flag, date — rendered from a metaobject list; (b) a reviews app's product metafields. **(a) is the right answer for this build** and is exactly the "where a native field doesn't exist, solve it properly" case. Aggregate rating/count from a shop metafield or computed from the entries. The "· Laundry detergent" attribution comes from the product reference, so it stays live.

**4. Merchant settings** — Section: kicker, aggregate rating, review count, secondary stat, source (metaobject list | blocks), speed (s), pause on hover, direction, card width, mask on/off, show stars. Blocks `review`: rating, title, body, author, product reference, verified badge.

**5. Reusable components** — `purelane-marquee.js` / marquee snippet (shared with the ticker), `purelane-rating` (shared with the product card), `purelane-badge`, glass card shell.

**6. Edge cases** — **Fewer reviews than fill the viewport** — the `-50%` loop needs the set repeated enough times to exceed 2× viewport width, so the repeat count must be computed, not fixed at 2; one review; zero reviews (hide the section); very long review body (clamp); missing author (fall back to "Verified buyer", which the prototype already does); rating < 5 (stars are hardcoded to five glyphs); a referenced product that was deleted; non-Latin text width.

**7. Accessibility** — The clone set must be `aria-hidden="true"`; the rail needs `role="region"` (or a list) with a real accessible name — `aria-label` on a bare `<div>` does nothing; ratings need text equivalents; **pause on `:focus-within` exists but there is no focusable content inside the cards, so keyboard users cannot pause it** — add a visible pause control or make the rail focusable; motion must stop entirely under reduced-motion (currently the global `animation-duration:.01ms` makes it jump rather than stop — worth checking and fixing).

**8. Responsive** — Cards 284→250px, padding 15/17→13/14, duration 52→40s ≤760px.

**9. Animations** — `marq` linear infinite; pause on hover/focus.

**10. ⚠ Do not copy** — hand-duplicated card markup; typed aggregate figures; five hardcoded reviews; unlabelled region; the clone being readable by screen readers; five star glyphs regardless of rating.

---

# PART 4 — Proposed Shopify architecture (stock Dawn)

## 4.1 Reuse from Dawn
| Dawn asset | Use |
|---|---|
| `layout/theme.liquid` | mount points for the scene layer + one global CSS/JS include |
| `snippets/price.liquid` | reference implementation for compare-at / on-sale / unit price semantics |
| `snippets/card-product.liquid` | **reference only** — its markup can't carry the glass design; ours replaces it for these sections |
| `snippets/buy-buttons.liquid`, `product-form.liquid` | real add-to-cart with variant + error handling |
| `assets/cart.js`, `cart-notification` / `cart-drawer` | AJAX add-to-cart and feedback |
| `snippets/icon-*.liquid` | icon convention |
| `assets/base.css` | visually-hidden, focus-ring, reset conventions (we add tokens, we don't fork it) |
| `snippets/image.liquid` / `image_url` + `image_tag` | responsive images, `srcset`, lazy, aspect ratios |
| Section groups, `{% schema %}`, `presets`, `blocks` | editor integration |
| `shopify:section:load / unload / select / reorder` events | animation re-init |
| Locales (`locales/en.default.json`) | all UI strings translatable |

## 4.2 New sections (required five first)
```
sections/purelane-hero.liquid
sections/purelane-product-grid.liquid
sections/purelane-combos.liquid
sections/purelane-bundles.liquid
sections/purelane-reviews.liquid
sections/purelane-scene-background.liquid   (global backdrop; header group or theme.liquid)
```
Bonus, in priority order: `purelane-ticker`, `purelane-ingredients`, `purelane-pillars`, `purelane-proof`, `purelane-range-strip`, `purelane-why-bundles`, `purelane-categories`, `purelane-trust-bar`, `purelane-signup`, `purelane-sticky-cta`, `purelane-progress-rail`.

## 4.3 Reusable snippets
```
snippets/purelane-product-card.liquid    variants: grid | stack | strip | category
snippets/purelane-product-media.liquid   image, srcset, aspect-ratio, .tile placeholder fallback
snippets/purelane-price.liquid           money, compare-at, save amount/%, per-unit
snippets/purelane-rating.liquid          metafield rating → stars + accessible text
snippets/purelane-badge.liquid           pill | tag | save | flag | cut
snippets/purelane-add-to-cart.liquid     variant-aware ATC / view-product fallback
snippets/purelane-panel-head.liquid      kicker + heading + rule + lede
snippets/purelane-glass.liquid           shell wrapper (or a pure class contract)
snippets/purelane-icon.liquid            single icon sprite source
snippets/purelane-marquee.liquid         track + computed repeat count + aria-hidden clones
```

## 4.4 Assets
```
assets/purelane-tokens.css       resolved V2 tokens, type scale, spacing, radii, breakpoint ladder
assets/purelane-base.css         glass, buttons, badges, reveal, panel head, utilities
assets/purelane-section-*.css    one per section, loaded per section
assets/purelane-scene.css + .js  fixed background, water layers, bubbles, depth
assets/purelane-reveal.js        IntersectionObserver reveal, re-initialisable
assets/purelane-carousel.js      hero stage (custom element)
assets/purelane-rail.js          snap rail + keyboard/prev-next (custom element)
assets/purelane-marquee.js       duplication + pause control (custom element)
assets/purelane-motion.js        shared reduced-motion + rAF scheduler + scroll observer
assets/product-*.svg             the 14 bottle illustrations, as files (seed product images)
```

## 4.5 JavaScript modules — and the one architectural rule
Every behaviour ships as a **custom element** (`<purelane-hero-stage>`, `<purelane-rail>`, `<purelane-marquee>`, `<purelane-reveal>`), because `connectedCallback`/`disconnectedCallback` are what make the theme editor safe: Shopify re-renders a section's DOM on every edit, and custom elements re-initialise for free. The prototype's parse-time `querySelectorAll` + `addEventListener` pattern would leave dead timers and unanimated content after a single editor change — **this is the single biggest rewrite in the project.**

Shared services in `purelane-motion.js`: one `matchMedia` reduced-motion source with a `change` listener; one rAF scroll scheduler all sections subscribe to; one IntersectionObserver factory. Replaces per-frame `offsetTop` walks with cached, `resize`-invalidated geometry or `IntersectionObserver` entirely.

## 4.6 Where each piece of content lives
| Content | Source |
|---|---|
| Product title, price, compare-at, image, URL, availability | **Product object** |
| Grid contents, "bestsellers" | **Collection** (picker) |
| Combo components, tier strips, hero slide products | **Product list metafields / block pickers** |
| Rating + review count | **Product metafield** (`rating` type) |
| Product badge ("Best seller", "New") | **Product metafield** `custom.badge` — or a tag rule |
| Micro-benefit caption ("Cuts grease instantly") | **Product metafield** `custom.benefit` |
| Combos (title, includes copy, flag, fine print) | **Metaobject `combo`** |
| Reviews | **Metaobject `review`** (rating, title, body, author, product, verified, date) |
| Ingredients, pillars, trust items, why-bundles | Section **blocks** |
| Headings, kickers, ledes, CTA labels/links, toggles, speeds | **Section settings** |
| Brand colours, radii, container width, motion defaults | **Theme settings** (`settings_schema.json`) |
| Savings, discount %, per-unit prices | **Computed in Liquid — never typed** |
| All UI strings | **Locale files** |

Metafield/metaobject definitions must ship as documentation (and ideally as a Shopify CLI-importable definition list) so the reviewer can reproduce the store.

## 4.7 Card reuse strategy
One `purelane-product-card.liquid` with a `variant` parameter driving markup density, and one CSS component (`.pl-card`) with modifier classes (`--grid`, `--stack`, `--strip`, `--category`). Callers pass a product object plus display flags; the snippet owns image fallback, sold-out state, title clamping, price row and CTA. **Four sections, one card template** — this is the "several sections render similar cards" requirement, and it is also what keeps the four edge-case products correct everywhere at once.

## 4.8 Theme-editor safety
1. **No cross-section DOM assumptions.** The scene background owns itself and *discovers* `[data-pl-scene]` sections at runtime.
2. **Scene index is derived, not authored** — a section setting picks a depth (1–4) with sensible defaults; ordering never breaks it.
3. **Re-init on `shopify:section:load`, teardown on `shopify:section:unload`** (timers, observers, listeners) — custom elements give this by construction.
4. **`shopify:block:select` pauses autoplay and jumps to the selected slide/card** so merchants can edit what they clicked.
5. **Reveal animations run on load and on section load**, and any element already in view resolves immediately — a section added below the fold must never stay invisible.
6. **Every grid/rail responds to block count**, never to a fixed child count or `:nth-child` position.
7. **Stagger delays computed from `forloop.index`**, capped, so reordering cannot produce a 4-second delay.
8. **Presets** for every section so "Add section" yields a populated, correct-looking block.
9. **Empty states** rendered only in the editor (`request.design_mode`).
10. **CSS scoped by `#shopify-section-{{ section.id }}`** or section-scoped custom properties, so two instances of the same section can coexist with different settings.

---

# PART 5 — Edge cases

## 5.1 The four required test products
| Case | Expected behaviour |
|---|---|
| **Normal product** | Baseline: image, title, rating, price, compare-at, discount %, Add to cart enabled. |
| **Sold out** | "Sold out" pill (badge slot reused), price still shown, CTA disabled with `aria-disabled` + text change, card keeps identical dimensions, optional desaturation — never colour-only signalling. Also verify inside combos (component sold out) and bundles (tier sold out) and as a hero slide product. |
| **No image** | Falls back to the prototype's own `.tile` — dashed border + leaf icon — sized to the host slot (150px `.shot`, 66px stack, 62px strip, 176px category). Must not collapse height, must not shift layout, must have empty `alt` and not be announced as an image. |
| **Very long title** | 2-line clamp in `.card h4` / `.combo h3` / `.cat h4`, full text available to AT and via `title`; card heights stay equal in a row; the price row stays bottom-pinned; test at 375px in the 2-up grid where the column is ~170px wide. |

## 5.2 Other production edge cases the design exposes
**Pricing:** no compare-at (hide `<s>`, hide %, hide save pill); compare-at ≤ price (never show a negative saving); price 0 / "from" pricing on multi-variant products; very large numbers (₹1,49,999 — Indian digit grouping); a currency whose symbol is not ₹ or is suffixed; taxes-included copy that is hardcoded.
**Variants:** multi-variant products cannot be added from a card without a picker → route to PDP; unavailable default variant; variants with different images.
**Collections & counts:** empty collection; fewer products than the limit (grid must not leave holes); more than the limit; a 4-column grid receiving 5 products (orphan row); one combo, one tier, one review.
**Metafields:** rating absent (hide, don't render "★ 0"); badge absent; benefit caption absent; combo metaobject referencing a deleted product; product list containing a draft/unpublished product.
**Content length:** long combo includes-sentence; long tier feature bullets wrapping to 3 lines and breaking column height parity; long review body; long headline in the hero at 375px; two-word vs six-word CTA labels.
**Layout:** combos with 5 components in a 302px card; bundles section with 2 or 4 tiers; reviews marquee shorter than the viewport; the shop grid at exactly 860px (breakpoint boundary).
**Environment:** reduced-motion on; JS disabled (content must still be present and readable — the reveal must not leave `opacity:0` permanently); slow network (fonts, images); `backdrop-filter` unsupported (needs a solid-ish fallback so glass doesn't become unreadable); RTL locale; 320px (below the stated 375px floor — should still not break horizontally).
**Editor:** duplicate sections on one page; two hero sections (two `h1`s); a section moved above the header group; blocks reordered mid-animation.

---

# PART 6 — Performance

Measured against the file as written; the goal is **identical pixels, better delivery**.

| Risk | Detail | Production approach |
|---|---|---|
| **Animated SVG filters** | 4 full-viewport layers, 3 running `feTurbulence` + `feDisplacementMap` (`scale` 30–72) **inside infinite CSS animations**, composited with `mix-blend-mode`. This is the single most expensive thing in the file — continuous GPU/CPU work on a fixed, full-screen surface, on every page, forever. | Rasterise the filtered result once (static SVG/WebP), animate transform/opacity only; keep filters for a capability-gated enhancement; drop to 2 layers on mobile as the file already partly does; pause when the tab is hidden and when off-screen. |
| **16 `backdrop-filter` declarations** | `blur(24px) saturate(150%)` on ~15 large containers; each is a separate backdrop root. Known repaint cost, worst on mobile Safari/Android. | Keep the look; reduce blur radius (the file already steps to 16px/12px ≤760px), avoid stacking blurred elements on blurred elements, and ensure each glass surface is promoted deliberately rather than accidentally. |
| **Base64 assets in CSS** | 15.2 KB of data URIs in the critical stylesheet — render-blocking, uncacheable independently, and not resizable. | Real product images from the Shopify CDN with `image_url: width:` + `srcset` + `sizes`; the 14 SVGs become the seeded product images. |
| **Duplicated inline SVG** | 4 bottle illustrations inlined again in cards 5–8 (~10 KB) with duplicated gradient ids; ~60 icons repeated inline (leaf ×12, check ×15, arrow ×6). | Icon snippet + `<use>`/sprite; product art becomes CDN images. |
| **Two infinite marquees** | Ticker 30s and reviews 52s translate a `max-content` track. Cheap if transform-only, but they never stop. | Keep transform-only, `will-change` sparingly, pause off-screen via IntersectionObserver and on `visibilitychange`; honour reduced-motion by stopping, not by 0.01ms-ing. |
| **Per-frame forced layout** | `pickScene()` walks `offsetTop`/`offsetParent` for 14 nodes and `syncRail()` reads `offsetTop` for 7 more — **every rAF frame, and on every `mousemove` at ≥1024px.** Classic layout thrash. | Replace with IntersectionObserver (scene + rail are both "which section am I in" questions); cache geometry on resize; throttle mouse parallax; never read layout inside the write phase. |
| **Hero product transform** | Reads `scrollY`, writes `transform`/`opacity` each frame. | Fine in principle; keep on the compositor (`transform`/`opacity` only), gate on reduced-motion and on ≥1024px, use a scroll-linked animation where supported. |
| **WAAPI shadow breathe** | `drop-shadow` animated for 7s on infinite loop = repeated filter rasterisation of a large element. | Replace with an opacity crossfade of a pre-rendered shadow layer, or drop the loop to a single subtle state. Visual delta is negligible; cost is not. |
| **Fonts** | 2 families × 8 weights via Google Fonts, third-party connection + render-blocking CSS. `display=swap` is set. | Self-host in the theme (`asset_url`), preload the two weights used above the fold, subset, `font-display:swap`, and set metric-adjusted fallbacks to limit the swap shift. |
| **LCP** | Likely the hero `h1` or the first hero bottle. Prototype loads the bottle as a CSS `background-image` — invisible to the preload scanner and unpreloadable. | Real `<img fetchpriority="high" loading="eager">` for slide 1; lazy-load slides 2–3; everything below the fold `loading="lazy"`. |
| **CLS** | Prototype is mostly safe: `.hstage` is a fixed clamp, `.shot` is 150px, `.tierpix` 78px, `.cat .ph` 194px, `.rcard` fixed width. Risks are the font swap and any image without reserved space. | Preserve every fixed box; put explicit `width`/`height`/`aspect-ratio` on all Shopify images; reserve the sticky CTA's 74px (already done via `body{padding-bottom}`). |
| **INP** | Single rAF handler is decent, but the mousemove path does layout reads. | Passive listeners everywhere, rAF-batched writes, no layout reads in handlers. |
| **Reveal on load** | ~30 `.rv` elements start at `opacity:0` with `filter:blur(7px)` — blur on 30 elements is a real paint cost, and any failure leaves content invisible. | Keep the effect; gate it (no blur on low-end/mobile if needed), guarantee a visible fallback, and unobserve after reveal (the file already does). |
| **CSS delivery** | ~820 lines of CSS in two blocks, ~190 lines of which are immediately overridden, plus ~45 lines of PDP CSS for markup not present. | Ship the resolved token set once; split critical vs per-section CSS; load section CSS with the section. |

---

# PART 7 — Accessibility

| Area | Prototype state | Required for production |
|---|---|---|
| **Keyboard navigation** | Nav links vanish <1024px with **no mobile menu** — the burger does nothing. The combo rail is scroll-only with no keyboard path. The reviews marquee's `:focus-within` pause is unreachable because nothing inside is focusable. Hero dots are focusable buttons ✓. | A real, focus-trapping mobile menu (Dawn's `<details>`/drawer pattern); rail with prev/next buttons or a labelled `tabindex="0"` scroller; a pause control (or focusable cards) in the marquee; logical DOM order everywhere; no keyboard traps. |
| **Focus states** | `:focus-visible{outline:2px solid #4f7d10;offset:3px;radius:6px}` — good and global ✓. | Verify it survives `overflow:hidden` on `.shot`/`.glass`/`.revrail` and against every glass background; ensure 3:1 contrast for the ring itself; add a skip-to-content link (absent). |
| **Contrast** | `--paper-3 rgba(36,26,61,.56)` on the pale mint ground is used for **11px** kickers, `.fine`, `.cnt`, `.cat p`, `.rcard .who`, `.fbot` — this is the most likely failure. `#b8701c` accent and `#7a9c1e` stars on light also need measuring, as do `.btn-ghost` ink `#01423b` on 66% white over a gradient, and `.ptag`/`.pill` text over glass. | Measure every pair against the actual composited background (glass over gradient — not against white). Fix by adjusting the token, not the design, and record each change. Never signal state by colour alone (sale, sold out, "best value"). |
| **Semantic structure** | `<header>/<nav>/<main>/<section>/<footer>/<article>` used ✓. Heading order is broadly sane, but `.stat h5`, `.fcol h5`, `.rcard h5` jump levels, and `<h4>` is used for card titles under `<h2>` with no `<h3>` in between. | One `h1`; strict level order per section; `<section>` only with an accessible name; `aria-label` only on elements with a role that supports it (`.revrail`, `.badges` currently do not). |
| **Buttons vs links** | Mostly correct. But: "Add to cart" is a `<button>` with no form/handler; "Shop bundle" and "Build this box" are `<a href="#…">` doing nothing; nav icons are `<button>`s that do nothing; the cart badge reads `0` with `aria-label="Cart, 0 items"` ✓ (needs to stay live). | Real forms for cart actions with live-region feedback; links for navigation with real targets; icon buttons keep their labels; 44×44px minimum hit areas (`.ico` is 38px, `.hdots` 6px, `.rail a` 8px). |
| **Images and alt text** | Every `.pimg` has `role="img"` + a descriptive `aria-label` ✓ — but they are CSS backgrounds, so they vanish in forced-colours/high-contrast mode and cannot be resized by the browser. Inline card SVGs have **no** `role`/`title`. `.tierpix` and `#rot` are `aria-hidden` — the rotator hides the only description of six products. | Real `<img>` with product-derived `alt`; decorative art `alt=""` + `aria-hidden`; SVG icons `aria-hidden` + `focusable="false"`; ensure forced-colours mode remains usable. |
| **Reduced motion** | Good CSS block ✓ and JS gating ✓, but the preference is read **once**; `animation-duration:.01ms` makes marquees *snap to the end* rather than stop; `.rv` correctly forced visible ✓. | Live `matchMedia` `change` listener; marquees and carousels **stop** (not accelerate); autoplay off entirely; parallax off; keep all content reachable and complete. |
| **Interactive elements** | Hero dots lack `aria-pressed`/tablist semantics and don't announce state; inactive slides stay in the a11y tree (three price tags announced); autoplay has no pause control and only pauses on hover, not focus; carousel dots are 6px. | Tablist or `aria-pressed` dots with arrow-key support; `inert`/`aria-hidden` on inactive slides; pause on focus and hover; visible pause affordance for any autoplaying content; announce slide changes politely or not at all. |
| **Mobile navigation** | **Does not exist.** | Build one — this is a required fix, not a bonus, since the brief demands keyboard access at every width from 375px. |
| **Forms** | Signup input has `aria-label` ✓ and `required` ✓, but `onsubmit="return false"` and no error/success messaging. | Real submission target, visible label or persistent placeholder alternative, inline validation messaging tied with `aria-describedby`, live-region confirmation. |
| **Ratings** | `★★★★★` glyphs, always five, with no value exposed. | Text equivalent ("Rated 4.8 out of 5, 237 reviews"), partial stars driven by the actual metafield value. |
| **Duplicated content** | Marquee clones and the ticker's doubled spans are read by screen readers (ticker is `aria-hidden` ✓, marquee clones are not). | `aria-hidden="true"` on every clone. |

---

# PART 8 — Implementation plan

Each phase ends with a commit series (small, reviewable, conventional messages) and a note in `AI_WORKFLOW.md`. Every deviation from the prototype is logged in `docs/DEVIATIONS.md` as it happens — that document is a graded deliverable.

### Phase 0 — Shopify / Dawn setup
- **Files:** new theme from stock Dawn; `.gitignore`; `shopify.theme.toml`; `docs/STORE_SETUP.md`.
- **Work:** Partner account, dev store, clean Dawn install, Shopify CLI, `git init` + first commit of untouched Dawn (so every later diff is *our* work); seed ≥8 products including the four required cases; create metafield/metaobject definitions; upload the 14 bottle SVGs as product images.
- **Dependencies:** none.
- **Testing:** `shopify theme dev` serves; theme check clean; all 8 products render on stock Dawn.
- **Risks:** Dawn version drift; dev-store limits; metaobject definitions are manual setup a reviewer must reproduce → document them precisely.

### Phase 1 — Foundation / design system
- **Files:** `assets/purelane-tokens.css`, `purelane-base.css`, `purelane-motion.js`, `purelane-reveal.js`; `snippets/purelane-icon.liquid`, `purelane-panel-head.liquid`, `purelane-badge.liquid`, `purelane-price.liquid`, `purelane-product-media.liquid`, `purelane-rating.liquid`, `purelane-product-card.liquid`; `sections/purelane-scene-background.liquid` + `purelane-scene.css/.js`; `config/settings_schema.json`; `locales/en.default.json`.
- **Work:** collapse V1+V2 into one resolved token set; normalise the 17 breakpoints into a documented ladder that produces identical output; build the glass/button/badge/card primitives; build the reduced-motion + rAF + IO services; build the scene background as a self-discovering global layer.
- **Dependencies:** Phase 0.
- **Testing:** a scratch template rendering every primitive side by side against the prototype at 375/768/1024/1440; token diff against the reference computed values.
- **Risks:** **highest-risk phase.** Getting the card contract wrong here costs four sections later. Breakpoint normalisation can silently change pixels — verify each consolidation with screenshots before accepting it.

### Phase 2 — Hero
- **Files:** `sections/purelane-hero.liquid`, `assets/purelane-section-hero.css`, `assets/purelane-carousel.js`.
- **Dependencies:** Phase 1 (card, price, media, motion).
- **Testing:** 375/768/1024/1440 vs reference; 1/2/3 slides; sold-out and no-image slide products; keyboard through dots; reduced motion; LCP measurement; add/remove/reorder in the editor.
- **Risks:** height-driven stage sizing with real images of varying aspect ratios; parallax + editor re-render; LCP regression from the carousel.

### Phase 3 — Shop / product grid
- **Files:** `sections/purelane-product-grid.liquid`, `assets/purelane-section-grid.css`, ATC snippet wiring.
- **Dependencies:** Phase 1 card.
- **Testing:** **all four required products visible in one grid**; 2-up at 375px; 4-up at 860px+; empty/short/over-long collections; real add-to-cart including a multi-variant product; keyboard through cards.
- **Risks:** the desktop `.pimg` zero-height question (2.27 #1) — **needs a user decision**; card height parity with the long title; ATC integration with Dawn's cart.

### Phase 4 — Best-selling combos
- **Files:** `sections/purelane-combos.liquid`, `assets/purelane-section-combos.css`, `assets/purelane-rail.js`.
- **Dependencies:** Phases 1, 3 (card in stack variant).
- **Testing:** 2/3/5-component combos; component with no image → `.tile`; gutter bleed at 375px and 1440px; snap behaviour; keyboard/prev-next; computed savings vs typed reference values.
- **Risks:** combo data modelling (metaobject vs blocks) is the biggest design decision in the project; negative/zero savings; the 5-item stack overflow.

### Phase 5 — Bundles
- **Files:** `sections/purelane-bundles.liquid`, `assets/purelane-section-bundles.css`.
- **Dependencies:** Phases 1, 4 (strip variant).
- **Testing:** 2/3/4 tiers; per-unit rounding; promoted tier via setting; sold-out tier; 1-col ↔ 3-col.
- **Risks:** representing "pick any 3" in real Shopify commerce terms — a bundle product/variant is the honest model; per-unit rounding must not contradict the total.

### Phase 6 — Reviews rail
- **Files:** `sections/purelane-reviews.liquid`, `assets/purelane-section-reviews.css`, `assets/purelane-marquee.js`; metaobject definition docs.
- **Dependencies:** Phase 1 (rating, badge, glass).
- **Testing:** 1/3/5/20 reviews; computed repeat count fills >2× viewport at 375px and 2560px; pause on hover **and** keyboard; reduced motion stops it; clones `aria-hidden`; edge mask matches.
- **Risks:** repeat-count maths (a wrong count produces a visible seam); metaobject setup burden for the reviewer.

### Phase 7 — Responsive QA
- **Files:** CSS across all sections; `docs/DEVIATIONS.md`.
- **Work:** side-by-side capture at **375, 414, 600, 768, 860, 900, 1024, 1180, 1440, 1920** plus each of the 17 original breakpoints; diff against `reference/purelane-homepage.html` rendered locally; log every intentional difference.
- **Testing:** no horizontal scroll at any width; 320px sanity check; long-title and no-image products at every width.
- **Risks:** breakpoint normalisation from Phase 1 surfacing here; `svh` behaviour on iOS.

### Phase 8 — Accessibility QA
- **Files:** section templates, `purelane-base.css`, new mobile-nav work.
- **Work:** axe/Lighthouse pass; full keyboard traversal; VoiceOver/NVDA spot checks; contrast measured against composited glass backgrounds; reduced-motion audit; forced-colours check; 44px hit areas.
- **Dependencies:** Phases 2–6.
- **Risks:** contrast fixes altering the palette — each one must be justified and logged; mobile nav is net-new scope the prototype never had.

### Phase 9 — Performance QA
- **Files:** asset loading, image tags, `purelane-scene.js/css`, font hosting.
- **Work:** Lighthouse mobile + desktop; WebPageTest; measure LCP/CLS/INP; rasterise or gate the water filters; self-host and preload fonts; audit `backdrop-filter` cost; verify no per-frame layout reads remain; pause animations off-screen and on hidden tabs.
- **Dependencies:** Phases 2–6.
- **Risks:** the scene background is both the signature visual and the main performance cost — expect to spend the most time here; any rasterisation must be pixel-verified.

### Phase 10 — Final visual comparison
- **Files:** `screenshots/`, `docs/DEVIATIONS.md`.
- **Work:** paired reference/implementation captures per section per breakpoint into `screenshots/`; overlay diffs; resolve or document every discrepancy; verify the editor matrix (add/remove/reorder/duplicate/reconfigure each of the five sections, animations still working).
- **Risks:** late-surfacing pixel drift; editor breakage found last.

### Phase 11 — Documentation and submission
- **Files:** `README.md`, `AI_WORKFLOW.md`, `docs/DEVIATIONS.md`, `docs/STORE_SETUP.md`, `docs/ARCHITECTURE.md`, clean commit history.
- **Work:** setup instructions, metafield/metaobject definitions, section-by-section settings reference, the deviations changelog with justifications, AI workflow write-up, screenshots, preview link.
- **Risks:** commit history is graded — keep it clean from Phase 0 rather than rewriting at the end.

---

# Open questions for the user

1. **Desktop `.pimg` bug (2.27 #1):** shop cards 1–4 show no artwork above 760px in the reference. Reproduce the empty box, or render the artwork as cards 5–8 clearly intend? This changes what "pixel-accurate" means for section 02.
2. **Combos data model:** real bundle products (buyable, priced by Shopify) vs metaobjects (flexible, but the CTA can only link)? Recommendation: bundle product + component product-list metafield.
3. **Reviews source:** custom `review` metaobject (recommended) vs a free reviews app vs section blocks?
4. **Bonus scope:** how much beyond the five? The scene background is arguably not optional — the five sections are transparent glass over it and cannot be evaluated without it. Recommendation: scene background + ticker + sticky CTA as part of the "five", the rest after Phase 10.
5. **Light palette confirmation:** confirm the intended design is the V2 light theme (what the file actually renders), not the V1 dark system underneath it.
6. **Deliverable form:** dev-store preview link, theme ZIP, or public repo? Any deadline?
