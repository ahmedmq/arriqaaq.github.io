<script lang="ts">
	import { onMount } from 'svelte';

	const roles: Record<string, string> = {
		crane: '<svg viewBox="0 0 32 32"><path d="M8 27h18v3H8zM12 9h3v18h-3zM14 9h13v3H14z" fill="#ffe45f" stroke="#34271f" stroke-width="1.2"/><path d="M24 12v8" stroke="#34271f" stroke-width="1.4"/><path d="M22 20h4v5h-4z" fill="#ee596f"/></svg>',
		parcel: '<svg viewBox="0 0 32 32"><path d="M8 10h16v16H8z" fill="#ffe45f" stroke="#34271f" stroke-width="1.5"/><path d="M8 15l8 4 8-4M16 19v7M12 10l8 4" fill="none" stroke="#126a78" stroke-width="1.3"/></svg>',
		toolbox: '<svg viewBox="0 0 32 32"><path d="M7 13h18v13H7z" fill="#ee596f" stroke="#34271f" stroke-width="1.5"/><path d="M12 13V9h8v4M7 18h18" fill="none" stroke="#34271f" stroke-width="1.5"/></svg>',
		helmet: '<svg viewBox="0 0 32 32"><path d="M9 19a7 7 0 0 1 14 0v3H9z" fill="#ffe45f" stroke="#34271f" stroke-width="1.4"/><path d="M7 22h18v3H9zM15 12h3v7h-3z" fill="#e9822d" stroke="#34271f" stroke-width="1"/></svg>'
	};

	onMount(() => {
		const headings = [...document.querySelectorAll<HTMLElement>('.reading-body h2, .reading-body h3')];
		headings.forEach((heading, index) => {
			if (heading.querySelector('.reading-role')) return;
			const role = document.createElement('span');
			role.className = `reading-role reading-role--${heading.tagName.toLowerCase()}`;
			role.setAttribute('aria-hidden', 'true');
			const roleName = heading.dataset.readingRole ?? Object.keys(roles)[index % Object.keys(roles).length];
			role.dataset.role = roleName;
			role.innerHTML = roles[roleName] ?? roles.crane;
			heading.prepend(role);
		});
	});
</script>
