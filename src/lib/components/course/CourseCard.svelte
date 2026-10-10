<script lang="ts">
	// Course summary card. White, hairline border, no colour block: the title
	// and Arabic name, the promise, the stages as STEP rows (38labs), the
	// reader's own progress (localStorage) and two actions.
	import { base } from '$app/paths';
	import type { Course } from '$lib/types';
	import { doneSet, onProgress } from '$lib/progress';
	import PixelCover from '$lib/components/ui/PixelCover.svelte';

	type Props = { course: Course };
	let { course }: Props = $props();

	const slugs = $derived(course.modules.flatMap((m) => m.lessons.map((l) => l.slug)));
	let done = $state(0);
	let nextSlug = $state('');
	$effect(() => {
		const count = () => {
			const set = doneSet();
			done = slugs.filter((s) => set.has(s)).length;
			nextSlug = slugs.find((s) => !set.has(s)) ?? slugs[0];
		};
		count();
		return onProgress(count);
	});
	const hours = $derived(Math.max(1, Math.round(course.minutes / 60)));
	const href = $derived(`${base}/${nextSlug || slugs[0]}/`);
</script>

<article class="course-card subject--{course.subject}">
	<div class="cover"><PixelCover seed={course.slug} subject={course.subject} cols={18} rows={4} ratio={4.2} /></div>
	<div class="intro">
		<span class="eyebrow">Course · {course.lesson_count} lessons · about {hours} hours</span>
		<h3>
			{course.title}
			{#if course.arabic}<span class="ar" lang="ar" dir="rtl">{course.arabic}</span>{/if}
		</h3>
		<p class="tagline">{course.tagline}</p>

		{#if done > 0}
			<div class="progress" aria-label={`${done} of ${course.lesson_count} lessons complete`}>
				<span class="bar"><i style:width={`${(100 * done) / course.lesson_count}%`}></i></span>
				<span class="count">{done} of {course.lesson_count} done</span>
			</div>
		{/if}

		<div class="actions">
			<a class="btn" href={`${base}/courses/${course.slug}/`}>Open the roadmap <span class="arrow">→</span></a>
			<a class="btn btn--ghost" {href}>{done > 0 ? 'Continue' : 'Start lesson 1'}</a>
		</div>
	</div>

	<ol class="steps" aria-label="Course steps">
		{#each course.modules as m, i}
			<li>
				<span class="eyebrow">Step {String(i + 1).padStart(2, '0')}</span>
				<span class="step-t">{m.title}</span>
				<span class="step-n">{m.lessons.length} lessons</span>
			</li>
		{/each}
	</ol>
</article>

<style>
	.cover {
		margin: calc(-1 * var(--s-5)) calc(-1 * var(--s-5)) 0;
		aspect-ratio: 4.2;
		border-radius: var(--r-lg) var(--r-lg) 0 0;
		overflow: hidden;
	}

	.course-card {
		display: grid;
		gap: var(--s-6);
		padding: var(--s-5);
		overflow: hidden;
		border-radius: var(--r-lg);
		background: var(--page);
		box-shadow: inset 0 0 0 1px var(--line);
	}

	.intro {
		display: grid;
		align-content: start;
		gap: var(--s-4);
	}

	h3 {
		display: grid;
		gap: 4px;
		font-size: var(--fs-h2);
		letter-spacing: -0.03em;
	}

	.ar {
		font-family: var(--font-arabic-display);
		font-weight: 500;
		font-size: 0.8em;
		letter-spacing: 0;
		color: var(--ink-3);
		justify-self: start;
	}

	.tagline {
		color: var(--ink-2);
		max-width: 34rem;
	}

	.steps {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--line);
	}

	.steps li {
		display: grid;
		grid-template-columns: 4.6rem 1fr auto;
		align-items: baseline;
		gap: var(--s-3);
		padding: 14px 0;
		border-bottom: 1px solid var(--line);
	}

	.steps .eyebrow {
		font-size: 11px;
	}

	.step-t {
		font-weight: 500;
	}

	.step-n {
		font-size: var(--fs-xs);
		color: var(--ink-3);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.progress {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--s-3);
		max-width: 26rem;
	}

	.bar {
		height: 4px;
		border-radius: var(--r-pill);
		background: var(--line);
		overflow: hidden;
	}

	.bar i {
		display: block;
		height: 100%;
		background: var(--subject);
	}

	.count {
		font-size: var(--fs-xs);
		color: var(--ink-3);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		margin-top: var(--s-2);
	}

	@media (max-width: 479px) {
		.actions {
			display: grid;
		}
	}

	@media (min-width: 900px) {
		.course-card {
			grid-template-columns: 1fr 1fr;
			gap: var(--s-6) var(--s-8);
			padding: var(--s-7);
		}

		.cover {
			grid-column: 1 / -1;
			margin: calc(-1 * var(--s-7)) calc(-1 * var(--s-7)) 0;
			aspect-ratio: 7;
		}
	}
</style>
