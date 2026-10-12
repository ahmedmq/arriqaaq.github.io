<script lang="ts">
	// End-of-article prompt. A light floating pill that appears once the
	// reader reaches the last part of the article and stays to the very
	// bottom of the page, offering the next lesson (course lessons) or a way
	// back to the top.
	import { base } from '$app/paths';
	import type { CoursePlace } from '$lib/types';

	type Props = { article: HTMLElement | undefined; place: CoursePlace | null };
	let { article, place }: Props = $props();
	let visible = $state(false);

	$effect(() => {
		if (!article) return;
		const el = article;
		let raf = 0;
		const update = () => {
			raf = 0;
			const r = el.getBoundingClientRect();
			const vh = window.innerHeight;
			const read = (vh - r.top) / Math.max(1, r.height); // 1 = bottom of article on screen
			// Step aside while an interactive widget sits behind the pill, so its
			// controls stay tappable on phones.
			const blocked = [...el.querySelectorAll<HTMLElement>('[data-widget]')].some((w) => {
				const b = w.getBoundingClientRect();
				return b.bottom > vh - 120 && b.top < vh;
			});
			visible = read > 0.85 && !blocked;
		};
		const queue = () => (raf ||= requestAnimationFrame(update));
		update();
		window.addEventListener('scroll', queue, { passive: true });
		window.addEventListener('resize', queue);
		return () => {
			window.removeEventListener('scroll', queue);
			window.removeEventListener('resize', queue);
			cancelAnimationFrame(raf);
		};
	});

	function toTop() {
		window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	}
</script>

<div class="pill" class:is-visible={visible} aria-hidden={!visible}>
	{#if place?.next}
		<a class="next" href={`${base}/${place.next.slug}/`} tabindex={visible ? 0 : -1}>
			<span class="txt">
				<span class="eyebrow">Up next · Lesson {place.next.n}</span>
				<span class="t">{place.next.title}</span>
			</span>
			<span class="go" aria-hidden="true">→</span>
		</a>
	{:else}
		<button class="next" onclick={toTop} tabindex={visible ? 0 : -1}>
			<span class="txt">
				<span class="eyebrow">{place ? 'Course complete' : 'You reached the end'}</span>
				<span class="t">Back to the top</span>
			</span>
			<span class="go" aria-hidden="true">↑</span>
		</button>
	{/if}
</div>

<style>
	.pill {
		position: fixed;
		left: 50%;
		bottom: calc(14px + env(safe-area-inset-bottom));
		z-index: 40;
		width: min(420px, calc(100vw - 2 * var(--gutter)));
		transform: translate(-50%, calc(100% + 32px));
		opacity: 0;
		transition:
			transform var(--dur-slow) var(--ease-out),
			opacity var(--dur) ease;
		pointer-events: none;
	}

	.pill.is-visible {
		transform: translate(-50%, 0);
		opacity: 1;
		pointer-events: auto;
	}

	.next {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		width: 100%;
		padding: 10px 10px 10px 18px;
		border: 0;
		border-radius: var(--r-pill);
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow:
			inset 0 0 0 1px var(--line),
			0 12px 32px -12px rgba(13, 12, 19, 0.25);
		color: var(--ink);
		text-align: left;
		text-decoration: none;
	}

	.txt {
		display: grid;
		gap: 1px;
		min-width: 0;
		flex: 1;
	}

	.eyebrow {
		font-size: 11px;
	}

	.t {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--fs-small);
		font-weight: 500;
	}

	.go {
		display: grid;
		place-items: center;
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--subject, var(--purple));
		color: var(--subject-on, #fff);
		font-weight: 600;
		transition: transform var(--dur) var(--ease-out);
	}

	.next:hover .go {
		transform: translateX(3px);
	}
</style>
