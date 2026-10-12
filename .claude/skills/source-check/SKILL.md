---
name: source-check
description: |
  Use before any teaching post (Mustalah Hadith, Usul al-Fiqh, aqeedah,
  tafsir, courses) is shown to the owner, committed or released, and
  whenever a post quotes the Qur'an, a hadith, a scholar or a book. It is
  the authenticity method: what must be cited, which sources to trust,
  how to find and read the original, and the `npm run check:citations`
  gate. Also use when the owner asks for "citations", "references",
  "authenticity" or "source checks".
---

# Source check: nothing without a citation

The owner's rule, given many times: **nothing is claimed without a
citation, nothing is invented, and an unclear citation is checked in the
original book.** This skill is how. `.claude/skills/mustalah-post/SKILL.md`
and `VOICE.md` still apply.

## 1. What must carry a citation

Every one of these, at the place it appears, in parentheses after it:

- a Qur'an verse: `(Quran 2:275)` with a quran.com link;
- a hadith: collection and number, with its grading where the documents
  give one: `(Sahih Muslim 1015)`;
- a scholar's saying or report: "X said", "as Ibn Hajar noted", "in the
  words of", "it is said that", including reports inside the owner's
  documents;
- a number, date or attribution that a reader could doubt (death years
  come from the owner's documents; cite those documents if asked);
- every quotation block, except the post's own "Note:" asides.

Widgets, scholar cards, quizzes and diagrams show content too: their
quotes carry the same citation (in the data module's `by`/`why`/`note`).

## 2. Where to check, in this order

| Need | Go to | Cite as |
| --- | --- | --- |
| The owner's teaching | The docx and notes in `references/` (read PDF pages as images) | the text itself; "(Course notes, Class N)" for a line only the notes have |
| The course book | *Min Atyab al-Minah*, `references/books/min-atyab-al-minah.pdf` | "*Min Atyab al-Minah*, introduction" or page |
| Qur'an | quran.com | `(Quran s:a)` + link |
| Hadith text and number | sunnah.com. Its URL uses the **in-book** number: open the page and cite the "Reference" number it shows (Introduction 27 is `/muslim/introduction/26`) | `(Sahih Muslim, Introduction 27)` + link |
| Hadith grading | dorar.net (al-Durar al-Saniyyah), or the grading the owner's documents give | the grader and book |
| Classical book, by page | shamela.ws (printed volume/page is in the page title), turath.io | `(al-Nawawi, *Al-Majmu*, 1/9)` + link |
| Scanned edition | archive.org, waqfeya.net: download the PDF, render the page (`pdftoppm`), read it | edition, page + link |
| Modern collections and studies | ketabonline.com, shamela.ws | author, title + link |
| English translations | troid.org and similar, only as a secondary link beside the original | "translation:" |

Arabic search terms work best: search the Arabic wording of the quote
(`"قرأت الرسالة" المزني`), then open the book page itself.

**Never cite** Wikipedia, blogs, forums, Goodreads or quote sites, search
summaries, or AI answers. Use them only to find where the original is.

## 3. Method for each claim

1. Find the line in the owner's documents. If it is not there, it does not
   go in the post. Never add a fact, a date or a book from memory.
2. If the documents give a citation, open it and confirm it.
3. If they give none, or it is unclear (the owner's "50 or 500?"), find the
   original: download the book into `references/books/` (git-ignored; keep
   the file name descriptive), read the actual page, and note the edition.
4. Confirmed directly: cite work + volume/page or number + link.
   Confirmed only through another book quoting it: say "as quoted in …".
   Found a different wording or number: tell the owner, quote both, and
   keep the post as the owner decides. If the original says more (another
   narration), it may be added with its citation.
5. Not found: keep the line as the documents have it, cite the documents,
   and list it for the owner as "primary source unconfirmed". Never guess.
6. Scholar quotes are plain quotes. A citation like "Sahih Muslim,
   Introduction 32" is a scholar's statement, not a hadith, and the quote
   classifier treats it so (`scripts/rehype-reading.ts`).

## 4. The Sources section

Every teaching post ends with `## Sources`: the owner's documents, then
each work checked, with edition and a link. Each entry must have a link.

## 5. The gate (run before showing, committing or releasing)

1. `npm run check:citations`: must pass. It checks every post tagged
   `hadith` (or with `citations: strict` in its frontmatter) for
   quotations without a citation, reported sayings without one, links to
   sources outside the trusted list, and a missing or link-less Sources
   section. `npm run check:citations -- --all` reports on every other
   post without failing (the older Usul posts still have gaps; fix them
   when a post is touched, and switch it to `citations: strict`).
   To trust a new library, add it to `TRUSTED` in
   `scripts/check-citations.ts` with a comment, only if it publishes the
   original texts.
2. An independent read-only audit agent: give it the post, the owner's
   documents and the widget/card data; it lists every claim not in the
   documents, every quote without a citation, every change of meaning and
   every garbled source line. Resolve each one (cite, fix to the source,
   or ask the owner). It must not edit files.
3. `npm run check:release` (links, then citations) before any push.
4. Report to the owner what was confirmed (with links) and what is still
   unconfirmed. Never claim a check that was not done.
