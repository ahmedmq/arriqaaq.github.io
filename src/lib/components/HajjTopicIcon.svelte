<script lang="ts">
	type Props = { name: string; index?: number };
	let { name, index = 0 }: Props = $props();
	const key = $derived(name.toLowerCase());
	const kind = $derived(
		key.includes('fiqh') ? 'scales' : key.includes('book') ? 'book' :
		key.includes('podcast') ? 'radio' : key.includes('event') ? 'tent' :
		key === 'islam' ? 'kaaba' : key.includes('competition') ? 'trophy' :
		key.includes('lifestyle') ? 'palm' : key.includes('covid') ? 'kit' :
		['book', 'tent', 'palm', 'lantern'][index % 4]
	);
</script>

<svg class="topic-icon" viewBox="0 0 120 92" aria-hidden="true">
	<path class="ground" d="M8 80q26-14 51 0t53-2" />
	{#if kind === 'scales'}
		<path d="M60 15v58M38 27h44M60 16l-8 8M60 16l8 8M38 29L23 56h30zm44 0L67 56h30z" />
		<path class="fill yellow" d="M23 56h30q-3 15-15 15T23 56zm44 0h30q-3 15-15 15T67 56z" />
	{:else if kind === 'book'}
		<path class="fill sky" d="M14 27q24-7 44 8v43q-20-15-44-8zm92 0q-24-7-44 8v43q20-15 44-8z" />
		<path d="M14 27q24-7 44 8v43q-20-15-44-8zm92 0q-24-7-44 8v43q20-15 44-8zM60 35v43" />
	{:else if kind === 'radio'}
		<path class="fill orange" d="M38 25L83 9M22 30h76v49H22z"/><circle cx="45" cy="55" r="15"/><circle cx="80" cy="47" r="4"/><path d="M73 64h15"/>
	{:else if kind === 'tent'}
		<path class="fill red" d="M14 76L59 17l47 59z"/><path d="M14 76L59 17l47 59M59 17v59M59 76l21-28 26 28M91 24V9l16 7-16 7"/>
	{:else if kind === 'kaaba'}
		<path class="fill ink" d="M27 31l46-14 25 15v46H27z"/><path d="M27 31l46-14 25 15-46 14zM52 46v32M27 48h71"/><path class="gold" d="M27 47h71v10H27z"/>
	{:else if kind === 'trophy'}
		<path class="fill yellow" d="M39 18h42v20q0 27-21 27T39 38z"/><path d="M39 26H22q0 24 22 25m37-25h17q0 24-22 25M60 65v12M42 78h36"/>
	{:else if kind === 'palm'}
		<path d="M59 76q-3-39 6-61" class="trunk"/><path class="fill green" d="M65 17Q31 1 24 22q24 8 41-5zm0 0Q89-4 103 14 86 28 65 17zm0 0Q59-8 78-12q10 20-13 29zm0 0q29 7 30 27-20-2-30-27zm0 0Q38 28 39 47q19-8 26-30z"/>
	{:else if kind === 'kit'}
		<path class="fill sky" d="M20 31h80v48H20z"/><path d="M44 31v-9h32v9M60 43v24M48 55h24"/>
	{:else}
		<path class="fill yellow" d="M39 28h42l9 17-9 31H39l-9-31z"/><path d="M50 28v-8h20v8M60 20V9"/>
	{/if}
</svg>

<style>
	.topic-icon{width:112px;height:auto;overflow:visible}.topic-icon path,.topic-icon circle{stroke:#34271f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;fill:none}.topic-icon .yellow{fill:#ffe45f}.topic-icon .sky{fill:#83d8ec}.topic-icon .orange{fill:#e9822d}.topic-icon .red{fill:#ee596f}.topic-icon .ink{fill:#25201c}.topic-icon .green{fill:#50a653}.topic-icon .gold{fill:#ffd43b;stroke:none}.topic-icon .trunk{stroke:#8b5a2b;stroke-width:10}.topic-icon .ground{stroke-width:3;stroke-dasharray:5 7;opacity:.65}
</style>
