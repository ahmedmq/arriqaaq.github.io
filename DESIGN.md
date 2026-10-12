# Arriqaaq design system

This is the design contract for arriqaaq.com. Read it before any UI, CSS,
component or imagery change. The values live in
[`src/lib/styles/tokens.css`](src/lib/styles/tokens.css). The shared component
classes live in [`base.css`](src/lib/styles/base.css), and article-body styles
in [`prose.css`](src/lib/styles/prose.css). If a rule here and the code
disagree, fix the code. If you need something the system lacks, add it to the
tokens and to this file in the same change.

**90% of readers are on phones.** Design at 375px first. Desktop is an
enhancement.

- **Living UI kit:** `/design/` (`src/routes/design/+page.svelte`) renders the
  real tokens and components. Look at it before building anything, and add
  every new shared component to it.
- **Agent skill:** `.claude/skills/arriqaaq-design/SKILL.md` carries these rules
  as a working checklist and loads for any UI, diagram or layout task.

## References and what we took from each

| Source | What we borrow |
| --- | --- |
| SurrealDB (surrealdb.com, Mantine + `@surrealdb/ui`) | Exact brand pink `#ff00a0` and purple `#9800ff`, obsidian ink `#0d0c13`, `#f6f6f8` surface, clean sections, the `cubic-bezier(.22,1,.36,1)` rise easing, collapsible footer columns |
| surrealdb.com/stop-choosing | Landing structure: pixel-reveal display title, then a pinned manifesto whose words light up on scroll and resolve to a giant one-word answer, then cards that flood with colour as they're reached |
| OpenAI article template (openai.com/index/…) | Reading type: 17px / 28px, weight 400, −0.01em; headings weight 500; centred article header; sticky header showing the current section; pill tabs, segmented toggles, filter chips; quotes that tilt into place |
| arriqaaq.com/blog (LSM post) | Numbered contents box, the reading-progress "road" under the header (ours grows flowers), the floating prev/next section pill |
| arriqaaqlabs roadmap | Course roadmap: numbered rail, cards alternating sides on desktop and stacked against a left rail on phones, "at the end of this course" outcome card |
| 38labs.com | Neatness: black pill primary button plus hairline ghost button, cards with large radius and hairline rows, small mono uppercase labels, "STEP 01" numbering, the eyebrow, heading, lede pattern for section headers |

## Copy

The owner's rules, from direct corrections:

- **Headings are at most 5–6 words.** No second muted sentence that explains the first.
- **Write about what Arriqaaq actually offers:** the Usul al-Fiqh course, Tafsir, its own books, podcasts, events and competitions for children, health, homeschooling and technology. Generic lines ("Every topic, one tap away", "Lessons, launches and reflections") are rejected.
- **The site's own description is canonical,** used verbatim in the hero, the footer and the meta description: *"An online creative space for authentic Islamic courses, articles, crafts, education and technology."*
- The hero label is **"The deen, from first principles"**, from the original "What we focus on" copy.
- No emojis anywhere in UI copy. Never ask readers for money, sponsorship or contributions.

## Colour

**The palette is five colours plus neutrals. Nothing else.**

