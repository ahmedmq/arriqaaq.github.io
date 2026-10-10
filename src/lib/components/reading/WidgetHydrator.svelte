<script lang="ts">
	// Brings [[WIDGET:name]] placeholders to life. The parser emits
	// <div class="widget-mount" data-widget="name" id="w-name-1"> for each
	// token; on the client this loads src/lib/widgets/<name>.ts and calls its
	// init(el). Widgets are code-split: a post only downloads the ones it uses.
	// Prerendered pages show the figure caption until the widget mounts.
	import { onMount } from 'svelte';

	const modules = import.meta.glob<{ init: (el: HTMLElement) => void | (() => void) }>('$lib/widgets/*.ts');

	onMount(() => {
		const cleanups: (() => void)[] = [];
		for (const el of document.querySelectorAll<HTMLElement>('.widget-mount[data-widget]')) {
			const load = modules[`/src/lib/widgets/${el.dataset.widget}.ts`];
			if (!load) {
				console.warn(`No widget module for "${el.dataset.widget}"`);
				continue;
			}
			load()
				.then((m) => {
					const off = m.init(el);
					if (typeof off === 'function') cleanups.push(off);
					el.dataset.ready = 'true';
				})
				.catch((err) => console.error(`Widget "${el.dataset.widget}" failed`, err));
		}
		return () => cleanups.forEach((f) => f());
	});
</script>
