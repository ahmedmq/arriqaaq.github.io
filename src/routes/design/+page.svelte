<script lang="ts">
	// Living UI kit (DESIGN.md). Every swatch, type style and component here
	// is the real thing, rendered with the site's tokens and classes. Add any
	// new shared component to this page in the same change.
	import Seo from '$lib/components/Seo.svelte';
	import PixelCover from '$lib/components/ui/PixelCover.svelte';
	import Flower from '$lib/components/ui/Flower.svelte';
	import PostRow from '$lib/components/ui/PostRow.svelte';

	let { data } = $props();

	const palette = [
		{ name: 'Pink', token: '--pink', hex: '#ff00a0', note: 'SurrealDB pink' },
		{ name: 'Purple', token: '--purple', hex: '#9800ff', note: 'SurrealDB purple' },
		{ name: 'Blue', token: '--blue', hex: '#0066ff', note: 'Usul al-Fiqh' },
		{ name: 'Amber', token: '--amber', hex: '#ffbe00', note: 'Tajweed' },
		{ name: 'Green', token: '--green', hex: '#00c25a', note: 'Arabic' }
	];
	const neutrals = [
		{ name: 'Ink', token: '--ink', hex: '#0d0c13' },
		{ name: 'Ink 2', token: '--ink-2', hex: '#45434f' },
		{ name: 'Ink 3', token: '--ink-3', hex: '#6b6a78' },
		{ name: 'Line', token: '--line-strong', hex: '#cfcdd9' },
		{ name: 'Surface', token: '--surface', hex: '#f6f6f8' },
		{ name: 'Page', token: '--page', hex: '#ffffff' }
	];
	const ramp = [
		{ token: '--ramp-0', hex: '#5b1bdc' },
		{ token: '--ramp-1', hex: '#6a2ce4' },
		{ token: '--ramp-2', hex: '#7c48e8' },
		{ token: '--ramp-3', hex: '#8b5cec' },
		{ token: '--lavender', hex: '#ebe9f5' },
		{ token: '--obsidian', hex: '#242132' }
	];
	let tab = $state(0);
	let seg = $state(0);
	let chip = $state(0);
</script>

<Seo title="Design system — Arriqaaq" description="The Arriqaaq UI kit: tokens and components." />
<svelte:head><meta name="robots" content="noindex" /></svelte:head>

