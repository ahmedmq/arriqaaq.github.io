/**
 * The six disciplines Arriqaaq teaches, in the order a student usually meets
 * them. `course` links a subject to its live course; `tag` to its articles.
 * Add a subject here and it appears on the landing page automatically.
 */
import type { Subject } from './types';

export type SubjectInfo = {
	id: Subject;
	name: string;
	arabic: string;
	question: string; // the card's second line
	course?: string; // course slug when one is live
	tag?: string; // tag slug for its articles
};

export const SUBJECTS: SubjectInfo[] = [
	{ id: 'tajweed', name: 'Tajweed', arabic: 'التجويد', question: 'Reciting the Qur’an as it was revealed' },
	{ id: 'nahw', name: 'Arabic grammar', arabic: 'النحو', question: 'The grammar that opens the texts' },
	{ id: 'aqeedah', name: 'Aqeedah', arabic: 'العقيدة', question: 'What a Muslim believes, and why', tag: 'islam' },
	{ id: 'hadith', name: 'Usul al-Hadith', arabic: 'أصول الحديث', question: 'How a narration is judged' },
	{ id: 'fiqh', name: 'Usul al-Fiqh', arabic: 'أصول الفقه', question: 'How rulings are derived', course: 'usul-al-fiqh', tag: 'fiqh' },
	{ id: 'tafsir', name: 'Usul at-Tafsir', arabic: 'أصول التفسير', question: 'How the Qur’an is explained', tag: 'tafsir' }
];
