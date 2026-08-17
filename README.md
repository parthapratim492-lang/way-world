# WAY — The Journal (blog) + gold-touch refinements

## The Journal — a real blog section

Both official write-ups and explorer stories live in one section, as you asked. The
official/story distinction is decided **server-side**, not by a checkbox anyone can tick:

- **`ADMIN_EMAIL`** (new, optional env var) — set it to your own account's email in
  `.env.local`. When you're signed in with that email and publish a post, it's
  automatically tagged **"WAY Editorial"**. Everyone else's posts are tagged **"Explorer
  Story"**. This is a plain string comparison, not a real roles/permissions system — don't
  extend it to gate anything more sensitive than this one label without building actual
  admin infrastructure first.
- **`/blog`** — grid of all posts, newest first, with the badge visible on every card.
- **`/blog/[slug]`** — full article. This page is a plain Server Component that reads
  straight from MongoDB — no client-side fetch, no loading spinner, because a read-only
  article doesn't need any interactivity.
- **`/blog/new`** — write form: title, optional excerpt (auto-generated from your content
  if you skip it), content, optional cover photo (reuses the same upload component from
  discoveries), tags. Available to any signed-in explorer.

**What's NOT built, on purpose:** editing or deleting a post once published, comments,
likes, and markdown formatting (content is plain text — paragraphs are split on blank
lines, but no bold/italic/links yet). All real, separate pieces of work, not corners cut
carelessly.

## Gold-touch: richer premium refinements

This builds on the ink-navy/brass palette from the earlier "classy futuristic" pass — not
a new theme, a more confident version of the same one:

- **Foil-effect gradient text** on page titles and the blog article title (white → brass
  → white), extended from where `world-title` already did this on the home page, so it's
  now consistent everywhere instead of only the homepage getting the premium treatment.
- **A subtle shimmer sweep on the primary button** — a soft light pass on hover, not a
  constant animation. Reads as a deliberate, crafted detail rather than motion for its
  own sake.
- **A thin gold divider** under every section header (`panel-header`) — small editorial
  touch, ties the blog's magazine feel back into the rest of the app.
- **Slightly richer panel depth** — a faint inner gold edge plus a deeper drop shadow on
  glass panels, so cards read as more physically "crafted" than flat.

## One bug I caught and fixed before shipping this

I initially added a CSS rule making active category filter chips glow using
`currentColor` for the shadow — but the active state's *text* color is dark ink (for
contrast against the filled background), so that shadow would have rendered as an
invisible dark glow instead of the intended category-color glow. Caught it by actually
reasoning through the cascade rather than assuming the effect would look right, and
removed the rule rather than ship something broken.

## Setup

New optional variable:
```
ADMIN_EMAIL=your-account-email@example.com
```
Everything else is unchanged.

## What to check

1. Sign in with whatever email you plan to use as `ADMIN_EMAIL`, write a post — should be
   tagged "WAY Editorial".
2. Sign in with a different account, write another post — should be tagged "Explorer
   Story".
3. `/blog` should show both, with the gold gradient badge only on the official one.
4. Open a post — full article page, cover image if you added one, paragraphs rendering
   correctly with blank-line breaks preserved.
