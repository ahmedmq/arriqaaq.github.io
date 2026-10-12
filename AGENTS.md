# Project Guidelines

This same contract is in `CLAUDE.md` for Claude Code. Keep the two files in sync.

## Design system: read DESIGN.md first

**Any visual, UI, copy-on-page, diagram, cover or course-page work must first
read `.claude/skills/arriqaaq-design/SKILL.md` (the design skill) and follow it.**
The living UI kit is at `/design/`. Before calling UI work done, run
`npx svelte-check`, then `npm run build && npm run check:links`, and look at
the result at 375px and 1280px.

Every UI, CSS, component, page or imagery change must follow [`DESIGN.md`](DESIGN.md).
Its values live in [`src/lib/styles/tokens.css`](src/lib/styles/tokens.css); shared
component classes in `src/lib/styles/base.css`; article body in `src/lib/styles/prose.css`.

- Use the tokens. Never hard-code a hex value, font stack, radius or duration in a component.
- The palette is exactly pink `#ff00a0`, purple `#9800ff`, blue `#0066ff`, amber `#ffbe00`,
  green `#00c25a` plus neutrals. No tints, pastels, opacity washes or new hues, anywhere,
  including diagrams and decorations. No orange.
- Reading type is Inter 17px / 28px, headings weight 500. Arabic uses Noto Naskh Arabic.
- Reuse the shared components (`.btn`, `.chip`, `.tabs`, `.card`, `.section-head`, `Cover`,
  `PostRow`, `reading/*`) before writing new ones. If something is missing, add it to the
  system (tokens and DESIGN.md) in the same change.
- Diagrams are SVG via `[[SVG:name]]` in `scripts/diagrams-svg.ts`, never screenshots, and
  must be authored portrait-first so they read at 375px.
- Courses are defined in `content/courses/*.yaml` (schema in DESIGN.md → Courses).
- Copy: headings max 5–6 words, about what Arriqaaq actually offers; no emojis; never ask for money.
- Writing or editing any teaching post (Usul al-Fiqh, Mustalah Hadith, courses): read [`VOICE.md`](VOICE.md) first. It is the voice and teaching-method contract, derived from the whole Usul series.
- Teaching posts (Mustalah Hadith, Usul al-Fiqh, courses): **nothing without a citation.** Every quotation, report, number and attribution gets a citation where it appears (work, volume/page or hadith number) plus a link when it is online (sunnah.com, shamela.ws, turath.io, archive.org), and the post ends with a `## Sources` list. Never add anything the owner's documents do not say. When a citation is missing or unclear, find the original book online, download it into `references/books/` (git-ignored), read the page and cite that edition; if it cannot be confirmed, say so to the owner instead of guessing. The method (which sites to trust, how to read the original) is `.claude/skills/source-check/SKILL.md`; before any teaching post is shown, committed or released, `npm run check:citations` must pass, and `npm run check:release` (links + citations) runs before any push.
- Any part of the Mustalah Hadith Made Easy series: also follow `.claude/skills/mustalah-post/SKILL.md` (sources verbatim, a `:::pause` box after every section, scholar cards, widgets, diagrams, Instagram card, and the checks). Every part uses the same style without being asked.
- Never touch the team member pages' drawings, `/magazine/`, `/lettersfromthesoul/` or the `/ilm/` post's images. Never change what an original image says.
- No broken links, images or anchors: `npm run check:links` must pass. `health.arriqaaq.com` and `ilm.arriqaaq.com` are offline; never link to them.
- A push to `main` deploys the live site. Work on a branch, and push only with the owner's go-ahead.

## Design changes: mobile is a first-class target

About 90% of readers are on phones. Any design or UI change must be verified to render
correctly on mobile, not just desktop. This applies every session and to every plan executed
in this repo.

- Test or reason about layouts at mobile viewport widths (≈375px) before considering a UI change complete.
- Use responsive units, fluid typography, and breakpoint-aware styles by default. Avoid fixed widths/heights that break on small screens.
- Animations, hover states, and pointer-only interactions must have sensible mobile equivalents (tap, scroll, or graceful no-op).
- When proposing a design change, explicitly state how it will behave on mobile.
