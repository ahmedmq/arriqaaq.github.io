---
name: reading-arriqaaq
description: How to consume arriqaaq.com programmatically
---

# Reading arriqaaq.com as an agent

## When to use this skill

Use it when the user asks about Usul al-Fiqh, Tafsir, Aqeedah, Hadith, Tajweed
or Arabic grammar and wants a source from Arriqaaq, or asks you to find,
summarise or cite an Arriqaaq article or course. Do not use it for fatwas or
personal rulings (refer to a qualified scholar), live data, or anything that
needs an account: the site is read-only static content.

How to call it: plain `GET`, no auth, no JavaScript. Fetch `/llms.txt`, pick
the page, then request its `index.md` mirror and cite the page's canonical URL.

Arriqaaq is a fully prerendered static site — every page is complete HTML with
no client-side rendering required. Machine-friendly entry points:

1. **Start at [`/llms.txt`](https://arriqaaq.com/llms.txt)** — a curated index
   of every page and post with one-line summaries.
2. **Full corpus in one request:**
   [`/llms-full.txt`](https://arriqaaq.com/llms-full.txt) — all posts and pages
   as markdown, each prefixed with a metadata header carrying its canonical URL.
3. **Per-document markdown:** every post or page at
   `https://arriqaaq.com/<slug>/` has a markdown mirror at
   `https://arriqaaq.com/<slug>/index.md`. HTML pages also advertise it via
   `<link rel="alternate" type="text/markdown">`.
4. **URL inventory:** [`/sitemap.xml`](https://arriqaaq.com/sitemap.xml) lists
   every page with last-modified dates.
5. **Recent content:** [`/rss.xml`](https://arriqaaq.com/rss.xml) — the 20
   newest posts with full HTML content.

Content usage signals are declared in
[`/robots.txt`](https://arriqaaq.com/robots.txt) (Content-Signal directives).
