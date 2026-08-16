# AI Workflow

## AI Tools
- **Claude Code** (Opus 5), used as an AI development assistant inside VS Code.

## Development Approach

The work is being run in explicit, approved phases (see [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)). Each phase is scoped before it starts, and the AI assistant is held to that scope — analysis before architecture, architecture before code.

The pattern used so far:

1. **Scaffold first, no implementation.** The project structure was created empty and deliberately, with placeholders rather than invented content.
2. **Analysis before decisions.** The complete assignment brief and all 1,716 lines of `reference/purelane-homepage.html` were read before any architecture was proposed.
3. **Findings surfaced, decisions escalated.** Where the prototype was ambiguous or self-contradicting, the assistant reported the finding and asked rather than assuming.
4. **Deviations logged as they are decided**, not reconstructed afterwards — the assignment grades the explanation of what changed as well as the change.

*Phases 1–11 to be documented as they happen.*

## AI-Assisted Tasks

### Phase 0 — Shopify / Dawn setup *(current)*

**Analysis (completed before this phase)**
- Read the assignment brief and extracted the requirements without summarising or inventing; recorded what the brief does *not* specify rather than filling gaps.
- Read the complete reference prototype — all 1,716 lines / 151,229 bytes — including both stylesheets, all inline SVG, and the full script block.
- Produced [docs/ANALYSIS.md](docs/ANALYSIS.md): page architecture, design system, section-by-section mapping of the five required sections to a proposed Shopify architecture, edge cases, performance and accessibility risks, and a phased plan.
- Identified prototype defects the visual comparison alone would not reveal, including a desktop product-card sizing bug, duplicate SVG IDs, a dangling anchor, and a combo whose stated product count contradicts its own artwork.

**Phase 0 — project preparation**
- Inspected the existing project, `docs/ASSIGNMENT.md`, `docs/ANALYSIS.md`, and `reference/purelane-homepage.html`.
- Verified the local toolchain: Node v24.13.0, npm 11.6.2, Git 2.53.0.
- Created `.gitignore` for a Shopify theme project, with the decision to track `config/settings_data.json` documented inline (it is part of the deliverable here, unlike on a live client store).
- Created [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) with the approved decisions and all twelve phases, including the Shopify CLI workflow written out command-by-command for approval before execution.
- Created [docs/DEVIATIONS.md](docs/DEVIATIONS.md) seeded with the five findings from analysis (DEV-001 to DEV-005), each with prototype behaviour, production issue, planned correction, reason, and whether visual output changes.

**Phase 0 — Shopify CLI setup**
- Shopify CLI was not present. Installed the current stable release: `npm install -g @shopify/cli@latest` → **@shopify/cli 4.6.1** (26 packages, one upstream deprecation warning for a transitive dependency, `boolean@3.2.0`). No other dependencies were installed.
- Noted that the CLI targets Node 20/22 LTS while this machine runs Node 24; no engine warning or malfunction was observed in any command run so far.

**Phase 0 — Authentication**
- Ran `shopify auth login`. The CLI issued device code `GQLD-NXZK` and opened a browser for the user to complete sign-in. No credentials were requested by or exposed to the assistant.
- Result: `✔ Logged in. ✔ Current account: aravindgandla40@gmail.com.` The session is stored locally by the CLI and is not tracked in the repository.

**Phase 0 — Store verification (read-only)**
- Ran `shopify theme list --store purelane-troopod-assignment-3xlpbw5t.myshopify.com` and the same command with `--json`. Both are read-only.
- The store is reachable and the authenticated account has access.

