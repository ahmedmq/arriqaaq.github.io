/**
 * Glossary of hadith terms (DESIGN.md → Rich posts). In Mustalah Hadith
 * posts, the first mention of a term in each section becomes tappable and
 * opens a card with its meaning and the lesson that explains it, the same
 * way scholar cards work (src/lib/data/scholars.ts).
 *
 * Every meaning here is the course's own gloss, in the words of the lesson
 * named in `lesson` (for Part 1, its parenthetical explanations). Nothing is
 * added from outside the lessons. A term the course has not explained yet
 * is marked `later`, as Part 1 says: "Each one gets its own lesson later".
 * When a later part explains it, add the meaning and point `lesson` there.
 * `match` is the pattern for the term as the posts write it (case-
 * sensitive).
 */
export type Term = {
	id: string;
	term: string;
	meaning?: string;
	later?: boolean;
	lesson: string; // slug of the lesson that explains (or first mentions) it
	match: string; // RegExp source
};

const P1 = 'mustalah-hadith-made-easy-part-1-brief-history';

export const TERMS: Term[] = [
	{ id: 'afrad', term: 'al-afrad', meaning: 'Unique narrations.', lesson: P1, match: 'al-afrad' },
	{ id: 'ghareeb', term: 'ghareeb', meaning: 'Rare.', lesson: P1, match: 'ghareeb' },
	{ id: 'hasan', term: 'hasan', meaning: 'Good.', lesson: P1, match: 'hasan' },
	{ id: 'illah', term: 'al-illah', meaning: 'Hidden defects.', lesson: P1, match: 'al-illah' },
	{ id: 'ijazah', term: 'ijazah', meaning: 'Permission to narrate.', lesson: P1, match: 'ijazah' },
	{ id: 'khabar-wahid', term: 'Khabar al-Wahid', meaning: 'Singular narrations.', lesson: P1, match: 'Khabar al-Wahid' },
	{ id: 'malool', term: 'ma’lool', meaning: 'Hadith with hidden defects.', later: true, lesson: P1, match: "ma['’]lool" },
	{ id: 'mawsool', term: 'mawsool', meaning: 'Connected.', lesson: P1, match: 'mawsool' },
	{ id: 'mudallas', term: 'mudallas', later: true, lesson: P1, match: 'mudallas' },
	{ id: 'mukhtaliteen', term: 'mukhtaliteen', meaning: 'Those who mix up narrations.', lesson: P1, match: 'mukhtaliteen' },
	{ id: 'munkar', term: 'munkar', meaning: 'Rejected.', lesson: P1, match: '(?:al-)?munkar' },
	{ id: 'munqati', term: 'munqati', meaning: 'Interrupted.', lesson: P1, match: 'munqati' },
	{ id: 'mursal', term: 'mursal', later: true, lesson: P1, match: '[Mm]ursal' },
	{ id: 'raf', term: 'raf', meaning: 'Elevation.', lesson: P1, match: 'raf' },
	{ id: 'riwayah-bil-mana', term: 'Riwayah bil Mana', meaning: 'Narration by meaning.', lesson: P1, match: 'Riwayah bil Mana|al-riwayah bi al-mana' },
	{ id: 'sanad', term: 'sanad', meaning: 'The chain of narrators.', lesson: P1, match: 'sanad' },
	{ id: 'shadh', term: 'shadh', meaning: 'Irregular.', lesson: P1, match: 'shadh' },
	{ id: 'shudhudh', term: 'ash-shudhudh', meaning: 'Oddity in narrations.', lesson: P1, match: 'ash-shudhudh' },
	{ id: 'tabaqat-huffaz', term: 'tabaqat al-huffaz', meaning: 'The tiers of the hadith masters.', lesson: P1, match: 'tabaqat al-huffaz' },
	{ id: 'tadlees', term: 'tadlees', meaning: 'Concealing flaws in the chain.', lesson: P1, match: 'tadlees' },
	{ id: 'uluww', term: 'al-uluww wa an-nuzool', meaning: 'Higher and lower chains.', lesson: P1, match: 'al-uluww wa an-nuzool' },
	{ id: 'waqf', term: 'waqf', meaning: 'Stopping.', lesson: P1, match: 'waqf' }
];

/** One pattern for all terms; group `t<i>` tells which term matched. */
export function termPattern(flags = 'g'): RegExp {
	return new RegExp(TERMS.map((t, i) => `(?<t${i}>(?<![\\w'’-])(?:${t.match})(?![\\w'’-]))`).join('|'), flags);
}

export function matchedTerm(m: RegExpMatchArray): Term | undefined {
	const g = m.groups ?? {};
	return TERMS.find((_, k) => g[`t${k}`] !== undefined);
}
