<script lang="ts">
	// Scroll-lit manifesto (SurrealDB stop-choosing), without pinning: as the
	// section scrolls through the screen, words light up in reading order,
	// accent words turn pink, then the answer appears right under the
	// sentence. No pinned stage, so no empty screen before or after it.
	// Without JS or with reduced motion everything is shown lit.
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

	// The answer cycles through "Islam" in several languages (SurrealDB's
	// "Stop choosing / Deja de elegir"). Reduced motion: English only.
	const LANGS: { t: string; lang: string; dir?: 'rtl' }[] = [
		{ t: 'Islam', lang: 'en' },
		{ t: 'الإسلام', lang: 'ar', dir: 'rtl' },
		{ t: 'İslam', lang: 'tr' },
		{ t: 'اسلام', lang: 'ur', dir: 'rtl' },
		{ t: 'ইসলাম', lang: 'bn' },
		{ t: 'इस्लाम', lang: 'hi' },
		{ t: 'Ислам', lang: 'ru' },
		{ t: '伊斯兰教', lang: 'zh' },
		{ t: 'Uislamu', lang: 'sw' },
		{ t: 'イスラム', lang: 'ja' }
	];
	let langIdx = $state(0);

	$effect(() => {
		if (!answered || !live) {
			langIdx = 0;
			return;
		}
		const id = setInterval(() => (langIdx = (langIdx + 1) % LANGS.length), 1100);
		return () => clearInterval(id);
	});
	const word = $derived(LANGS[langIdx]);

	$effect(() => {
		if (!hold || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		live = true;
		let raf = 0;
		const update = () => {
			raf = 0;
			// 0 when the section's top reaches 85% down the screen, 1 when it
			// reaches 25%: the sentence lights up while it is comfortably in view.
			const r = hold!.getBoundingClientRect();
			const vh = window.innerHeight;
			const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.6)));
			lit = Math.round(Math.min(1, p / 0.8) * words.length);
			answered = p > 0.9;
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
		<div class="wrap stack">
			<p class="words">
				{#each words as w, i}
					<span class="w" class:lit={i < lit} class:accent={w.accent}>{w.t}</span>{' '}
				{/each}
			</p>
			<p class="answer" class:is-on={answered} aria-hidden={!answered}>
				<span class="sr-only">Islam.</span>
				{#key langIdx}
					<span class="word" lang={word.lang} dir={word.dir} aria-hidden="true">{word.t}</span>
				{/key}<span class="stop" aria-hidden="true">.</span>
			</p>
		</div>
</section>

<style>
	.manifesto {
		position: relative;
		padding-block: var(--s-7) var(--s-6);
	}

	.stack {
		display: grid;
		justify-items: center;
		gap: var(--s-2);
	}

	.words {
		max-width: 16ch;
		font-size: clamp(2rem, 1.2rem + 4.4vw, 4.5rem);
		font-weight: 500;
		line-height: 1.08;
		letter-spacing: -0.035em;
		text-align: center;
		text-wrap: balance;
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

	/* A fixed-height line with room above: taller scripts (Arabic, Bengali,
	   Devanagari) must not ride up into "rooted in", and the page must not
	   jump as the word changes. */
	.answer {
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		height: 1.25em;
		margin-top: 0.12em;
		line-height: 1.25 !important;
	}

	.answer .stop {
		color: var(--pink);
	}

	.answer .word {
		display: inline-block;
		animation: word-in 0.5s var(--ease-out) both;
	}

	.answer .word:is([lang='ar'], [lang='ur']) {
		font-size: 0.86em;
		font-family: var(--font-arabic-display);
		font-weight: 600;
		letter-spacing: 0;
		line-height: 1.1;
	}

	.answer .word:is([lang='zh'], [lang='ja'], [lang='bn'], [lang='hi']) {
		font-size: 0.72em;
		letter-spacing: 0;
		font-weight: 600;
	}

	@keyframes word-in {
		from {
			opacity: 0;
			transform: translateY(0.12em);
			filter: blur(6px);
		}
	}

	.answer.is-on {
		opacity: 1;
		transform: none;
	}

</style>
