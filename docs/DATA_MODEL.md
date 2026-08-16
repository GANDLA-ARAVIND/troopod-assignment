# Data Model

Proposed Shopify data model for the five required Purelane sections.

**Status: PROPOSAL. Nothing in this document has been created on the store.** No products, metafield definitions or metaobject definitions exist yet. This is the specification to be applied before Phases 3–6.

The assignment requires:

> Products, prices, and content come from the platform, not your Liquid. Where a native field doesn't exist, solve it properly.

So every value the prototype types as a literal has to resolve to one of three places, in this order of preference:

1. **Native product / collection data** — where Shopify already owns the value.
2. **Product metafields** — where the value belongs to one product.
3. **Metaobjects** — where the value is a structured, repeated record that is not a product.

Anything that is presentation copy rather than data stays in **section settings**, so a merchant edits it in the theme editor.

---

## 1. Native Shopify data — no configuration needed

These cover the bulk of the five sections and require nothing beyond seeded products.

| Prototype literal | Native source | Used by |
|---|---|---|
| "Tap cleaner & limescale remover" | `product.title` | grid, combos, bundles, hero |
| "₹200" | `product.price` + `money` filters | grid, combos, bundles, hero |
| "₹299" | `product.compare_at_price` | all price rows |
| "33% off" | **computed** — `(compare_at − price) / compare_at` | `purelane-price` |
| "Save ₹398" | **computed** — `compare_at − price`, or Σ(components) − bundle price | combos, bundles |
| Product artwork | `product.featured_image` | all card variants |
| Alt text | `image.alt`, falling back to `product.title` | `purelane-media` |
| Card link | `product.url` | grid, category |
| Sold out state | `product.available` | grid, combos, bundles |
| Variant for add-to-cart | `product.selected_or_first_available_variant` | grid |
| Needs a variant picker | `product.variants_count > 1` | grid |
| "3 products" | **computed** — size of the component product list | combos |
| "Flat ₹166 per product" | **computed** — price ÷ quantity | bundles |
| Which products appear in the grid | `collection.products` | grid |

**None of these require a metafield.** The single most important consequence: the prototype's typed savings, discount percentages and product counts become derived values that cannot drift from the truth.

---

## 2. Product metafields

Values that belong to one product and have no native home.

### 2.1 `reviews.rating`

| | |
|---|---|
| **Name** | `reviews.rating` |
| **Purpose** | Star rating shown on the product card ("★ 4.8") |
| **Shopify type** | `rating` (min 1, max 5) |
| **Owner** | Product |
| **Used in** | `snippets/purelane-rating.liquid` → shop grid |
| **Required** | No — the rating line is omitted entirely when absent, never rendered as "0" |
| **Example** | `4.8` |

**Why this exact namespace:** it is Shopify's *standard* review metafield, and Dawn's own `snippets/card-product.liquid` already reads `card_product.metafields.reviews.rating` (lines 173–206). Using the same key means any review app that writes the standard definition populates the Purelane card with no code change, and it keeps our card interchangeable with Dawn's.

### 2.2 `reviews.rating_count`

| | |
|---|---|
| **Name** | `reviews.rating_count` |
| **Purpose** | Number beside the rating ("· 237 reviews") |
| **Shopify type** | `number_integer` |
| **Owner** | Product |
| **Used in** | `snippets/purelane-rating.liquid` |
| **Required** | No — the count is omitted when absent; the rating still renders |
| **Example** | `237` |

### 2.3 `custom.badge`

| | |
|---|---|
| **Name** | `custom.badge` |
| **Purpose** | The corner pill on a product card — "Best seller", "Top rated", "New" |
| **Shopify type** | `single_line_text_field` |
| **Owner** | Product |
| **Used in** | `snippets/purelane-product-card.liquid` (grid variant) |
| **Required** | No — no badge renders when absent |
| **Example** | `Best seller` |

**Note:** the sold-out badge takes precedence over this one; a product cannot be simultaneously "Best seller" and out of stock in the same badge slot. A section-level override (`badge_text`) also takes precedence, so a merchant can force a badge per block without editing the product.

*Considered and rejected:* deriving the badge from tags. Tags are unordered, merchant-visible in filtering, and would mean "best-seller" is both a badge and a facet. A metafield keeps display copy out of the taxonomy. A `list.single_line_text_field` was also rejected — the design has room for exactly one pill.

### 2.4 `custom.benefit`

| | |
|---|---|
| **Name** | `custom.benefit` |
| **Purpose** | The micro-caption under each product in a combo tray — "Cuts grease instantly", "Melts hard water stains" |
| **Shopify type** | `single_line_text_field` |
| **Owner** | Product |
| **Used in** | `snippets/purelane-product-card.liquid` (stack variant) → combos |
| **Required** | No — the caption is omitted when absent and the tile still renders |
| **Example** | `Cuts grease instantly` |

**Why a product metafield rather than combo data:** the prototype repeats "Cuts grease instantly" under the kitchen cleaner in three different combos. The caption is a property of the product, not of the combo, so it is stored once and read everywhere. This is the same reasoning as the shared product card.

---

## 3. Metaobjects

Structured, repeated records that are not products.

### 3.1 `review`

Reviews have **no native Shopify object**. This is the clearest "where a native field doesn't exist, solve it properly" case in the assignment.

