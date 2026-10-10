<script lang="ts">
	// "Swipe or pick a chapter": the original homepage carousel, redrawn in
	// the design system. Chapters are the six biggest topics; each shows its
	// six latest posts as a deck of cards. Pick a chapter with the pill tabs
	// (OpenAI tabs); swipe the deck on phones (native scroll snap), or use the
	// arrow buttons and keyboard on desktop. Works without JS as a plain
	// scrollable row of the first chapter.
	import { base } from '$app/paths';
	import { posts, tags, subjectForPost, coursePlace } from '$lib/content';
	import PixelCover from '$lib/components/ui/PixelCover.svelte';

	const CHAPTERS = 6;
	const PER = 6;

	const chapters = [...tags]
		.filter((t) => t.post_count > 0)
		.sort((a, b) => b.post_count - a.post_count)
		.slice(0, CHAPTERS)
		.map((t) => ({ tag: t, posts: posts.filter((p) => p.tags.includes(t.id)).slice(0, PER) }));

	let active = $state(0);
	let track: HTMLElement | undefined = $state();
	let atStart = $state(true);
	let atEnd = $state(false);

	const current = $derived(chapters[active]);

	function pick(i: number) {
		active = i;
		track?.scrollTo({ left: 0, behavior: 'auto' });
		queueMicrotask(updateEdges);
	}

	function updateEdges() {
		if (!track) return;
		atStart = track.scrollLeft < 8;
		atEnd = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
	}

	function step(dir: 1 | -1) {
		if (!track) return;
		const card = track.querySelector<HTMLElement>('.card-c');
		const w = (card?.offsetWidth ?? 280) + 16;
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		track.scrollBy({ left: dir * w, behavior: smooth ? 'smooth' : 'auto' });
	}

	function onTabKey(e: KeyboardEvent, i: number) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
			e.preventDefault();
			const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
			pick(n);
			document.getElementById(`chapter-tab-${n}`)?.focus();
		}
	}

	const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
</script>

<section class="section chapters" aria-labelledby="chapters-h">
	<div class="wrap">
		<div class="head">
			<div class="section-head">
				<span class="eyebrow">Swipe or pick</span>
				<h2 class="split" id="chapters-h">Something from <em>every chapter.</em></h2>
			</div>
			<div class="arrows" aria-hidden="true">
				<button class="icon-btn" tabindex="-1" disabled={atStart} onclick={() => step(-1)} aria-label="Previous">
					<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
				</button>
				<button class="icon-btn" tabindex="-1" disabled={atEnd} onclick={() => step(1)} aria-label="Next">
					<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
				</button>
			</div>
		</div>

		<div class="tabs-row scroll-x" role="tablist" aria-label="Chapters">
			{#each chapters as c, i (c.tag.id)}
				<button
					id={`chapter-tab-${i}`}
					class="tab"
					role="tab"
					aria-selected={active === i}
					aria-controls="chapter-panel"
					tabindex={active === i ? 0 : -1}
					onclick={() => pick(i)}
					onkeydown={(e) => onTabKey(e, i)}
				>
					<span class="tn">{String(i + 1).padStart(2, '0')}</span>
					{c.tag.name}
				</button>
			{/each}
		</div>

		<div id="chapter-panel" role="tabpanel" aria-labelledby={`chapter-tab-${active}`}>
			<ul class="track" bind:this={track} onscroll={updateEdges}>
				{#each current.posts as p (p.id)}
					{@const place = coursePlace(p.slug)}
					<li class="card-c subject--{subjectForPost(p)}">
						<a href={`${base}/${p.slug}/`}>
							<span class="cover"><PixelCover seed={p.slug} subject={subjectForPost(p)} cols={10} rows={5} ratio={1.9} /></span>
							<span class="body">
								<span class="kicker">
									<span class="topic">{place ? `${place.course.title} · Lesson ${place.lesson.n}` : current.tag.name}</span>
									<span class="date">{date(p.published_at)}</span>
								</span>
								<span class="title">{place ? place.lesson.title : p.title}</span>
							</span>
						</a>
					</li>
				{/each}
				<li class="card-c more">
					<a href={`${base}/tag/${current.tag.slug}/`}>
						<span class="more-n">{current.tag.post_count}</span>
						<span class="more-t">All {current.tag.name} articles <span aria-hidden="true">→</span></span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</section>

<style>
	.chapters {
		padding-top: 0;
	}

	.head {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.arrows {
		display: none;
		gap: var(--s-2);
		margin-bottom: var(--s-6);
	}

	.arrows button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	@media (hover: hover) and (min-width: 900px) {
		.arrows {
			display: flex;
		}
	}

	.tabs-row {
		margin-bottom: var(--s-5);
		gap: 4px;
	}

	.tabs-row .tab {
		box-shadow: inset 0 0 0 1px var(--line);
	}

	.tabs-row .tab[aria-selected='true'] {
		background: var(--ink);
		color: #fff;
		box-shadow: none;
	}

	.tn {
		margin-right: 6px;
		font-family: var(--font-mono);
		font-size: 11px;
		opacity: 0.6;
	}

	/* The deck: native horizontal scroll with snap, edge-to-edge on phones. */
	.track {
		display: flex;
		gap: var(--s-4);
		margin: 0 calc(-1 * var(--gutter));
		padding: 2px var(--gutter) var(--s-2);
		list-style: none;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--gutter);
		overscroll-behavior-x: contain;
		scrollbar-width: none;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	.card-c {
		flex: 0 0 min(78%, 300px);
		scroll-snap-align: start;
	}

	.card-c a {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: var(--r-lg);
		background: var(--page);
		box-shadow: inset 0 0 0 1px var(--line);
		overflow: hidden;
		text-decoration: none;
		transition:
			box-shadow var(--dur) ease,
			transform var(--dur) var(--ease-out);
	}

	.card-c a:hover {
		box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-1);
		transform: translateY(-2px);
	}

	.cover {
		display: block;
		aspect-ratio: 1.9;
	}

	.body {
		display: grid;
		gap: 8px;
		padding: var(--s-4) var(--s-5) var(--s-5);
	}

	.kicker {
		display: flex;
		flex-wrap: wrap;
		gap: 2px var(--s-3);
		font-size: var(--fs-xs);
		font-weight: 500;
	}

	.topic {
		color: var(--subject-ink);
	}

	.date {
		color: var(--ink-3);
	}

	.title {
		font-size: 1.0625rem;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.015em;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Last card: jump to the whole chapter. */
	.more a {
		justify-content: space-between;
		padding: var(--s-5);
		background: var(--surface);
		box-shadow: none;
	}

	.more-n {
		font-size: 3.5rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--purple-ink);
	}

	.more-t {
		font-weight: 500;
	}
</style>
