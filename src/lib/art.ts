/**
 * Small art helpers: a seeded random generator (for the hero pixel reveal
 * and the roadmap band) and the brand flower's petal geometry.
 */

/** mulberry32 over a string hash: tiny, fast, good enough for layout noise. */
export function rng(seed: string): () => number {
	let h = 1779033703 ^ seed.length;
	for (let i = 0; i < seed.length; i++) {
		h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	let a = h >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Five-petal flower centred on (0,0) with petal radius r. Returned as SVG
 * circle descriptors so callers can colour petals and centre separately.
 */
export function flowerPetals(r: number): { cx: number; cy: number; r: number }[] {
	const d = r * 1.18;
	return Array.from({ length: 5 }, (_, i) => {
		const a = (-90 + i * 72) * (Math.PI / 180);
		return { cx: +(Math.cos(a) * d).toFixed(2), cy: +(Math.sin(a) * d).toFixed(2), r };
	});
}
