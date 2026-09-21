<script lang="ts">
	import { base } from '$app/paths';
	import type { Track } from '$lib/types';
	type Props = { track: Track };
	let { track }: Props = $props();
</script>

<a class="track-card" href={`${base}/track/${track.slug}/`} style:--track-color={track.color} style:--track-accent={track.accent}>
	<div class="track-card-copy">
		<span class="track-kicker">{track.eyebrow}</span>
		<h3>{track.title}</h3>
		<p>{track.description}</p>
		<span class="track-cta">Follow the path <span aria-hidden="true">→</span></span>
	</div>
	<div class="track-card-map" aria-hidden="true">
		<svg viewBox="0 0 260 170">
			<path class="mini-hills" d="M0 128q45-42 92-5t87-9q40-41 81-2v58H0z" />
			<path d="M20 144C48 118 42 75 88 69c40-5 39 45 79 35 25-6 30-43 73-69" />
			{#each track.posts.slice(0, 6) as _, i}
				<circle cx={[21, 65, 108, 150, 193, 239][i]} cy={[143, 92, 74, 105, 76, 35][i]} r={i === 0 ? 9 : 7} />
			{/each}
		</svg>
		<span>{track.posts.length} lessons · 6 stations</span>
	</div>
</a>
