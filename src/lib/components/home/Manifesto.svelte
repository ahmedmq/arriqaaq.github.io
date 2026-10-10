<script lang="ts">
	// Scroll-lit manifesto (SurrealDB stop-choosing). The stage pins while you
	// scroll; words light up in reading order, accent words turn pink, then the
	// answer lands. Without JS or with reduced motion everything is shown lit.
	type Word = { t: string; accent?: boolean };
	const raw =
		'*Courses.* *Articles.* *Crafts.* *Technology.* One creative space, rooted in';
	// "*the text*" marks an accent run that may span several words.
	let inAccent = false;
	const words: Word[] = raw.split(' ').map((x) => {
		if (x.startsWith('*')) inAccent = true;
		const w = { t: x.replace(/\*/g, ''), accent: inAccent };
		if (/\*\.?$/.test(x)) inAccent = false;
		return w;
	});

	let hold: HTMLElement | undefined = $state();
	let lit = $state(words.length);
	let answered = $state(true);
	let live = $state(false);

	$effect(() => {
		if (!hold || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		live = true;
		let raf = 0;
		const update = () => {
			raf = 0;
			const r = hold!.getBoundingClientRect();
			const span = r.height - window.innerHeight;
			const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
			lit = Math.round(Math.min(1, p / 0.78) * words.length);
			answered = p > 0.84;
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
</script>

<section class="manifesto" class:is-live={live} bind:this={hold} aria-label="What Arriqaaq is">
	<div class="stage">
		<div class="wrap stack">
			<p class="words" class:is-dim={answered && live}>
				{#each words as w, i}
					<span class="w" class:lit={i < lit} class:accent={w.accent}>{w.t}</span>{' '}
				{/each}
			</p>
			<p class="answer" class:is-on={answered} aria-hidden={!answered}>Islam<span>.</span></p>
		</div>
	</div>
</section>

<style>
	.manifesto {
		position: relative;
	}

	.manifesto.is-live {
		height: 200svh;
	}

	.stage {
		display: flex;
		align-items: center;
		min-height: calc(100svh - var(--topbar-h));
		padding-block: var(--s-8);
	}

	.is-live .stage {
		position: sticky;
		top: var(--topbar-h);
		height: calc(100svh - var(--topbar-h));
		padding-block: 0;
		overflow: hidden;
	}

	.stack {
		display: grid;
		place-items: center;
	}

	.stack > * {
		grid-area: 1 / 1;
	}

	.words {
		max-width: 16ch;
		font-size: clamp(2rem, 1.2rem + 4.4vw, 4.5rem);
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.035em;
		text-align: center;
		text-wrap: balance;
		transition:
			opacity var(--dur-slow) var(--ease-out),
			transform var(--dur-slow) var(--ease-out);
	}

	.w {
		transition: color var(--dur) ease;
	}

	.is-live .w {
		color: #d6d4df;
	}

	.is-live .w.lit,
	.w {
		color: var(--ink);
	}

	.w.accent,
	.is-live .w.accent.lit {
		color: var(--pink);
	}

	.is-live .w.accent:not(.lit) {
		color: #d6d4df;
	}

	.words.is-dim {
		opacity: 0;
		transform: scale(0.96);
	}

	.answer {
		font-size: clamp(5rem, 2rem + 18vw, 14rem);
		font-weight: 500;
		line-height: 0.9;
		letter-spacing: -0.05em;
		opacity: 0;
		transform: scale(0.94);
		transition:
			opacity var(--dur) var(--ease-soft),
			transform var(--dur-slow) var(--ease-out);
		pointer-events: none;
	}

	.answer span {
		color: var(--pink);
	}

	.answer.is-on {
		opacity: 1;
		transform: none;
	}

	/* No JS: show the sentence, then the answer underneath it. */
	.manifesto:not(.is-live) .stack {
		gap: var(--s-6);
	}

	.manifesto:not(.is-live) .stack > * {
		grid-area: auto;
	}
</style>
