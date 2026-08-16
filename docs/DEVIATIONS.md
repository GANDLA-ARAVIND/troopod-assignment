# Deviations Log

The assignment states:

> **The design is the spec. The code is not.** Reproduce the visual output exactly. But where the underlying HTML or CSS is wrong for production — semantics, accessibility, performance, breakpoint logic — **fix it and tell us what you changed.**

This file is that record. Every meaningful difference between `reference/purelane-homepage.html` and the Shopify implementation is logged here with its justification.

**Ground rules**
- The **rendered** design is the visual source of truth; the prototype code is not.
- Obvious implementation bugs are **not** reproduced.
- Redesigning is out of scope. Where a correction changes visible output, it is stated explicitly and kept to the minimum that restores the evident design intent.

**Status legend** — `Planned` · `Implemented` · `Verified` (checked in Phase 10) · `Rejected`

**Visual-change legend**
- **No** — pixel output is unchanged.
- **Yes (restores intent)** — output differs from the prototype as rendered, because the prototype as rendered was broken.
- **Yes (documented)** — output differs by deliberate decision.

---

## Index

| ID | Title | Phase | Visual change | Status |
|---|---|---|---|---|
| DEV-001 | Desktop product-card artwork sizing bug | 1 / 3 | Yes (restores intent) | **Implemented** |
| DEV-002 | Duplicate SVG IDs in the water layers | 1 | No | Planned |
| DEV-003 | Dangling `#voices` anchor | 1 / bonus | No | Planned |
| DEV-004 | `.striphint` visible at all widths | Bonus | Yes (restores intent) | Planned |
| DEV-005 | Combo says "5 products" but shows 3 | 4 | Yes (documented) | Planned |
| DEV-006 | Long product titles clamped to two lines | 1 | Yes (documented) | **Implemented** |
| DEV-007 | Sold-out state added to the card design | 1 | Yes (documented) | **Implemented** |
| DEV-008 | Missing-image tile promoted to all card variants | 1 | No | **Implemented** |
| DEV-009 | Purelane CSS namespaced `pl-` | 1 | No | **Implemented** |
| DEV-010 | Single resolved token set; dead V1 palette dropped | 1 | No | **Implemented** |
| DEV-011 | Reveal hidden state gated behind JS readiness | 1 | No | **Implemented** |
| DEV-012 | Purelane microcopy as snippet defaults, not locale keys | 1 | No | **Implemented** |
| DEV-013 | Product artwork as `<img>`, not CSS background | 1 | No | **Implemented** |
| DEV-014 | Google Fonts loaded temporarily for Outfit + Inter | 1.5 | No | **Implemented** |
| DEV-015 | Hero paints its own background until the scene layer exists | 2 | No (interim) | **Implemented** |
| DEV-016 | Carousel dot hit area expanded to 44px | 2 | No | **Implemented** |
| DEV-017 | Hero heading split into two settings | 2 | No | **Implemented** |
| DEV-018 | Hero offer prices derived, not typed | 2 | Depends on store data | **Implemented** |
| DEV-019 | Carousel a11y: inactive slides inert, pause on focus | 2 | No | **Implemented** |
| DEV-020 | Purelane custom elements declared `display: block` | 2 (fix) | Yes (restores intent) | **Implemented** |
| DEV-021 | Bundle per-unit price computed exactly, not hand-rounded | 5 | Yes (documented) | **Implemented** |
| DEV-022 | Marquee repeat count and duration computed, not fixed | 6 | Yes (restores intent) | **Implemented** |
| DEV-023 | Review stars reflect the real rating | 6 | Yes (documented) | **Implemented** |
| DEV-024 | First hero slide marked active server-side | QA | Yes (restores intent) | **Implemented** |
| DEV-025 | Shared stylesheet loaded once, globally | QA | Yes (restores intent) | **Implemented** |
| DEV-026 | Autoplay does not resume while hovered or focused | QA | No | **Implemented** |
| DEV-027 | Combo rail item carries width and snap, card fills it | QA | Yes (restores intent) | **Implemented** |
| DEV-028 | Reviews and combos configured as blocks, not metaobjects | QA | No | **Implemented** |

---

## DEV-001 — Desktop product-card artwork sizing bug

**Area:** Shop / product grid (`#shop`) · **Phase:** 1 (foundation) → verified in 3 · **Status:** Implemented
**Reference:** `reference/purelane-homepage.html` CSS lines 267, 409–411, 614–615; HTML lines 1259–1286

### Prototype behaviour
Shop cards 1–4 render their product artwork as `.pimg` — a `<span>` carrying a base64 `background-image` and an `aspect-ratio`, inside `.card .shot` (`display:grid; place-items:center`). A height for that span is declared **only** inside `@media(max-width:760px)`:

```css
.card .shot{height:150px;display:grid;place-items:center;overflow:hidden}
.card .shot svg{height:122px;width:auto}          /* cards 5–8 only */
@media(max-width:760px){
  .card .shot{height:126px}
  .card .shot .pimg{height:108px}                  /* the only height for cards 1–4 */
}
```

Above 760px the span has no height, no width, and no intrinsic size (a background image contributes none). As a centred grid item it computes to zero, so **cards 1–4 display an empty tile on desktop**. Cards 5–8 use inline `<svg>` at `height:122px` and render correctly, which is what makes the intent unambiguous.

### Production issue
The desktop grid shows four product cards with no product visible. Reproducing this would ship an empty media slot on the primary commerce section, break the visual rhythm of the 4-up row, and — once real Shopify product images replace the prototype's CSS backgrounds — be impossible to reproduce faithfully anyway, since a real `<img>` has intrinsic dimensions.

### Correction as implemented
`assets/purelane-base.css` §11, `snippets/purelane-media.liquid`:
- `.pl-card__shot` keeps the reference dimensions (150px desktop / 126px ≤760px) and its gradient, radius, border and `overflow:hidden`.
- `.pl-card__shot .pl-media` is given `height: 122px` **unconditionally** — matching cards 5–8 in the same grid, which is what establishes the intended size — dropping to `108px` at ≤760px, which is the prototype's own mobile value.
- Artwork renders as a real `<img>` with `object-fit: contain` and `object-position: center bottom`, mirroring `.pimg`'s `background-size: contain; background-position: center bottom`.
- Explicit `width`/`height` attributes reserve space, so the fix does not introduce CLS.

