<script lang="ts">
	// Subject cards (stop-choosing "day cards"). Each card floods with its
	// subject colour and shows its Arabic name when it crosses the middle of
	// the screen. That is the phone equivalent of hover, which desktop also gets.
	import { base } from '$app/paths';
	import { SUBJECTS } from '$lib/subjects';
	import { getCourse, getTag } from '$lib/content';

	const cards = SUBJECTS.map((s) => {
		const course = s.course ? getCourse(s.course) : undefined;
		const tag = s.tag ? getTag(s.tag) : undefined;
		const href = course ? `${base}/courses/${course.slug}/` : tag?.post_count ? `${base}/tag/${tag.slug}/` : null;
		const foot = course
			? `${course.lesson_count} lessons · Start the course`
			: tag?.post_count
				? `${tag.post_count} article${tag.post_count === 1 ? '' : 's'} · Read`
				: 'Course in preparation';
		return { ...s, href, foot, live: !!course };
	});

	let grid: HTMLElement | undefined = $state();
	let reached = $state<Record<string, boolean>>({});

	$effect(() => {
		if (!grid || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					const id = (e.target as HTMLElement).dataset.id!;
					reached[id] = e.isIntersecting;
				}
			},
			{ rootMargin: '-42% 0px -42% 0px' }
		);
		grid.querySelectorAll('[data-id]').forEach((el) => io.observe(el));
		return () => io.disconnect();
	});
</script>

<section class="section subjects" id="subjects">
	<div class="wrap">
		<div class="section-head">
			<span class="eyebrow">Six sciences</span>
			<h2 class="split">Every subject, from its <em>roots.</em></h2>
		</div>

		<div class="grid" bind:this={grid}>
			{#each cards as c, i}
				<svelte:element
					this={c.href ? 'a' : 'div'}
					href={c.href}
					class="card-s subject--{c.id}"
					class:is-reached={reached[c.id]}
					class:is-live={c.live}
					data-id={c.id}
				>
					<span class="n">{String(i + 1).padStart(2, '0')}</span>
					<span class="head">
						<span class="name">{c.name}</span>
						<span class="q">{c.question}</span>
					</span>
					<span class="ar" lang="ar" dir="rtl">{c.arabic}</span>
					<span class="foot">
						<span>{c.foot}</span>
						{#if c.href}<span class="go" aria-hidden="true">→</span>{/if}
					</span>
				</svelte:element>
			{/each}
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		gap: var(--s-3);
	}

	.card-s {
		/* Flooded cards always use white text (requested), on every subject colour. */
		--subject-on: #fff;
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-rows: auto 1fr auto auto;
		gap: var(--s-4);
		min-height: 300px;
		padding: var(--s-5);
		border-radius: var(--r-lg);
		background: var(--surface);
		color: var(--ink);
		text-decoration: none;
		overflow: hidden;
	}

	/* The colour flood sits under the content and fades in. */
	.card-s::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--subject);
		opacity: 0;
		transition: opacity var(--dur) var(--ease-soft);
	}

	.card-s.is-reached::before {
		opacity: 1;
	}

	.n {
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--ls-eyebrow);
		color: var(--ink-3);
		transition: color var(--dur) ease;
	}

	.head {
		display: grid;
		align-content: start;
		gap: 2px;
	}

	.name {
		font-size: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
		font-weight: 500;
		line-height: 1.05;
		letter-spacing: -0.03em;
	}

	.q {
		font-size: clamp(1.25rem, 1.1rem + 0.8vw, 1.6rem);
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--ink-3);
		transition: color var(--dur) ease;
	}

	.ar {
		justify-self: end;
		font-family: var(--font-arabic-display);
		font-weight: 500;
		font-size: clamp(2rem, 1.6rem + 2.4vw, 3rem);
		line-height: 1.3;
		letter-spacing: 0;
		color: var(--line-strong);
		transform: translateY(6px);
		transition:
			opacity var(--dur) ease,
			transform var(--dur-slow) var(--ease-out),
			color var(--dur) ease;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		padding-top: var(--s-3);
		border-top: 1px solid rgba(13, 12, 19, 0.1);
		font-size: var(--fs-small);
		font-weight: 500;
	}

	.go {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--page);
		color: var(--ink);
		transition: transform var(--dur) var(--ease-out);
	}

	/* Reached / hovered state: text takes the subject's on-colour. */
	.card-s.is-reached,
	.card-s.is-reached .q,
	.card-s.is-reached .n {
		color: var(--subject-on);
	}

	.card-s.is-reached .ar {
		color: var(--subject-on);
		opacity: 1;
		transform: none;
	}

	.card-s.is-reached .foot {
		border-top-color: color-mix(in srgb, var(--subject-on) 25%, transparent);
	}

	a.card-s:hover .go {
		transform: translateX(3px);
	}

	@media (hover: hover) {
		a.card-s:hover::before {
			opacity: 1;
		}

		a.card-s:hover,
		a.card-s:hover .q,
		a.card-s:hover .n,
		a.card-s:hover .ar {
			color: var(--subject-on);
		}

		a.card-s:hover .ar {
			opacity: 1;
			transform: none;
		}
	}

	.card-s:not([href]):not(.is-reached) .foot {
		color: var(--ink-3);
	}

	@media (min-width: 720px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1040px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.card-s {
			min-height: 360px;
		}
	}
</style>
