<script lang="ts">
	// On the privacy page: turn Google Analytics on or off for this browser.
	import { onMount } from 'svelte';
	import { GA_ID, allowed, setConsent, type Consent } from '$lib/analytics';

	let state = $state<Consent | null>(null);
	onMount(() => {
		state = allowed() ? 'granted' : 'denied';
	});
	function pick(c: Consent) {
		setConsent(c);
		state = c;
	}
</script>

{#if GA_ID}
	<div class="choice" data-pagefind-ignore>
		<span>Analytics in this browser</span>
		<div class="segmented" role="group" aria-label="Analytics in this browser">
			<button type="button" aria-pressed={state === 'granted'} onclick={() => pick('granted')}>On</button>
			<button type="button" aria-pressed={state === 'denied'} onclick={() => pick('denied')}>Off</button>
		</div>
	</div>
{/if}

<style>
	.choice {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3) var(--s-4);
		margin: var(--s-5) 0;
		font-size: var(--fs-small);
		color: var(--ink-2);
	}
</style>