| Field | Type | Required | Purpose | Example |
|---|---|---|---|---|
| `rating` | `rating` (1–5) | Yes | Star count on the card | `5` |
| `title` | `single_line_text_field` | Yes | Card headline | `Sparkling taps again` |
| `body` | `multi_line_text_field` | Yes | Review text | `Hard water had ruined our bathroom fittings…` |
| `author` | `single_line_text_field` | No | Reviewer name; falls back to a section-level default | `Rohit S.` |
| `product` | `product_reference` | No | Drives the "· Floor cleaner" attribution **live**, so renaming a product updates the review | → Floor cleaner |
| `verified` | `boolean` | No | Shows the check icon in `.who` | `true` |
| `date` | `date` | No | Ordering and future display | `2026-03-14` |

**Definition:** `review`, with `list.metaobject_reference` exposed as a section setting so a merchant picks and orders the reviews shown.

**Why a metaobject rather than section blocks:** reviews are reused across sections (the rail, and later a product page), have more than three fields, and a merchant should curate them once rather than retyping them per section. Section blocks remain available as a documented fallback for a merchant who wants a one-off review in one place.

*Considered and rejected:* a reviews app. It would install a third-party section framework into a build being judged on our own work, and the store is a development store with no real review history.

### 3.2 `combo`

| Field | Type | Required | Purpose | Example |
|---|---|---|---|---|
| `title` | `single_line_text_field` | Yes | Card heading | `Kitchen essentials` |
| `bundle_product` | `product_reference` | Yes | The buyable product — supplies price, compare-at, availability and URL | → Kitchen Essentials Box |
| `components` | `list.product_reference` | Yes | Products shown in the tray; **drives the count and the includes-sentence** | → Kitchen Cleaner, Dishwash Gel, Tap Cleaner |
| `includes_text` | `multi_line_text_field` | No | Optional override of the generated includes-sentence | `Everything for a sparkling kitchen…` |
| `flag` | `single_line_text_field` | No | Corner flag | `Most popular` |
| `fine_print` | `single_line_text_field` | No | Line under the price | `Inclusive of all taxes · COD available` |
| `promote` | `boolean` | No | Applies the accent border treatment | `true` |

**Why `bundle_product` + `components` rather than one or the other:** the bundle product makes the combo genuinely buyable and lets Shopify own its price; the component list makes the tray artwork, the product count and the saving all derive from real products. The saving is then **computed** as Σ(component prices) − bundle price, which is why DEV-005 ("5 products" showing 3 tiles) cannot recur — the count and the artwork read the same list.

### 3.3 Bundle tiers — **no metaobject**

Tiers ("pick any 2 / 3 / 5") map to **section blocks** referencing a real bundle product or variant, plus a `list.product_reference` for the artwork strip.

**Why not a metaobject:** unlike combos and reviews, tiers are not reused anywhere else, there are always about three of them, and their copy (tag label, feature bullets, CTA) is exactly the presentation text a merchant edits in the theme editor. A metaobject would add setup burden with no reuse benefit.

---

## 4. Section settings — presentation, not data

Not stored on the store; edited in the theme editor. Specified per section in Phases 2–6. Indicative:

- Kickers, headings, ledes, CTA labels and links for all five sections
- Collection picker and product limit (grid)
- Aggregate rating, review count and secondary stat (reviews rail)
- Marquee speed, pause-on-hover, card width (reviews rail)
- Autoplay and interval (hero)
- Which tier is promoted (bundles) — a setting, never the middle child by position
- Overflow threshold for combo trays (DEV-005)
- Microcopy defaults currently living in snippets: "% off", "Save", "reviews", "No image available" (see DEV-012)

---

## 5. Seed data required (Phase 0 leftover)

At least eight products, per the brief, including the three required edge cases.

| # | Product | Sold out | Image | Title length | Metafields to set |
|---|---|---|---|---|---|
| 1 | Foaming Kitchen Cleaner | No | Yes | Normal | rating, rating_count, badge, benefit |
| 2 | Tap Cleaner & Limescale Remover | No | Yes | Normal | rating, rating_count, badge, benefit |
| 3 | Dishwash Gel | No | Yes | Normal | rating, rating_count, benefit |
| 4 | Floor Cleaner | No | Yes | Normal | rating, rating_count, benefit |
| 5 | Laundry Detergent | No | Yes | Normal | rating, rating_count, benefit |
| 6 | Copper, Bronze & Brass Cleaner | **Yes** | Yes | Normal | rating, rating_count |
| 7 | Magic Eraser | No | **No** | Normal | benefit |
| 8 | Washing Machine Cleaner & Descaler Tablets… | No | Yes | **Very long** | rating, rating_count, badge |

Products 6, 7 and 8 are the three required test cases. Every card variant must be checked against all three.

**Images:** the prototype embeds 14 bottle illustrations as base64 SVG in `:root` (reference lines 252–265). These are extracted to files and uploaded as the product images, so the artwork matches the reference while being served from the Shopify CDN with real `srcset`.

---

## 6. What this model deliberately avoids

- **No metafield for anything computable.** Savings, discount percentages, per-unit prices and product counts are derived in Liquid. A merchant cannot make them contradict the prices.
- **No metaobject for one-off presentation copy.** That is what section settings are for.
- **No custom namespace where a Shopify standard exists.** `reviews.rating` over `custom.rating`, so review apps and Dawn's own card interoperate.
- **No app dependency.**
