<script lang="ts">
	// A book's page, kept short: the book, the two actions (read it here, or
	// download it), then what it is and what pairs with it. Reading happens in
	// the reader at /books/<slug>/read/, so there is no preview to scroll through.
	import { base } from '$app/paths';
	import { books, settings } from '$lib/content';
	import { SITE_URL, pageTitle, breadcrumbLd } from '$lib/site';
	import { bookAuthors } from '$lib/data/book-authors';
	import { shelfLabel } from '$lib/books/shelves';
	import Seo from '$lib/components/Seo.svelte';
	import Book3D from '$lib/components/books/Book3D.svelte';
	import BookScene from '$lib/components/books/BookScene.svelte';

	let { data } = $props();
	const book = $derived(data.book);

	let open = $state(false);
	$effect(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const t = setTimeout(() => (open = true), reduce ? 0 : 900);
		return () => clearTimeout(t);
	});

	const pairs = $derived(
		[
			...books.filter((b) => b.slug !== book.slug && b.shelf === book.shelf),
			...books.filter((b) => b.slug !== book.slug && b.shelf !== book.shelf && b.authors.some((a) => book.authors.includes(a)))
		].slice(0, 3)
	);
	const people = $derived([...book.authors, ...(book.illustrator ? [book.illustrator] : [])]);
	const languages = $derived(book.pdfs.length > 1 ? book.pdfs.map((p) => p.lang).join(' and ') : 'English');
	const jsonLd = $derived([breadcrumbLd([{ name: 'Books', path: '/books/' }, { name: book.title, path: `/books/${book.slug}/` }]), {
		'@context': 'https://schema.org',
		'@type': 'Book',
		name: book.title,
		url: `${SITE_URL}/books/${book.slug}/`,
		author: book.authors.map((name) => ({ '@type': 'Person', name })),
		...(book.illustrator ? { illustrator: { '@type': 'Person', name: book.illustrator } } : {}),
		...(book.pages ? { numberOfPages: book.pages } : {}),
		datePublished: String(book.year),
		inLanguage: book.pdfs.length > 1 ? ['en', 'ur'] : 'en',
		isAccessibleForFree: true,
		publisher: { '@type': 'Organization', name: settings.title, url: `${SITE_URL}/` },
		...(book.cover ? { image: `${SITE_URL}${book.cover}` } : {})
	}]);
</script>

<Seo
	title={pageTitle(`${book.title}: Free Book`)}
	description={`${book.line} By ${book.authors.join(' and ')}. Free to read.`}
	image={book.cover}
	{jsonLd}
/>

