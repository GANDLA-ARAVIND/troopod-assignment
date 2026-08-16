# Implementation Plan

Approved plan for the Troopod Shopify AI Product Engineer assignment.

**Source of truth for WHAT:** [ASSIGNMENT.md](ASSIGNMENT.md)
**Source of truth for VISUAL DESIGN:** the *rendered* `reference/purelane-homepage.html`
**Not a source of truth:** the prototype's HTML/CSS/JS implementation
**Analysis backing this plan:** [ANALYSIS.md](ANALYSIS.md)
**Deviation log:** [DEVIATIONS.md](DEVIATIONS.md)

---

## Approved decisions

1. The **rendered** Purelane design is the visual source of truth.
2. The prototype **code** is not the implementation source of truth.
3. The five required sections are rebuilt properly for production Shopify.
4. Build on **stock Dawn**.
5. Use **real Shopify data** — products, prices, and content come from the platform.
6. All content a marketing team would want to change is **merchant-editable**.
7. **Preserve the visual design.** No redesigning.
8. Production fixes are allowed where the prototype is technically wrong, inaccessible, or unsuitable for Shopify — **every meaningful deviation is logged in [DEVIATIONS.md](DEVIATIONS.md)**.
9. **Obvious implementation bugs are not reproduced.** Specifically, the desktop product-card artwork sizing bug is corrected, not replicated.

---

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Shopify / Dawn setup | **In progress** — Dawn pulled ✅; store seeding + Git baseline outstanding |
| 1 | Foundation / design system | **Minimum foundation implemented — detailed QA pending** |
| 2 | Hero | **Implemented; carousel defect fixed — awaiting user re-test in the storefront** |
| 3 | Shop / Product Grid | **Implemented — not yet browser-verified** |
| 4 | Best-selling Combos | **Implemented — not yet browser-verified** |
| 5 | Bundles | **Implemented — not yet browser-verified** |
| 6 | Reviews Rail | Not started |
| 7 | Responsive QA | Not started |
| 8 | Accessibility QA | Not started |
| 9 | Performance QA | Not started |
| 10 | Final visual comparison | Not started |
| 11 | Documentation and submission | Not started |

---

# Phase 0 — Shopify / Dawn setup

**Goal:** a working local theme-development loop against a clean stock Dawn install on a development store, with the repository prepared, before any section work begins.

### 0.1 Local project preparation — *done in this phase*
- `.gitignore` suitable for a Shopify theme project.
- `docs/IMPLEMENTATION_PLAN.md` (this file).
- `docs/DEVIATIONS.md` seeded with the findings from analysis.
- `AI_WORKFLOW.md` updated with Phase 0 activity.

### 0.2 Toolchain status (verified on this machine)

| Tool | Status |
|---|---|
| Node.js | ✅ v24.13.0 |
| npm | ✅ 11.6.2 |
| Git | ✅ 2.53.0 (repository **not** initialized — all Git operations handled manually by the user) |
| Shopify CLI | ✅ **4.6.1** (installed via `npm install -g @shopify/cli@latest`) |
| Shopify auth | ✅ logged in as `aravindgandla40@gmail.com` |
| Store access | ✅ `purelane-troopod-assignment-3xlpbw5t.myshopify.com` reachable |

### 0.3 Shopify CLI workflow

Every command below is documented for approval. **Nothing in 0.3 has been executed.** Commands marked ⚠️ touch remote state or credentials and require explicit confirmation before they are run.

**Step 1 — Install the CLI** (local only, no remote effect)
```bash
npm install -g @shopify/cli@latest
shopify version
```
The Shopify CLI is distributed as an npm package. Installing globally makes `shopify` available in any directory. Note: the CLI officially targets Node 20/22 LTS; Node 24 is newer and may print an engine warning. If it misbehaves, the fallback is `npx @shopify/cli@latest <command>` or installing Node 22 LTS.

**Step 2 — Authenticate** ⚠️
```bash
shopify auth login
```
Opens a browser, authenticates the Partner/Shopify account, and stores a session locally. Remote effect: creates a CLI session for the account. It does not modify the store.

