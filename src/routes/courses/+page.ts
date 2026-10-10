import { courses, getPage } from '$lib/content';

export const prerender = true;

export function load() {
	// The legacy "Courses" page (content/pages/courses.md) lists live and past
	// programmes; it is shown below the self-paced course routes.
	return { courses, programmes: getPage('courses') ?? null };
}
