<script lang="ts">
	// Landing hero. The title is revealed by a grid of palette blocks that
	// clear in a random order (SurrealDB's pixel-title transition). Pure CSS,
	// so it also plays without JS; reduced motion skips it.
	import { base } from '$app/paths';
	import { rng } from '$lib/art';
	import HeroTree from './HeroTree.svelte';

	const COLS = 12;
	const ROWS = 4;
	const tones = ['var(--pink)', 'var(--purple)', 'var(--blue)', 'var(--amber)', 'var(--green)'];
	const rand = rng('arriqaaq-hero');
	const blocks = Array.from({ length: COLS * ROWS }, () => ({
		c: tones[Math.floor(rand() * tones.length)],
		d: Math.round(rand() * 650)
	}));
</script>

<section class="hero">
	<div class="wrap inner">
		<span class="eyebrow eyebrow--quiet eyebrow--dot">The deen, from first principles</span>
		<h1 class="title">
			<span class="text">Roots before branches<span class="stop">.</span></span>
			<span class="pixels" aria-hidden="true" style:--cols={COLS} style:--rows={ROWS}>
				{#each blocks as b}<i style:--c={b.c} style:--d={`${b.d}ms`}></i>{/each}
			</span>
		</h1>
		<p class="lede">An online creative space for authentic Islamic courses, articles, crafts, education and technology.</p>
		<div class="cta">
			<a class="btn" href={`${base}/courses/usul-al-fiqh/`}>Start Usul al-Fiqh <span class="arrow">→</span></a>
			<a class="btn btn--ghost" href="#subjects">Explore the subjects</a>
		</div>
		<HeroTree />
	</div>
</section>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		padding-block: clamp(56px, 12vw, 140px) clamp(16px, 3vw, 40px);
		text-align: center;
	}

	.inner {
		display: grid;
		justify-items: center;
		gap: var(--s-5);
	}

	.title {
		position: relative;
		max-width: 12ch;
		font-size: var(--fs-display);
		line-height: var(--lh-display);
		letter-spacing: var(--ls-display);
		font-weight: 500;
	}

	.stop {
		color: var(--pink);
	}

	.pixels {
		position: absolute;
		inset: -0.06em -0.04em;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		pointer-events: none;
	}

	.pixels i {
		background: var(--c);
		box-shadow: 0 0 0 1px var(--c);
		opacity: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.pixels i {
			opacity: 1;
			animation: pixel-off 1ms steps(1, end) both;
			animation-delay: calc(var(--d) + 250ms);
		}
	}

	@keyframes pixel-off {
		to {
			opacity: 0;
		}
	}

	.lede {
		max-width: 36rem;
		font-size: var(--fs-lead);
		line-height: 1.55;
		color: var(--ink-2);
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-3);
		margin-top: var(--s-2);
	}

	/* Phones: full-width stacked buttons are easier to hit with a thumb. */
	@media (max-width: 479px) {
		.cta {
			display: grid;
			width: 100%;
		}
	}
</style>
