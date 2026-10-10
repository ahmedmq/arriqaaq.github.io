import postsRaw from './generated/posts.json';
import pagesRaw from './generated/pages.json';
import tagsRaw from './generated/tags.json';
import authorsRaw from './generated/authors.json';
import settingsRaw from './generated/settings.json';
import coursesRaw from './generated/courses.json';
import type { Author, Course, CoursePlace, Post, SiteSettings, Subject, Tag } from './types';

export const posts = postsRaw as Post[];
export const pages = pagesRaw as Post[];
export const tags = tagsRaw as Tag[];
export const authors = authorsRaw as Author[];
export const settings = settingsRaw as SiteSettings;
export const courses = coursesRaw as Course[];

export const POSTS_PER_PAGE = 9;

const tagBySlug = new Map(tags.map((t) => [t.slug, t]));
const tagById = new Map(tags.map((t) => [t.id, t]));
const authorBySlug = new Map(authors.map((a) => [a.slug, a]));
const authorById = new Map(authors.map((a) => [a.id, a]));
const postBySlug = new Map(posts.map((p) => [p.slug, p]));
const pageBySlug = new Map(pages.map((p) => [p.slug, p]));

export function getPost(slug: string): Post | undefined {
	return postBySlug.get(slug);
}
export function getPage(slug: string): Post | undefined {
	return pageBySlug.get(slug);
}
export function getTag(slug: string): Tag | undefined {
	return tagBySlug.get(slug);
}
export function getTagById(id: string): Tag | undefined {
	return tagById.get(id);
}
export function getAuthor(slug: string): Author | undefined {
	return authorBySlug.get(slug);
}
export function getAuthorById(id: string): Author | undefined {
	return authorById.get(id);
}

export function postsByTag(tagId: string): Post[] {
	return posts.filter((p) => p.tags.includes(tagId));
}

export function postsByAuthor(authorId: string): Post[] {
	return posts.filter((p) => p.authors.includes(authorId));
}

export function relatedPosts(post: Post, n = 3): Post[] {
	if (!post.primary_tag) return posts.filter((p) => p.id !== post.id).slice(0, n);
	return posts
		.filter((p) => p.id !== post.id && p.tags.includes(post.primary_tag!))
		.slice(0, n);
}

export function resolveImage(src: string | null | undefined, base: string): string | null {
	if (!src) return null;
	if (/^https?:\/\//.test(src)) return src;
	return base + src;
}


export function adjacentPosts(post: Post): { prev: Post | null; next: Post | null } {
	const idx = posts.findIndex((p) => p.id === post.id);
	if (idx === -1) return { prev: null, next: null };
	return {
		prev: idx + 1 < posts.length ? posts[idx + 1] : null,
		next: idx - 1 >= 0 ? posts[idx - 1] : null
	};
}

const courseBySlug = new Map(courses.map((c) => [c.slug, c]));

export function getCourse(slug: string): Course | undefined {
	return courseBySlug.get(slug);
}

/** Where a post sits inside a course, or null when it is not a lesson. */
export function coursePlace(postSlug: string): CoursePlace | null {
	for (const course of courses) {
		const flat = course.modules.flatMap((m) => m.lessons.map((lesson) => ({ lesson, module: m })));
		const i = flat.findIndex((x) => x.lesson.slug === postSlug);
		if (i === -1) continue;
		return {
			course,
			lesson: flat[i].lesson,
			module: flat[i].module,
			prev: flat[i - 1]?.lesson ?? null,
			next: flat[i + 1]?.lesson ?? null
		};
	}
	return null;
}

/** Tag slug → subject colour family. Unlisted tags fall back to 'general'. */
const SUBJECT_BY_TAG: Record<string, Subject> = {
	fiqh: 'fiqh',
	tafsir: 'tafsir',
	tajweed: 'tajweed',
	grammar: 'nahw',
	arabic: 'nahw',
	aqeedah: 'aqeedah',
	hadith: 'hadith',
	islam: 'aqeedah',
	ramadhan: 'aqeedah',
	book: 'hadith',
	poem: 'tajweed',
	homeschooling: 'nahw',
	coding: 'fiqh',
	tech: 'fiqh',
	health: 'tajweed',
	lifestyle: 'tajweed',
	podcast: 'hadith',
	magazine: 'nahw',
	competition: 'nahw',
	events: 'aqeedah'
};

export function subjectForTag(slug: string | null | undefined): Subject {
	return (slug && SUBJECT_BY_TAG[slug]) || 'general';
}

export function subjectForPost(post: Post): Subject {
	const place = coursePlace(post.slug);
	if (place) return place.course.subject;
	const tag = post.primary_tag ? getTagById(post.primary_tag) : null;
	return subjectForTag(tag?.slug);
}