**Phase 0 — Dawn retrieval: blocked, escalated, then resolved**
- The first theme listing returned exactly one theme: **Horizon**, id `165270782208`, role `live`. **No Dawn theme existed on the store.**
- Cause: new Shopify stores now provision with Horizon, Shopify's current default theme. The assignment brief describes Dawn as "the one new stores start on", which is no longer accurate.
- The assistant stopped rather than substituting Horizon, pulling the live theme, or adding Dawn itself. Horizon has a different architecture (theme blocks, a different section model) and the brief requires stock **Dawn** specifically; adding a theme is also a remote state change. Escalated to the user with the exact admin steps.
- The user added Dawn from the free theme library. A second read-only listing confirmed **Dawn, id `165271175424`, role `unpublished`**, alongside the still-live Horizon.
- Pulled with `shopify theme pull --store … --theme 165271175424 --path .` — read-only against the store. The CLI warned "It doesn't seem like you're running this command in a theme directory", which is expected: the project root held only documentation and the reference file at that point. Download completed successfully.

**Phase 0 — Dawn baseline verification**
- Structure confirmed: `assets/` (190), `config/` (2), `layout/` (2), `locales/` (51), `sections/` (48), `snippets/` (39), `templates/` (13) — **345 files**.
- Version confirmed as **Dawn 16.0.0** from `config/settings_schema.json` → `theme_info.theme_version`.
- Confirmed stock: `config/settings_data.json` carries the auto-generated header and `"current": "Dawn"`; `templates/index.json` holds Dawn's default homepage (image-banner, featured-collection, heading, buttons).
- Confirmed the Dawn snippets the planned architecture depends on are present: `card-product`, `price`, `unit-price`, `buy-buttons`, `cart-drawer`, `cart-notification`, `header-drawer`, `product-form` behaviour.
- Confirmed **no Purelane implementation exists** — no file in `assets/`, `sections/` or `snippets/` matches "purelane".
- Confirmed `reference/purelane-homepage.html` still 151,229 bytes, and all four `docs/` files intact — the pull did not disturb them.
- `shopify theme check`: **155 files inspected, 0 errors, 11 warnings**, all pre-existing in stock Dawn (6 × UndefinedObject, 2 × VariableName, 2 × UnusedAssign, 1 × OrphanedSnippet) across 8 Dawn files. Recorded as the baseline so later Phase 1+ runs can be compared against it.

**Not done in Phase 0** — no theme push, publish, rename or delete; Horizon untouched and still live; no products, metafields or metaobjects; no Purelane sections, snippets, schemas, CSS or JS; no Git operations of any kind (the user handles Git manually); `reference/purelane-homepage.html` untouched; `shopify theme dev` not yet run.

### Phase 1 — Minimum Purelane foundation *(current)*

**Dawn inspection first, then build**
- Read Dawn 16.0.0's `snippets/card-product.liquid` (628 lines), `snippets/price.liquid`, `snippets/loading-spinner.liquid`, `assets/product-form.js`, and `layout/theme.liquid`'s asset-loading pattern before writing anything.
- Conclusion recorded: Dawn's card markup is built around `card__inner` / `.ratio` / `--ratio-percent` and Dawn's `card_style`, card colour scheme and badge-position theme settings. The Purelane card is a glass shell with a fixed-height media slot and a bottom-pinned price row; the two trees do not overlap enough for an override to beat a purpose-built snippet. Dawn's *mechanisms* are reused instead — `<product-form>` + `{% form 'product' %}` for real AJAX add-to-cart, `loading-spinner`, the `reviews.rating` metafield convention, and Dawn's locale strings.
- Confirmed Dawn loads section CSS/JS per section rather than globally, so Purelane sections load `purelane-base.css` themselves and `layout/theme.liquid` is left untouched.

**Built**
- `assets/purelane-base.css` — one resolved token set plus the primitives the five sections share, including the four-variant product card.
- `assets/purelane-reveal.js` — `<purelane-reveal>`, the lifecycle-safe pattern later sections copy.
- Seven snippets: product card, media, price, rating, badge, panel head, icon.
- `docs/DATA_MODEL.md` — the proposed metafield/metaobject model, with the reasoning for each choice and for what was rejected.

**Deviations decided and logged this phase** — DEV-006 (long-title clamp), DEV-007 (sold-out state), DEV-008 (missing-image tile), DEV-009 (`pl-` namespacing), DEV-010 (single resolved token set), DEV-011 (reveal gated behind JS readiness), DEV-012 (microcopy as snippet defaults), DEV-013 (`<img>` instead of CSS background). DEV-001 moved from Planned to Implemented.

