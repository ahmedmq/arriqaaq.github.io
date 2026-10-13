<script lang="ts">
	// Asks visitors in the EEA, UK and Switzerland before Google Analytics may
	// set cookies (analytics.ts → shouldAsk). Everyone else is never shown it;
	// anyone can change their answer on the privacy page (AnalyticsChoice).
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { shouldAsk, setConsent, type Consent } from '$lib/analytics';

	let show = $state(false);
	onMount(() => {
		show = shouldAsk();
	});

	function answer(c: Consent) {
		setConsent(c);
		show = false;
	}
</script>

{#if show}
	<div class="consent" role="dialog" aria-label="Analytics cookies" aria-live="polite">
		<p>
			Arriqaaq uses Google Analytics to see which lessons and books help readers. No ads, and nothing is sold.
			<a href={`${base}/privacy/#analytics`}>Privacy</a>
		</p>
		<div class="actions">
			<button type="button" class="btn btn--ghost" onclick={() => answer('denied')}>Decline</button>
			<button type="button" class="btn" onclick={() => answer('granted')}>Accept</button>
		</div>
	</div>
{/if}

<style>
	.consent {
		position: fixed;
		z-index: 55;
		left: var(--s-4);
		right: var(--s-4);
		bottom: calc(var(--s-4) + env(safe-area-inset-bottom));
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3) var(--s-5);
		max-width: 680px;
		margin: 0 auto;
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r-lg);
		background: var(--page);
		box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-2);
		font-size: var(--fs-small);
		line-height: 1.5;
		color: var(--ink-2);
	}

	p {
		flex: 1 1 280px;
		margin: 0;
	}

	a {
		color: var(--ink);
	}

	.actions {
		display: flex;
		gap: var(--s-2);
		flex: 0 0 auto;
	}

	/* Phones: the two buttons share the width, each a full touch target. */
	@media (max-width: 480px) {
		.actions {
			flex: 1 1 100%;
		}
		.actions .btn {
			flex: 1;
		}
	}
</style>
