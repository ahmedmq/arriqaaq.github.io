# SEO and analytics

What the site does for search and measurement, why, and the one-time setup
the owner does in Google and Microsoft. Everything here is free.

The site is served by **GitHub Pages** (`.github/workflows/deploy.yml`) and
the domain's DNS is managed at **Wix**.

## 1. One-time setup (owner)

All of these IDs are **public**: they end up in every page's HTML. They are
not secrets, so a public repo is fine. Do not commit them to code. Add them
in GitHub → repo → **Settings → Secrets and variables → Actions → Variables**
(the *Variables* tab, not *Secrets*). The deploy workflow reads them at
build time. An empty variable turns that tool off.

| Variable | What | Needed? |
| --- | --- | --- |
| `PUBLIC_GA_ID` | GA4 measurement ID, `G-XXXXXXXXXX` | Yes, for Google Analytics |
| `PUBLIC_CLARITY_ID` | Microsoft Clarity project ID | Optional (heatmaps, recordings) |
| `PUBLIC_GSC_VERIFICATION` | Search Console meta-tag token | Only if you skip DNS verification |

Nothing in this setup is a secret. GitHub Pages deploys with the workflow's built-in token.

### Google Analytics 4
1. analytics.google.com → Admin → **Create property** "Arriqaaq", your time zone → Web stream, URL `https://arriqaaq.com`. Copy the **Measurement ID** into `PUBLIC_GA_ID`.
2. Web stream → **Enhanced measurement** ⚙:
   - Page views → *Show advanced settings* → **untick "Page changes based on browser history events"**. The site sends its own page views, and leaving this on would count every page twice.
   - Keep on: scrolls, outbound clicks, file downloads (PDF downloads arrive as `file_download`).
   - Turn off: site search (the site sends `search` itself) and form interactions (they misfire).
3. Admin → Data collection → **Google signals: off**. Admin → Data retention → **14 months**.
4. Admin → Custom definitions → create these **event-scoped custom dimensions**. Parameter values only show in reports once they are registered.
   `content_id`, `course_id`, `lesson_id`, `book_id`, `percent`, `search_type`, `widget_id`, `result`, `method`, `metric_rating`, `debug_target`.
   Then create a **custom metric** `lesson_number` (standard) if you want it.
5. Admin → Events → mark as **key events**: `article_complete`, `lesson_complete`, `tutorial_complete`, `book_open`, `file_download`, `share`. You can mark them before they have arrived.
6. Admin → Product links → **Search Console links** → link the property below.

### Google Search Console
1. search.google.com/search-console → Add property → **Domain** `arriqaaq.com`.
2. Copy the TXT record → Wix → **Domains** → arriqaaq.com → **Manage DNS records** → TXT → Add record: host name empty (or `@`), value the `google-site-verification=…` text. Save, wait a few minutes, then press Verify in Search Console. With DNS verification there is no token for the site.
   (Alternative: choose a *URL prefix* property `https://arriqaaq.com/`, pick the **HTML tag** method, and put only the `content="…"` value in `PUBLIC_GSC_VERIFICATION`.)
3. Sitemaps → submit `https://arriqaaq.com/sitemap.xml`.
4. After the slug change ships: URL Inspection → test a few old URLs (for example `/saddzarai/`) to confirm the 301, and request indexing of the new ones.

### Bing Webmaster Tools
bing.com/webmasters → **Import from Google Search Console**. It verifies by itself. Bing also feeds ChatGPT search, Copilot and DuckDuckGo.

### Microsoft Clarity (optional)
clarity.microsoft.com → New project → copy the ID from `clarity.ms/tag/<ID>` into `PUBLIC_CLARITY_ID`. It loads only where analytics consent applies. If you turn it on, add a line about it to `/privacy/`. Microsoft asks that it not be used on sites aimed at children; the children's books are for parents to read with them.

## 2. What is measured

Page views are sent by the router (`src/routes/+layout.svelte`), once per page, with a `content_group` of `home`, `article`, `lesson`, `course`, `book`, `book_reader`, `listing` or `error`. Events (`src/lib/analytics.ts`):

| Event | When | Parameters |
| --- | --- | --- |
| `read_progress` | 25/50/75/100% of an article or lesson has scrolled past | `content_id`, `content_group`, `course_id`, `lesson_number`, `percent` |
| `article_complete` | End reached after at least 30 s on the page | same + `seconds` |
| `tutorial_begin` | First lesson of a course marked complete | `course_id`, `lesson_id`, `lesson_number` |
| `lesson_complete` | "Mark as complete" on a lesson | same |
| `tutorial_complete` | Every lesson of the course marked | same |
| `self_check` | "I knew it" / "Not yet" in a Pause and check box | `content_id`, `question_id`, `result` |
| `book_open` | The reader finished loading a book | `book_id`, `edition`, `pages` |
| `book_read_progress` | 25/50/75/100% of a book's pages reached | `book_id`, `percent`, `page_number` |
| `file_download` | PDF download (GA automatic) | `file_name` |
| `search` | Site search or the /articles/ filter, after typing stops | `search_term`, `search_type` |
| `select_content` | A search result clicked, or a scholar or term card opened in a lesson (`content_type` `scholar` or `term`) | `content_type`, `content_id` |
| `share` | Share sheet or copy link on an article | `method`, `item_id` |
| `comment_post` | A new giscus comment on the page | `content_id` |
| `widget_interact` | First touch on an interactive widget | `widget_id`, `content_id` |
| `LCP`, `INP`, `CLS`, `FCP`, `TTFB` | Core Web Vitals from real visitors | `value`, `metric_rating`, `debug_target` |
| `click` (outbound) | GA automatic | `link_url` |

