<script lang="ts">
	// The hero book. The CSS book renders first (works without JS and while three.js
	// loads); when WebGL is ready the three.js book takes its place. Skipped for
	// reduced motion and Save-Data, where the CSS book is kept.
	import { base } from '$app/paths';
	import type { Book } from '$lib/types';
	import Book3D from './Book3D.svelte';
	import type { BookScene } from '$lib/books/book-scene';

	let { book, open = false }: { book: Book; open?: boolean } = $props();
	let host: HTMLDivElement;
	let gl = $state(false);
	let scene: BookScene | null = null;

	const first = $derived(book.cover_is_page_one ? 1 : 0);

	$effect(() => {
		const conn = (navigator as any).connection;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || conn?.saveData) return;
		let dead = false;
		const start = async () => {
			const { mountBookScene } = await import('$lib/books/book-scene');
			if (dead) return;
			const s = await mountBookScene(host, {
				title: book.title,
				surname: book.authors[0].split(' ').slice(-1)[0],
				ratio: book.ratio,
				pages: book.pages ?? 100,
				cover: book.cover ? `${base}${book.cover}` : null,
				pageRatio: book.page_ratio,
				spreads: book.previews.slice(first, first + 6).map((p) => `${base}${p.src}`)
			});
			if (dead) return s?.destroy();
			if (s) {
				scene = s;
				gl = true;
				s.setOpen(open);
			}
		};
		// Let the page become usable first.
		const id = 'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 300);
		return () => {
			dead = true;
			if ('cancelIdleCallback' in window) cancelIdleCallback(id as number);
			scene?.destroy();
			scene = null;
			gl = false;
		};
	});

	$effect(() => {
		// Read `open` first: an optional chain on a not-yet-loaded scene would skip it
		// and the effect would never run again.
		const o = open;
		scene?.setOpen(o);
	});
</script>

<div class="scene" class:gl>
	<Book3D {book} leaf {open} />
	<div class="gl-host bk--{book.shelf}" bind:this={host}></div>
</div>

<style>
	.scene {
		position: relative;
		width: 100%;
	}

	.gl-host {
		position: absolute;
		inset: -28px -8px;
		pointer-events: none;
	}

	.scene.gl .gl-host {
		pointer-events: auto;
	}

	.scene.gl :global(.b3) {
		visibility: hidden;
	}
</style>
