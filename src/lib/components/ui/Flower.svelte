<script lang="ts">
	// The Arriqaaq flower: five round petals around a gold centre.
	// `bloom` (0..1) scales the petals open, used by the reading progress vine.
	import { flowerPetals } from '$lib/art';

	type Props = { size?: number; petal?: string; centre?: string; bloom?: number; class?: string };
	let {
		size = 20,
		petal = 'var(--pink)',
		centre = 'var(--amber)',
		bloom = 1,
		class: cls = ''
	}: Props = $props();
	const petals = flowerPetals(3.2);
</script>

<svg class={cls} width={size} height={size} viewBox="-9 -9 18 18" aria-hidden="true">
	<g style:transform={`scale(${0.35 + 0.65 * bloom}) rotate(${(1 - bloom) * -40}deg)`} style:transition="transform var(--dur) var(--ease-out)">
		{#each petals as p}
			<circle cx={p.cx} cy={p.cy} r={p.r} style:fill={petal} />
		{/each}
	</g>
	<circle r="2.1" style:fill={centre} />
</svg>