### Reports worth opening weekly
- **Reports → Engagement → Pages and screens**, filtered by content group: views, average engagement time, read depth.
- **Reports → Engagement → Landing page**: where search visitors arrive.
- **Acquisition → Traffic acquisition**: Organic Search vs Instagram vs WhatsApp vs direct.
- **Explore → Funnel**: `tutorial_begin` → `lesson_complete` → `tutorial_complete` for each course.
- **Explore → Free form**: `read_progress` by `content_id` and `percent`, to find where readers stop.
- **Search terms** (event `search`): what readers look for and do not find, which is a list of what to write next.
- **Search Console → Performance**: queries, clicks, CTR and position per page. Pages ranking 5–15 with low CTR are the cheapest wins; improve their title and description.
- **Search Console → Core Web Vitals**, plus the `LCP`/`INP`/`CLS` events with `debug_target` to see which element is slow.

## 3. Consent and privacy

- Ads features, Google signals and ad personalisation are off everywhere (`src/app.html`).
- EEA, UK and Switzerland: `analytics_storage` defaults to denied, and the banner (`ConsentBanner.svelte`, shown by time zone) asks first. GA still receives cookieless pings for modelling (Consent Mode "advanced").
- Elsewhere analytics is on by default. Anyone can turn it off on `/privacy/` (`AnalyticsChoice.svelte`). The choice is stored in `localStorage` under `arriqaaq:consent`.
- GA4 does not store IP addresses.

## 4. SEO: what was done and why

Sources: Google Search Central (SEO starter guide, title links, snippets,
URL structure, canonicalisation, sitemaps, structured data, Core Web
Vitals), the June 2025 rich-result simplification, Backlinko's CTR study
(titles of 40–60 characters), and the GEO paper (Aggarwal et al., KDD 2024)
on being cited by AI answer engines.

- **Readable slugs.** 18 cryptic or overlong slugs were renamed (`saddzarai` → `sadd-ad-dharai`, …). Old slugs go in frontmatter `redirect_from`. GitHub Pages cannot send a 301, so the build writes a page at each old URL with an instant meta refresh and a canonical to the new one (`scripts/write-redirects.ts`), which Google treats as a permanent redirect. (`functions/_middleware.js` would give a real 301 only if the site moved to Cloudflare Pages.) Giscus threads and course progress follow the rename. **To rename a post:** move the file, change `slug:`, add the old slug under `redirect_from:`, and update links (the build fails if a course lesson or book points at a missing post).
- **Titles** lead with the topic and fit in about 60 characters. Series parts are automatic ("What is Istihsan? | Usul al-Fiqh Part 11"). Set `seo_title:` in frontmatter to override. The h1 on the page is unchanged.
- **Descriptions** come from frontmatter `description:`, else a long enough `excerpt:`, else the first real paragraphs (no bookmark cards, no basmala), cut on a word at 160 characters. For important posts, write a `description:` by hand: one or two sentences saying what the reader will learn.
- **One h1 per page.** Body `#` headings shift down one level.
- **Structured data:** BlogPosting (image, dates, course membership, organisation author), BreadcrumbList, Course with its lessons, ItemList of courses, Book, Organization and WebSite. FAQ, HowTo and the sitelinks search box are retired, so they are not used.
- **Index hygiene:** `noindex, follow` on topic pages with fewer than 3 articles, the author page (it repeats /articles/), book reader pages and errors. The sitemap lists only indexable URLs, once each, with images.
- **IndexNow:** the deploy workflow's build job compares the new sitemap with the live one, and a last job pings Bing, Yandex and others with what changed once the deploy is live. Run `npm run build && npm run indexnow all` once after the first deploy to send every URL.

### Next, in order of value
1. **Author identity (E-E-A-T).** Teaching posts are signed "Arriqaaq". A named teacher with a short bio and credentials (an author page with `Person` markup) is the strongest trust signal Google documents for religious and educational content. This needs the owner's decision.
2. **Hand-written descriptions** for the Usul and Mustalah parts and the most-visited pages, once Search Console shows which ones get impressions.
3. **Image weight.** `static/images` is 157 MB, and 86 files are over 400 KB (some 4–7 MB PNG screenshots). Converting them to WebP or AVIF with `width` and `height` set would cut LCP on phones the most. Re-encoding does not change what an image says. The never-touch list in DESIGN.md still applies.
4. **Internal links.** Every series part should link to the parts it builds on and to the course roadmap, with descriptive anchor text, not "previous".
5. **Answer-first openings.** For each teaching post, put a one or two sentence definition near the top ("Sadd adh-Dhara'i is …"). AI answer engines and featured snippets quote it.