### Reason
Explicitly approved by the user: *"Do NOT reproduce this apparent CSS bug… preserve the intended visual product-card design, make product media render correctly at desktop and mobile, keep the card layout visually consistent with the reference."* The prototype contradicts itself within the same grid — four cards render artwork, four do not — so the design intent is established by the file itself, not inferred.

### Visual output change
**Yes (restores intent).** Cards 1–4 will show product artwork on desktop where the reference shows an empty tile. Card dimensions, spacing, badge placement, and every other card property are unchanged. Mobile output is unchanged.

---

## DEV-002 — Duplicate SVG IDs in the water layers

**Area:** Scene background · **Phase:** 1 · **Status:** Planned
**Reference:** HTML lines 833–870 (`wl-a`, `wl-b`)

### Prototype behaviour
The `wl-a` and `wl-b` water layers each inline a `<defs>` block declaring the same three IDs: `cg` (gradient), `wf` and `wf2` (turbulence/displacement filters). Each ID therefore appears twice in the document.

### Production issue
Duplicate `id` values are invalid HTML. `url(#wf2)` resolves to the first match in document order, so `wl-b` silently renders using `wl-a`'s filter definition rather than its own. The two definitions happen to be identical here, which hides the bug — but on a Shopify page the risk compounds: sections can be duplicated in the theme editor, which would multiply every inlined ID across the page and let one section's filters and gradients hijack another's.

### Planned correction
Every SVG `id` in the theme is namespaced per section instance, e.g. `id="pl-{{ section.id }}-wf2"`, with all `url(#…)` references generated from the same value. Where a definition is genuinely shared, it is declared once in a single hidden sprite rather than repeated per layer.

### Reason
Correctness and theme-editor safety. The assignment requires that "adding, removing, reordering, and reconfiguring should never break anything, including the animations" — duplicated section instances with colliding filter IDs are exactly that failure.

### Visual output change
**No.** Each layer will use the filter it was always meant to use; since the duplicate definitions are identical, the rendered result is the same.

---

## DEV-003 — Dangling `#voices` anchor

**Area:** Progress rail, footer · **Phase:** 1 (rail is bonus scope) · **Status:** Planned
**Reference:** HTML line 939 (rail), line 1545 (footer); CSS lines 424–431 (`.voices`, dead)

### Prototype behaviour
The fixed progress rail contains `<a href="#voices" aria-label="Reviews">` and the footer contains `<a href="#voices">Reviews</a>`. **No element with `id="voices"` exists in the file.** The `.voices` grid CSS (three breakpoints) styles markup that was removed.

### Production issue
Two links go nowhere. Activating either leaves the user on the page with no feedback — a broken navigation affordance and a screen-reader announcement ("Reviews") that resolves to nothing. The rail's JS also queries `document.querySelector('#voices')`, storing `null` in its target array; the guard `if (t && …)` prevents a crash but the dot can never activate, so the rail permanently misreports position. The dead `.voices` CSS is unreachable code.

### Planned correction
- Point both links at the reviews rail section, which is the required section `#reviews` and the content the label describes.
- In the theme, in-page anchors are generated from the actual section IDs rather than typed, so a section that is removed or reordered in the theme editor cannot leave a dangling link.
- Drop the unreachable `.voices` rules; they style no markup.

### Reason
Broken links and unreachable CSS are production defects, and hardcoded fragment IDs cannot survive the theme editor — sections have generated IDs and merchants can remove the target entirely.

### Visual output change
**No.** The links look identical; they simply resolve. The rail dot for reviews becomes able to activate, which is its designed behaviour.

---

## DEV-004 — `.striphint` visible at all widths

**Area:** Full range strip (`#range`, bonus scope) · **Phase:** Bonus · **Status:** Planned
**Reference:** CSS line 605; HTML line 1447

### Prototype behaviour
```css
@media(max-width:760px){ .striphint{display:block} }
```
`<p class="striphint">Swipe to see the full shelf</p>`

`display:block` is declared only inside the ≤760px block, and there is **no base rule setting `display:none`**. A `<p>` is already `display:block`, so the media query changes nothing and the hint renders at every width.

### Production issue
"Swipe to see the full shelf" is shown on desktop, where the strip does not scroll — `.stripwrap` only becomes a horizontal scroller at ≤760px. The instruction is inaccurate above that width, and an inaccurate affordance hint is worse than none, particularly for screen-reader users who receive it as plain content with no indication it does not apply.

### Planned correction
Hide the hint by default and reveal it only where the strip actually scrolls (≤760px), which is the evident intent of the media query. In the theme the hint text is a merchant-editable setting and can be turned off entirely.

### Reason
The media query's existence establishes the intent; the missing base rule is an oversight, not a design choice. A scroll hint must only appear where scrolling exists.

### Visual output change
**Yes (restores intent).** The line disappears above 760px. Mobile output is unchanged. *Bonus-scope section — this correction lands only if `#range` is built.*

---

## DEV-005 — Combo says "5 products" but shows 3

**Area:** Best-selling combos (`#combos`) · **Phase:** 4 · **Status:** Planned
**Reference:** HTML line 1189, "Complete home bundle" card

### Prototype behaviour
The "Complete home bundle" card states `<div class="cnt">5 products</div>` and its includes-sentence lists five ("Kitchen Cleaner, Laundry Detergent, Floor Cleaner, Toilet Cleaner & Handwash"), while its `.stack` renders **three** product images (kitchen, floor, handwash) joined by two `+` glyphs. The 302px card has room for three tiles; five were never drawn.

### Production issue
The count, the includes-list and the artwork disagree. In the prototype these are three independent hardcoded strings so nothing enforces consistency. In Shopify all three derive from the **same** product list, so the inconsistency cannot simply be transcribed — the section has to decide what a combo of five products displays inside a 302px tray, and the answer must hold for 2, 3, 5 or any other count a merchant configures.

