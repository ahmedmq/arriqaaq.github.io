# Project Guidelines

This same contract is in `AGENTS.md` for Codex and other agents. Keep the two files in sync.

## Design system: read DESIGN.md first

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

## Design changes: mobile is a first-class target

About 90% of readers are on phones. Any design or UI change must be verified to render
correctly on mobile, not just desktop. This applies every session and to every plan executed
in this repo.

- Test or reason about layouts at mobile viewport widths (≈375px) before considering a UI change complete.
- Use responsive units, fluid typography, and breakpoint-aware styles by default. Avoid fixed widths/heights that break on small screens.
- Animations, hover states, and pointer-only interactions must have sensible mobile equivalents (tap, scroll, or graceful no-op).
- When proposing a design change, explicitly state how it will behave on mobile.
