import { error } from '@sveltejs/kit';
import { getTrack, tracks } from '$lib/content';

export const prerender = true;

export function entries() {
	return tracks.map((track) => ({ slug: track.slug }));
}

export function load({ params }) {
	const track = getTrack(params.slug);
	if (!track) error(404, 'Learning path not found');
	return { track, breadcrumb: `Learning path / ${track.title}` };
}