### Planned correction
- Count and includes-list are **computed from the component product list**, never typed. They can no longer disagree with each other.
- The stack renders the first *N* components (N = 3, matching the reference's visual density and card width) and, when more exist, appends an overflow indicator in the established `.tile` style (e.g. `+2`) as the final item.
- The overflow threshold is a section setting, so a merchant can show fewer or more.
- The rendered result for the 2- and 3-product combos is pixel-identical to the reference.

### Reason
The assignment requires real Shopify data and forbids hardcoding what a merchant would change. Deriving the count from the product list is the only correct implementation; once derived, the display rule for overflow has to be explicit. Silently dropping components would misrepresent the offer, and cramming five tiles into a 302px tray would break the reference layout.

### Visual output change
**Yes (documented).** The "Complete home bundle" card gains a small `+2` overflow tile after its three product tiles. Every other combo card is unchanged. The alternative — a card whose stated count contradicts its own artwork — is not defensible in production.

---

## DEV-006 — Long product titles clamped to two lines

**Area:** Product card (all consumers) · **Phase:** 1 · **Status:** Implemented
**Reference:** CSS line 414 (`.card h4`), HTML lines 1261–1425

### Prototype behaviour
`.card h4` sets `line-height:1.2` and `margin-bottom:7px` with no height constraint and no clamp. Every title in the file was hand-picked to fit one or two lines, so the grid always looked even.

### Production issue
The assignment requires a seeded product **with a very long title**. In a real catalogue, one card's title wrapping to four lines pushes that card taller than its row neighbours. Because `.pr` is bottom-pinned with `margin-top:auto`, the card grows rather than the price moving — so a single long title visibly breaks the row rhythm the design depends on, worst at 375px where the 2-up column is roughly 170px wide.

### Correction as implemented
`.pl-card__title` in `assets/purelane-base.css` §11: two-line clamp via `-webkit-line-clamp`, with `min-height: 2.4em` (two lines at `line-height: 1.2`) so short titles reserve the same space as long ones and every card in a row starts its price row at the same offset. The full untruncated title remains in the DOM and is therefore fully available to assistive technology and to search engines — only the visual presentation is clipped.

### Reason
Preserving the card rhythm is preserving the design. The alternative — letting titles run to arbitrary length — changes the visual output far more than a clamp does.

### Visual output change
**Yes (documented).** Titles longer than two lines are visually truncated with an ellipsis. Every title in the reference file fits within two lines, so **no card in the reference renders differently**. The change is only observable with the assignment's required long-title test product.

---

## DEV-007 — Sold-out state added to the card design

**Area:** Product card (all consumers) · **Phase:** 1 · **Status:** Implemented
**Reference:** no source — the prototype has no sold-out state

### Prototype behaviour
Nothing in the prototype is ever unavailable. Every card renders an enabled "Add to cart" button, and there is no disabled button style, no sold-out badge, and no unavailable treatment anywhere in the 1,716 lines.

### Production issue
The assignment requires a seeded **sold-out product**, and it will appear in the shop grid, potentially as a combo component and as a bundle tier. Shopify knows the state via `product.available`; the design has no vocabulary for expressing it.

### Correction as implemented
Built from the design's existing parts rather than invented:
- **Badge** — `.pl-badge--soldout` reuses the exact geometry of `.pill` (8.5px, `.13em` tracking, `4px 9px`, `999px` radius, 86% white fill) with a neutral violet hairline and `--pl-paper-3` ink instead of the amber/olive promotional pair, so it reads as status rather than as a promotion. It occupies the same corner slot and takes precedence over `custom.badge`.
- **Button** — the existing `.pl-btn--ghost` at `opacity: .55`, `cursor: not-allowed`, hover lift removed, with `disabled` set.
- **Label** — the button text changes to Dawn's own `products.product.sold_out` string, and visually-hidden text names the product, so the state is never conveyed by colour or opacity alone.
- **Artwork** — `opacity: .62` on the image only.

### Reason
Required by the brief's own test data. Every value used already exists in the design; no new colour, radius, type size or spacing step was introduced.

### Visual output change
**Yes (documented).** A state the reference cannot display. No in-stock card renders differently.

---

## DEV-008 — Missing-image tile promoted to all card variants

**Area:** Product card (all consumers) · **Phase:** 1 · **Status:** Implemented
**Reference:** CSS lines 526–528 and 745; HTML line 1189 (the laundry combo's middle item)

### Prototype behaviour
The design already has a no-artwork treatment: `.stack .it .tile`, a dashed-border rounded tile containing the leaf icon, used for the one combo component that has no illustration. It exists **only** inside combo trays; the shop grid, bundle strips and category tiles have no equivalent because every product there was given artwork.

### Production issue
The assignment requires a seeded **product with no image**, and it can appear in any of those sections.

### Correction as implemented
`.pl-tile` in `assets/purelane-base.css` §10 carries the reference's exact treatment — `rgba(255,255,255,.5)` fill, `1px dashed rgba(75,58,143,.26)`, `9px` radius, olive leaf — and is emitted by `snippets/purelane-media.liquid` whenever `image` is blank. Each card variant sizes it to its own slot: 122×82 in the grid (108×72 ≤760px), 66×44 in stacks, 62×40 in strips, 176px in categories. Visually-hidden text names the product and states that no image is available; the tile itself is `aria-hidden`.

### Reason
The fallback is the design's own, extended to the slots that needed it. Nothing was invented.

### Visual output change
**No.** The reference's one no-image case renders identically. The treatment simply now exists in slots the reference never exercised.

---

## DEV-009 — Purelane CSS namespaced `pl-`

**Area:** Foundation · **Phase:** 1 · **Status:** Implemented

### Prototype behaviour
Generic class names throughout: `.card`, `.badge`, `.price`, `.btn`, `.rating`, `.wrap`, `.glass`, `.media`.

### Production issue
Dawn 16.0.0 already owns `.card`, `.card__content`, `.badge`, `.price`, `.rating`, `.button`, `.media` and a large `--color-*` custom property set. Transcribing the prototype's class names into the theme would silently restyle Dawn's own product cards, cart drawer, badges and price blocks on every page of the store — including templates we never touch.

### Correction as implemented
Every Purelane class and custom property is prefixed (`.pl-card`, `.pl-badge`, `--pl-accent`), and the component styles are additionally scoped under a `.pl` root class. `assets/purelane-base.css` is loaded by Purelane sections rather than from `layout/theme.liquid`, so pages without a Purelane section never download it.

### Reason
Isolation. Dawn's own templates must keep working exactly as they do at the baseline commit.

### Visual output change
**No.** Class names are not visual output.

---

## DEV-010 — Single resolved token set; dead V1 palette dropped

**Area:** Foundation · **Phase:** 1 · **Status:** Implemented
**Reference:** style block 1 (lines 12–633), style block 2 (lines 634–823)

### Prototype behaviour
Two stylesheets. The first declares a full dark design system; the second re-declares `:root` and overrides every surface, button, badge, glass treatment and scene gradient. The second wins, so the page renders **light**. Roughly 190 lines of the first block are unreachable, and a further ~45 lines style a product-detail page (`.crumb`, `.gal-main`, `.vopt`, `.stickybuy`, …) whose markup is not in the file at all.

### Production issue
Transcribing both blocks would ship a theme where a maintainer cannot tell which value is live, where a merchant-facing colour setting could be silently overridden, and where a quarter of the CSS styles nothing.

### Correction as implemented
`assets/purelane-base.css` declares one resolved token set — the V2 light values that actually render. The dead V1 tokens and the orphan PDP rules are not carried over. Literals that V2 used inline without tokenising (`#4f7d10`, `#7a9c1e`, `#01423b`, the teal button gradient) are named as `--pl-olive`, `--pl-olive-2`, `--pl-teal-ink`, `--pl-btn-fill` so sections stop repeating raw hex.

### Reason
The rendered design is the spec. Unreachable code is not part of it.

### Visual output change
**No.** Only the overriding values were ever visible.

---

## DEV-011 — Reveal hidden state gated behind JS readiness

**Area:** Foundation · **Phase:** 1 · **Status:** Implemented
**Reference:** CSS lines 157–160; JS lines 1571–1580

### Prototype behaviour
`.rv { opacity: 0; transform: translateY(30px); filter: blur(7px) }` is applied unconditionally in CSS. A parse-time script then adds `.in` via IntersectionObserver. Roughly 30 elements across the page depend on it.

### Production issue
Three failure modes leave real content permanently invisible: JavaScript disabled or blocked, the script erroring before the observer is attached, and — the one that matters most here — the **theme editor**. Shopify re-renders a section's DOM on every setting change; the prototype's document-level `querySelectorAll` ran once at parse time and never again, so an edited section would keep its `opacity: 0` markup with nothing left to reveal it. The assignment states explicitly that reconfiguring "should never break anything, **including the animations**".

### Correction as implemented
- The hidden state is scoped to `purelane-reveal[data-pl-ready] .pl-rv`. The `data-pl-ready` attribute is set by the custom element itself in `connectedCallback`. No JS, no attribute, no hidden state — content renders fully visible.
- `assets/purelane-reveal.js` defines `<purelane-reveal>`, whose `connectedCallback`/`disconnectedCallback` make it re-initialise on `shopify:section:load` and tear down its observer on unload, with no section-level wiring.
- `prefers-reduced-motion` is read through a live `change` listener rather than sampled once, and under reduced motion everything is revealed immediately instead of animated.

### Reason
Theme-editor survival and graceful degradation are both explicit requirements. This is the pattern the four later sections build on.

### Visual output change
**No.** Identical reveal behaviour when JavaScript runs.

---

## DEV-012 — Purelane microcopy as snippet defaults, not locale keys

**Area:** Foundation · **Phase:** 1 · **Status:** Implemented

### Intended approach
Purelane-specific strings — "% off", "Save", "reviews", "No image available" — were first added as a `purelane` block in `locales/en.default.json`, which is standard Shopify practice.

### Production issue
Theme Check's `MatchingTranslations` rule requires every key to exist in **all 51** of Dawn's locale files. Four new keys produced **120 errors**. Satisfying the rule means editing all 51 Dawn locale files to insert English strings into Japanese, Arabic, Finnish and so on — a large diff across files we otherwise never touch, with fake translations in every one.

### Correction as implemented
The locale file was reverted to stock. Purelane microcopy is a snippet parameter with an English default (`{{ percent_off_label | default: '% off' }}`), and sections expose these as settings, so a merchant can still change every string from the theme editor — which the assignment actually requires, and which a locale key would *not* have given them. Strings that Dawn already translates (`products.product.sold_out`, `add_to_cart`, `choose_options`, `price.regular_price`, `price.sale_price`, `accessibility.star_reviews_info`, `accessibility.total_reviews`) continue to use Dawn's `t` filter and stay fully localised.

### Reason
Merchant-editability outranks a locale key for display copy, and stock Dawn files are left untouched. Revisit in Phase 11 if the store needs a second language.

### Visual output change
**No.**

---

## DEV-013 — Product artwork as `<img>`, not a CSS background

**Area:** Foundation · **Phase:** 1 · **Status:** Implemented
**Reference:** CSS lines 250–281; every `.pimg` span in the markup

### Prototype behaviour
All 14 product illustrations are base64 SVG data URIs assigned to custom properties in `:root`, applied as `background-image` on `<span class="pimg" role="img" aria-label="…">`, sized by a per-asset `aspect-ratio`.

### Production issue
- Products come from Shopify, so artwork is a `product.featured_image` on the CDN, not a compile-time constant. A CSS background cannot express that.
- Background images take no `srcset`/`sizes`, so every viewport downloads the same file.
- They are invisible to the preload scanner, which matters directly for the hero LCP.
- They vanish in forced-colours / high-contrast mode, taking the product with them.
- 15.2 KB of base64 sits in the critical stylesheet, render-blocking and separately uncacheable.

### Correction as implemented
`snippets/purelane-media.liquid` renders a real `<img>` with a five-step `srcset` (120–480w), a per-variant `sizes`, explicit `width`/`height`, `loading="lazy"` by default and an optional `fetchpriority="high"` for LCP candidates. `object-fit: contain` with `object-position: center bottom` reproduces the prototype's `background-size: contain; background-position: center bottom` exactly. Alt text resolves from the image's own alt, then the product title.

### Reason
Required by "products, prices, and content come from the platform", and by the performance requirement. The visual result is unchanged.

### Visual output change
**No.** Same artwork, same fit, same anchor point — different delivery.

---

## DEV-014 — Google Fonts loaded temporarily for Outfit + Inter

**Area:** `layout/theme.liquid` · **Phase:** 1.5 (between foundation and hero) · **Status:** Implemented — **temporary, Phase 9 removes it**
**Reference:** line 11

### Prototype behaviour
`<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">` preceded by two preconnects.

### Production issue
Shopify's font library carries neither Outfit nor Inter, so `settings.type_header_font` / `type_body_font` and Dawn's `font_face` pipeline cannot supply them. Without a webfont, every section built in Phases 2–7 renders in a fallback stack and visual comparison against the reference is meaningless.

### Correction as implemented
The reference's font loading is reproduced **verbatim** in `layout/theme.liquid` — same two families, same weights, same `display=swap`, same preconnect pair, byte-identical URL (verified by diff against reference line 11). Three `RemoteAsset` Theme Check warnings are suppressed with a scoped `theme-check-disable`/`enable` pair so that genuinely new warnings stay visible in later phases; the suppression carries its justification inline.

### Reason
Approved as an explicit interim decision: accurate visual comparison now, performance correction later. The costs are known and written into the file — a render-blocking third-party stylesheet, two extra DNS/TLS handshakes, and no control over subsetting or cache policy.

### Phase 9 replacement
Self-hosted, subset, preloaded `woff2` served from the theme's own assets, with metric-adjusted fallbacks to limit swap shift. The `theme.liquid` block is deleted at that point.

### Visual output change
**No.** This is what makes the visual output match.

**Known fidelity note:** the Purelane CSS sets `font-weight: 800` on badges, which are set in Inter — but the reference only loads Inter to 700, so those render at the nearest available weight. Reproducing the reference's exact weight set reproduces this too. Not a defect.

---

## DEV-015 — Hero paints its own background until the scene layer exists

**Area:** Hero · **Phase:** 2 · **Status:** Implemented — **interim**
**Reference:** CSS lines 64-70, 660-664; HTML lines 826-831

### Prototype behaviour
The page has a fixed, full-viewport `.scenes` stack behind everything: four gradient scenes cross-fading on scroll, four animated water layers and 16 bubbles. The hero is transparent and sits over scene 1, `linear-gradient(178deg,#fbfffb,#eafaec 24%,#d6f1dc 54%,#bfe8ca 100%)`.

### Production issue
The scene layer is a page-level component shared by all five sections, and it is the single largest performance item in the file (three full-viewport animated `feTurbulence`/`feDisplacementMap` filters). It is deliberately not built in Phase 2. But a transparent hero over Dawn's white body does not resemble the design at all and cannot be visually reviewed.

### Correction as implemented
The hero renders its own `.pl-hero__bg` carrying **scene 1's exact gradient**, behind its scrim, controlled by a `show_local_background` section setting (default on) whose help text states it is temporary.

### Reason
Makes the section evaluable standalone without pre-empting the shared background's architecture. When the scene layer is built, the setting is switched off — or the element is removed — and the hero becomes transparent as designed.

### Visual output change
**No (interim).** The hero shows the same gradient the reference shows behind it. What is missing is the water, bubbles and scroll-driven scene transitions — all deferred, none owned by this section.

---

## DEV-016 — Carousel dot hit area expanded to 44px

**Area:** Hero · **Phase:** 2 · **Status:** Implemented
**Reference:** CSS lines 322-326

### Prototype behaviour
`.hdots button { width: 6px; height: 6px }` — a 6×6px pointer target, growing to 20×6px when active.

### Production issue
A 6px target fails every touch-target guideline and is genuinely hard to hit on a phone, which is where this carousel is most used. WCAG 2.5.8 asks for 24×24px minimum; 44×44px is the common practical floor.

### Correction as implemented
The painted dot keeps its exact reference dimensions (6px, 20px active, same colours, same 0.4s morph). A transparent `::before` pseudo-element centred on it extends the *hit area* to 44×44px.

### Reason
The visual design is preserved precisely; only the invisible interactive region changes.

### Visual output change
**No.** Nothing painted changes. The dots simply become usable.

---

## DEV-017 — Hero heading split into two settings

**Area:** Hero · **Phase:** 2 · **Status:** Implemented
**Reference:** HTML line 964 — `<h1 class="d1 rv in">Clean<br>That<br><span class="lime">Lasts</span></h1>`

### Prototype behaviour
The headline's line breaks and its accent word are baked into the markup, with the third line wrapped in `.lime`.

### Production issue
"Nothing hardcoded that a marketing team would want to change" — the headline is the single most-edited element on any homepage. Shopify's `richtext` setting permits only `<p> <strong> <em> <a> <br>`, so a `<span class>` cannot survive it, and an `html` setting would require a marketer to write markup.

### Correction as implemented
Two settings: `heading` (textarea, one headline line per line break) and `heading_accent` (single line, appended last and wrapped in `.pl-accent-text`). Defaults reproduce the reference exactly — `Clean\nThat` plus `Lasts`. A `heading_tag` setting picks H1 or H2 so a second hero, or a page that already has an H1, does not produce a broken outline.

### Reason
Merchant-editability with no HTML knowledge, identical rendered result.

### Visual output change
**No.** Renders character-for-character as the reference at default settings.

---

## DEV-018 — Hero offer prices derived, not typed

**Area:** Hero · **Phase:** 2 · **Status:** Implemented
**Reference:** HTML line 994

### Prototype behaviour
Three price tags with every figure typed as a literal: "Single bottle ₹200 / ~~₹299~~ / 33% off", "Any 2 products ₹349 / ~~₹598~~ / Save ₹249", "Any 3 products ₹499 / ~~₹897~~ / Save ₹398".

### Production issue
None of it is connected to anything. ₹598 is two products' compare-at prices added by hand; ₹249 is a subtraction done by hand. Any price change on the store leaves the hero lying.

### Correction as implemented
Per slide:
- **Compare-at** = the sum of each shown product's `compare_at_price`, falling back to its `price` where no compare-at exists. This is the honest "bought separately" total.
- **Price** = the optional **offer product**'s `price` — a real bundle product, so Shopify owns the number — or, when no offer product is set, the sum of the shown products' prices.
- **Saving** = computed by `purelane-price`, as a percentage or an amount, per a block setting.
- If the computed compare-at is not greater than the price, the strikethrough and the saving chip are both omitted rather than showing a zero or negative saving.

### Reason
Directly required: "Products, prices, and content come from the platform, not your Liquid."

### Visual output change
**Depends on store data.** With products priced as the reference implies (₹200/₹299 each) and bundle products at ₹349 and ₹499, the tags render exactly as the reference. With different seeded prices the numbers differ — correctly. The layout, type and treatment are unchanged.

---

## DEV-019 — Carousel accessibility: inert slides, pause on focus

**Area:** Hero · **Phase:** 2 · **Status:** Implemented
**Reference:** HTML line 994; JS lines 1659-1682

### Prototype behaviour
Inactive slides are `opacity: 0; pointer-events: none` but remain fully in the accessibility tree — so all three price tags and all six product names are announced at once, as if they were competing simultaneous offers. Dots are unlabelled beyond "Show 2 products" and carry no state. Autoplay pauses on `mouseenter` only.

### Correction as implemented
- Inactive slides get `inert` **and** `aria-hidden="true"`, so only the visible offer is announced.
- Each slide is a `role="group"` with `aria-roledescription="slide"` and a positional label; the stage is a `role="region"` with `aria-roledescription="carousel"` and a merchant-set accessible name.
- Dots carry `aria-current` and roving `tabindex`, respond to arrow keys, and announce position and offer label.
- Autoplay pauses on **`focusin` as well as `mouseenter`** — the prototype left a keyboard user unable to stop the carousel moving under them.
- A polite `role="status"` region announces the offer on manual navigation only, staying silent during autoplay.

### Reason
Required by the accessibility baseline. None of it is visible.

### Visual output change
**No.**

---

## DEV-020 — Purelane custom elements declared `display: block`

**Area:** Foundation + Hero · **Phase:** 2 (defect fix) · **Status:** Implemented
**Not a prototype deviation** — a defect in our own Phase 1/2 code, recorded here because it changed rendered output.

### The defect
`<purelane-reveal>` and `<purelane-hero-stage>` had no `display` declaration anywhere. Custom elements have no default display, so both resolved to **`display: inline`**.

Two consequences, both reported from the storefront:

1. **Autoplay never started.** `<purelane-hero-stage>` was the IntersectionObserver target. An inline element whose children are all block-level has a degenerate box, so the observer could not satisfy `threshold: 0.2`, `this.visible` stayed false, and `play()` returned at its guard every time. The timer was never created. Manual dot clicks still worked because they bypass the visibility gate.
2. **Slide indicators were not visible or usable.** `.pl-hero__grid` — `max-width: 1180px; width: 100%; margin: 0 auto; position: relative` — was applied to the inline `<purelane-reveal>`. Inline boxes ignore width, max-width and vertical margins, and a relatively positioned inline box is a degenerate containing block. `.pl-hero__prod { position: absolute; bottom: 28px }` therefore resolved against a collapsed box instead of the grid, putting the stage and the dots below it outside the intended area, where `.pl-hero { overflow: hidden }` clipped them.

A third, separately real bug in the same area: the dots' 44×44px `::before` hit areas were centred on 6px dots at a 13px pitch, so each overlapped roughly three neighbours. Because later siblings paint over earlier ones, **clicking dot 1 activated dot 3**.

### Correction as implemented
- `purelane-reveal { display: block }` in `purelane-base.css`, with a comment explaining why every Purelane custom element must declare it. This is foundation-level, so the four remaining sections cannot repeat the mistake.
- `purelane-hero-stage { display: block; position: relative }` in `purelane-hero.css`.
- Dot hit areas changed from a centred 44×44 box to `left: -3.5px; right: -3.5px; height: 44px` — full row height, exactly half the gap each side. Targets now touch but never overlap. **The painted dot is untouched**: still 6px, still 20px when active, same colours, same 0.4s morph.
- `this.visible` now initialises to `true`, and `startVisibilityWatch()` calls `play()` directly. The observer's role is narrowed to *pausing* when the hero leaves the viewport, and its threshold dropped from `0.2` to `0` — a ratio gate was never needed for a pause check and was the thing an unmeasurable target could not satisfy. Autoplay no longer depends on an observer callback arriving.
- Added `shopify:block:select` / `shopify:block:deselect` handling so selecting a slide in the theme editor shows that slide and holds it still while it is edited.

### Reason
The section could not do what the reference does. No accessibility or lifecycle safety was removed to achieve it — `inert` on inactive slides, pause on hover and focus, roving tabindex, arrow keys and full teardown on disconnect are all unchanged, and editor safety improved.

### Visual output change
**Yes (restores intent).** The dots become visible and correctly placed, and the hero grid is constrained to its 1180px max-width as designed. Both were broken by the defect, not by the design.

---

## DEV-021 — Bundle per-unit price computed exactly, not hand-rounded

**Area:** Bundles (`#bundles`) · **Phase:** 5 · **Status:** Implemented
**Reference:** HTML lines 1210, 1221, 1235

### Prototype behaviour
Three typed per-unit lines:

| Tier | Price | Quantity | True per unit | Prototype prints |
|---|---|---|---|---|
| Starter | ₹349 | 2 | 174.50 | **₹174** (floored) |
| Most popular | ₹499 | 3 | 166.33 | **₹166** (either rule) |
| Whole home | ₹799 | 5 | 159.80 | **₹160** (rounded up) |

### Production issue
No single rounding rule reproduces all three. The first is floored, the third is rounded, and the second is ambiguous. These were typed by hand, not calculated — which is exactly what the assignment forbids: *"Products, prices, and content come from the platform, not your Liquid."* Once a merchant changes a bundle price, every one of these numbers becomes wrong, and there is no rule to inherit because the prototype never had one.

### Correction as implemented
The per-unit figure is the bundle product's real price divided by the tier quantity, rendered through Shopify's `money` filter so it respects the store's currency format. It is shown only when both a price and a quantity exist — never as ₹0 and never estimated. Prefix and suffix ("Flat" … "per product") are block settings, so the wording stays merchant-editable.

### Reason
The number has to be true. Picking one of the reference's two conflicting rules would reproduce a hand-typed artefact and still be wrong for two of the three tiers as soon as prices change.

### Visual output change
**Yes (documented).** With the reference's own prices the line reads "Flat ₹174.50 per product" rather than "Flat ₹174 per product", and similarly ₹166.33 and ₹159.80. The type, colour, size and position of the line are unchanged. If exact-to-the-reference whole numbers are preferred over arithmetic correctness, a rounding mode could become a section setting — flagged for the Phase 7 review rather than decided unilaterally.

---

## DEV-022 — Marquee repeat count and duration computed, not fixed

**Area:** Reviews rail (`#reviews`) · **Phase:** 6 · **Status:** Implemented
**Reference:** CSS lines 479-481, 582; HTML line 1009

### Prototype behaviour
Five review cards are hand-duplicated once, giving ten. The track animates `translate3d(0)` → `translate3d(-50%)` over 52s (40s below 760px). The `-50%` works only because the track holds exactly two copies of the visible set.

### Production issue
Two failures, both caused by the numbers being fixed rather than derived.

1. **The loop gaps on wide screens.** Ten cards at 284px + 12px gap make a 2,960px track, so one half is 1,480px. Once the viewport exceeds 1,480px the translation exposes empty space before the clone arrives. The reference is safe only up to about 1,480px wide.
2. **Speed drifts with the review count.** A merchant publishing ten reviews instead of five doubles the track length, and a fixed 52s duration then scrolls it at double speed. Publish three and it crawls.

Both get worse under merchant control, which is the whole point of the section.

### Correction as implemented
- **Repeat count is computed.** The review set is repeated until one half of the track is at least 2,000px, using ceiling division, then doubled for the loop. Five reviews → 2 repeats → 20 cards, half-track 2,960px. One review → 7 repeats. Ten → 1 repeat.
- **DOM is capped** at 40 cards total, so a merchant with 20 reviews does not multiply them further.
- **Duration is derived from the real track width**: `calc(var(--pl-marq-distance) / var(--pl-marq-speed) * 1s)`, with both values set inline per section instance. The speed setting is expressed in pixels per second, defaulting to **28 — the reference's own rate** (1,480px ÷ 52s = 28.5px/s). Verified across 1, 2, 3, 5, 8, 10 and 20 reviews: the rate holds at 27.9–28.1px/s throughout.
- A separate distance value is supplied for the 760px breakpoint, where cards narrow to 250px, so the rate stays constant there too.

### Reason
The reference's constants encode its own content. Once the content is merchant-controlled they stop being correct, and the failure is silent — a gap at the right viewport width, a wrong speed at the wrong review count.

### Visual output change
**Yes (restores intent).** Identical at the reference's own five reviews and at viewports up to ~1,480px. Above that the reference gaps and this does not. The DOM holds 20 cards rather than 10 at five reviews — the cost of a loop that closes at any width.

**Known difference:** the reference speeds up about 15% below 760px (52s → 40s for a proportionally shorter track). This keeps the rate constant across breakpoints instead. Flagged for the Phase 7 review rather than matched, since the reference's mobile value looks like a hand-tuned constant rather than an intent.

---

## DEV-023 — Review stars reflect the real rating

**Area:** Reviews rail (`#reviews`) · **Phase:** 6 · **Status:** Implemented
**Reference:** HTML line 1009 — `<div class="st">&#9733;&#9733;&#9733;&#9733;&#9733;</div>` on every card

### Prototype behaviour
Every review card prints five star glyphs, hardcoded. There is no rating value anywhere in the markup, and no accessible text: the glyphs are the only carrier of meaning.

### Production issue
Once reviews are real data they carry real ratings, and a four-star review displaying five stars misrepresents a customer. The glyphs are also inaccessible — a screen reader announces "black star black star black star…" or nothing useful, and the value cannot be read at all.

### Correction as implemented
The glyph count is the review's actual `rating`, rounded to the nearest whole star and clamped to five. The glyph run is `aria-hidden`, and Dawn's own `accessibility.star_reviews_info` string states the exact value in visually-hidden text ("4.8 out of 5 stars"). The glyph itself, its size, colour and letter-spacing are unchanged.

### Reason
Required by "real Shopify data", and by the accessibility baseline's "ratings have meaningful accessible text".

### Visual output change
**Yes (documented).** A review rated below 5 shows fewer stars. Every review in the reference is five stars, so at reference data the output is identical. Half-star rendering is not implemented — the reference has no such treatment to reproduce, and the exact value is always available in text.

---

## DEV-024 — First hero slide marked active server-side

**Area:** Hero · **Phase:** Final QA · **Status:** Implemented
**Not a prototype deviation** — a defect in our own code, found by rendering the page.

### The defect
No slide carried `is-on` in the server-rendered HTML; the class was applied only by `goTo(0)` once the custom element booted. Since `.pl-hero__slide { opacity: 0 }` and `.pl-hero__bottle { opacity: 0 }`, the entire product stage was invisible until JavaScript ran — including the slide-1 image deliberately marked `loading="eager" fetchpriority="high"` as the LCP candidate. A no-JS visitor saw an empty stage.

### Correction
`{% if forloop.first %} is-on{% endif %}` on the slide class. `goTo(0)` is idempotent, so the JS path is unchanged.

### Verified
Puppeteer with JavaScript disabled: hero product renders at 425×666px, opacity 1.

### Visual output change
**Yes (restores intent).** The hero is visible immediately rather than after JS boot.

---

## DEV-025 — Shared stylesheet loaded once, globally

**Area:** Foundation + all five sections · **Phase:** Final QA · **Status:** Implemented
**Not a prototype deviation** — an architectural defect in our own code.

### The defect
Each section emitted its own `<link>` to `purelane-base.css`. With all five on one page the browser kept **all five in the cascade**, so the last copy sat *after* `purelane-hero.css`, `purelane-reviews.css` and `purelane-combos.css` and overrode their rules at equal specificity.

Confirmed by reading the document's stylesheet order — base.css at positions 1, 3, 5, 7 and 9 of 10.

Casualties, all silent:
- `.pl-hero__badges { position: absolute }` lost to `.pl-glass-2 { position: relative }`, so the desktop promise rail rendered in normal flow at the top-left of the grid instead of pinned right-centre. **This was visible in the first screenshot and is what exposed the bug.**
- `.pl-combo { padding: 0 }`, `.pl-tier { padding: 24px 22px }` and `.pl-rcard { padding: 15px 17px }` all lost to `.pl-card { padding: 16px }`.
- Only the product grid, last in the cascade, was unaffected.

### Correction
`purelane-base.css` is loaded once from `layout/theme.liquid`, immediately after Dawn's own `base.css`; the five sections load only their own stylesheet. Base is now always first, so section rules always win.

### Reason
Root cause rather than raising specificity rule by rule, which would have been endless. It matches how Dawn loads its own `base.css`.

### Trade-off
The 20 KB foundation now loads on every page rather than only pages with a Purelane section. Acceptable, and the same trade Dawn already makes. Phase 9 can revisit.

### Verified
Stylesheet order now lists base.css exactly once, first. Badges measured at `position: absolute`, x=1196 — the right edge of the 1180px grid minus 18px, as designed.

### Visual output change
**Yes (restores intent).** Restores the layout the CSS always described.

---

## DEV-026 — Autoplay does not resume while hovered or focused

**Area:** Hero · **Phase:** Final QA · **Status:** Implemented

### The defect
`onDotClick` and `onDotKeydown` both ended with `this.play()`. `play()` had no notion of "the visitor is still here", so clicking or arrow-keying a dot restarted autoplay even though the pointer or keyboard focus was still inside the carousel — defeating the pause that DEV-019 introduced. Caught by a Puppeteer test that focused a dot and watched the slide change underneath it.

### Correction
`hovered` and `focused` are tracked as state by the four listeners, and `play()` returns early while either is true. The dot handlers still call `play()`; it simply becomes a no-op until the visitor leaves.

### Verified
Focus a dot, wait 5s: slide index unchanged. Hover: unchanged. Move away: autoplay resumes.

### Visual output change
**No.**

---

## DEV-027 — Combo rail item carries width and snap, card fills it

**Area:** Combos · **Phase:** Final QA · **Status:** Implemented

### The defect
In the reference, `.combo` is itself the rail's flex item, so `align-items: stretch` gave every card the tallest card's height. Wrapping each card in an `<li>` for list semantics made the **`<li>`** the flex item; the card inside stayed content-height, so cards ended ragged with their CTAs at different heights.

### Correction
`.pl-comborail > li` takes `flex: 0 0 302px` (268px ≤760px) and `scroll-snap-align: start`; `.pl-combo` becomes `flex: 1 1 auto; width: 100%`.

### Also fixed alongside
- **Saving pill under the corner flag.** The reference pill reads "You save ₹398"; a store using `$398.00 USD` overflowed under the flag. Capped with `.pl-combo__tray:has(.pl-combo__flag) .pl-combo__save { max-width: calc(100% - 104px) }`.
- **Space before the comma** in the generated includes sentence ("Cleaner , Dishwash") — whitespace control in the loop.

### Visual output change
**Yes (restores intent).** Equal card heights and aligned CTAs, as the reference has.

---

## DEV-028 — Reviews and combos configured as blocks, not metaobjects

**Area:** Reviews, Combos · **Phase:** Final QA · **Status:** Implemented — **revisit**

### What happened
The `review` and `combo` metaobject definitions and all ten entries were created on the store exactly as [DATA_MODEL.md](DATA_MODEL.md) specifies, with `PUBLIC_READ` storefront access and every entry `ACTIVE`.

But a `metaobject_list` **section setting could not be populated by authoring `templates/index.json` directly**. Five value formats were tried — GIDs, bare handles, bare numeric ids, `shopify://metaobjects/<type>/<handle>`, and `shopify://metaobjects/<type>/<id>`. In every case Liquid received a `MetaobjectListDrop` with `size == 0`. The drop resolves, the references do not.

### Correction
Both sections were built from the start with `review` / `combo` **block fallbacks**, and the homepage is configured with those. All content, ordering and behaviour are identical.

**Metaobjects still take precedence in code.** The moment a merchant opens the theme editor and picks the entries in the Reviews or Combos picker — which writes whatever internal format Shopify expects — the section switches to the metaobject path with no code change. The entries are already on the store waiting.

### Reason
The approved data model is intact and demonstrably built; only the *authoring route* for that one setting type is unavailable outside the theme editor. Blocks were the documented fallback for exactly this situation.

### Visual output change
**No.** Identical rendering from either source.

### To finish the metaobject story
Open the theme editor → Purelane reviews → **Reviews** → select the five entries; same for Purelane combos → **Combos**. Roughly two minutes, and it proves the metaobject path end to end.

---

## Pending / to be raised

Recorded during analysis, not yet decided. These are **not** approved deviations.

| Finding | Notes |
|---|---|
| Dead V1 dark palette (~190 lines) and ~45 lines of PDP CSS for absent markup | The page renders in the light V2 palette. Shipping one resolved token set is a code-level change with no visual effect; will be logged once implemented. |
| No mobile navigation below 1024px (burger opens nothing) | Required by "keyboard at every width from 375px". Net-new scope — Phase 8. Needs a UI decision. |
| Duplicated review cards exposed to assistive technology | Marquee clones will get `aria-hidden`. No visual change. Phase 6. |
| Star ratings as five literal `★` glyphs regardless of value | Will reflect the real rating with a text equivalent. Possible visual change if a product rates below 5. Phase 3 / 6. |
| Contrast of `--paper-3` (`rgba(36,26,61,.56)`) on 11px text over glass | Must be measured against the composited background in Phase 8. Any token adjustment is a visual change and gets its own entry. |
| Reduced motion accelerates marquees (`animation-duration:.01ms`) rather than stopping them | Will stop. Phase 8. |
| Shop grid shows 4 products twice | Real collection data replaces it. Not a deviation — the prototype was padding a grid. |