**Step 3 — Confirm the target store** ⚠️
```bash
shopify theme list --store <your-dev-store>.myshopify.com
```
Read-only. Lists themes on the development store, confirming access and showing the clean Dawn theme with its ID. Needed to identify exactly which theme to pull.

**Step 4 — Pull the clean Dawn theme into this repo** ⚠️
```bash
shopify theme pull --store <your-dev-store>.myshopify.com --theme <dawn-theme-id> --path .
```
Downloads the store's Dawn theme files into the project root (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`). Remote effect: **none — this only reads.** Local effect: writes theme directories alongside `docs/`, `reference/`, `screenshots/`.
*This must be the genuine Dawn installed on the store. Dawn is not recreated by hand and no third-party theme is substituted.*

**Step 5 — Run the theme locally** (safe, no writes to the published theme)
```bash
shopify theme dev --store <your-dev-store>.myshopify.com
```
Serves the local files at `http://127.0.0.1:9292` with hot reload, using live store data. It uploads to a hidden *development* theme, never to the live theme.

**Step 6 — Preview / share**
```bash
shopify theme dev --store <your-dev-store>.myshopify.com   # local preview URL
shopify theme push --unpublished --theme "Purelane WIP"    # ⚠️ shareable preview theme
```
`--unpublished` creates a new, unpublished theme on the store and returns a preview link. It does not touch the live theme.

**Step 7 — Push changes safely** ⚠️
```bash
shopify theme push --theme <our-working-theme-id> --store <your-dev-store>.myshopify.com
```
Uploads local files to a **specific, non-live** theme. Rules for this project:
- Never `shopify theme push` without `--theme` (it can prompt for and overwrite the live theme).
- Never push to the untouched Dawn theme — it stays as the pristine baseline for comparison.
- `--only` / `--ignore` to scope risky pushes.
- Nothing is published (`shopify theme publish`) without explicit instruction.

**Step 8 — Linting throughout**
```bash
shopify theme check
```
Runs Theme Check against the local theme. No remote effect. Used from Phase 1 onward and again in Phase 11.

### 0.4 Store seeding — requires manual action on the store
- ≥ 8 products suiting the Purelane brand.
- Including: **one sold out**, **one with no image**, **one with a very long title**.
- The 14 bottle illustrations extracted from the prototype become the seeded product images.
- Metafield / metaobject definitions are designed in Phase 1 and created before Phases 3–6.

### 0.5 Phase 0 risks
- Dawn version drift between the provided store and any local reference.
- Development-store limits (password page, no real checkout).
- Metaobject/metafield definitions are manual store configuration a reviewer must reproduce → they get documented precisely in Phase 11.
- Node 24 vs the CLI's supported LTS versions.

### 0.6 Phase 0 exit criteria
- [x] Shopify CLI installed and authenticated
- [x] Development store reachable
- [x] **Clean Dawn identified on the store** — Dawn 16.0.0, id `165271175424`, unpublished *(resolved, see 0.7)*
- [x] Dawn pulled into the repository — 345 files, Theme Check 0 errors
- [ ] `shopify theme dev` serves the store locally
- [ ] A separate working theme exists on the store (Dawn baseline left untouched)
- [ ] ≥ 8 products seeded, including the three required edge-case products
- [x] Repository documentation in place
- [ ] Git repository initialized and baseline commit created *(user-handled)*

### 0.7 Phase 0 blocker — the store had Horizon, not Dawn — **RESOLVED**

*Resolved: the user added Dawn to the store from the free theme library. Dawn 16.0.0 now exists as an unpublished theme (`165271175424`) and has been pulled locally. Horizon remains the live theme and was never touched. The original finding is retained below because it is a real trap for anyone reproducing this build.*

`shopify theme list --store purelane-troopod-assignment-3xlpbw5t.myshopify.com` returns exactly one theme:

```json
[{ "id": 165270782208, "name": "Horizon", "processing": false, "createdAtRuntime": false, "role": "live" }]
```

