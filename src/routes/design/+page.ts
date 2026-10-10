import { getPost, posts } from '$lib/content';

export const prerender = true;

export function load() {
	// A real diagram and a real article row, so the kit shows the live system.
	const html = getPost('istihsan')?.html ?? '';
	const diagram = html.match(/<figure class="fig fig-dgm[^"]*">[\s\S]*?<\/figure>/)?.[0] ?? '';
	return { diagram, sample: posts.find((p) => p.slug === 'istihsan') ?? posts[0] };
}
