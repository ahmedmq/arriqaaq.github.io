---
name: mustalah-post
description: |
  Use when writing, editing or reviewing any part of the "Mustalah Hadith
  Made Easy" series (content/posts/mustalah-hadith-made-easy-part-*.md) or
  the mustalah-hadith course. It is the house style every part follows:
  sources, voice, structure, and the interactive pieces (Pause and check
  boxes, scholar cards, come-back review, widgets, diagrams), so the owner
  never has to ask for them again.
---

# Mustalah Hadith Made Easy: how every part is built

Part 1 (`content/posts/mustalah-hadith-made-easy-part-1-brief-history.md`)
is the reference. Read it before writing a new part, and also read
`VOICE.md` and the `arriqaaq-design` skill. Work on a branch; push only
with the owner's go-ahead.

## 1. Sources (owner rules, non-negotiable)

- Primary: `references/Mustalah Hadeeth notes.pdf` (one "CLASS n" per part).
  Support only: `references/mustalah-hadeeth_final-1.pdf`. Any document the
  owner supplies for a part must be included.
- **Render every PDF page as an image** (`pdftoppm`, `pdfimages`) and read
  the images. Extracted text misses titles, Arabic scans and hand-drawn
  diagrams (Part 1's book title and chain were only in images).
- Keep sourced text **verbatim**. Only fix tone in your own connecting
  lines. Never add your own references, dates, books or facts.
- Where sources disagree, ask the owner; do not decide, and put no
  editorial or "sources differ" notes in the post. When the notes' Arabic
  page conflicts with an English document, the owner has said to follow the
  Arabic page.
- The course book is *Min Atyab al-Minah fi Ilm al-Mustalah* by Shaykh
  Abdul Muhsin Al-Abbad and Shaykh Abdul Kareem al-Murad.

## 2. Voice and frontmatter

- Title: `Mustalah Hadith Made Easy (Part N) - <Topic>`; slug
  `mustalah-hadith-made-easy-part-N-<topic>`; excerpt `Understanding <topic>`;
  tag `hadith`; add the lesson to `content/courses/mustalah-hadith.yaml`.
- VOICE.md method: hook question, plain restatements ("In simpler terms",
  "Simply put") after dense sourced passages, reassurance Notes ("Don't
  worry about these terms..."), "Point(s) of benefit" kept as the notes have
  them. Headings 5 to 6 words max. No emojis.
- Quotes are labelled by evidence (rehype-reading): a scholar's words are a
  plain quote, never "HADITH".

## 3. The interactive pieces every part gets

| Piece | When | How |
| --- | --- | --- |
| **Pause and check** | End of every main `##` section (before its `---`) | `:::pause` box, 2 to 4 questions. Answers are the post's own words, never new facts. At most one "Think about it" item (no answer) per box. Do not repeat the end quiz's questions |
| **Scholar cards** | Automatic in every post tagged `hadith` | First mention per section is tappable. Add each new scholar to `src/lib/data/scholars.ts` (name, death year, line, works, all from the lessons). Make `match` exclude book titles and namesakes, then check the matches across all posts (§5) |
| **Come-back review** | Automatic | "Not yet" marks in Pause boxes return at the top of the next lessons and on the course page (`ReviewCard`). Nothing to author; just keep using `:::pause` |
| **Widgets** | Where a concept is a process, an order or a family | `[[WIDGET:mh-…]]`. Data in `src/lib/widgets/data/`, with an `f` no-JS fallback in `scripts/widgets.ts`. Existing patterns to reuse: tap-to-break chain (`isnad-chain`), stepper (`mh-fitnah`), tabs and chips (`mh-works`), scrolled vertical timeline (`mh-timeline`), "put in order" then true-scale ruler (`mh-order`), quiz (`mh-quiz-N`, about 8 questions, last section before the Conclusion) |
| **Diagrams** | One overview near the top ("The story in N steps"), more where structure helps | Free-form SVG via `scripts/diagram-free.ts`, `[[SVG:mh-…]]`, portrait-first |
| **Instagram card** | Every part | Add a card in `scripts/generate-instagram.mts` with a small diagram; `npm run instagram` |

Before adding a new widget type, ask what the reader must take away at that
point and whether an existing pattern already does it. Research first; do
not build a second version of something the post already has.

## 4. Visual rules (owner corrections)

- Course colour is **purple** (`subject--hadith`). Use pink, purple, blue
  and green. **Never amber**: it reads as orange.
- Text on any colour fill is **white** (`var(--on-colour)` or `--h-on`).
- Diagrams are free-form (paths, arrows, hubs), not only stacked blocks.
- Every interactive piece must be obviously correct. Click through each
  one in a browser before saying it works.

## 5. Checks before showing the owner

1. `npm run parse`. Then check the scholar matches (no book titles, no
   namesakes such as Ibn Qudamah al-Maqdisi) by listing `data-sch` spans
   in `src/lib/generated/posts.json` and the counts in
   `src/lib/generated/scholars.json`.
2. `npx svelte-check --tsconfig ./tsconfig.json`, then
   `npm run build && npm run check:links`. A build can stop the dev server;
   restart it. A new widget file needs a dev-server restart to load.
3. In the browser at 390px and 1280px, with Playwright and system Chrome:
   open every Pause answer and mark it, tap scholar names (bottom sheet on
   phones), play every widget to its end, check there is no horizontal
   overflow, and check without JavaScript.
4. Adversarial review for accuracy against the sources, references and
   tone, after each part. Reviewer agents must not edit files.
5. Show the owner before committing new kinds of interactivity. Commit
   with the attribution line; never push without the go-ahead.