**There is no Dawn theme on the store.** New Shopify stores now provision with **Horizon**, Shopify's current default theme, rather than Dawn. The assignment brief predates that change — it says *"a development store … running a clean install of Dawn. Dawn is Shopify's free default theme, the one new stores start on"* — but that is no longer what a new store starts on.

The brief is unambiguous that the build target is Dawn: *"Build on stock Dawn rather than a premium theme, so we're looking at your work and not somebody else's section framework."* Horizon is a different theme with a different architecture (theme blocks, a different section model), so it is not a substitute, and the entire architecture in [ANALYSIS.md](ANALYSIS.md) Part 4 assumes Dawn.

**Resolution:** Dawn was added to the store from the free Shopify theme library (Online Store → Themes → Add theme → Dawn), which installs it unpublished. It was then pulled with `shopify theme pull --theme 165271175424 --path .`. Horizon remains live and untouched.

**Remote state modified by the assistant: none.** Only `auth login` (local session) and read-only `theme list` / `theme pull` calls have run against the store.

### 0.8 Dawn baseline as pulled

| Property | Value |
|---|---|
| Theme name | Dawn |
| Theme ID | `165271175424` |
| Role | unpublished (Horizon remains live) |
| Version | **16.0.0** (`config/settings_schema.json` → `theme_info.theme_version`) |
| Local path | `e:\troopod-assignment\` (theme root = project root) |
| Files | 345 across `assets/` (190), `locales/` (51), `sections/` (48), `snippets/` (39), `templates/` (13), `config/` (2), `layout/` (2) |
| Theme Check | 155 files inspected, **0 errors**, 11 warnings — all pre-existing in stock Dawn |

**Note for Phase 1:** [ANALYSIS.md](ANALYSIS.md) Part 4 was written against a generic recent Dawn. The pulled theme is **Dawn 16.0.0**, and the snippets the architecture depends on are all present and confirmed: `card-product.liquid`, `price.liquid`, `buy-buttons.liquid`, `product-form` behaviour via `buy-buttons`, `cart-drawer.liquid`, `cart-notification.liquid`, `unit-price.liquid`, `header-drawer.liquid`. Dawn 16 has no `blocks/` directory (that is Horizon's theme-block model), so the section + block architecture in the analysis holds unchanged.

---

# Phase 1 — Foundation / design system

**Status: minimum foundation implemented — detailed QA pending.**

**Goal:** the shared token set, primitives, and reusable card contract that four of the five sections depend on. Scoped deliberately to the minimum the five sections need, not a general design system.

### Delivered

| File | Purpose |
|---|---|
| `assets/purelane-base.css` | Resolved tokens, scope, type scale, glass, buttons, badges, panel head, price row, rating, media + tile, **product card (4 variants)**, reveal, reduced motion |
| `assets/purelane-reveal.js` | `<purelane-reveal>` custom element — the theme-editor-safe lifecycle pattern the later sections copy |
| `snippets/purelane-product-card.liquid` | **The one card.** Variants: `grid` · `stack` · `strip` · `category` |
| `snippets/purelane-media.liquid` | Real `<img>` with srcset, or the dashed leaf tile fallback |
| `snippets/purelane-price.liquid` | Price / compare-at / computed saving |
| `snippets/purelane-rating.liquid` | `reviews.rating` metafield → stars + accessible text |
| `snippets/purelane-badge.liquid` | pill · tag · save · flag · soldout |
| `snippets/purelane-panel-head.liquid` | Kicker + heading + leaf rule + lede |
| `snippets/purelane-icon.liquid` | leaf · arrow · check · star · plus |
| `docs/DATA_MODEL.md` | Proposed metafield / metaobject model (not yet created on the store) |

### Deliberately deferred

- **Scene background** (`purelane-scene-background`) — the fixed water/gradient layer. Not needed to build the five sections and it is the single largest performance item; Phase 9 territory.
- **`purelane-motion.js`** (shared rAF + scroll service) — no consumer yet. The hero is its first, in Phase 2.
- **`config/settings_schema.json`** — untouched. No theme-level Purelane setting has a consumer yet; adding one now would be speculative.
- **Breakpoint ladder** — the shared breakpoints in use are 760px (rhythm, blur, card sizes) and the fluid `clamp()` type scale, which needs none. Component-specific breakpoints (e.g. the shop grid's 860px) stay at their **reference values**, because consolidating them would change output between 860–899px, and identical output is the constraint. Documented rather than normalised.
- **Webfont delivery** — see the open decision below.

### Open decision — webfont delivery

The design specifies Outfit (500–800) and Inter (400–700); the prototype loads them from Google Fonts (reference line 11). `--pl-font-display` / `--pl-font-body` are defined with close system fallbacks, but **no webfont is loaded yet**, so sections built in Phase 2+ will render in fallback type until this is settled. Options: self-host both families as theme assets (performance-correct, needs the font files), or replicate the prototype's Google Fonts link in `layout/theme.liquid` (matches the reference exactly, adds a third-party request to fix in Phase 9). **Needs a decision before Phase 2 visual comparison is meaningful.**

**Dependencies:** Phase 0.
**Testing done:** `shopify theme check` — 0 errors. **Not yet done:** no section renders these snippets, so nothing has been visually verified in a browser. No pixel comparison has been made. That is Phases 2–6 and 7/10.
**Risks:** the card contract is now fixed; if a later section needs a shape it cannot express, the cost lands across four sections.

---

# Phase 2 — Hero

**Status: implemented — static validation passed; runtime validation pending a store push.**

**Files delivered:** `sections/purelane-hero.liquid`, `assets/purelane-hero.css`, `assets/purelane-hero.js`. Phase 1 snippets extended: `purelane-media.liquid` (configurable srcset ladder for hero-scale artwork), `purelane-icon.liquid` (shield, no-chem, drop).

**Architecture:** slides are `slide` blocks (limit 8) and promises are `badge` blocks (limit 4), so both are add/remove/reorder-able. Each slide holds up to three product pickers plus an optional **offer product** whose price becomes the headline figure; compare-at and saving are derived, never typed (DEV-018). Behaviour lives in `<purelane-hero-stage>`, a custom element whose `connectedCallback`/`disconnectedCallback` make it survive theme-editor re-renders.

### Validation status

**Confirmed by the user in the storefront (`http://127.0.0.1:9292`):** desktop hero renders; manual slide switching works; mobile page scrolling is correct; theme editor integration works.

