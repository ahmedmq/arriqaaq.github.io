<script lang="ts">
	import { onMount } from 'svelte';

	let pct = $state(0);

	onMount(() => {
		function update() {
			const max = document.body.scrollHeight - window.innerHeight;
			pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (window.scrollY / max) * 100));
		}
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<div class="reading-progress" aria-hidden="true" style={`--read:${pct / 100}`}>
	<div class="reading-progress-fill"></div>
	<svg class="reading-cart" viewBox="0 0 44 20">
		<path d="M2 6h21v9H2z" class="cart-body"/><path d="M23 9h9l5 5v1H23z" class="cart-cab"/><path d="M5 3h15v4H5z" class="cart-load"/>
		<circle cx="10" cy="16" r="3"/><circle cx="30" cy="16" r="3"/>
	</svg>
</div>
