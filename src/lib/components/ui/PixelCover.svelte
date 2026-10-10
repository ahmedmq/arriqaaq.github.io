<script lang="ts">
	// Pixel-field cover (the arriqaaqlabs roadmap cards): a grid of rounded
	// blocks that thickens toward one corner, on a grey ground. Solid fills
	// only: the subject colour, ink, or a neutral grey. Deterministic from
	// `seed`, so it renders identically at build time and in the browser.
	import { rng } from '$lib/art';
	import type { Subject } from '$lib/types';

	type Props = { seed: string; subject: Subject; cols?: number; rows?: number; ratio?: number };
	let { seed, subject, cols = 14, rows = 4, ratio = 3.2 }: Props = $props();

	const W = 480;
	const H = $derived(Math.round(W / ratio));
	const cells = $derived.by(() => {
		const rand = rng(seed);
		const cell = Math.min(W / cols, H / rows);
		const pad = cell * 0.14;
		const s = cell - pad * 2;
		const ox = (W - cols * cell) / 2;
		const oy = (H - rows * cell) / 2;
		const corner = Math.floor(rand() * 4);
		const out: { x: number; y: number; s: number; dot: boolean; tone: string }[] = [];
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) {
				const fx = corner % 2 === 0 ? c / (cols - 1) : 1 - c / (cols - 1);
				const fy = corner < 2 ? 1 - r / (rows - 1) : r / (rows - 1);
				const d = Math.pow(fx * 0.62 + fy * 0.38, 1.6);
				if (rand() > d * 1.05) continue;
				const dot = rand() < 0.12;
				const t = rand();
				const tone = t < d * 0.9 ? 'var(--subject)' : t < d * 0.9 + 0.06 ? 'var(--ink)' : 'var(--line-strong)';
				out.push({ x: ox + c * cell + pad, y: oy + r * cell + pad, s, dot, tone });
			}
		return out;
	});
</script>

<svg class="pixel subject--{subject}" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
	<rect width={W} height={H} style:fill="var(--surface)" />
	{#each cells as c}
		{#if c.dot}
			<circle cx={c.x + c.s / 2} cy={c.y + c.s / 2} r={c.s * 0.32} style:fill={c.tone} />
		{:else}
			<rect x={c.x} y={c.y} width={c.s} height={c.s} rx={c.s * 0.22} style:fill={c.tone} />
		{/if}
	{/each}
</svg>

<style>
	.pixel {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
