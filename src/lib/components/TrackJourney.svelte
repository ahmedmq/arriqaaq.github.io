<script lang="ts">
	import type { Track } from '$lib/types';
	type Props = { track: Track; completed: number[] };
	let { track, completed }: Props = $props();

	const stations = [
		{ at: 1, label: 'Origins', x: 72, y: 224, role: 'book' },
		{ at: 5, label: 'Rulings', x: 205, y: 124, role: 'gate' },
		{ at: 9, label: 'Reasoning', x: 356, y: 192, role: 'scale' },
		{ at: 13, label: 'Sources', x: 506, y: 92, role: 'spring' },
		{ at: 17, label: 'Language', x: 654, y: 188, role: 'scroll' },
		{ at: 21, label: 'Deduction', x: 798, y: 92, role: 'lantern' }
	];
</script>

<section class="journey-board" aria-labelledby="journey-title">
	<header class="journey-board-head">
		<div><span class="journey-overline">Your study map</span><h2 id="journey-title">From roots to rulings</h2></div>
		<div class="journey-score"><strong>{completed.length}</strong><span>of {track.posts.length}<br />lessons gathered</span></div>
	</header>
	<div class="journey-map">
		<svg viewBox="0 0 880 300" role="img" aria-label="Six-stage illustrated route through the Usul al-Fiqh learning path">
			<path class="journey-hill hill-far" d="M0 191Q86 116 171 177T344 161T516 168T690 153T880 167V300H0Z" />
			<path class="journey-hill hill-near" d="M0 237Q105 176 222 229T454 219T672 232T880 203V300H0Z" />
			<path class="journey-route" d="M72 224C123 207 143 132 205 124S299 181 356 192 448 115 506 92 596 174 654 188 748 128 798 92" />
			{#each stations as station, i}
				<a href={`#lesson-${station.at}`} aria-label={`Go to lesson ${station.at}: ${station.label}`}>
					<g class="map-station" class:is-reached={completed.some((n) => n >= station.at)} transform={`translate(${station.x} ${station.y})`}>
						<circle class="station-pad" r="29" />
						{#if station.role === 'book'}
							<path d="M-20-13q20-7 20 6 0-13 20-6v29q-20-6-20 7 0-13-20-7z" />
						{:else if station.role === 'gate'}
							<path d="M-18 19V-12h36v31M-9 19V0Q0-12 9 0v19M-23-12h46" />
						{:else if station.role === 'scale'}
							<path d="M0-18v37M-19-11h38M-14-11l-8 18h16zM14-11L6 7h16zM-10 20h20" />
						{:else if station.role === 'spring'}
							<path d="M0-20c-14 18-18 24-18 31a18 18 0 0036 0C18 4 14-2 0-20zM-7 10q7-8 14 0" />
						{:else if station.role === 'scroll'}
							<path d="M-17-17h28q10 0 6 9v26h-28q-10 0-6-9v-26M-9-7H9M-9 1H9M-9 9H4" />
						{:else}
							<path d="M-12-8Q0-22 12-8v22h-24zM-17 14h34M0-24v-7M-22-16l-7-5M22-16l7-5" />
						{/if}
						<text y="47" text-anchor="middle">{i + 1} · {station.label}</text>
					</g>
				</a>
			{/each}
			<g class="map-flora"><path d="M23 271q4-31 14-44M31 249l-14-10M35 239l15-13M841 270q-1-34-14-51M835 244l17-14M829 235l-15-12" /><circle cx="37" cy="224" r="7"/><circle cx="826" cy="216" r="7"/></g>
		</svg>
	</div>
	<div class="journey-legend"><span><i class="legend-dot"></i>Station</span><span><i class="legend-dot is-done"></i>Reached</span><span>The route continues as lessons are added.</span></div>
</section>