<div class="wrap kit" id="top">
	<header class="section-head">
		<span class="eyebrow">UI kit</span>
		<h1 class="split">The Arriqaaq <em>design system.</em></h1>
		<p class="lede">The real tokens and components. Rules live in <code>DESIGN.md</code>; agents load <code>.claude/skills/arriqaaq-design</code>.</p>
	</header>

	<section>
		<h2 class="h">Palette <span>full strength only, no tints</span></h2>
		<div class="swatches">
			{#each palette as c}
				<div class="sw"><span class="chip-c" style:background={`var(${c.token})`}></span><b>{c.name}</b><code>{c.token}</code><small>{c.hex} · {c.note}</small></div>
			{/each}
		</div>
		<div class="swatches">
			{#each neutrals as c}
				<div class="sw"><span class="chip-c line" style:background={`var(${c.token})`}></span><b>{c.name}</b><code>{c.token}</code><small>{c.hex}</small></div>
			{/each}
		</div>
		<h3 class="h3">Diagram ramp <span>diagrams and course chrome only</span></h3>
		<div class="swatches">
			{#each ramp as c}
				<div class="sw"><span class="chip-c" style:background={`var(${c.token})`}></span><code>{c.token}</code><small>{c.hex}</small></div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="h">Type <span>Inter · IBM Plex Sans Arabic · Noto Naskh · Amiri Quran · JetBrains Mono</span></h2>
		<div class="type">
			<p style:font-size="var(--fs-display)" class="t-display">Roots<span class="pink">.</span></p>
			<p class="split">Section heading, <em>max six words.</em></p>
			<p class="t-h2">Article h2 · Inter 600</p>
			<p class="t-body">Body text is Inter 17px on 28px, the OpenAI article settings, in a 680px reading column. Inline Arabic like <span lang="ar" dir="rtl" class="ar">الاستحسان</span> falls through to Noto Naskh.</p>
			<p class="t-ar" lang="ar" dir="rtl">أصول الفقه</p>
			<span class="eyebrow">Eyebrow label</span>
		</div>
	</section>

	<section>
		<h2 class="h">Controls</h2>
		<div class="row-c">
			<a class="btn" href="#top">Primary <span class="arrow">→</span></a>
			<a class="btn btn--ghost" href="#top">Ghost</a>
			<span class="subject--fiqh"><a class="btn btn--subject" href="#top">Subject</a></span>
			<button class="icon-btn" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg></button>
		</div>
		<div class="row-c">
			{#each ['All', 'Fiqh', 'Book', 'Podcast'] as c, i}
				<button class="chip" aria-pressed={chip === i} onclick={() => (chip = i)}>{c}</button>
			{/each}
			<span class="tag">Tag</span>
		</div>
		<div class="row-c">
			<div class="tabs" role="tablist">
				{#each ['Pill tab', 'Another', 'Third'] as t, i}
					<button class="tab" role="tab" aria-selected={tab === i} onclick={() => (tab = i)}>{t}</button>
				{/each}
			</div>
		</div>
		<div class="row-c">
			<div class="segmented">
				{#each ['Segmented', 'Toggle'] as t, i}
					<button aria-pressed={seg === i} onclick={() => (seg = i)}>{t}</button>
				{/each}
			</div>
		</div>
	</section>

	<section>
		<h2 class="h">Cards and covers</h2>
		<div class="grid-c">
			<div class="card"><div class="cv"><PixelCover seed="kit-a" subject="fiqh" /></div><div class="card-body"><span class="eyebrow">Subject colour</span><p>PixelCover</p></div></div>
			<div class="card"><div class="cv"><PixelCover seed="kit-b" subject="fiqh" mix /></div><div class="card-body"><span class="eyebrow">mix</span><p>Roadmap lesson cards</p></div></div>
			<div class="card"><div class="card-body flower"><Flower size={48} /><p>Brand flower</p></div></div>
		</div>
		<div class="rows"><PostRow post={data.sample} /></div>
	</section>

	<section class="prose-demo">
		<h2 class="h">Quotes <span>classified at build time</span></h2>
		<div class="prose subject--fiqh">
			<blockquote class="quote quote--quran is-in" data-label="Qur’an">
				<p class="q-ar" lang="ar" dir="rtl">﴿فَاسْتَبِقُوا الْخَيْرَاتِ﴾</p>
				<p>“So compete in good deeds.”</p>
				<cite class="q-cite">Quran 2:148</cite>
			</blockquote>
			<blockquote class="quote quote--hadith is-in" data-label="Hadith">
				<p>“The best of you are those who are best to their wives.”</p>
				<cite class="q-cite">Jami‘ al-Tirmidhi</cite>
			</blockquote>
			<blockquote class="quote quote--plain is-in"><p>A general quotation sits on a quiet grey rule.</p></blockquote>
		</div>
	</section>

	<section class="prose-demo">
		<h2 class="h">Diagram language <span>SurrealDB six-parts style</span></h2>
		<div class="prose subject--fiqh">{@html data.diagram}</div>
	</section>
</div>

<style>
	.kit {
		padding-block: var(--s-7) var(--s-8);
	}

	.kit section {
		margin-top: var(--s-8);
	}

	.lede {
		color: var(--ink-2);
	}

	.h {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--s-2) var(--s-4);
		margin-bottom: var(--s-5);
		padding-top: var(--s-4);
		border-top: 1px solid var(--line);
		font-size: var(--fs-h3);
		font-weight: 600;
	}

	.h span,
	.h3 span {
		font-size: var(--fs-xs);
		font-weight: 500;
		color: var(--ink-3);
	}

	.h3 {
		margin: var(--s-5) 0 var(--s-3);
		font-size: 1rem;
		font-weight: 600;
	}

	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--s-4);
		margin-bottom: var(--s-4);
	}

	.sw {
		display: grid;
		gap: 2px;
		font-size: var(--fs-small);
	}

	.chip-c {
		height: 64px;
		border-radius: var(--r);
		margin-bottom: 6px;
	}

	.chip-c.line {
		box-shadow: inset 0 0 0 1px var(--line);
	}

	.sw code,
	.lede code {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--ink-2);
	}

	.sw small {
		color: var(--ink-3);
	}

	.type {
		display: grid;
		gap: var(--s-4);
	}

	.t-display {
		font-weight: 500;
		line-height: var(--lh-display);
		letter-spacing: var(--ls-display);
	}

	.pink {
		color: var(--pink);
	}

	.t-h2 {
		font-size: var(--fs-h2);
		font-weight: 600;
		letter-spacing: -0.025em;
	}

	.t-body {
		max-width: var(--measure);
	}

	.t-ar {
		font-family: var(--font-arabic-display);
		font-size: 2rem;
		font-weight: 500;
		justify-self: start;
	}

	.row-c {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
		margin-bottom: var(--s-4);
	}

	.grid-c {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--s-4);
	}

	.cv {
		aspect-ratio: 2.4;
	}

	.card p {
		margin-top: 6px;
		font-weight: 500;
	}

	.flower {
		display: grid;
		place-items: center;
		min-height: 100%;
	}

	.rows {
		margin-top: var(--s-5);
		max-width: 760px;
	}

	.prose-demo .prose > :global(*) {
		margin-inline: 0;
	}
</style>
