/**
 * Analytics: Google Analytics 4 events, sent through the gtag loaded in
 * src/app.html. Every function is a safe no-op when GA is not configured
 * (PUBLIC_GA_ID empty), during prerender, or when a blocker removed gtag.
 *
 * Event names follow Google's recommended events where one fits (search,
 * share, select_content, tutorial_begin, tutorial_complete) and are
 * snake_case and under 40 characters otherwise. The full list, with the
 * parameters to register as custom dimensions, is in docs/seo-and-analytics.md.
 */
import { PUBLIC_GA_ID, PUBLIC_CLARITY_ID } from '$env/static/public';

export const GA_ID = /^G-[A-Z0-9]+$/.test(PUBLIC_GA_ID ?? '') ? PUBLIC_GA_ID : '';
const CLARITY_ID = /^[a-z0-9]{6,20}$/i.test(PUBLIC_CLARITY_ID ?? '') ? PUBLIC_CLARITY_ID : '';

type Params = Record<string, string | number | boolean | undefined | null>;

const CONSENT_KEY = 'arriqaaq:consent';
export type Consent = 'granted' | 'denied';

function gtag(...args: unknown[]) {
	if (typeof window === 'undefined' || !GA_ID) return;
	const g = (window as any).gtag;
	if (typeof g === 'function') g(...args);
}

/** Send one GA4 event. Parameter values are cut to GA's 100-character limit. */
export function track(name: string, params: Params = {}) {
	const clean: Params = {};
	for (const [k, v] of Object.entries(params)) {
		if (v === undefined || v === null || v === '') continue;
		clean[k] = typeof v === 'string' ? v.slice(0, 100) : v;
	}
	gtag('event', name, clean);
}

// ---------------------------------------------------------------- consent

export function storedConsent(): Consent | null {
	try {
		const v = localStorage.getItem(CONSENT_KEY);
		return v === 'granted' || v === 'denied' ? v : null;
	} catch {
		return null;
	}
}

export function setConsent(c: Consent) {
	try {
		localStorage.setItem(CONSENT_KEY, c);
	} catch {
		/* storage unavailable: the choice lasts for this page only */
	}
	gtag('consent', 'update', { analytics_storage: c });
	if (c === 'granted') loadClarity();
	window.dispatchEvent(new CustomEvent('arriqaaq:consent'));
}

/**
 * Whether the visitor seems to be in the EEA, UK or Switzerland. GA applies
 * its own default there by IP; the banner uses the time zone as a stand-in so
 * it needs no server. A visitor there with another time zone stays at
 * "denied" (no cookies) and simply is not asked.
 */
function inEurope(): boolean {
	try {
		return /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe))/.test(
			Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
		);
	} catch {
		return true;
	}
}

/** Show the consent banner: GA is on, no answer yet, and the visitor is in Europe. */
export function shouldAsk(): boolean {
	return !!GA_ID && !storedConsent() && inEurope();
}

/** Analytics cookies are allowed: an explicit yes, or no answer outside Europe. */
export function allowed(): boolean {
	const c = storedConsent();
	return c ? c === 'granted' : !inEurope();
}

// ---------------------------------------------------------------- page views

/** Content group for a route: reports can then compare lessons, articles, books. */
export function contentGroup(routeId: string | null, isLesson: boolean): string {
	if (!routeId) return 'error';
	if (routeId === '/') return 'home';
	if (routeId === '/[slug]') return isLesson ? 'lesson' : 'article';
	if (routeId === '/books/[slug]/read') return 'book_reader';
	if (routeId.startsWith('/books')) return 'book';
	if (routeId.startsWith('/courses')) return 'course';
	return 'listing';
}

export function pageView(group: string, referrer?: string) {
	track('page_view', {
		page_location: location.href,
		page_title: document.title,
		page_referrer: referrer,
		content_group: group
	});
}

// ---------------------------------------------------------------- reading