**Defect found by the user and fixed:** autoplay did not run and the slide indicators were neither visible nor usable. Root cause was a single one: `<purelane-reveal>` and `<purelane-hero-stage>` had no `display` declaration, so both were `display: inline`. Full analysis in [DEVIATIONS.md → DEV-020](DEVIATIONS.md).

**Confirmed by the assistant:** `shopify theme check` — 0 errors, 15 warnings, unchanged from before the fix. Schema JSON valid. All four fixed files verified as served by the running dev server over HTTP. The Google Fonts link (DEV-014) confirmed present in the served HTML.

**Still NOT confirmed — requires the user's browser:** that autoplay now advances slides; that indicators are visible and clickable; keyboard interaction; reduced motion; widths 375–1440; theme editor lifecycle after the fix. The assistant cannot reproduce the user's view, because the hero's placement was made through the theme editor and lives in the **remote** theme's `index.json` — the local `templates/index.json` still holds only stock Dawn sections, so the dev server renders the homepage without the hero when fetched directly. Local templates were deliberately not edited, as that would risk overwriting the user's editor configuration.

**Dependencies:** Phase 1. Plus store data — see [DATA_MODEL.md §5a](DATA_MODEL.md): without seeded products the stage renders placeholder tiles and prices fall back to component sums.

**Known integration issue:** the reference header is `position: fixed` and floats over the hero, which is what the hero's `padding-top: 150px` accounts for. Dawn's header is in a section group and occupies real layout space, so a full-viewport hero currently extends below the fold by roughly the header height. Options are a `section_height` change (already a setting), an overlay header, or a negative offset — deferred to Phase 7, when the header treatment is decided against real screenshots.

