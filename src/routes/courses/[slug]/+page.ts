import { error } from '@sveltejs/kit';
import { courses, getCourse } from '$lib/content';

export const prerender = true;

export function entries() {
	return courses.map((c) => ({ slug: c.slug }));
}

export function load({ params }) {
	const course = getCourse(params.slug);
	if (!course) throw error(404, 'Course not found');
	return { course };
}
