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
| DEV-001 | Desktop product-card artwork sizing bug | 3 | Yes (restores intent) | Planned |
| DEV-002 | Duplicate SVG IDs in the water layers | 1 | No | Planned |
| DEV-003 | Dangling `#voices` anchor | 1 / bonus | No | Planned |
| DEV-004 | `.striphint` visible at all widths | Bonus | Yes (restores intent) | Planned |
| DEV-005 | Combo says "5 products" but shows 3 | 4 | Yes (documented) | Planned |

---

## DEV-001 — Desktop product-card artwork sizing bug

**Area:** Shop / product grid (`#shop`) · **Phase:** 3 · **Status:** Planned
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

### Planned correction
Render product media as a real `<img>` inside a fixed-dimension media slot:
- `.shot` keeps its reference dimensions (150px desktop / 126px ≤760px) and its gradient, radius, border and `overflow:hidden`.
- The image is sized to the reference's evident intent — matching cards 5–8 at **122px** desktop and the prototype's own **108px** at ≤760px — with `object-fit:contain` and `object-position:center bottom`, mirroring `.pimg`'s `background-size:contain; background-position:center bottom`.
- Explicit width/height/aspect-ratio to reserve space and avoid CLS.

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