| Token | Hex | Use |
| --- | --- | --- |
| `--pink` | `#ff00a0` | Brand accent (SurrealDB pink). Aqeedah, Tafsir |
| `--purple` | `#9800ff` | Brand accent (SurrealDB purple). Usul al-Hadith |
| `--blue` | `#0066ff` | Usul al-Fiqh |
| `--amber` | `#ffbe00` | Tajweed. Flower centres, text selection |
| `--green` | `#00c25a` | Arabic grammar (replaces the source palette's orange) |
| `--ink` | `#0d0c13` | Text, primary buttons, dark UI |
| `--ink-2`, `--ink-3` | `#45434f`, `#6b6a78` | Secondary text, meta |
| `--page`, `--surface`, `--surface-2` | `#fff`, `#f6f6f8`, `#eeeef2` | Grounds |
| `--line`, `--line-strong` | `#e8e7ee`, `#cfcdd9` | Hairlines, inactive marks |

Each colour has a text-safe `-ink` partner (≥4.5:1 on white): `--pink-ink`,
`--amber-ink` and `--green-ink`. Purple and blue already pass, so their `-ink`
equals the base colour. Use `-ink` for coloured text and thin strokes. Use the
base colour for fills and large shapes.

Rules:

- **No tints, pastels, washes or opacity fades of palette colours.** A colour
  appears at full strength, or not at all. Coloured backgrounds are full
  fills (a subject card when it is reached), never pale versions. Neutral
  grounds (`--surface`) carry everything else.
- **Never introduce a new hue**, including in illustrations, diagrams, chart
  series, decorations or one-off components.
- There is no orange. The source palette's orange was replaced by green.
- Text on a `--subject` fill uses `--subject-on` (ink on amber, green and pink;
  white on purple and blue). **Exception, by owner rule: in diagrams, widgets
  and the Mustalah Hadith course, text inside any colour is white** (black on
  colour looks bad). Amber is avoided in new diagrams and widgets because the owner reads it as
  orange; use pink, purple, blue and green.
- Light theme only.
- **The one exception is the diagram language:** SurrealDB's purple ramp (`--ramp-0…3`) and lavender (`--lavender`) are used inside diagrams and course chrome, exactly as specified under Diagram language. Nowhere else.

### Subjects

Each discipline owns one colour. Put `.subject--{id}` on a component root, and
children read `--subject`, `--subject-ink` and `--subject-on`. The ids are
`tajweed`, `nahw`, `aqeedah`, `hadith`, `fiqh`, `tafsir` and `general`. The
mapping from tags to subjects lives in `subjectForTag()` in
`src/lib/content.ts`. The list of subjects is in `src/lib/subjects.ts`.

## Type

- **Inter** for everything, including labels and numbers (use
  `font-variant-numeric: tabular-nums` for counts). It's the licensed
  stand-in for OpenAI Sans, which is proprietary. **JetBrains Mono** is for
  code only.
- Arabic uses two faces. **IBM Plex Sans Arabic** (`--font-arabic-display`,
  weight 500) is for Arabic in UI and headings: subject cards, course titles,
  covers. **Noto Naskh Arabic** (`--font-arabic`) is for Arabic inside article
  text, where the traditional script suits Qur'an and hadith. The prose font
  stack falls through to Naskh automatically, and `[lang=ar]` or `.ar` gets a
  1.12× size bump.
- Reading: `--fs-body` 17px, `--lh-body` 1.647 (28px), `--ls-body` −0.01em, in
  a measure of `--measure` (680px).
- Headings are weight 500 (never bold), tracked tight (−0.02em to −0.05em),
  with `text-wrap: balance`. Use the fluid sizes `--fs-display`, `--fs-h1`,
  `--fs-h2`, `--fs-h3` and `--fs-lead`, which already scale from phone to
  desktop.
- Eyebrow (`.eyebrow`): 12px Inter, weight 600, uppercase, 0.12em tracking,
  in `--subject-ink` (purple by default). Add `.eyebrow--quiet` for grey
  breadcrumbs.
- **Section headings are split headings** (`h2.split`, arriqaaqlabs style):
  an ink lead phrase, at most one `<em>` highlight in solid subject colour,
  then a `<span class="mute">` continuation in `--ink-3`. Size
  `--fs-section`, weight 500, −0.04em. Put the eyebrow above it, and don't
  add a separate lede paragraph, because the muted half *is* the lede. Add
  `.barred` for a coloured left bar (roadmap stages).

## Layout and spacing

- Container: `.wrap` (max 1200), `.wrap--wide` (1040, figures and roadmaps),
  `.wrap--measure` (680, reading). The side gutter is `--gutter`, which is
  20px on a phone.
- Spacing uses the 4px scale `--s-1` to `--s-9`. Landing bands are separated
  by `--section`.
- Radius: chips `--r-sm` (10), cards `--r` (14), panels and sheets `--r-lg`
  (24), buttons and tabs `--r-pill`.
- Elevation is mostly hairlines (`inset 0 0 0 1px var(--line)`). `--shadow-1`
  is for hover, and `--shadow-2` for floating UI only.

## Components (use these, don't re-invent)

| Class / component | What |
| --- | --- |
| `.btn`, `.btn--ghost`, `.btn--subject`, `.btn--block` | Pill buttons. One primary per view, with ghost for secondary. Min height 44px. Inside courses and lessons, the primary is `.btn--subject`. Avoid black blocks at the bottom of reading pages. |
| `.chip`, `.chip--subject`, `aria-pressed` | Filter chips (OpenAI). Active = ink fill. |
| `.tag` | Mono uppercase pill label (38labs). |
| `.tabs` / `.tab[aria-selected]` | Pill tabs. Active = `--scrim` fill. |
| `.segmented` / `button[aria-pressed]` | Two to three way toggle. |
| `.card`, `.card-body`, `.card-row`, `.card--fill` | 38labs card anatomy. |
| `.section-head` (+ `--center`) | Eyebrow above an `h2.split`. |
| `h2.split`, `em`, `.mute`, `.barred` | Split heading with a colour highlight and a muted continuation. |
| `.scroll-x` | Horizontal chip or tab row on phones, with an edge fade. |
| `use:reveal` + `[data-reveal]` | Rise-in on scroll. Visible without JS. |
| `PixelCover.svelte` | The dotted pixel-field cover (arriqaaqlabs). `mix` for palette-mixed dots. |
| `Flower.svelte` | The brand flower (five petals, amber centre). |
| `PostRow.svelte`, `Archive.svelte` | Article lists (pixel thumbnail, topic, date, title). |
| `home/*` | `Hero`, `HeroTree`, `Manifesto`, `SubjectCards`, `ChapterCarousel`, the landing page sections. |
| `reading/WidgetHydrator.svelte` | Mounts `[[WIDGET:name]]` interactives on the posts that use them. |
| `CourseCard.svelte` | Course summary. |
| `reading/*` | Article chrome: `ArticleHeader`, `Toc`, `FlowerVine`, `SectionPill` (the light "Up next" pill, shown only at the end of an article), `LessonNav`. |

## Interaction and motion

- Hover is never the only way in. Every hover effect has a tap or scroll
  equivalent. Subject cards flood when they cross the middle of the screen,
  which is the phone version of hover.
- Touch targets are at least 44px (`--tap`).
- Durations are `--dur-fast`, `--dur` and `--dur-slow`, with easing
  `--ease-out`. All of them collapse to 0 under `prefers-reduced-motion`.
  Scroll-driven pieces (manifesto, vine) render in their final state when
  motion is reduced or JS is off.
- `localStorage` is for course progress only (`src/lib/progress.ts`), and
  every access is guarded.

## Imagery

- **Diagrams are SVG, never screenshots**, and they follow the Diagram language
  below. Author them with `scripts/diagram-kit.ts` in `scripts/diagrams/*.ts`,
  and embed them with `[[SVG:name]]` on their own line.
- **Never touch these images:** the team member pages (`/aiasha-sadaf-ismailmalik/`,
  `/asiya-khan/`, `/huda-syed/`, `/zahravenkat/`, `/zara-ilyas/`, `/saniya-khaleel/`,
  `/zahra-shahid/`), `/magazine/`
  and `/lettersfromthesoul/`, which are hand-made artwork, and the `/ilm/` post,
  which keeps its original technical images.
- Feature images in cards and headers are replaced by generated covers. The
  original `feature_image` stays in frontmatter for social cards (OG), because
  social platforms can't render SVG.
- Real photographs and book covers stay as photos, framed with `--r` radius
  and a hairline.

## Diagram language

Modelled on SurrealDB's agent-memory deep dive ("The six parts of an agentic
system") and the hifz context-layer deck. The values are SurrealDB's own,
read from its computed styles. The kit (`scripts/diagram-kit.ts`) implements
all of this, so build diagrams only from its primitives.

**The idea: one cohesive structure, not a stack of cards.** Blocks sit 8px
apart and form slabs and layers, like a building section. If a diagram looks
like a list of separate cards joined by rails, re-lay it out.

| Element | Spec |
| --- | --- |
| Block | Square corners (radius 0). Padding 14px vertical, 16px horizontal. 8px gap to the next block. `block()` |
| Context block | Lavender `#ebe9f5`, ink text. For the parts around the focus. `tone: 'light'` |
| Focus layers | SurrealDB purple ramp with white text, darkest at the focus: `#5b1bdc` → `#6a2ce4` → `#7c48e8` → `#8b5cec`. `tone: 'p0'…'p3'` |
| Highlight | Pink, used sparingly. Prefer `accent: true` on a lavender block, which turns its label and meta pink. A solid pink block (`tone: 'pink'`, ink text) at most once per diagram |
| Extra categories | Blue, amber and green, only when a diagram genuinely needs more categories than purple and pink allow (for example five rulings on a scale) |
| Label | JetBrains Mono 10.5px, uppercase, 0.8px tracking, `#706d8f` (on purple, 80% white). Optional number: `3 THE CONTEXT LAYER` |
| Content | JetBrains Mono 13px, line height 18.5px. Short: a phrase, not a paragraph |
| Body | Inter 13px, only for an explanation that needs a full sentence. Keep it to two or three lines |
| Meta | JetBrains Mono 11.5px, for `item · item · item` lists under the content |
| Tags | Small rectangles inside a block (translucent white on purple, white on lavender), mono 11.5px |
| Chip | Obsidian `#242132`, white mono uppercase 10.5px, 30px tall. It labels a relationship on a connector (`CAPTURE`, `SPECIFIED BY`). `chip()` |
| Connector | 1px `#b6b3c9` line ending in a 5px diamond. Dashed for a weaker or optional link. `connector()` |
| Group label | Inter 14px uppercase in brand purple, naming the blocks below it (`AGENT MEMORY`). `group()` |
| Caption | Below the figure, Inter, `--ink-3`, left-aligned |

**Free-form diagrams.** Not every idea is a stack of blocks. When the idea is
a path, a hub, a comparison or a timeline, draw that instead, with
`scripts/diagram-free.ts` (modelled on the hifz slides): rounded nodes with a
1.5px ink outline and a full palette fill (or plain white), dashed ink arrows
with a small arrowhead, white pill labels sitting on the lines, small
uppercase mono captions, and plenty of white space. Default to pink and
purple; use blue and green confidently when a diagram has several
categories (not amber: the owner reads it as orange, so avoid it in new
diagrams and widgets), and keep a colour meaning the same thing everywhere in one post
(the Mustalah history path, hub, timeline and works widget all share one
colour per period). Text inside any colour is white. Mix shapes across a post;
never repeat the same layout back to back. The block kit below stays for
layered structures.

**Layouts** (pick one; don't invent ornament):

- **Layer stack.** Full-width slabs, darkening toward the subject, for "X is built on Y". It's the SurrealDB six-parts shape: context blocks on top, a chip on the connector, then purple layers.
- **Two-up slab.** A `row()` of 2 blocks sharing one height, for pairs and comparisons (Aam / Khaas, Majority / Hanafi). Prefer two-up over single file whenever the text fits.
- **Tree as slabs.** The root is a full-width p0 block; each branch is a full-width p1–p3 block; its leaves are two-up light blocks directly under it. No rails or dots.
- **Flow.** Blocks top to bottom, linked by connectors with chips. Use it for pipelines and cause and effect.

**Phone first:** canvas `W = 360`, rendered about 1:1 on a 375px phone.
Nothing smaller than 10.5px. On desktop a diagram is shown near its natural
size: capped at 440px (about 1.2×) and centred, never stretched to the column.
Use `wide: true` only for a genuinely wide diagram drawn on a wider canvas.

## Reading (article pages)

The article page is where readers spend their time; these rules come from
the OpenAI article template (type and measure) and Anthropic's research
posts (heading weight and spacing).

- **Body:** Inter 17px / 28px in a 680px column, near-black on white. Paragraphs are 1.35em apart.
- **Section headings (h2):** Inter 600, about 1.5–1.875rem, with roughly 64px of space before them. Above each one sits a small mono index (`01`, `02`…) on a 2px rule in the subject colour (`data-n`, added at build time). Headings rise in gently as they scroll into view, and are fully visible without JS or with reduced motion.
- **h3:** Inter 600. **h4:** small uppercase label.
- **No emojis** in headings, titles or line openings. `scripts/rehype-reading.ts` strips them at build time, so old posts are cleaned without editing them. Don't add new ones.
- **Qur'an quotes** (`blockquote.quote--quran`, detected automatically): white, with hairlines above and below, a small `QUR'AN` label, the Arabic verse on its own right-aligned line in **Amiri Quran** at 1.6em, the translation beneath in Inter, and the reference as a small mono `cite`. Write them as a blockquote with the Arabic on its own line, the translation, then `(Quran 2:185)`.
- **Hadith** (`quote--hadith`): the same structure with a thin purple rule and a `HADITH` label. The Arabic matn is set in Noto Naskh.
- **Classification is by evidence, not by mention.** A quote is Qur'an only if it carries a Qur'an reference (`(Quran 2:185)`, `Quran 2:230`, `(2:255)`) or verse marks, and hadith only if it carries a collection reference with a number (`(Sahih al-Bukhari 4362)`), a collection alone (`(Bukhari and Muslim)`), a grade label (`(Authentic Hadith: …)`), a leading `Narrated`, or a sunnah.com link. A scholar or Companion talking about the Qur'an or hadith, or quoting the Prophet (ﷺ) in passing, is a plain quote. Never label a quote just because it contains the words Hadith, Muslim, Sunan or ﷺ.
- **Scholar and other quotes (`quote--plain`):** ink text a little larger than body behind a 4px rule in the subject colour, and no label. A short saying (up to 300 characters, `quote--pull`) is set larger and heavier as a pull-quote so it stands out of the column. A short closing line that only names the speaker or source (`Abdullah bin al-Mubarak`, `(Majmoo al-Fatawa 20/306)`) becomes a quiet attribution line with a short rule before it.
- **Notes (`quote--note`):** a `> **Note**: …` aside written as a quote. Ink text and a 3px rule in the subject colour; no quote square, no label.
- **Inline Arabic** in English sentences is wrapped automatically (`span[lang=ar]`) so it gets the Naskh face and correct direction.
- **Chrome:** the header shows the current section; the flower vine shows progress; the end pill appears at the end of the article and stays at the bottom; each article ends with a "Suggest a fix / report an issue" line linking to GitHub. Never ask readers for money or sponsorship.

## Rich posts: SVG, animation, interactives

Anything below can go straight into a post's markdown:

| Need | How |
| --- | --- |
| Diagram | `[[SVG:name]]` on its own line; author it in `scripts/diagrams/*.ts` with the diagram kit |
| One-off inline SVG or HTML | Paste raw `<svg>` or `<figure>` markup; it passes through (`rehype-raw`). Colours come from the CSS tokens (`var(--purple)`), never new hues |
| Animated SVG | Inline SVG with CSS `@keyframes` inside a `<style>` scoped by a class. Wrap it in `@media (prefers-reduced-motion: no-preference)` |
| Interactive widget | `[[WIDGET:name]]`: register it in `scripts/widgets.ts` and implement `src/lib/widgets/<name>.ts` exporting `init(el)`. `WidgetHydrator` loads it only on posts that use it. Build controls from `.tabs`, `.segmented`, `.chip` and `.btn` |
| Image | `::image{src=… width=wide|full caption=…}`, for real photos only, never for diagrams |
| Questions after a section | `:::pause` with a list: each item is a question, the indented paragraph under it is the answer; an item with no answer is a "Think about it" prompt. Renders as native `<details>` (works without JS); `src/lib/pause.ts` adds "I knew it / Not yet", saved in the reader's browser. Answers come from the post's own words |
| Scholar cards | Automatic in posts tagged `hadith`: `scripts/rehype-scholars.ts` marks the first mention of each scholar per section; `ScholarCards.svelte` opens a card (bottom sheet on phones, popover on desktop) with the death year, the works, and the other posts that mention him. Data: `src/lib/data/scholars.ts` |
| Come-back review | Automatic: "Not yet" answers in Pause boxes are kept in the browser (`$lib/review`) and asked again by `ReviewCard` at the top of the course's other lessons and on the course page |

Every rich element must work at 375px, respect reduced motion, and render
something meaningful before JS runs (a caption or a static frame).

**Widget precedent (Mustalah Hadith, Part 1).** Keep a widget's data in one
module under `src/lib/widgets/data/` and give the registry entry an `f`
fallback that renders the same data as plain HTML at build time, so readers
without JavaScript get the full content and the widget replaces it when it
starts. Styles live in `src/lib/styles/widgets.css` (`.wd`, a `.wd-hue--*` class
per palette colour, `--h` fill and `--h-on` text). Controls follow the step,
play and scrub pattern: Back / Play / Next buttons plus a range slider, a
graph that moves with them, and a card that shows the current item. Other
patterns there: filter chips, tabs, a tap-to-break chain, a stepper, and a quiz
that turns answers green or pink and explains each one. Widgets use only
existing classes (`.chip`, `.tabs`, `.btn`, `.scroll-x`) for controls.

## Covers

- **Article lists and the carousel:** a pixel-field thumbnail (`PixelCover`, the arriqaaqlabs dotted pattern) on a grey ground, in a **per-post palette colour** (`accentForPost(slug)`), so neighbouring rows differ. The topic label takes the same colour.
- **Course card:** a pixel banner in the course colour.
- **Roadmap:** each course keeps **one fixed colour** for its header band and heading accents (Usul al-Fiqh is blue), while the dots on its lesson cards **mix the palette** (`<PixelCover mix>`).
- Post titles are never baked into images; the page sets them in Inter.

## Landing page (top to bottom)

1. **Hero:** the label, "Roots before branches." with the pixel-block reveal, the site description, two buttons, then the **roots-before-branches tree** (`HeroTree`). Roots draw down first, then the branches grow up and flowers bloom. It sits centred under the buttons, nearly full width on phones and about 620px on desktop, never behind text.
2. **Manifesto** (`Manifesto`): "Courses. Articles. Crafts. Technology. One creative space, rooted in" lights up word by word as it scrolls through the screen, then **Islam.** appears beneath it, cycling through ten languages (SurrealDB's "Stop choosing / Deja de elegir"). It is not pinned, so there is no empty screen around it. Taller scripts get a fixed-height line so nothing overlaps.
3. **Six sciences** (`SubjectCards`): cards flood with the subject colour, with white text, as they cross the middle of the screen.
4. **Course card** (`CourseCard`): white, a pixel banner, the steps list.
5. **New from Arriqaaq:** `PostRow` list with filter chips.
6. **Explore by topic:** every topic with its count, in a grid of rows.
7. **Something from every chapter** (`ChapterCarousel`): pill tabs for the six biggest topics, and a swipeable deck of each topic's latest posts.
8. **Newsletter.**

## Content integrity

- **No broken links, images, anchors or unconverted directives.** After any content or routing change, run `npm run build && npm run check:links`, which crawls every built page.
- The parser joins multi-line directives, maps old Ghost `/content/images/` URLs to `/images/`, drops missing local bookmark images, and **fails the build** on an unconverted directive or an unknown `[[SVG]]`.
- **Dead external links:** keep the words and drop the link. Dead embedded images: remove them. Never rewrite the meaning of a post.
- **Recovering old content:** the Ghost export is at `../arriqaaq-website/arriqaaq.ghost.2026-05-03-16-49-49.json` (pages marked `draft` were never migrated), and its images are at `https://storage.ghost.io/c/ce/b6/ceb66798-429b-432a-a02d-1c148871e2cf/content/images/…`.
- `health.arriqaaq.com` and `ilm.arriqaaq.com` are offline. Never link to them.

## Courses

A course is an ordered route over existing posts, defined in
`content/courses/<slug>.yaml`:

```yaml
slug: usul-al-fiqh
title: Usul al-Fiqh Made Easy
arabic: أصول الفقه
subject: fiqh            # tajweed | nahw | aqeedah | hadith | fiqh | tafsir (hadith = purple, Mustalah Hadith Made Easy)
tagline: One line for cards.
outcome: What the learner can do at the end (roadmap outcome card).
modules:                 # shown as STEP 01, STEP 02, … on the roadmap
  - title: Foundations
    blurb: One line.
    lessons:
      - slug: <post slug>   # must exist, or the build fails
        title: Short lesson title
```

Listing a post in a course automatically gives it the course banner, a
"Lesson N of M" marker, lesson-aware next/previous links and the
mark-complete control. The roadmap is generated at `/courses/<slug>/`.

## Mobile checklist (every UI change)

1. Check at 375px and 390px: no horizontal page scroll, and no text under
   14px except eyebrows.
2. Thumb reach: primary actions are full-width or bottom-anchored on phones.
3. Tables scroll inside themselves. Code blocks wrap or scroll.
4. Sticky or fixed elements respect `env(safe-area-inset-*)`.
5. Try it with JS disabled and with reduced motion: content must be complete.
6. Say in the PR or summary how the change behaves on mobile.
