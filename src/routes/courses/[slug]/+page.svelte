<script lang="ts">
	// Course roadmap (arriqaaqlabs roadmap design): one numbered rail, stages
	// marked by small pills on the rail, lesson cards that alternate sides on desktop and stack
	// against a left rail on phones. Progress comes from this browser only.
	import { base } from '$app/paths';
	import { settings } from '$lib/content';
	import { SITE_URL } from '$lib/site';
	import Seo from '$lib/components/Seo.svelte';
	import PixelCover from '$lib/components/ui/PixelCover.svelte';
	import { doneSet, onProgress } from '$lib/progress';
	import { reveal } from '$lib/actions';
	import { rng } from '$lib/art';

	let { data } = $props();
	const course = $derived(data.course);
	const lessons = $derived(course.modules.flatMap((m) => m.lessons));
	const hours = $derived(Math.max(1, Math.round(course.minutes / 60)));

	let done = $state<Set<string>>(new Set());
	$effect(() => {
		const sync = () => (done = doneSet());
		sync();
		return onProgress(sync);
	});
	const doneCount = $derived(lessons.filter((l) => done.has(l.slug)).length);
	const next = $derived(lessons.find((l) => !done.has(l.slug)) ?? lessons[0]);

	// Pixel field in the band's top-right corner (arriqaaqlabs roadmap band).
	// White blocks over the solid subject colour, denser toward the corner.
	const pixels = $derived.by(() => {
		const rand = rng(course.slug + ':band');
		const cols = 14,
			rows = 7,
			out: { x: number; y: number; o: number }[] = [];
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) {
				const d = Math.pow((c / (cols - 1)) * 0.7 + (1 - r / (rows - 1)) * 0.3, 1.8);
				if (rand() < d) out.push({ x: c * 40, y: r * 40, o: rand() < 0.15 ? 0.32 : 0.14 });
			}
		return out;
	});

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: course.title,
		description: course.tagline,
		url: `${SITE_URL}/courses/${course.slug}/`,
		provider: { '@type': 'Organization', name: settings.title, url: `${SITE_URL}/` },
		hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${hours}H` }
	});
</script>

<Seo title={`${course.title} — Roadmap — ${settings.title}`} description={course.tagline} {jsonLd} />

<div class="roadmap subject--{course.subject}">
	<header class="band">
		<svg class="band-pixels" viewBox="0 0 560 280" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
			{#each pixels as p}<rect x={p.x + 4} y={p.y + 4} width="32" height="32" rx="7" fill="#fff" opacity={p.o} />{/each}
		</svg>
		<!-- Breadcrumb spans the full page container so it lines up with the
		     header logo, not with the centred reading column (arriqaaqlabs). -->
		<nav class="crumbs wrap" aria-label="Breadcrumb">
			<a href={`${base}/courses/`}>Courses</a> <span aria-hidden="true">/</span> <span>{course.title}</span>
		</nav>
		<div class="hero wrap wrap--measure">
		<span class="eyebrow">Course · Roadmap{#if course.arabic}{' · '}<span class="ar" lang="ar" dir="rtl">{course.arabic}</span>{/if}</span>
		<h1>{course.title}</h1>
		<p class="tagline">{course.tagline}</p>
		<span class="summary">{course.lesson_count} lessons · {course.modules.length} steps · about {hours} hours</span>

		{#if doneCount > 0}
		<div class="start">
				<div class="prog" aria-label={`${doneCount} of ${course.lesson_count} lessons complete`}>
					<span class="bar"><i style:width={`${(100 * doneCount) / course.lesson_count}%`}></i></span>
					<span class="eyebrow">{doneCount} of {course.lesson_count} complete</span>
				</div>
			<a class="btn btn--on-band" href={`${base}/${next.slug}/`}>Continue with lesson {next.n} <span class="arrow">→</span></a>
		</div>
		{/if}
		</div>
	</header>

	<div class="wrap wrap--wide">
		<ol class="rail">
			{#each course.modules as m, mi}
				<li class="milestone" use:reveal data-reveal>
					<span class="milestone-pill">Step {String(mi + 1).padStart(2, '0')} · {m.title}</span>
				</li>
				{#each m.lessons as l (l.slug)}
					{@const isDone = done.has(l.slug)}
					{@const isNext = l.slug === next.slug}
					<li class="stop" class:is-right={l.n % 2 === 0} class:is-done={isDone} class:is-next={isNext} use:reveal data-reveal>
						<span class="node" aria-hidden="true">
							{#if isDone}✓{:else}{String(l.n).padStart(2, '0')}{/if}
						</span>
						<a class="lesson card" href={`${base}/${l.slug}/`}>
							<span class="thumb">
								<PixelCover seed={l.slug} subject={course.subject} mix />
							</span>
							<span class="lesson-body">
								<span class="row">
									<span class="tag">{m.title}</span>
									{#if isDone}<span class="state done">Completed</span>{:else if isNext}<span class="state next">Up next</span>{/if}
								</span>
								<span class="t">{l.title}</span>
								{#if l.excerpt}<span class="x">{l.excerpt}</span>{/if}
								<span class="meta">Lesson {l.n} · {l.minutes} min read</span>
							</span>
						</a>
					</li>
				{/each}
			{/each}
		</ol>

		<section class="outcome" use:reveal data-reveal>
			<span class="eyebrow">At the end of this course</span>
			<p>{course.outcome}</p>
			<a class="btn" href={`${base}/${next.slug}/`}>
				{doneCount > 0 ? `Continue with lesson ${next.n}` : `Start with lesson 1: ${lessons[0].title}`} <span class="arrow">→</span>
			</a>
		</section>
	</div>
</div>

<style>
	/* ---- Coloured band (arriqaaqlabs roadmap header) ------------------- */

	.band {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		background: var(--subject);
		color: var(--subject-on);
	}

	.band-pixels {
		position: absolute;
		top: 0;
		right: 0;
		z-index: -1;
		width: 62%;
		height: 46%;
		pointer-events: none;
		-webkit-mask-image: linear-gradient(to left, #000 35%, transparent);
		mask-image: linear-gradient(to left, #000 35%, transparent);
	}

	@media (min-width: 900px) {
		.band-pixels {
			width: min(52%, 720px);
			height: 100%;
		}
	}

	.hero {
		display: grid;
		justify-items: center;
		gap: var(--s-3);
		padding-block: var(--s-5) var(--s-7);
		text-align: center;
	}

	.band .eyebrow {
		color: inherit;
		opacity: 0.92;
	}

	.crumbs {
		display: block;
		padding-top: var(--s-5);
		font-size: var(--fs-eyebrow);
		font-weight: 600;
		letter-spacing: var(--ls-eyebrow);
		text-transform: uppercase;
	}

	.crumbs a {
		color: inherit;
		text-decoration: none;
	}

	.crumbs a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.crumbs span[aria-hidden] {
		margin-inline: 6px;
		opacity: 0.7;
	}

	h1 {
		font-size: var(--fs-section);
		letter-spacing: -0.04em;
		line-height: 1.05;
	}

	.eyebrow .ar {
		font-family: var(--font-arabic-display);
		font-size: 1.15em;
		letter-spacing: 0;
		text-transform: none;
	}

	.tagline {
		max-width: 32rem;
		font-size: var(--fs-lead);
		line-height: 1.45;
		opacity: 0.94;
	}

	.summary {
		margin-top: var(--s-2);
		padding: 8px 14px;
		border-radius: var(--r-pill);
		background: var(--page);
		color: var(--subject-ink);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
	}

	.start {
		display: grid;
		justify-items: center;
		gap: var(--s-3);
		width: 100%;
		margin-top: var(--s-4);
	}

	.prog {
		display: grid;
		gap: 8px;
		width: min(100%, 320px);
	}

	.bar {
		height: 6px;
		border-radius: var(--r-pill);
		background: rgba(255, 255, 255, 0.28);
		overflow: hidden;
	}

	.bar i {
		display: block;
		height: 100%;
		background: #fff;
	}

	.btn--on-band {
		background: var(--page);
		border-color: var(--page);
		color: var(--ink);
	}

	.btn--on-band:hover {
		background: var(--page);
		box-shadow: var(--shadow-2);
	}

	/* ---- Stages and rail ----------------------------------------------- */

	.rail {
		position: relative;
		display: grid;
		gap: var(--s-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The vertical line. */
	.rail::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 18px;
		width: 2px;
		background: var(--line-strong);
	}

	/* Stage marker sitting on the rail: small, not a heading (arriqaaqlabs). */
	.milestone {
		position: relative;
		z-index: 1;
		padding-block: var(--s-4) var(--s-1);
	}

	.milestone:first-child {
		padding-top: var(--s-6);
	}

	.milestone-pill {
		display: inline-flex;
		align-items: center;
		min-height: 30px;
		padding: 6px 14px;
		border-radius: var(--r-pill);
		background: var(--subject);
		color: var(--subject-on);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.stop {
		position: relative;
		display: grid;
		grid-template-columns: 38px 1fr;
		gap: 14px;
		align-items: start;
	}

	.node {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		margin-top: 18px;
		border: 2px solid var(--ink);
		border-radius: 50%;
		background: var(--page);
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: 11px;
		font-weight: 600;
	}

	.is-done .node {
		border-color: var(--subject);
		background: var(--subject);
		color: var(--subject-on);
		font-size: 15px;
	}

	.is-next .node {
		box-shadow: 0 0 0 4px var(--page), 0 0 0 6px var(--subject);
	}

	.lesson {
		display: grid;
	}

	.thumb {
		display: block;
		aspect-ratio: 3.6;
	}

	.lesson-body {
		display: grid;
		gap: 6px;
		padding: var(--s-4) var(--s-4) var(--s-4);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.state {
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.state.done {
		color: var(--subject-ink);
	}

	.state.next {
		color: var(--ink);
	}

	.t {
		font-size: 1.1875rem;
		font-weight: 500;
		line-height: 1.22;
		letter-spacing: -0.025em;
	}

	.x {
		font-size: var(--fs-small);
		color: var(--ink-2);
	}

	.meta {
		font-family: var(--font-sans);
		font-variant-numeric: tabular-nums;
		font-size: 10.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-3);
	}

	.is-next .lesson {
		box-shadow: inset 0 0 0 2px var(--subject);
	}

	/* Desktop: rail in the centre, cards alternate sides. */
	@media (min-width: 900px) {
		.rail {
			gap: 0;
		}

		.rail::before {
			left: 50%;
			transform: translateX(-1px);
		}

		.milestone {
			display: flex;
			justify-content: center;
			padding-block: var(--s-6) var(--s-4);
		}

		.stop {
			grid-template-columns: 1fr 64px 1fr;
			gap: 0;
			min-height: 150px;
		}

		.node {
			grid-column: 2;
			grid-row: 1;
			justify-self: center;
			margin-top: 40px;
		}

		.lesson {
			grid-row: 1;
			grid-column: 1;
			margin-bottom: -40px;
		}

		.stop.is-right .lesson {
			grid-column: 3;
		}

		.stop:last-child .lesson {
			margin-bottom: 0;
		}
	}

	/* ---- Outcome ----------------------------------------------------------- */

	.outcome {
		display: grid;
		justify-items: center;
		gap: var(--s-4);
		max-width: 44rem;
		margin: var(--s-8) auto 0;
		padding: var(--s-6) var(--s-5);
		border-radius: var(--r-lg);
		background: var(--surface);
		text-align: center;
	}

	.outcome .eyebrow {
		color: var(--subject-ink);
	}

	.outcome p {
		font-size: clamp(1.25rem, 1.1rem + 0.8vw, 1.625rem);
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.outcome .btn {
		white-space: normal;
	}
</style>
