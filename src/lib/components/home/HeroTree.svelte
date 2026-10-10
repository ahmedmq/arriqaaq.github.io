<script lang="ts">
	// "Roots before branches", acted out under the hero: the roots draw
	// downward first, then the branches grow upward level by level, then small
	// brand flowers bloom at the tips. A standalone emblem below the buttons,
	// never behind text. Starts when it scrolls into view. Deterministic
	// (seeded) and rendered at build time; with reduced motion it is drawn.
	import { reveal } from '$lib/actions';
	import { rng, flowerPetals } from '$lib/art';

	const W = 900;
	const H = 620;
	const GROUND = 430; // y of the ground line
	const CX = W / 2;

	type Seg = { d: string; depth: number; kind: 'root' | 'branch' };
	type Tip = { x: number; y: number; c: string; delay: number; s: number };

	const rand = rng('arriqaaq-roots-before-branches');
	const segs: Seg[] = [];
	const tips: Tip[] = [];
	const TIP_COLORS = ['var(--pink)', 'var(--purple)', 'var(--blue)', 'var(--amber)', 'var(--green)'];

	// Gently curved segment from (x,y) at angle a (radians) with length len.
	function grow(x: number, y: number, a: number, len: number, depth: number, max: number, kind: 'root' | 'branch') {
		const x2 = x + Math.cos(a) * len;
		const y2 = y + Math.sin(a) * len;
		const bend = (rand() - 0.5) * len * 0.35;
		const mx = (x + x2) / 2 + Math.cos(a + Math.PI / 2) * bend;
		const my = (y + y2) / 2 + Math.sin(a + Math.PI / 2) * bend;
		segs.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, depth, kind });
		if (depth >= max) {
			if (kind === 'branch' && rand() < 0.75) {
				tips.push({ x: x2, y: y2, c: TIP_COLORS[tips.length % TIP_COLORS.length], delay: depth, s: 0.7 + rand() * 0.6 });
			}
			return;
		}
		const kids = kind === 'branch' ? (rand() < 0.3 ? 3 : 2) : rand() < 0.5 ? 2 : 3;
		const spread = kind === 'branch' ? 0.5 + rand() * 0.2 : 0.62 + rand() * 0.25;
		for (let i = 0; i < kids; i++) {
			const t = i / (kids - 1) - 0.5;
			const na = a + t * spread * 2 + (rand() - 0.5) * 0.18;
			const nl = len * (kind === 'branch' ? 0.74 + rand() * 0.08 : 0.68 + rand() * 0.1);
			grow(x2, y2, na, nl, depth + 1, max, kind);
		}
	}

	// Trunk, then branches upward and roots downward from the ground.
	segs.push({ d: `M${CX} ${GROUND} L${CX} ${GROUND - 34}`, depth: 0, kind: 'branch' });
	grow(CX, GROUND - 34, -Math.PI / 2, 74, 1, 6, 'branch');
	grow(CX, GROUND, Math.PI / 2, 52, 1, 5, 'root');

	// Tight viewBox around everything drawn (plus room for flowers).
	const nums = segs.flatMap((sg) => (sg.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number));
	const xs = nums.filter((_, i) => i % 2 === 0);
	const ys = nums.filter((_, i) => i % 2 === 1);
	const PAD = 14;
	const vx = Math.floor(Math.min(...xs) - PAD);
	const vy = Math.floor(Math.min(...ys) - PAD);
	const vw = Math.ceil(Math.max(...xs) - vx + PAD);
	const vh = Math.ceil(Math.max(...ys) - vy + PAD);

	// Timing: roots first (0.2s–1.4s), then branches level by level, then flowers.
	const delayOf = (s: Seg) => (s.kind === 'root' ? 0.2 + s.depth * 0.28 : 1.3 + s.depth * 0.26);
	const petals = flowerPetals(3.2);
</script>

<svg class="tree" viewBox="{vx} {vy} {vw} {vh}" aria-hidden="true" use:reveal>
	<line class="ground" x1={CX - 220} y1={GROUND} x2={CX + 220} y2={GROUND} pathLength="1" />
	{#each segs as s}
		<path
			class="seg {s.kind}"
			d={s.d}
			pathLength="1"
			style:--d={`${delayOf(s)}s`}
			style:stroke-width={s.kind === 'root' ? Math.max(0.8, 2.2 - s.depth * 0.35) : Math.max(0.8, 2.6 - s.depth * 0.3)}
		/>
	{/each}
	{#each tips as t}
		<g class="tip" style:--d={`${1.3 + t.delay * 0.26 + 0.35}s`} transform="translate({t.x.toFixed(1)} {t.y.toFixed(1)}) scale({t.s.toFixed(2)})">
			<g class="bloom">
				{#each petals as p}<circle cx={p.cx} cy={p.cy} r={p.r} style:fill={t.c} />{/each}
				<circle r="2.1" style:fill="var(--amber)" />
			</g>
		</g>
	{/each}
</svg>

<style>
	/* A real feature, not a footnote: nearly edge to edge on phones,
	   about 600px on desktop. */
	.tree {
		--tw: min(620px, calc(100vw - 16px));
		display: block;
		width: var(--tw);
		height: auto;
		/* Symmetric negative margins centre it even when it is wider than the
		   text column (phones), instead of overflowing to the right. */
		justify-self: center;
		margin: var(--s-6) calc((100% - var(--tw)) / 2) 0;
	}

	/* Desktop: size by HEIGHT, as large as fits in one view below the header
	   (window minus header and breathing room), capped at 680px. Big, but
	   never split across the fold. Phones keep the width-based sizing above. */
	@media (min-width: 720px) {
		.tree {
			--th: min(calc(100svh - var(--topbar-h) - 96px), 680px);
			width: auto;
			height: var(--th);
			max-width: 100%;
			margin: var(--s-6) auto 0;
		}
		pointer-events: none;
		overflow: visible;
	}

	.seg {
		fill: none;
		stroke-linecap: round;
	}

	.branch {
		stroke: var(--ink-3);
	}

	.root {
		stroke: var(--purple);
	}

	.ground {
		stroke: var(--line);
		stroke-width: 1;
	}

	.bloom {
		transform-box: fill-box;
		transform-origin: center;
	}

	@media (prefers-reduced-motion: no-preference) {
		.seg,
		.ground {
			stroke-dasharray: 1;
			stroke-dashoffset: 1;
		}

		.tree:global(.is-in) .seg,
		.tree:global(.is-in) .ground {
			animation: draw 0.9s var(--ease-soft) forwards;
			animation-delay: var(--d, 0s);
		}

		.ground {
			animation-duration: 0.6s;
		}

		.bloom {
			transform: scale(0);
		}

		.tree:global(.is-in) .bloom {
			animation: bloom 0.6s var(--ease-out) forwards;
			animation-delay: var(--d, 0s);
		}
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes bloom {
		to {
			transform: scale(1);
		}
	}
</style>
