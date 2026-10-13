<script lang="ts">
	// End-of-lesson block: mark complete (saved in this browser), then the
	// previous and next lessons and a link back to the course roadmap.
	import { base } from '$app/paths';
	import type { CoursePlace } from '$lib/types';
	import { isDone, setDone, onProgress, doneSet } from '$lib/progress';
	import { track } from '$lib/analytics';

	type Props = { place: CoursePlace; slug: string };
	let { place, slug }: Props = $props();

	let done = $state(false);
	$effect(() => {
		const sync = () => (done = isDone(slug));
		sync();
		return onProgress(sync);
	});

	const isLast = $derived(!place.next);

	// Course funnel for analytics: tutorial_begin (first lesson marked in this
	// course), lesson_complete, tutorial_complete (every lesson marked).
	function toggle() {
		const next = !done;
		const lessons = place.course.modules.flatMap((m) => m.lessons.map((l) => l.slug));
		const before = lessons.filter((l) => doneSet().has(l)).length;
		setDone(slug, next);
		if (!next) return;
		const params = { course_id: place.course.slug, lesson_id: slug, lesson_number: place.lesson.n };
		if (before === 0) track('tutorial_begin', params);
		track('lesson_complete', params);
		if (before + 1 === lessons.length) track('tutorial_complete', params);
	}
</script>

<section class="lesson-nav subject--{place.course.subject}" aria-label="Course navigation">
	<div class="done-row">
		<div>
			<span class="eyebrow">Lesson {place.lesson.n} of {place.course.lesson_count}</span>
			<p>{done ? 'Marked complete. It will show as done on the roadmap.' : 'Finished reading? Mark it to track your route.'}</p>
		</div>
		<button class={done ? 'btn btn--ghost' : 'btn btn--subject'} aria-pressed={done} onclick={toggle}>
			{#if done}<span aria-hidden="true">✓</span> Completed{:else}Mark as complete{/if}
		</button>
	</div>

	<div class="pn">
		{#if place.prev}
			<a class="card pn-card" href={`${base}/${place.prev.slug}/`}>
				<span class="eyebrow">← Previous · Lesson {place.prev.n}</span>
				<span class="t">{place.prev.title}</span>
			</a>
		{/if}
		{#if place.next}
			<a class="card pn-card pn-next" href={`${base}/${place.next.slug}/`}>
				<span class="eyebrow">Next · Lesson {place.next.n} →</span>
				<span class="t">{place.next.title}</span>
			</a>
		{:else}
			<a class="card pn-card pn-next" href={`${base}/courses/${place.course.slug}/`}>
				<span class="eyebrow">Course complete</span>
				<span class="t">Back to the roadmap</span>
			</a>
		{/if}
	</div>

	{#if !isLast}
		<a class="roadmap-link" href={`${base}/courses/${place.course.slug}/`}>View the full roadmap · {place.course.title}</a>
	{/if}
</section>

<style>
	.lesson-nav {
		display: grid;
		gap: var(--s-4);
		max-width: calc(var(--measure) + 2 * var(--gutter));
		margin: var(--s-7) auto 0;
		padding-inline: var(--gutter);
	}

	.done-row {
		display: grid;
		gap: var(--s-4);
		padding: var(--s-5);
		border-radius: var(--r-lg);
		background: var(--surface);
	}

	.done-row .eyebrow {
		color: var(--subject-ink);
	}

	.done-row p {
		margin-top: 6px;
		font-size: var(--fs-small);
		color: var(--ink-2);
	}

	.pn {
		display: grid;
		gap: var(--s-3);
	}

	.pn-card {
		display: grid;
		gap: 6px;
		padding: var(--s-4) var(--s-5);
	}

	.pn-card .t {
		font-weight: 500;
		line-height: 1.3;
	}

	.pn-next {
		box-shadow: inset 0 0 0 1.5px var(--subject);
	}

	a.pn-next:hover {
		box-shadow: inset 0 0 0 1.5px var(--subject), var(--shadow-1);
	}

	.pn-card .eyebrow {
		color: var(--ink-3);
	}

	.pn-next .eyebrow {
		color: var(--subject-ink);
	}

	.roadmap-link {
		justify-self: center;
		padding-block: var(--s-3);
		font-size: var(--fs-small);
		color: var(--ink-2);
		text-underline-offset: 3px;
	}

	@media (min-width: 640px) {
		.done-row {
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		.pn {
			grid-template-columns: 1fr 1fr;
		}

		.pn-next:only-child {
			grid-column: 2;
		}

		.pn-next {
			text-align: right;
		}
	}
</style>
