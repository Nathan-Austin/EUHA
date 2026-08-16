# heatawards.eu mock homepage — status

> Last touched: 2026-05-27

## What this is

Pure HTML mock of a redesigned heatawards.eu, pitched as a **consumer-directory** reframe of the current awards-body site. Built to back the 2027 pitch to Neil. We don't own the source repo; this is a mockup he'd see, not code to deploy.

## Files

- `index.html` — homepage
- `category-mild.html` — single category page (Mild Chili Sauce, demo)
- `maker-spicepunk.html` — single maker page (Spicepunk, demo)
- `assets/` — flatlays + bottle shots copied from the EHSA 2026 Press Kit on Drive, plus the EHSA banner PNG

Open `index.html` in a browser to walk the flow (Mild card on homepage links to category page; "View Spicepunk" links on category page link to maker page).

## Design language locked

- EHSA banner mustard `#F5C518` as the single accent
- Pure black (`var(--ink)`) for dark backgrounds and headlines
- Archivo Black for all display type, banner-style
- No brown anywhere (the wood-toned palette was rejected mid-session)
- Bronze medal treatment = yellow + black, not copper
- "BEST IN CATEGORY" stamp: rotated yellow square with thick black border, top-left of hero images

## What's built into the homepage

- Top bar with EHSA brand
- Hero: top-3 European podium on black, with directory search strip directly under it
- Country pills: 23 countries sized by real EHSA 2026 maker counts (Germany 12 to Latvia 1)
- Best-in-category grid: 16 Golds grouped as Heat ladder (5), Styles & flavours (5), Pantry & condiments (5), Wildcard (1)
- Real product imagery on 13 of 16 category cards; 3 typographic placeholders (Pandemonic ×2, chilisaus.be) since they have no images in the press kit
- Press strip, CTA tiles, sponsors, footer

## Open questions / known gaps

- Hero stats claim "247 makers, 28 countries" but country pills sum to 71 / 23 (real EHSA entrant count). Resolve: pick one frame.
- Only one category page built (Mild). Same template will work for the other 15.
- Only one maker page built (Spicepunk). Same template applies to other makers, but other makers will have different asset availability.
- All press kit / "Visit website" / "Where to buy" CTAs are `#` placeholders.
- Pandemonic + chilisaus.be still missing imagery in the EHSA press kit on Drive. Worth chasing the makers for shots before any real publication.

## Resume here

Most natural next moves, in priority order:

1. Reconcile the 247 / 71 mismatch in the homepage hero stats.
2. Build a second category page from a different group (e.g. Hot or BBQ) to prove the template generalises.
3. Build a second maker page (e.g. MUNNVOLD or Burnin Benzes) to prove the maker template generalises.
4. Build the All-Makers index page (the destination of "Browse all makers →" CTAs).
5. Build a country page (e.g. /country/germany).

If the design lands with Neil, the next conversation is: do we propose it to him as a static reference, or do we offer to build it for real in Next.js / similar?