/**
 * Reading depth for one article: read_progress at 25/50/75/100% of the body
 * that has scrolled past the bottom of the screen, and article_complete when
 * the end is reached after at least 30 seconds on the page (so a fast flick
 * to the bottom is not counted as reading). Returns a cleanup.
 */
export function trackReading(article: HTMLElement, params: Params): () => void {
	if (!GA_ID) return () => {};
	const start = performance.now();
	const sent = new Set<number>();
	let completed = false;
	let raf = 0;
	const check = () => {
		raf = 0;
		const r = article.getBoundingClientRect();
		if (r.height <= 0) return;
		const seen = Math.min(1, Math.max(0, (innerHeight - r.top) / r.height));
		for (const mark of [25, 50, 75, 100]) {
			if (seen * 100 >= mark - 2 && !sent.has(mark)) {
				sent.add(mark);
				track('read_progress', { ...params, percent: mark });
			}
		}
		if (!completed && seen >= 0.98 && performance.now() - start > 30_000) {
			completed = true;
			track('article_complete', { ...params, seconds: Math.round((performance.now() - start) / 1000) });
		}
	};
	const onScroll = () => {
		if (!raf) raf = requestAnimationFrame(check);
	};
	addEventListener('scroll', onScroll, { passive: true });
	// The end can be reached without scrolling again after 30 s (short posts).
	const timer = setTimeout(check, 31_000);
	return () => {
		removeEventListener('scroll', onScroll);
		clearTimeout(timer);
		if (raf) cancelAnimationFrame(raf);
	};
}

// ---------------------------------------------------------------- site-wide listeners

let started = false;

/**
 * Once per page load: Core Web Vitals from real visitors, giscus comments,
 * the first touch on each interactive widget, and Microsoft Clarity when
 * configured and allowed.
 */
export function startAnalytics() {
	if (started || !GA_ID || typeof window === 'undefined') return;
	started = true;

	// Core Web Vitals (LCP, INP, CLS, plus FCP and TTFB) with the element to blame.
	import('web-vitals/attribution').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
		const send = (m: any) => {
			const a = m.attribution ?? {};
			track(m.name, {
				value: Math.round(m.name === 'CLS' ? m.delta * 1000 : m.delta),
				metric_id: m.id,
				metric_value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value),
				metric_rating: m.rating,
				debug_target: a.largestShiftTarget ?? a.interactionTarget ?? a.target ?? undefined,
				non_interaction: true
			});
		};
		onCLS(send);
		onINP(send);
		onLCP(send);
		onFCP(send);
		onTTFB(send);
	});

	// giscus posts its discussion metadata to the page; a rising count is a new comment.
	let comments = -1;
	addEventListener('message', (e) => {
		if (e.origin !== 'https://giscus.app') return;
		const d = (e.data as any)?.giscus?.discussion;
		if (!d || typeof d.totalCommentCount !== 'number') return;
		if (comments >= 0 && d.totalCommentCount > comments) track('comment_post', { content_id: location.pathname });
		comments = d.totalCommentCount;
	});

	// First interaction with each widget on a page.
	const touched = new Set<string>();
	addEventListener(
		'pointerdown',
		(e) => {
			const w = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('.widget-mount[data-widget]');
			if (!w) return;
			const key = location.pathname + '#' + w.id;
			if (touched.has(key)) return;
			touched.add(key);
			track('widget_interact', { widget_id: w.dataset.widget, content_id: location.pathname });
		},
		{ passive: true }
	);

	if (allowed()) loadClarity();
}

let clarityLoaded = false;
function loadClarity() {
	if (!CLARITY_ID || clarityLoaded) return;
	clarityLoaded = true;
	const w = window as any;
	w.clarity =
		w.clarity ||
		function (...args: unknown[]) {
			(w.clarity.q = w.clarity.q || []).push(args);
		};
	const s = document.createElement('script');
	s.async = true;
	s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
	document.head.appendChild(s);
	w.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
}
