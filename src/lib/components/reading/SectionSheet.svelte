<script lang="ts">
	// The contents of the article you are reading, as a light bottom sheet on phones
	// (a centred panel on larger screens). Opened from the section label in the
	// header; the current section is marked, and tapping one jumps to it.
	import { tick } from 'svelte';
	import { reading } from '$lib/reading.svelte';

	let dialog: HTMLDialogElement;
	let list: HTMLOListElement;

	$effect(() => {
		if (reading.sheet && !dialog.open) {
			dialog.showModal();
			tick().then(() => list?.querySelector('.is-current')?.scrollIntoView({ block: 'center' }));
		}
		if (!reading.sheet && dialog.open) dialog.close();
	});

	const close = () => (reading.sheet = false);
</script>

<dialog
	bind:this={dialog}
	class="cs"
	aria-label="Contents"
	onclose={close}
	onclick={(e) => e.target === dialog && close()}
>
	{#if reading.entries.length}
		<div class="in">
			<header>
				<div>
					<span class="eyebrow">Contents</span>
					<p class="where">{reading.index >= 0 ? `Section ${reading.index + 1} of ${reading.entries.length}` : 'Introduction'}</p>
				</div>
				<button type="button" class="icon-btn" aria-label="Close contents" onclick={close}>✕</button>
			</header>
			<span class="bar" aria-hidden="true"><i style:width={`${reading.progress * 100}%`}></i></span>
			<ol bind:this={list}>
				{#each reading.entries as e, i (e.id)}
					<li class:is-current={reading.index === i} class:is-done={reading.index > i}>
						<a href={`#${e.id}`} onclick={close} aria-current={reading.index === i ? 'location' : undefined}>
							<span class="n">{String(i + 1).padStart(2, '0')}</span>
							<span class="t">{e.text}</span>
						</a>
					</li>
				{/each}
			</ol>
		</div>
	{/if}
</dialog>

<style>
	.cs {
		width: min(520px, calc(100vw - 32px));
		max-height: calc(100dvh - 32px);
		padding: 0;
		border: 0;
		border-radius: var(--r-lg);
		background: var(--page);
		color: var(--ink);
		box-shadow: var(--shadow-2);
		overflow: auto;
		overscroll-behavior: contain;
	}

	.cs::backdrop {
		background: rgba(13, 12, 19, 0.45);
	}

	.in {
		display: grid;
		gap: var(--s-3);
		padding: var(--s-5) var(--s-5) var(--s-4);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: var(--s-3);
	}

	.where {
		margin: var(--s-1) 0 0;
		font: 500 11.5px/1.3 var(--font-mono);
		letter-spacing: 0.04em;
		color: var(--ink-3);
	}

	.bar {
		display: block;
		height: 3px;
		border-radius: 2px;
		background: var(--line);
		overflow: hidden;
	}

	.bar i {
		display: block;
		height: 100%;
		background: var(--subject-ink, var(--purple-ink));
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	a {
		display: grid;
		grid-template-columns: 28px minmax(0, 1fr);
		gap: var(--s-2);
		align-items: baseline;
		min-height: var(--tap);
		padding: 10px var(--s-2) 10px var(--s-3);
		border-left: 3px solid transparent;
		border-radius: 0 var(--r-sm) var(--r-sm) 0;
		color: var(--ink-2);
		text-decoration: none;
		font-size: var(--fs-small);
		line-height: 1.35;
	}

	a:hover {
		background: var(--surface);
	}

	.n {
		font: 500 11px/1.4 var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--ink-3);
	}

	.is-done a {
		color: var(--ink-3);
	}

	li.is-current a {
		border-left-color: var(--subject-ink, var(--purple-ink));
		background: var(--surface);
		color: var(--ink);
		font-weight: 600;
	}

	li.is-current .n {
		color: var(--subject-ink, var(--purple-ink));
	}

	@media (max-width: 700px) {
		.cs {
			width: 100vw;
			max-width: 100vw;
			max-height: 78dvh;
			margin: auto 0 0;
			border-radius: var(--r-lg) var(--r-lg) 0 0;
			padding-bottom: env(safe-area-inset-bottom);
		}
		.in {
			padding: var(--s-4) var(--s-4) var(--s-3);
		}
	}
</style>
