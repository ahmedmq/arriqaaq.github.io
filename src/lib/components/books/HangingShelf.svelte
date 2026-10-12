<script lang="ts">
	// A row of books standing on one baseline, with a soft shadow each. No lines.
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="hshelf">
	<div class="hshelf-books">{@render children()}</div>
</div>
