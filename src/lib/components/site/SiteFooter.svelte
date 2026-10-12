<script lang="ts">
	// Footer columns (SurrealDB pattern): always open on desktop, tap-to-expand
	// groups on phones so the footer is not a wall of links.
	import { base } from '$app/paths';
	import Flower from '$lib/components/ui/Flower.svelte';
	import { REPO_URL, ISSUES_URL } from '$lib/site';

	type Link = { label: string; href: string; ext?: boolean };
	const columns: { title: string; links: Link[] }[] = [
		{
			title: 'Learn',
			links: [
				{ label: 'Usul al-Fiqh course', href: '/courses/usul-al-fiqh/' },
				{ label: 'Subjects', href: '/#subjects' },
				{ label: 'All articles', href: '/articles/' },
				{ label: 'Other courses', href: '/courses/' },
				{ label: 'Books', href: '/books/' }
			]
		},
		{
			title: 'Arriqaaq',
			links: [
				{ label: 'About', href: '/about/' },
				{ label: 'Letters from the Soul', href: '/lettersfromthesoul/' },
				{ label: 'Magazine', href: '/magazine/' },
				{ label: 'Contact', href: '/contact/' }
			]
		},
		{
			title: 'Elsewhere',
			links: [
				{ label: 'Instagram', href: 'https://www.instagram.com/arriqaaq/', ext: true },
				{ label: 'WhatsApp group', href: 'https://chat.whatsapp.com/G9uGLfu3mwCJrvN5KqNDJ7', ext: true },
				{ label: 'GitHub', href: 'https://github.com/arriqaaq', ext: true },
				{ label: 'Report an issue', href: ISSUES_URL, ext: true },
				{ label: 'Contribute a fix', href: REPO_URL, ext: true }
			]
		}
	];

	let open = $state<Record<string, boolean>>({});
	const year = new Date().getFullYear();
	const href = (l: Link) => (l.ext ? l.href : base + l.href);
</script>

<footer class="site-footer">
	<div class="wrap">
		<div class="top">
			<div class="brand">
				<a href={`${base}/`} class="logo"><Flower size={26} /><span>arriqaaq</span></a>
				<p>An online creative space for authentic Islamic courses, articles, crafts, education and technology.</p>
			</div>

			<div class="cols">
				{#each columns as col}
					<div class="col" class:is-open={open[col.title]}>
						<h2 class="col-title">
							<button
								type="button"
								aria-expanded={!!open[col.title]}
								onclick={() => (open[col.title] = !open[col.title])}
							>
								{col.title}
								<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
							</button>
							<span class="col-label">{col.title}</span>
						</h2>
						<ul>
							{#each col.links as l}
								<li>
									<a href={href(l)} target={l.ext ? '_blank' : undefined} rel={l.ext ? 'noreferrer' : undefined}
										>{l.label}{#if l.ext}<span aria-hidden="true"> ↗</span>{/if}</a
									>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>

		<div class="bottom">
			<span>© {year} Arriqaaq</span>
			<a href={`${base}/books/`}>Books</a>
			<a href={`${base}/privacy/`}>Privacy</a>
			<a href={`${base}/rss.xml`}>RSS</a>
			<a href={`${base}/llms.txt`}>llms.txt</a>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		margin-top: var(--section);
		padding-block: var(--s-7) calc(var(--s-6) + env(safe-area-inset-bottom));
		background: var(--surface);
		font-size: var(--fs-small);
	}

	.top {
		display: grid;
		gap: var(--s-6);
	}

	.logo {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		text-decoration: none;
	}

	.brand p {
		margin-top: var(--s-3);
		max-width: 34ch;
		color: var(--ink-2);
	}

	.col {
		border-top: 1px solid var(--line-strong);
	}

	.col-title {
		font-size: inherit;
		font-weight: 500;
		letter-spacing: 0;
	}

	.col-title button {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		min-height: 52px;
		padding: 0;
		border: 0;
		background: none;
		font-weight: 500;
	}

	.col-title svg {
		width: 18px;
		height: 18px;
		transition: transform var(--dur) var(--ease-out);
	}

	.col.is-open .col-title svg {
		transform: rotate(180deg);
	}

	.col-label {
		display: none;
	}

	ul {
		display: none;
		margin: 0;
		padding: 0 0 var(--s-4);
		list-style: none;
	}

	.col.is-open ul {
		display: grid;
		gap: var(--s-1);
	}

	li a {
		display: inline-block;
		padding-block: 7px;
		color: var(--ink-2);
		text-decoration: none;
	}

	li a:hover {
		color: var(--ink);
	}

	.bottom {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-5);
		margin-top: var(--s-6);
		padding-top: var(--s-5);
		border-top: 1px solid var(--line-strong);
		color: var(--ink-3);
	}

	.bottom a {
		color: var(--ink-3);
		text-decoration: none;
	}

	@media (min-width: 900px) {
		.top {
			grid-template-columns: 1fr 1.6fr;
			gap: var(--s-8);
		}

		.cols {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: var(--s-6);
		}

		.col {
			border-top: 0;
		}

		.col-title button {
			display: none;
		}

		.col-label {
			display: block;
			margin-bottom: var(--s-3);
			color: var(--ink);
		}

		ul,
		.col.is-open ul {
			display: grid;
			gap: 0;
		}
	}
</style>
