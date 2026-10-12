<script lang="ts">
	// Read a whole book on the site. Pages are drawn from the book's own PDF with
	// PDF.js, only the ones near the screen, in one continuous scroll. Page jump,
	// zoom (pages scroll sideways when zoomed), remembers where the reader stopped.
	// PDF.js loads on this page only. Downloads are offered here and nowhere else.
	import { onMount, tick } from 'svelte';
	import { base } from '$app/paths';
	import type { Book } from '$lib/types';

	let { book }: { book: Book } = $props();

	const ZOOMS = [1, 1.5, 2, 3];
	let ed = $state(0);
	let zi = $state(0);
	let total = $state(book.pages ?? 1);
	let current = $state(1);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let resume = $state(0);
	let sheetEl = $state<HTMLDivElement>();
	// Position is saved only once the reader has moved, so opening the book never overwrites it.
	let moved = $state(false);

	let doc: any = null;
	let loading: any = null;
	let io: IntersectionObserver | null = null;
	const drawn = new Map<number, { w: number; task: any; canvas: HTMLCanvasElement }>();
	const near = new Set<number>();

	const pdf = $derived(book.pdfs[ed]);
	const pages = $derived(Array.from({ length: total }, (_, i) => i + 1));
	const key = $derived(`bookpos:${book.slug}:${ed}`);
	const zoom = $derived(ZOOMS[zi]);

	function save(n: number) {
		try { localStorage.setItem(key, String(n)); } catch {}
	}
	function saved(): number {
		try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
	}

	const pageEl = (n: number) => sheetEl?.querySelector<HTMLElement>(`[data-n="${n}"]`) ?? null;

	async function draw(n: number) {
		const el = pageEl(n);
		if (!doc || !el) return;
		const cssW = el.clientWidth;
		if (!cssW) return;
		const have = drawn.get(n);
		if (have && Math.abs(have.w - cssW) < 2) return;
		const page = await doc.getPage(n);
		const unit = page.getViewport({ scale: 1 });
		let scale = (cssW * Math.min(devicePixelRatio || 1, 2)) / unit.width;
		const px = unit.width * scale * unit.height * scale;
		const cap = zoom > 1.5 ? 5_000_000 : 10_000_000; // keep phones from running out of memory
		if (px > cap) scale *= Math.sqrt(cap / px);
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		canvas.width = Math.floor(viewport.width);
		canvas.height = Math.floor(viewport.height);
		canvas.setAttribute('role', 'img');
		canvas.setAttribute('aria-label', `Page ${n} of ${book.title}`);
		have?.task?.cancel();
		const task = page.render({ canvas, viewport });
		const entry = { w: cssW, task, canvas };
		drawn.set(n, entry);
		try { await task.promise; } catch { return; } // cancelled
		if (drawn.get(n) !== entry) return;
		el.style.aspectRatio = `${unit.width} / ${unit.height}`;
		el.querySelector('canvas')?.remove();
		el.appendChild(canvas);
	}

	function release(n: number) {
		const d = drawn.get(n);
		if (!d) return;
		d.task?.cancel();
		drawn.delete(n);
		pageEl(n)?.querySelector('canvas')?.remove();
	}

	function observe() {
		io?.disconnect();
		io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					const n = Number((e.target as HTMLElement).dataset.n);
					if (e.isIntersecting) { near.add(n); draw(n); }
					else { near.delete(n); release(n); }
				}
			},
			{ rootMargin: '80% 0px' }
		);
		sheetEl?.querySelectorAll('.pg').forEach((el) => io!.observe(el));
	}

	function whichPage() {
		const a = pageEl(1), b = pageEl(2);
		if (!a) return;
		const r = a.getBoundingClientRect();
		const step = b ? b.getBoundingClientRect().top - r.top : r.height;
		const probe = innerHeight * 0.4 - r.top;
		current = Math.min(total, Math.max(1, Math.floor(probe / step) + 1));
	}
	let raf = 0;
	const onScroll = () => { moved = true; if (!raf) raf = requestAnimationFrame(() => { raf = 0; whichPage(); }); };

	function go(n: number) {
		const t = Math.min(total, Math.max(1, Math.round(n) || 1));
		pageEl(t)?.scrollIntoView({ block: 'start' });
		current = t;
		moved = true;
	}

	async function open(index: number) {
		status = 'loading';
		for (const n of [...drawn.keys()]) release(n);
		near.clear();
		await loading?.destroy();
		loading = null;
		doc = null;
		try {
			const lib: any = await import('pdfjs-dist/legacy/build/pdf.mjs'); // the compatibility build, for older phones
			const worker: any = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
			lib.GlobalWorkerOptions.workerSrc = worker.default;
			loading = lib.getDocument({ url: base + book.pdfs[index].href, rangeChunkSize: 262144, disableAutoFetch: true, isEvalSupported: false });
			doc = await loading.promise;
			total = doc.numPages;
			status = 'ready';
			await tick();
			observe();
			const s = saved();
			resume = s > 1 && s <= total ? s : 0;
			current = 1;
		} catch (e) {
			console.error(e);
			status = 'error';
		}
	}

	async function setZoom(next: number) {
		const keep = current;
		zi = Math.min(ZOOMS.length - 1, Math.max(0, next));
		await tick();
		for (const n of near) draw(n);
		go(keep);
	}

	function pickEdition(i: number) {
		ed = i;
		resume = 0;
		moved = false;
		open(i);
		window.scrollTo({ top: 0 });
	}

	$effect(() => { if (status === 'ready' && moved) save(current); });

	onMount(() => {
		const want = new URLSearchParams(location.search).get('ed')?.toLowerCase();
		const i = book.pdfs.findIndex((p) => p.lang?.toLowerCase() === want);
		if (i > 0) ed = i;
		open(ed);
		let t: ReturnType<typeof setTimeout>;
		const onResize = () => { clearTimeout(t); t = setTimeout(() => { for (const n of near) draw(n); }, 250); };
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', onResize);
		return () => {
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', onResize);
			io?.disconnect();
			for (const n of [...drawn.keys()]) release(n);
			loading?.destroy();
		};
	});
