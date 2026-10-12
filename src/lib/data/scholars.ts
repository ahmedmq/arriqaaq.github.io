/**
 * Scholar cards (DESIGN.md → Rich posts). In Mustalah Hadith posts, the first
 * mention of a scholar in each section becomes tappable and opens a small
 * card: name, death year, the works the lessons mention, and the other
 * posts on the site that mention him (computed at build time).
 *
 * Every line here comes from the lessons (the course notes and the "Brief
 * History" document, as published in Part 1). Nothing is added from outside
 * them. `match` is the pattern for the name as the posts write it; it must
 * not match book titles that contain the name (Muqaddimah Ibn al-Salah,
 * Sahih Muslim, Kitab al-Hakim...).
 */
export type Scholar = {
	id: string;
	name: string;
	ah?: number;
	born?: number;
	line?: string;
	works: string[];
	match: string; // RegExp source, matched case-sensitively
};

// A name inside a book title is not a mention of the person.
const NOT_TITLE =
	'(?<!Muqaddimah )(?<!Kitab )(?<!Jami )(?<!Sahih )(?<!Sunan )(?<!Tafsir )(?<!Tafseer )(?<!Taqreeb )(?<!Sharh )(?<!\\bala )(?<!Ilal )';

export const SCHOLARS: Scholar[] = [
	{ id: 'shafii', name: 'Imam al-Shafi’i', ah: 204, line: 'The first to author a work in this noble science.', works: ['Al-Risalah', 'Kitab al-Umm'], match: "al-Shafi['’]i" },
	{ id: 'humaydi', name: 'al-Humaydi, Abdullah bin al-Zubayr', ah: 219, line: 'The author of Al-Musnad and a teacher of al-Bukhari.', works: ['A treatise on hadith terminology'], match: 'al-Humaydi' },
	{ id: 'muslim', name: 'Imam Muslim bin al-Hajjaj al-Qushayri al-Naysaburi', ah: 261, works: ['The introduction (Muqaddimah) of his Al-Jami, Sahih Muslim', 'Al-Tamyeez'], match: 'Imam Muslim' },
	{ id: 'abudawood', name: 'Imam Abu Dawood al-Sijistani', ah: 275, works: ['Risalah ila Ahl Makkah'], match: 'Abu Dawood' },
	{ id: 'tirmidhi', name: 'Imam Muhammad bin Isa bin Sawrah al-Tirmidhi', ah: 279, line: 'A student of Imam al-Bukhari.', works: ['Al-Ilal as-Sagheer', 'Al-Jami al-Kabeer', 'Al-Ilal al-Kabeer'], match: 'al-Tirmidhi' },
	{ id: 'ibnhibban', name: 'al-Hafiz Muhammad bin Hibban al-Busti', ah: 354, works: ['Al-Thiqaat', 'Al-Majrooheen', 'Al-Saheeh ala al-Taqaseem wa al-Anwa'], match: '(?:Ibn|bin) Hibban' },
	{ id: 'ramahurmuzi', name: 'Qadi al-Hasan bin Abdurrahman al-Ramahurmuzi', ah: 360, line: 'He singled out the science of mustalah for authorship, in a rudimentary state.', works: ['Al-Muhaddith al-Fasil bayn al-Rawi wa al-Waiee'], match: 'al-Ramahurmuzi' },
	{ id: 'hakim', name: 'Abu Abdillah Muhammad bin Abdullah al-Hakim al-Naysaburi', ah: 405, works: ['Marifat Ulum al-Hadith'], match: 'al-Hakim' },
	{ id: 'abunuaym', name: 'Abu Nuaym Ahmad bin Abdullah al-Asbahani', ah: 430, works: ['Al-Mustakhraj ala Kitab al-Hakim', 'Hilyatul Awliya wa Tabaqat al-Asfiya'], match: 'Abu Nuaym' },
	{ id: 'khalili', name: 'Abu Yala al-Khalili', ah: 446, works: ['Al-Irshad fi Marifat Ulama al-Hadith'], match: 'al-Khalili' },
	{ id: 'khatib', name: 'al-Khatib al-Baghdadi (Abu Bakr Ahmad bin Ali)', ah: 463, line: 'In the words of Ibn Nuqtah, everyone who came after al-Khatib became dependent on his books.', works: ['Al-Kifayah fee Ilm al-Riwayah', 'Al-Jami li-Adab al-Shaykh wa al-Sami'], match: 'al-Khatib(?: al-Baghdadi)?' },
	{ id: 'maqdisi', name: 'al-Hafiz Abu al-Fadl Muhammad bin Tahir al-Maqdisi', ah: 507, works: ['A book on higher and lower chains (al-uluww wa an-nuzool)'], match: '(?<=Tahir )al-Maqdisi' },
	{ id: 'iyad', name: 'Qadi Iyad', ah: 544, works: ['Al-Ilma fi Dhabt ar-Riwayah wa Taqyeed as-Sama'], match: 'Qadi Iyad' },
	{ id: 'mayyanji', name: 'Abu Hafs Umar al-Mayyanji', ah: 581, works: ['Ma La Yasa al-Muhaddith Jahluh'], match: 'al-Mayyanji' },
	{ id: 'ibnsalah', name: 'Abu Amr Uthman bin al-Salah al-Shahrazuri', ah: 643, born: 577, line: 'A scholar residing in Damascus. His book marked a turning point in the field.', works: ['Marifat Anwa Uloom al-Hadith, famously called Muqaddimah Ibn al-Salah'], match: '(?:Ibn|bin) al-Salah' },
	{ id: 'nawawi', name: 'Imam al-Nawawi', ah: 676, line: 'The author of the Forty Hadith.', works: ['Irshad Tullab al-Haqaaiq', 'Al-Taqreeb'], match: 'al-Nawawi' },
	{ id: 'ibnkathir', name: 'Ibn Kathir', ah: 774, works: ['Ikhtisar Uloom al-Hadith'], match: 'Ibn Kathir' },
	{ id: 'bulqini', name: 'al-Bulqini', ah: 805, line: 'A teacher of Ibn Hajar.', works: ['Mahasin al-Istilah'], match: '[Aa]l-Bulqini' },
	{ id: 'iraqi', name: 'al-Iraqi', ah: 806, works: ['Alfiyyah, a poem of 1000 lines on Ibn al-Salah’s Muqaddimah'], match: '[Aa]l-Iraqi' },
	{ id: 'ibnhajar', name: 'Abu al-Fadl Ahmad bin Ali bin Hajar al-Asqalani', ah: 852, works: ['Nukhbat al-Fikar fee Mustalah Ahl al-Athar', 'Nuzhat al-Nazar fee Tawdih Nukhbat al-Fikar', 'An-Nukat ala Ibn al-Salah'], match: 'Ibn Hajar' },
	{ id: 'sakhawi', name: 'al-Sakhawi', ah: 902, line: 'A student of Ibn Hajar.', works: ['Fath al-Mugheeth'], match: '[Aa]l-Sakhawi' },
	{ id: 'suyuti', name: 'Jalaluddin as-Suyuti', ah: 911, works: ['Tadreeb al-Rawi fi Sharh Taqreeb al-Nawawi'], match: 'as-Suyuti' },
	{ id: 'bayquni', name: 'Umar bin Muhammad al-Bayquni', ah: 1080, works: ['Mandhumah al-Bayquniyyah, a poem of 34 verses'], match: 'al-Bayq(?:uni|ooni)\\b' },
	{ id: 'qasimi', name: 'Muhammad Jamal al-Deen al-Qasimi', ah: 1332, works: ['Qawaid al-Tahdith'], match: 'al-Qasimi' }
];

/** One pattern for all names; group `s<i>` tells which scholar matched. */
export function scholarPattern(flags = 'g'): RegExp {
	return new RegExp(
		SCHOLARS.map((s, i) => `(?<s${i}>${NOT_TITLE}\\b${s.match}(?![\\w-]))`).join('|'),
		flags
	);
}

export function matchedScholar(m: RegExpMatchArray): Scholar | undefined {
	const g = m.groups ?? {};
	const i = SCHOLARS.findIndex((_, k) => g[`s${k}`] !== undefined);
	return SCHOLARS[i];
}