<article class="bk--{book.shelf}">
	<section class="wrap hero">
		<div class="stage">
			<div class="stage-book">
				{#key book.slug}<BookScene {book} {open} />{/key}
			</div>
			{#if book.previews.length > 2}
				<button type="button" class="open-btn" aria-pressed={open} onclick={() => (open = !open)}>
					{open ? 'Close the cover' : 'Open the cover'}
				</button>
			{/if}
		</div>

		<div class="intro">
			<span class="eyebrow eyebrow--quiet"><a href={`${base}/books/`}>Books</a> / {shelfLabel(book.shelf)}</span>
			<h1>{book.title}</h1>
			<p class="line">{book.line}</p>
			<p class="by">
				by <b>{book.authors.join(' and ')}</b>{#if book.illustrator}, illustrated by <b>{book.illustrator}</b>{/if}
			</p>

			<div class="actions">
				<a class="btn btn--bk read" href={`${base}/books/${book.slug}/read/`}>Read now <span class="arrow">→</span></a>
				{#if book.pdfs.length > 1}
					{#each book.pdfs.slice(1) as p (p.href)}
						<a class="btn btn--ghost" href={`${base}/books/${book.slug}/read/?ed=${p.lang?.toLowerCase()}`} lang={p.ar ? 'ur' : undefined}>Read in {p.lang}</a>
					{/each}
				{/if}
			</div>
			<div class="more-actions">
				{#each book.pdfs as p (p.href)}
					<a class="btn btn--ghost" href={base + p.href} download>{book.pdfs.length > 1 ? `Download ${p.lang}` : 'Download PDF'}</a>
				{/each}
				{#if book.external}<a class="btn btn--ghost" href={book.external.href} target="_blank" rel="noopener">{book.external.label}</a>{/if}
				{#if book.print}<a class="btn btn--ghost" href={book.print.href} target="_blank" rel="noopener">{book.print.label}</a>{/if}
			</div>
			{#if book.extra}<p class="extra">{book.extra}</p>{/if}
		</div>
	</section>

	<section class="wrap about">
		<div class="col">
			{#if book.quote}
				<blockquote class="pull">{book.quote}</blockquote>
				{#if book.quote_cite}<p class="cite">{book.quote_cite}</p>{/if}
			{/if}
			{#if book.inside.length}
				<h2 class="label">What's inside</h2>
				<ol class="inside">
					{#each book.inside as t}<li>{t}</li>{/each}
				</ol>
			{/if}
			<p class="post"><a href={`${base}/${book.post}/`}>Read the launch post: {book.post_title}</a></p>
		</div>

		<div class="col">
			<h2 class="label">Details</h2>
			<dl class="rows card">
				<div><dt>Written by</dt><dd>{book.authors.join(', ')}</dd></div>
				{#if book.illustrator}<div><dt>Illustrated by</dt><dd>{book.illustrator}</dd></div>{/if}
				{#if book.pages}<div><dt>Pages</dt><dd>{book.pages}</dd></div>{/if}
				<div><dt>Published</dt><dd>{book.year_note ?? book.year}</dd></div>
				<div><dt>Language</dt><dd>{languages}</dd></div>
			</dl>
			{#each people as name (name)}
				{@const a = bookAuthors[name]}
				{#if a?.line}
					<p class="who"><b>{#if a.href}<a href={`${base}${a.href}`}>{name}</a>{:else}{name}{/if}.</b> {a.line}</p>
				{/if}
			{/each}
		</div>
	</section>

	{#if pairs.length}
		<section class="wrap pairs" aria-labelledby="pairs-h">
			<h2 class="label" id="pairs-h">Pairs well with</h2>
			<ul>
				{#each pairs as p (p.slug)}
					<li class="bk--{p.shelf}">
						<a class="bk-link" href={`${base}/books/${p.slug}/`} aria-label={p.title}><Book3D book={p} /></a>
						<a class="name" href={`${base}/books/${p.slug}/`}>{p.title}</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</article>

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
		gap: var(--s-7);
		align-items: center;
		padding-block: var(--s-6) var(--s-6);
	}

	.stage {
		display: grid;
		justify-items: center;
		gap: var(--s-3);
		min-width: 0;
	}

	.stage-book {
		--bh: clamp(250px, 32vw, 380px);
		--wmax: min(calc(50vw - 36px), 300px);
		width: 100%;
		display: grid;
		justify-items: center;
		padding-block: var(--s-4);
	}

	.stage-book :global(.b3) {
		width: 100%;
	}

	.open-btn {
		border: 0;
		background: none;
		padding: var(--s-2) var(--s-3);
		color: var(--ink-3);
		font-size: var(--fs-small);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.intro {
		display: grid;
		gap: var(--s-3);
		justify-items: start;
		min-width: 0;
	}

	.eyebrow--quiet a {
		color: inherit;
		text-decoration: none;
	}

	h1 {
		margin: 0;
		font-size: var(--fs-h1);
		font-weight: 500;
		letter-spacing: -0.035em;
		line-height: 1.05;
		text-wrap: balance;
	}

	.line {
		margin: 0;
		font-size: var(--fs-lead);
		color: var(--ink-2);
		text-wrap: pretty;
	}

	.by {
		margin: 0;
		color: var(--ink-3);
		font-size: var(--fs-small);
	}

	.by b {
		color: var(--ink);
		font-weight: 500;
	}

	.actions,
	.more-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.actions {
		margin-top: var(--s-2);
	}

	.read {
		min-height: 52px;
		padding-inline: var(--s-6);
		font-size: var(--fs-body);
	}

	.extra {
		margin: 0;
		color: var(--ink-3);
		font-size: var(--fs-small);
	}

	.about {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--s-7);
		align-items: start;
		padding-block: var(--s-7) 0;
		border-top: 1px solid var(--line);
		margin-top: var(--s-2);
	}

	.col {
		display: grid;
		gap: var(--s-3);
		min-width: 0;
	}

	.label {
		margin: var(--s-3) 0 0;
		font: 600 0.75rem/1.3 var(--font-sans);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--bk-ink);
	}

	.col > .label:first-child {
		margin-top: 0;
	}

	.pull {
		margin: 0;
		padding: var(--s-1) 0 var(--s-1) var(--s-5);
		border-left: 4px solid var(--bk);
		font-size: clamp(1.1875rem, 1.1rem + 0.4vw, 1.4rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.35;
		text-wrap: pretty;
	}

	.cite {
		margin: 0 0 0 var(--s-5);
		color: var(--ink-3);
		font-size: var(--fs-small);
	}

	.inside {
		margin: 0;
		padding-left: 1.2em;
		font-size: var(--fs-small);
		color: var(--ink-2);
		display: grid;
		gap: var(--s-1);
	}

	.post {
		margin: var(--s-2) 0 0;
		font-size: var(--fs-small);
	}

	.post a {
		color: var(--bk-ink);
	}

	.rows {
		margin: 0;
		overflow: hidden;
	}

	.rows > div {
		display: grid;
		grid-template-columns: minmax(96px, 34%) minmax(0, 1fr);
		gap: var(--s-3);
		padding: 13px var(--s-5);
		border-top: 1px solid var(--line);
		font-size: var(--fs-small);
	}

	.rows > :first-child {
		border-top: 0;
	}

	dt {
		color: var(--ink-3);
	}

	dd {
		margin: 0;
	}

	.who {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--fs-small);
	}

	.who b {
		font-weight: 500;
		color: var(--ink);
	}

	.who a {
		color: inherit;
	}

	.pairs {
		padding-block: var(--s-7) var(--section);
	}

	.pairs ul {
		list-style: none;
		margin: var(--s-4) 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-6) var(--s-8);
		--bh: 210px;
		--wmax: 170px;
	}

	.pairs li {
		display: grid;
		gap: var(--s-2);
		justify-items: center;
		text-align: center;
		width: 210px;
	}

	.pairs .name {
		color: var(--ink);
		font-size: var(--fs-small);
		line-height: 1.3;
		text-decoration: none;
		text-wrap: balance;
	}

	.pairs .name:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (max-width: 820px) {
		.hero {
			grid-template-columns: 1fr;
			gap: var(--s-3);
			padding-block: var(--s-3) var(--s-5);
		}
		.stage-book {
			--bh: 232px;
			--wmax: calc(50vw - 28px);
			padding-block: var(--s-2);
		}
		.actions .read {
			flex: 1 1 100%;
		}
		.more-actions .btn {
			flex: 1 1 calc(50% - var(--s-2));
			padding-inline: var(--s-3);
		}
		.about {
			grid-template-columns: 1fr;
			gap: var(--s-6);
			padding-block-start: var(--s-6);
		}
		.pairs ul {
			flex-wrap: nowrap;
			gap: var(--s-6);
			--bh: 150px;
			--wmax: 108px;
			overflow-x: auto;
			margin-inline: calc(-1 * var(--gutter));
			padding-inline: var(--gutter);
			justify-content: flex-start;
			scrollbar-width: none;
		}
		.pairs li {
			flex: none;
			width: 132px;
			min-width: 0;
		}
	}
</style>
