# WAY — Design pass: "classy futuristic"

A real redesign, not a tweak — new palette, new type system, new signature element. The
old look (purple/cyan neon-on-black) is genuinely one of the most common AI-generated
"futuristic" defaults right now; this replaces it with something more considered.

## The direction: instrument / cartography

Think an antique brass compass or astrolabe, reimagined as software — not a sci-fi
dashboard. That's where "futuristic but classy" comes from: precision instruments have
always looked forward-looking without needing neon.

**Palette** — ink navy background (`#0A0E14`), aged brass as the one real accent
(`#C6A15B`), with emerald and sapphire used sparingly for secondary meaning, ivory text
instead of stark white. Category pins moved from flat Tailwind-style hues to a curated
jewel-tone set (roasted amber for cafés, sapphire for viewpoints, plum for hidden spots).

**Type** — Fraunces (a characterful serif, not another geometric tech sans) for headings,
Inter for body text, JetBrains Mono for anything numeric or data-like (XP, distances,
coordinates, badge counts) — a small detail that reinforces the instrument-panel feel
without saying so.

**Signature element** — a faint brass compass rose rotates slowly behind the hero title.
One bold move, kept quiet, rather than decoration scattered everywhere.

**Instrument framing** — the hero map card now has thin brass corner brackets, like a
viewfinder or a ship's optical instrument. The Leaflet popup (previously plain white,
which clashed badly against everything else) is now themed to match.

## A preview file, since I can't render the real app for you

`way-design-preview.html` (shared separately) is a standalone static file — open it
directly in a browser, no server needed — showing the new hero section with real colors,
real fonts, real spacing. It's not the live app, just enough to sanity-check the direction
before you run the real thing.

## What actually changed in code

- `app/layout.tsx` — new font trio (Fraunces / Inter / JetBrains Mono)
- `app/globals.css` — full palette rewrite, corner-bracket framing, compass keyframe
  animation, Leaflet popup theme override, refined button styling
- `lib/categories.ts` — jewel-tone category colors
- `components/CompassRose.tsx` — new, the signature element
- `components/MapView.tsx` — popup link/tag colors updated to match

Every feature built in the last eight phases works exactly the same — this touched
presentation only, not logic.

## One thing worth knowing

I caught and fixed a real CSS syntax error during this pass (a broken rule from an earlier
edit) using the same build-verification step I've used throughout — that's exactly why I
never skip it, even for "just CSS" changes.

## What to check

1. Open `way-design-preview.html` first — fastest way to see the direction.
2. Run the real app (`npm run dev`) and compare — the compass rose, corner brackets, and
   popup theme only exist in the real app since the map itself is real Leaflet.
3. Tell me what's off — too subtle, too much, wrong warmth, whatever. This is exactly the
   kind of thing that's much faster to fix from specific feedback than to keep guessing at.