</script>

<div class="reader bk--{book.shelf}" style:--z={zoom}>
	<div class="bar">
		<a class="icon-btn" href={`${base}/books/${book.slug}/`} aria-label="Book details">←</a>
		<div class="where">
			<span class="t">{book.title}</span>
			<span class="p" aria-live="polite">Page {current} of {total}</span>
		</div>
		<input class="scrub" type="range" min="1" max={total} value={current} aria-label="Go to page" oninput={(e) => go(+e.currentTarget.value)} />
		<div class="zoom" role="group" aria-label="Zoom">
			<button type="button" class="icon-btn" aria-label="Zoom out" disabled={zi === 0} onclick={() => setZoom(zi - 1)}>−</button>
			<button type="button" class="icon-btn" aria-label="Zoom in" disabled={zi === ZOOMS.length - 1} onclick={() => setZoom(zi + 1)}>+</button>
		</div>
		<a class="icon-btn" href={base + pdf.href} download aria-label="Download PDF">↓</a>
	</div>

	{#if book.pdfs.length > 1}
		<div class="wrap eds">
			<div class="segmented" role="group" aria-label="Edition">
				{#each book.pdfs as p, i}
					<button type="button" aria-pressed={i === ed} onclick={() => pickEdition(i)}>{p.lang}</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if resume}
		<div class="wrap">
			<div class="resume">
				<span>Pick up where you stopped, page {resume}?</span>
				<button type="button" class="btn btn--bk" onclick={() => { go(resume); resume = 0; }}>Continue</button>
				<button type="button" class="btn btn--ghost" onclick={() => (resume = 0)}>Start at page 1</button>
			</div>
		</div>
	{/if}

	{#if status === 'error'}
		<div class="wrap fail">
			<p>The reader could not open this book in your browser.</p>
			<a class="btn btn--bk" href={base + pdf.href}>Open the PDF</a>
		</div>
	{/if}

	<div class="scroller">
		<div class="sheet" bind:this={sheetEl} style:--ratio={book.page_ratio}>
			{#each pages as n (n)}
				<div class="pg" data-n={n}><span class="pn">{n}</span></div>
			{/each}
		</div>
	</div>

	<noscript><p class="wrap">Reading on the site needs JavaScript. <a href={base + pdf.href}>Download the PDF</a> instead.</p></noscript>

	{#if status === 'ready'}
		<div class="wrap end">
			<span class="eyebrow">The end</span>
			<h2>That is {book.title}.</h2>
			<div class="actions">
				<a class="btn btn--bk" href={base + pdf.href} download>Download PDF</a>
				{#if book.external}<a class="btn btn--ghost" href={book.external.href} target="_blank" rel="noopener">{book.external.label}</a>{/if}
				<a class="btn btn--ghost" href={`${base}/books/${book.slug}/`}>Book details</a>
				<a class="btn btn--ghost" href={`${base}/books/`}>More books</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.reader {
		padding-bottom: var(--s-7);
	}

	.bar {
		position: sticky;
		top: var(--topbar-h);
		z-index: 20;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2) var(--s-3);
		padding: var(--s-2) var(--gutter);
		background: var(--page);
		border-bottom: 1px solid var(--line);
	}

	.where {
		display: grid;
		min-width: 0;
		flex: 0 1 auto;
	}

	.where .t {
		font-size: var(--fs-small);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 28ch;
	}

	.where .p {
		white-space: nowrap;
		font: 500 11.5px/1.3 var(--font-mono);
		letter-spacing: 0.04em;
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}

	.scrub {
		flex: 1 1 120px;
		min-width: 60px;
		accent-color: var(--bk);
	}

	.zoom {
		display: flex;
		gap: var(--s-1);
	}

	.icon-btn:disabled {
		opacity: 0.35;
	}

	.eds,
	.resume,
	.fail {
		margin-top: var(--s-4);
	}

	.resume {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2) var(--s-3);
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r);
		background: var(--surface);
		font-size: var(--fs-small);
	}

	.resume span {
		flex: 1 1 100%;
	}

	.fail {
		display: grid;
		gap: var(--s-3);
		justify-items: start;
	}

	.scroller {
		overflow-x: auto;
		padding: var(--s-4) var(--gutter) 0;
	}

	.sheet {
		width: calc(min(100%, 860px) * var(--z));
		margin-inline: auto;
		display: grid;
		gap: var(--s-4);
	}

	.pg {
		position: relative;
		width: 100%;
		aspect-ratio: var(--ratio);
		background: var(--surface);
		box-shadow: 0 0 0 1px var(--line);
		scroll-margin-top: calc(var(--topbar-h) + 64px);
	}

	.pg :global(canvas) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: #fff;
	}

	.pn {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font: 500 14px var(--font-mono);
		color: var(--ink-3);
	}

	.end {
		display: grid;
		gap: var(--s-3);
		justify-items: start;
		margin-top: var(--s-7);
	}

	.end h2 {
		margin: 0;
		font-size: var(--fs-h2);
		font-weight: 500;
		letter-spacing: -0.03em;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	@media (max-width: 640px) {
		.where .t {
			display: none;
		}
		.where {
			flex: 1 1 auto;
		}
		.scrub {
			order: 9;
			flex: 1 1 100%;
			height: 24px;
		}
		.actions .btn {
			flex: 1 1 100%;
		}
	}
</style>