**Not done in Phase 1** — no sections (hero, grid, combos, bundles, reviews); no products, metafields or metaobjects created remotely; no scene background; no `purelane-motion.js`; no `config/settings_schema.json` changes; no webfont loaded; no Git operations; `reference/purelane-homepage.html` untouched; nothing rendered in a browser, so no visual verification has taken place.

### Phase 1.5 — Temporary webfont loading

- Added the reference's Google Fonts loading to `layout/theme.liquid` — the first Dawn file this project modifies. Verified byte-identical to reference line 11 by diffing the extracted URLs.
- Three `RemoteAsset` warnings were suppressed with a scoped `theme-check-disable`/`enable` pair, justified inline. The first attempt put the directive inside a `{%- comment -%}` block, which Theme Check does not parse — caught by re-running the check.
- Logged as DEV-014, explicitly temporary, with the Phase 9 replacement written into the file.

### Phase 2 — Hero

**Read before building**
- Re-read the hero's CSS (reference lines 206–248, 283–332), the light-palette overrides (690–706), the markup (945–997 plus the single-line stage on 994) and the behaviour (1613–1682) before writing any code.

**Built**
- `sections/purelane-hero.liquid` — 18 settings across 5 groups, `slide` blocks (limit 8) and `badge` blocks (limit 4), with a preset that lays out the reference's three slides and three promises.
- `assets/purelane-hero.css` — nine numbered sections, every value traced to a reference line in a comment.
- `assets/purelane-hero.js` — `<purelane-hero-stage>`: carousel, dot controls with roving tabindex and arrow keys, IntersectionObserver-gated autoplay, scroll and pointer parallax, WAAPI shadow breathe, live reduced-motion handling, full teardown on disconnect.
- Extended two Phase 1 snippets: `purelane-media` gained a configurable srcset ladder (the card's 120–480w is too small for hero artwork) and now skips widths larger than the source image; `purelane-icon` gained shield, no-chem and drop for the promise badges.

**Decisions worth recording**
- **Slides as blocks, not a fixed three.** The prototype hardcodes three; a merchant can now run one or eight.
- **Offer product over a manual price field.** Slide 2's "₹349" is a real bundle price, so it belongs to a real product that Shopify prices. A manual number would have been faster and would have reintroduced exactly the hardcoding the brief forbids. Falls back to summing the shown products when no offer product is set, so the section degrades honestly rather than showing nothing.
- **Heading split into two settings** rather than an `html` setting — a marketer should not have to write `<span>` to colour the last word.
- The hero paints scene 1's gradient itself because the shared scene layer is deliberately not built yet (DEV-015).

**Mistake caught in this phase**
- Scratch scaffolding was left inside the slide loop while working out the price derivation — a stray `for` over a non-existent setting, an empty `capture`, and a `for … break` no-op. Spotted on read-back before running Theme Check and removed. It would not have errored, which is precisely why it needed catching by review rather than by tooling.

**Deviations logged** — DEV-014 (temporary Google Fonts), DEV-015 (hero-local background), DEV-016 (44px dot hit area), DEV-017 (heading split), DEV-018 (derived prices), DEV-019 (carousel accessibility).

**Not done in Phase 2** — the other four sections; bonus sections; the scene background; products, metafields or metaobjects; performance optimisation; the full accessibility audit; pixel QA. No Git operations. `reference/purelane-homepage.html` untouched.

### Phase 2 (fix) — Hero carousel defect

The user tested the real storefront and reported two failures: autoplay never advanced slides, and the slide indicators were neither visible nor usable. Everything else worked.

**Debugging, not guessing**
- Grepped both stylesheets for any rule targeting `purelane-hero-stage`, `purelane-reveal` or the `.pl-hero__stage-wrap` class the section applies. **None existed.**
- Traced the positioning chain in the section markup: `.pl-hero__prod { position: absolute; bottom: 28px }` resolves against the nearest positioned ancestor, which is `.pl-hero__grid` — a class applied to `<purelane-reveal>`.

**Single root cause.** Custom elements have no default display, so both custom elements were `display: inline`. An inline box ignores `width`/`max-width`/vertical margins, and a relatively positioned one whose children are all blocks is a degenerate containing block. That produced both symptoms at once: the absolutely positioned product stage resolved against a collapsed box and its dots were clipped by `.pl-hero { overflow: hidden }`, and the IntersectionObserver gating autoplay could not satisfy `threshold: 0.2` against an unmeasurable target, so `play()` returned at its guard forever. Manual dot clicks kept working because they bypass the visibility gate — which is exactly the asymmetry the user observed.

**A second, independent bug found while fixing the first.** The dots' 44×44px `::before` hit areas were centred on 6px dots at a 13px pitch, overlapping roughly three neighbours each. Since later siblings paint over earlier ones, clicking dot 1 activated dot 3. Not reported by the user — they could not see the dots to click them — but it would have surfaced immediately after the first fix.

**Fixes applied** — all four verified as served by the running dev server over HTTP, not merely written to disk:
1. `purelane-reveal { display: block }` in the **foundation** stylesheet, so the four remaining sections cannot repeat the mistake.
2. `purelane-hero-stage { display: block; position: relative }`.
3. Dot hit areas changed from a centred 44×44 box to full row height and exactly half the gap each side — targets now touch but never overlap. The painted dot is byte-for-byte unchanged.
4. Autoplay no longer waits on an observer callback: `this.visible` initialises `true`, `play()` is called directly, and the observer's threshold dropped to `0` with its role narrowed to pausing when the hero leaves the viewport.
5. Added `shopify:block:select` / `shopify:block:deselect` so editing a slide in the theme editor shows and holds that slide.

No accessibility or lifecycle safety was traded away to make autoplay work — `inert` slides, pause on hover and focus, roving tabindex, arrow keys and teardown on disconnect are all unchanged, and editor safety improved.

**Lesson recorded.** The bug was invisible to Theme Check, to schema validation and to reading the Liquid — the markup and the JavaScript were both correct in isolation. It only existed in the interaction between an undeclared CSS default and an observer threshold. Static validation cannot substitute for rendering the page; the user's storefront test found in minutes what four clean tool runs had missed.

**What the assistant still could not verify.** The hero's placement was made through the theme editor, so it lives in the remote theme's `index.json`; the local `templates/index.json` still contains only stock Dawn sections. Fetching `http://127.0.0.1:9292/` therefore returns a homepage without the hero. Local templates were deliberately left alone rather than edited to force a render, because `theme dev` would push that over the user's editor configuration. Runtime confirmation of the fix is the user's to make.

### Phase 3 — Shop / Product Grid

**The point of this phase was how little it needed.** Phase 1's card investment paid out: the section is roughly 200 lines of Liquid, most of it schema, plus 40 lines of CSS. Every edge case the assignment tests — sold out, no image, very long title, missing compare-at, missing rating, multi-variant — is inherited from `purelane-product-card.liquid` and was not written again. That is what "several sections render similar cards, build accordingly" was asking for, and it is the first place the claim can be checked.

**Built**
- `sections/purelane-product-grid.liquid` — 13 settings across four groups, plus optional `product` blocks (limit 24) that take precedence over the collection so a merchant can curate a specific row without editing the collection itself.
- `assets/purelane-product-grid.css` — the shelf grid only. Columns are driven by CSS custom properties set inline from section settings, so two instances of the section on one page can use different column counts without their styles colliding.

**Decisions worth recording**
- **No JavaScript.** The reference `#shop` is a static grid whose only motion is a CSS hover lift and the shared scroll reveal. Adding a rail or any script would have been invention.
- **The 860px breakpoint was kept, not normalised.** The reference switches to four columns at 860px. Folding that into the shared 900px step would change the layout between 860 and 899px, and identical output is the constraint. Component-specific breakpoints stay at their reference values; the comment in the CSS says so.
- **List semantics with the card filling the cell.** `.pl-shelf > li { display: flex }` and `.pl-shelf .pl-card { flex: 1 1 auto }` make every card in a row share the tallest card's height, so their price rows and buttons line up — which is what actually keeps the long-title product from breaking the row rhythm at 375px.
- **Dawn's `product-form.js` is loaded here**, being the first section that can render a buyable card, so add-to-cart goes through Dawn's own cart drawer and notification path rather than a parallel implementation.

**Result worth noting:** Theme Check returned **11 warnings, 0 errors — exactly the stock Dawn baseline.** Every Purelane `OrphanedSnippet` warning cleared, because this section consumes the last of the Phase 1 snippets that nothing had used yet.

**No deviation was introduced.** Nothing in this section departs from the reference beyond corrections already logged in Phases 1–2, so `docs/DEVIATIONS.md` was not touched.

**Not done in Phase 3** — combos, bundles, reviews, bonus sections, performance optimisation, the accessibility audit, pixel QA. No browser has rendered this section and no products are seeded, so every runtime claim is reported as unverified rather than assumed. No Git operations. `reference/purelane-homepage.html` unchanged at 151,229 bytes; the hero's three files untouched.

## AI Mistakes / Corrections

*Nothing to report yet — no implementation has been written.*

Corrections made to the assistant's own work during analysis:
- None required. Findings were verified directly against the source file (line numbers, byte counts, computed CSS behaviour) rather than asserted from memory.

Human decisions that overrode or directed the assistant:
- **Desktop product-card artwork bug** — the assistant surfaced the zero-height `.pimg` issue as an open question rather than choosing. The user ruled that the bug must **not** be reproduced and the intended design must be preserved. Recorded as DEV-001.
- **Git** — the user instructed twice that Git and GitHub commands are not to be executed, and handles all Git operations manually. The assistant began a `git init` in Phase 0 after the task list requested it; the user rejected the call and restated the rule. No Git command has run. `.gitignore` was still authored so the repository is ready.

Assumptions that turned out to be wrong:
- The plan assumed the development store would arrive with a clean Dawn install, because the assignment brief states Dawn is what new stores start on. It is not — the store provisioned with Horizon. Caught by verifying the theme list before pulling, rather than assuming the pull target existed.

Mistakes made and corrected during Phase 1:
- **Locale keys.** Purelane microcopy was first added as a `purelane` block in `locales/en.default.json`, which is standard Shopify practice. Theme Check's `MatchingTranslations` rule requires every key to exist in all 51 of Dawn's locale files, so four keys produced **120 errors**. Caught by running Theme Check rather than assuming the edit was safe. Reverted the locale file to stock and moved the strings to snippet parameters with section-setting overrides — which is also better for the assignment, since a merchant can now edit them. Logged as DEV-012.
- **Filter in a `render` argument.** `{% render 'purelane-badge', text: 'products.product.sold_out' | t %}` is not permitted; Liquid filters cannot be applied to `render` arguments. One Theme Check error, fixed by assigning the translated string first.
- Both were caught by validation, not by review. Theme Check is now run after every change rather than at the end of a phase.

## Validation and Testing

Planned, per [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md):
- **Visual:** paired reference/implementation screenshots per section per breakpoint (Phases 7 and 10), stored in `screenshots/`.
- **Responsive:** 375 → 1920px, plus each of the prototype's 17 original breakpoints.
- **Accessibility:** axe / Lighthouse, full keyboard traversal, screen-reader spot checks, contrast measured against composited backgrounds, reduced-motion audit (Phase 8).
- **Performance:** Lighthouse and Core Web Vitals — LCP, CLS, INP (Phase 9).
- **Theme editor:** add, remove, reorder, duplicate and reconfigure every section, confirming animations survive (Phase 10).
- **Code:** `shopify theme check` from Phase 1 onward.
- **Edge-case data:** the four required test products — normal, sold out, no image, very long title — exercised in every section that renders a card.

*No validation has been run yet; there is nothing to validate.*

## Automation Opportunities

*To be documented after implementation.*
