export type Author = {
	id: string;
	slug: string;
	name: string;
	bio: string | null;
	profile_image: string | null;
	cover_image: string | null;
	website: string | null;
	twitter: string | null;
};

export type Tag = {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	feature_image: string | null;
	post_count: number;
};

export type Post = {
	id: string;
	uuid: string;
	type: 'post' | 'page';
	slug: string;
	title: string;
	html: string;
	plaintext: string;
	feature_image: string | null;
	custom_excerpt: string | null;
	published_at: string;
	updated_at: string;
	reading_time: number;
	featured: boolean;
	visibility: string;
	show_title_and_feature_image: boolean;
	custom_template: string | null;
	tags: string[];
	primary_tag: string | null;
	authors: string[];
	primary_author: string | null;
	toc: { id: string; text: string }[];
	words: number;
	diagram_count: number;
	widgets: string[];
};

export type SiteSettings = {
	title: string;
	url: string;
	description: string;
	logo: string | null;
	icon: string | null;
	cover_image: string | null;
	navigation: { label: string; url: string; mobile?: boolean }[];
	secondary_navigation: { label: string; url: string; mobile?: boolean }[];
};

export type Subject = 'tajweed' | 'nahw' | 'aqeedah' | 'hadith' | 'fiqh' | 'tafsir' | 'general';

export type CourseLesson = {
	n: number;
	slug: string;
	title: string;
	excerpt: string | null;
	minutes: number;
};

export type CourseModule = { title: string; blurb: string | null; lessons: CourseLesson[] };

export type Course = {
	slug: string;
	title: string;
	arabic: string | null;
	subject: Subject;
	code: string | null;
	tagline: string;
	outcome: string;
	level: string | null;
	lesson_count: number;
	minutes: number;
	modules: CourseModule[];
};

export type CoursePlace = {
	course: Course;
	lesson: CourseLesson;
	module: CourseModule;
	prev: CourseLesson | null;
	next: CourseLesson | null;
};

export type BookShelf = 'hadith' | 'tafsir' | 'family' | 'history' | 'children';

export type Book = {
	slug: string;
	title: string;
	line: string;
	authors: string[];
	illustrator: string | null;
	shelf: BookShelf;
	year: number;
	year_note: string | null;
	extra: string | null;
	pages: number | null;
	cover: string | null;
	/** cover width / height */
	ratio: number;
	/** page width / height of the PDF */
	page_ratio: number;
	/** The PDF(s) the book is read from and downloaded as. More than one means editions (English, Urdu). */
	pdfs: { lang: string | null; ar: boolean; href: string }[];
	/** Where else it is online (Academia). Shown only as a download choice. */
	external: { label: string; href: string } | null;
	print: { label: string; href: string } | null;
	previews: { n: number; src: string }[];
	cover_is_page_one: boolean;
	quote: string | null;
	quote_cite: string | null;
	inside: string[];
	post: string;
	post_title: string;
};