---

# Phase 3 — Shop / Product Grid

**Status: IMPLEMENTED — NOT YET BROWSER-VERIFIED.**

**Files delivered:** `sections/purelane-product-grid.liquid`, `assets/purelane-product-grid.css`. No new JavaScript — the reference `#shop` is a static grid with a CSS hover lift, so none is warranted.

**Architecture:** the section is deliberately thin. Products come from a collection picker, or from hand-picked `product` blocks which take precedence. Each product is rendered by `snippets/purelane-product-card.liquid` in its `grid` variant, so all six edge cases — sold out, missing image, long title, missing compare-at, missing rating, multi-variant — are inherited rather than reimplemented. The CSS is 40 lines: the shelf grid and the row-height rule that keeps cards aligned.

**DEV-001 is satisfied here.** The desktop artwork sizing correction lives in `purelane-base.css` §11 and needed no grid-specific work.

**Validation done:** `shopify theme check` — **0 errors, 11 warnings, exactly the stock Dawn baseline.** Every Purelane `OrphanedSnippet` warning cleared, because this section consumes the last of the Phase 1 snippets. Schema JSON parsed and asserted valid. `purelane-product-grid.css` confirmed served by the running dev server.

**NOT verified — needs a browser and seeded products:** rendering, the 2-up ↔ 4-up switch at 860px, card height parity with the long-title product, sold-out and no-image cards, real add-to-cart against Dawn's cart drawer, keyboard traversal, theme editor add/remove/reorder.

**Dependencies:** Phase 1 card. Plus store data — the section renders an editor-only empty state and nothing on the storefront until a collection is chosen.

---

# Phase 4 — Best-selling Combos

**Status: IMPLEMENTED — NOT YET BROWSER-VERIFIED.**

**Files delivered:** `sections/purelane-combos.liquid`, `snippets/purelane-combo-card.liquid`, `assets/purelane-combos.css`. **No JavaScript** — the reference rail is native `overflow-x: auto` with CSS `scroll-snap`, so a script would be invention rather than reproduction.

**Data source:** `combo` metaobject entries per [DATA_MODEL.md §3.2](DATA_MODEL.md), with `combo` section blocks as a fallback so the section works before the metaobject definition exists on the store. Metaobjects win when the list is populated. Both paths normalise into one snippet, which owns all the arithmetic.

**Everything computed:** product count from the component list; compare-at as the sum of each component's `compare_at_price` (falling back to its price); saving as that total minus the bundle price, suppressed entirely when not positive; the includes sentence generated from component titles unless overridden. **DEV-005 is structurally impossible here** — count and artwork read the same list.

**Validation done:** `shopify theme check` — **0 errors, 11 warnings, exactly the stock Dawn baseline.** All three section schemas re-parsed and valid. `purelane-combos.css` confirmed served by the running dev server.

**NOT verified — needs a browser and seeded data:** rendering, rail scroll and snap, gutter bleed at 375px and 1440px, the +N overflow tile, keyboard traversal, theme editor add/remove/reorder.

**Dependencies:** Phase 1 card (stack variant). Plus store data — see the combo and bundle-product requirements in [DATA_MODEL.md](DATA_MODEL.md).

---

# Phase 5 — Bundles

**Status: IMPLEMENTED — NOT YET BROWSER-VERIFIED.**

**Files delivered:** `sections/purelane-bundles.liquid`, `assets/purelane-bundles.css`. **No JavaScript** and **no new snippet** — the reference is a static grid with a CSS hover lift, and the tier composition is section-local by design.

**Data model:** tiers are section blocks, per [DATA_MODEL.md §3.3](DATA_MODEL.md). No bundle metaobject. Each tier binds to a real bundle product, so Shopify owns the price, compare-at, availability and URL.

**Computed, never typed:** the per-unit figure is the bundle price divided by the tier quantity, rendered through `money`. It appears only when both a price and a quantity exist. Compare-at comes from the bundle product itself and the strikethrough is omitted when absent. No saving chip — the reference tier price row does not have one.

