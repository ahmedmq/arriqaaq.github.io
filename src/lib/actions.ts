/**
 * `use:reveal` adds .is-in when an element scrolls into view, once. Pair with
 * [data-reveal] (base.css) or any selector keyed on .is-in. Without JS or
 * IntersectionObserver the element is shown immediately.
 */
export function reveal(node: Element, opts: { margin?: string; selector?: string; threshold?: number } = {}) {
	const targets: Element[] = opts.selector ? [...node.querySelectorAll(opts.selector)] : [node];
	if (typeof IntersectionObserver === 'undefined') {
		targets.forEach((t) => t.classList.add('is-in'));
		return {};
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					e.target.classList.add('is-in');
					io.unobserve(e.target);
				}
			}
		},
		{ rootMargin: opts.margin ?? '0px 0px -12% 0px', threshold: opts.threshold ?? 0.05 }
	);
	targets.forEach((t) => io.observe(t));
	return { destroy: () => io.disconnect() };
}
