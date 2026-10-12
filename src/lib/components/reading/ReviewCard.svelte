<script lang="ts">
	// Come-back review: the questions this reader marked "Not yet" in earlier
	// Pause and check boxes, asked again. On a lesson it shows the course's
	// other lessons' questions; on the course page, all of them. "Got it now"
	// retires a question; "Still not sure" keeps it for next time. Renders
	// nothing until the browser has something to bring back.
	import { base } from '$app/paths';
	import { reviewItems, removeReview, onReview, type ReviewItem } from '$lib/review';

	type Props = { slugs: string[]; exclude?: string; heading?: string };
	let { slugs, exclude, heading = 'Before you start' }: Props = $props();

	let items = $state<ReviewItem[]>([]);
	let open = $state<Record<string, boolean>>({});
	let kept = $state<Record<string, boolean>>({});

	$effect(() => {
		const sync = () =>
			(items = reviewItems()
				.filter((x) => slugs.includes(x.slug) && x.slug !== exclude)
				.sort((a, b) => a.at - b.at));
		sync();
		return onReview(sync);
	});
</script>

{#if items.length}
	<aside class="review" aria-label="Questions to review">
		<div class="head">
			<span class="title">{heading}</span>
			<span class="count">{items.length} question{items.length === 1 ? '' : 's'} you marked "Not yet"</span>
		</div>
		<ol>
			{#each items as it (it.id)}
				<li class:is-kept={kept[it.id]}>
					<a class="from" href={`${base}/${it.slug}/`}>{it.title}</a>
					<button class="q" aria-expanded={!!open[it.id]} onclick={() => (open[it.id] = !open[it.id])}>
						<span>{@html it.q}</span>
						<span class="cta">{open[it.id] ? 'Hide answer ↑' : 'Show answer ↓'}</span>
					</button>
					{#if open[it.id]}
						<div class="a">{@html it.a}</div>
						<div class="rate">
							<button class="knew" onclick={() => removeReview(it.id)}>Got it now</button>
							<button class="notyet" onclick={() => ((kept[it.id] = true), (open[it.id] = false))}>Still not sure</button>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	</aside>
{/if}

<style>
	.review {
		max-width: var(--measure);
		margin: var(--s-2) auto var(--s-6);
		border-radius: var(--r);
		background: var(--surface);
		overflow: hidden;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-1) var(--s-3);
		padding: 10px var(--s-4);
		background: var(--pink);
		color: var(--on-colour);
		font-size: 0.875rem;
		line-height: 1.3;
	}

	.title {
		font-weight: 600;
	}

	ol {
		margin: 0;
		padding: var(--s-1) var(--s-4) var(--s-2);
		list-style: none;
	}

	li {
		padding: var(--s-3) 0;
	}

	li + li {
		border-top: 1px solid var(--line);
	}

	.from {
		display: block;
		margin-bottom: 2px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--subject-ink, var(--purple-ink));
		text-decoration: none;
	}

	.q {
		display: grid;
		gap: var(--s-1);
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		text-align: left;
		font: 500 1rem/1.5 var(--font-sans);
		color: var(--ink);
		cursor: pointer;
	}

	.cta {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--subject-ink, var(--purple-ink));
	}

	.a {
		margin-top: var(--s-2);
		padding-left: var(--s-3);
		border-left: 3px solid var(--subject, var(--purple));
		color: var(--ink-2);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.a :global(p) {
		margin: 0;
	}

	.rate {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		margin-top: var(--s-3);
	}

	.rate button {
		min-height: 36px;
		padding: 0 var(--s-4);
		border: 0;
		border-radius: 999px;
		font: 600 0.8125rem var(--font-sans);
		color: var(--on-colour);
		cursor: pointer;
	}

	.knew {
		background: var(--green);
	}

	.notyet {
		background: var(--pink);
	}

	li.is-kept .from::after {
		content: ' · kept for next time';
		color: var(--ink-3);
		font-weight: 500;
	}
</style>
