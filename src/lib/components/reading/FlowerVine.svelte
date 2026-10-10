<script lang="ts">
	// Reading progress along the bottom edge of the header (the LSM post's
	// "read road", with flowers instead of a truck). The stem grows as you
	// read; a flower sits at each section and blooms as you pass it; a bud
	// rides the tip and turns with your scroll. Also publishes the current
	// section to the header via $lib/reading.
	import { untrack } from 'svelte';
	import { reading, resetReading } from '$lib/reading.svelte';
	import Flower from '$lib/components/ui/Flower.svelte';

	type Props = { article: HTMLElement | undefined };
	let { article }: Props = $props();

	let progress = $state(0);
	let spin = $state(0);
	let marks = $state<{ f: number; text: string }[]>([]);

	$effect(() => {
		if (!article) return;
		const el = article;
		return untrack(() => track(el));
	});

	// Runs untracked: it writes the state it also reads, which must not
	// re-trigger the effect.
	function track(el: HTMLElement) {
		let heads: HTMLElement[] = [];
		let texts: string[] = [];
		let raf = 0;
		let lastY = window.scrollY;

		const measure = () => {
			heads = [...el.querySelectorAll<HTMLElement>('.prose h2')];
			const top = el.getBoundingClientRect().top + window.scrollY;
			const h = Math.max(1, el.offsetHeight);
			texts = heads.map((hd) => hd.textContent?.trim() ?? '');
			marks = heads.map((hd, i) => ({
				f: Math.min(0.98, Math.max(0.02, (hd.getBoundingClientRect().top + window.scrollY - top) / h)),
				text: texts[i]
			}));
			reading.total = heads.length;
		};

		const update = () => {
			raf = 0;
			const r = el.getBoundingClientRect();
			const vh = window.innerHeight;
			progress = Math.min(1, Math.max(0, (vh * 0.4 - r.top) / Math.max(1, r.height)));
			spin += (window.scrollY - lastY) * 0.9;
			lastY = window.scrollY;
			let idx = -1;
			for (let i = 0; i < heads.length; i++) if (heads[i].getBoundingClientRect().top < vh * 0.4) idx = i;
			reading.index = idx;
			reading.section = idx >= 0 ? (texts[idx] ?? '') : '';
			reading.past = r.top < 0;
		};
		const queue = () => (raf ||= requestAnimationFrame(update));

		measure();
		update();
		const ro = new ResizeObserver(() => {
			measure();
			queue();
		});
		ro.observe(el);
		window.addEventListener('scroll', queue, { passive: true });
		return () => {
			ro.disconnect();
			window.removeEventListener('scroll', queue);
			cancelAnimationFrame(raf);
			resetReading();
		};
	}
</script>

<div class="vine" aria-hidden="true" style:--p={progress}>
	<span class="stem"></span>
	<span class="stem-fill"></span>
	{#each marks as m}
		<span class="mark" style:left={`${m.f * 100}%`}>
			<Flower
				size={14}
				petal={progress >= m.f ? 'var(--subject, var(--pink))' : 'var(--line-strong)'}
				centre={progress >= m.f ? 'var(--amber)' : 'var(--line-strong)'}
				bloom={progress >= m.f ? 1 : 0.4}
			/>
		</span>
	{/each}
	<span class="bud" style:left={`calc(${progress} * (100% - 18px))`} style:transform={`rotate(${spin}deg)`}>
		<Flower size={18} petal="var(--subject, var(--pink))" />
	</span>
</div>

<style>
	.vine {
		position: fixed;
		top: calc(var(--topbar-h) - 9px);
		left: 0;
		right: 0;
		z-index: 51;
		height: 18px;
		pointer-events: none;
	}

	.stem,
	.stem-fill {
		position: absolute;
		left: 0;
		top: 8px;
		height: 2px;
	}

	.stem {
		right: 0;
		background: repeating-linear-gradient(90deg, var(--line-strong) 0 6px, transparent 6px 11px);
		opacity: 0.7;
	}

	.stem-fill {
		width: calc(var(--p) * 100%);
		background: var(--gradient-brand);
		border-radius: 2px;
	}

	.mark {
		position: absolute;
		top: 2px;
		transform: translateX(-50%);
	}

	.bud {
		position: absolute;
		top: 0;
		transition: left 90ms linear;
	}

	@media (prefers-reduced-motion: reduce) {
		.bud {
			transform: none !important;
			transition: none;
		}
	}
</style>
