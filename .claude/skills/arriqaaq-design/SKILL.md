---
name: arriqaaq-design
description: |
  Use for ANY visual, UI, layout, styling, copy-on-page, diagram, cover,
  course-page or landing-page work on the Arriqaaq site: new components or
  pages, CSS changes, redrawing an image as SVG, adding a course, changing
  headings, or reviewing how something looks. Enforces DESIGN.md (palette,
  type, diagram language, copy rules, never-touch list) and the mobile-first
  verification loop. Load it before writing any UI code.
---

# Arriqaaq design: working rules

`DESIGN.md` is the contract and `src/lib/styles/tokens.css` holds the values.
The living kit at `/design/` (`src/routes/design/+page.svelte`) shows every
token and component rendered for real. Read DESIGN.md before your first
edit; this skill is the checklist you work from.

## Before you build

1. Reuse what exists: `.btn`, `.chip`, `.tag`, `.tabs`, `.segmented`, `.card`, `.section-head` with `h2.split`, `.eyebrow`, `PixelCover`, `PostRow`, `Archive`, `CourseCard`, `reading/*`, `home/*`. If you need something new, add it to the system (tokens + DESIGN.md + the `/design/` kit) in the same change.
2. Never hard-code a hex value, font stack, radius or duration in a component. Use tokens.

## Non-negotiables (each one comes from an owner correction)

- **Palette:** pink `#ff00a0`, purple `#9800ff`, blue `#0066ff`, amber `#ffbe00`, green `#00c25a` plus neutrals, at full strength. No tints, pastels, opacity washes, gradients behind content, or new hues. No orange. The only exception is the diagram ramp and lavender, inside diagrams and course chrome.
- **White first.** Neutral grounds; colour is an accent. No big empty colour blocks, and no black blocks at the bottom of reading pages.
- **Copy:** headings are at most 5–6 words, about what Arriqaaq actually offers. No muted second sentence. No emojis. Never ask for money or sponsorship. The site description is used verbatim: "An online creative space for authentic Islamic courses, articles, crafts, education and technology."
- **Type:** Inter for everything. Headings weight 500 (article h2/h3: 600). IBM Plex Sans Arabic for UI Arabic, Noto Naskh in text, Amiri Quran for verses. JetBrains Mono for code and diagram labels only.
- **Layout:** page-level text aligns to the header logo's left edge (`.wrap`). Reading content sits in the centred 680px column.
- **Never touch these images or their content:** the team member pages (aiasha-sadaf-ismailmalik, asiya-khan, huda-syed, zahravenkat, zara-ilyas, saniya-khaleel, zahra-shahid), `/magazine/`, `/lettersfromthesoul/`, and the `/ilm/` post. When redrawing other images, never change what the original says (labels, spellings).

## Diagrams

Build them only with `scripts/diagram-kit.ts` (`block`, `row`, `chip`, `connector`, `group`, `responsive`), in a module under `scripts/diagrams/`, embedded as `[[SVG:key]]`. One cohesive structure, square blocks 8px apart, lavender for context, the purple ramp toward the focus, pink sparingly (`accent: true`). Draw on the 360-wide canvas. Anything taller than about 900px uses `responsive()` (two columns on desktop). Preview both widths and look at the PNGs:
`npm run preview:diagrams -- <batch> /tmp/dgm [key]` writes `<key>-390.png` and `<key>-1280.png`.

## Courses

Add `content/courses/<slug>.yaml` (schema in DESIGN.md → Courses). Each course has one fixed colour (its subject); its lesson cards use `PixelCover mix`.

## Verify before you say "done"

1. `npx svelte-check --tsconfig ./tsconfig.json`: 0 errors.
2. `npm run build && npm run check:links`: build passes, and there are no broken links, images, anchors or directives.
3. **Look at it** at 375–390px and at 1280px. Screenshot it with Playwright driving the system Chrome (`playwright-core` with `channel: 'chrome'`). Check for horizontal overflow, centring, gaps and overlaps, and that text reads at phone size. 90% of readers are on phones.
4. Check reduced motion and no-JS: content must be complete.
5. State in your summary how the change behaves on mobile.

## Ship

Work on a branch, not `main`: a push to `main` deploys the live site. Commit with a clear message, and never push without the owner's go-ahead.