**Promoted tier is a block setting**, not the middle child, and its meaning is carried by the tag text rather than the accent border alone; a fallback line states it when a highlighted tier has no tag.

**Validation done:** `shopify theme check` — **0 errors, 11 warnings, exactly the stock Dawn baseline**, clean on the first run. All four section schemas re-parsed and valid. `purelane-bundles.css` confirmed served by the dev server.

**NOT verified — needs a browser and seeded products:** rendering, the 1-col ↔ 3-col switch at 760px, the artwork strip at 1 / 3 / 5 products, the dense-strip step-down, per-unit output against real prices, sold-out tier, keyboard traversal, theme editor add/remove/reorder.

**Dependencies:** Phase 1 media, price, badge, icon and panel-head snippets. Plus store data — bundle products at ₹349 / ₹499 / ₹799, two of which the hero also needs.

---

# Phase 6 — Reviews Rail

**Files:** `sections/purelane-reviews.liquid`, `assets/purelane-section-reviews.css`, `assets/purelane-marquee.js`; `review` metaobject definition.
**Dependencies:** Phase 1 (rating, badge, glass shell).
**Testing:** 1 / 3 / 5 / 20 reviews; computed repeat count fills more than 2× viewport at 375px and 2560px; pause on hover **and** keyboard; reduced motion stops the marquee; clones `aria-hidden`; edge mask matches the reference.
**Risks:** repeat-count maths — a wrong count shows a visible seam; metaobject setup burden for the reviewer.

---

# Phase 7 — Responsive QA

**Files:** CSS across all sections; `docs/DEVIATIONS.md`.
**Work:** paired captures at 375, 414, 600, 768, 860, 900, 1024, 1180, 1440, 1920 plus each of the prototype's 17 original breakpoints; diff against the locally rendered reference; log every intentional difference.
**Testing:** no horizontal scroll at any width; 320px sanity check; long-title and no-image products at every width.
**Risks:** Phase 1's breakpoint normalisation surfacing here; `svh` behaviour on iOS.

---

# Phase 8 — Accessibility QA

**Files:** section templates, `assets/purelane-base.css`, mobile navigation work.
**Work:** axe / Lighthouse pass; full keyboard traversal; VoiceOver / NVDA spot checks; contrast measured against the *composited* glass backgrounds; reduced-motion audit; forced-colours check; 44px hit areas.
**Dependencies:** Phases 2–6.
**Risks:** contrast fixes altering the palette — each must be justified and logged; mobile navigation is net-new scope the prototype never had.

---

# Phase 9 — Performance QA

**Files:** asset loading, image tags, `assets/purelane-scene.js/.css`, font hosting.
**Work:** Lighthouse mobile and desktop; measure LCP / CLS / INP; rasterise or capability-gate the animated water filters; self-host and preload fonts; audit `backdrop-filter` cost; confirm no per-frame layout reads remain; pause animations off-screen and on hidden tabs.
**Dependencies:** Phases 2–6.
**Risks:** the scene background is both the signature visual and the main performance cost; any rasterisation must be pixel-verified.

---

# Phase 10 — Final visual comparison

**Files:** `screenshots/`, `docs/DEVIATIONS.md`.
**Work:** paired reference/implementation captures per section per breakpoint; overlay diffs; resolve or document every discrepancy; run the full theme-editor matrix — add, remove, reorder, duplicate and reconfigure each of the five sections, confirming animations still work.
**Risks:** late-surfacing pixel drift; editor breakage found last.

---

# Phase 11 — Documentation and submission

**Files:** `README.md`, `AI_WORKFLOW.md`, `docs/DEVIATIONS.md`, `docs/ANALYSIS.md`, `docs/IMPLEMENTATION_PLAN.md`, store setup notes, commit history.
**Work:** setup instructions; metafield and metaobject definitions; section-by-section settings reference; the deviations changelog with justifications; the AI workflow write-up; screenshots; preview link.
**Risks:** commit history is graded — it must be kept clean from the start rather than rewritten at the end.
