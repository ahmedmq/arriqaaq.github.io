/**
 * Data for the Mustalah Hadith history widgets. One source of truth: the
 * widgets render it in the browser and scripts/widgets.ts renders the same
 * data as a plain list for readers without JavaScript.
 *
 * Every line comes from the course notes (Class 1) and "Brief History of
 * Mustalah al-Hadith". Nothing is added from outside them. Dates are the
 * death years (AH) those two sources give. Where the two sources differ, the
 * Brief History is followed.
 */

/** The palette hue each category wears. Amber is not used: it reads as orange. */
export type Hue = 'green' | 'purple' | 'blue' | 'pink';

export type Cat = 'sahifa' | 'first' | 'books' | 'salah';

export const CATS: Record<Cat, { label: string; hue: Hue }> = {
	sahifa: { label: 'Since the Sahabah', hue: 'green' },
	first: { label: 'The first works', hue: 'purple' },
	books: { label: 'The later days', hue: 'blue' },
	salah: { label: 'Ibn al-Salah and after', hue: 'pink' }
};

export type Entry = {
	cat: Cat;
	/** Death year in AH. Used only to order entries inside a category. */
	ah?: number;
	when: string;
	who: string;
	work: string;
	note: string;
};

const entries: Entry[] = [
	{
		cat: 'sahifa',
		when: 'Time of the Sahabah',
		who: 'Abdullah ibn Amr al-As',
		work: 'As-Sahifa as-Sadiqa',
		note: 'Written manuscripts of hadith were present since the time of the Sahabah. This is one of them.'
	},
	{
		cat: 'sahifa',
		when: 'Student of Abu Hurayrah',
		who: 'Hammam ibn Munabbah',
		work: 'As-Sahifa as-Sahiha',
		note: 'Every hadith in it is present in Bukhari and Muslim, and its sanad is very short: Hammam, Abu Hurayrah, the Prophet (ﷺ).'
	},
	{
		cat: 'first',
		ah: 204,
		when: 'd. 204 AH',
		who: 'Imam al-Shafi’i',
		work: 'Al-Risalah',
		note: 'The first to author a work in this science. He wrote it twice: the Old Risalah, which is lost, and the New Risalah, which is what we have today. His Kitab al-Umm is a fiqh book that also deals with usul al-fiqh, with some benefits on the hadith sciences.'
	},
	{
		cat: 'first',
		ah: 219,
		when: 'd. 219 AH',
		who: 'al-Humaydi, Abdullah bin al-Zubayr',
		work: 'A treatise on hadith terminology',
		note: 'Author of Al-Musnad and teacher of al-Bukhari. al-Khatib al-Baghdadi mentions, in Al-Kifayah, that he had such a treatise.'
	},
	{
		cat: 'first',
		ah: 261,
		when: 'd. 261 AH',
		who: 'Imam Muslim',
		work: 'The introduction to his Sahih',
		note: 'He classified reports, categorised narrators by memorisation and precision, and stressed narrating only from trustworthy sources. His Al-Tamyeez also touches on the subject.'
	},
	{
		cat: 'first',
		ah: 275,
		when: 'd. 275 AH',
		who: 'Imam Abu Dawood',
		work: 'Risalah ila Ahl Makkah',
		note: 'A risalah to the people of Mecca describing his Sunan. It covers mursal, ghareeb, shadh, munqati and mudallas narrations, and ma’lool hadith, concisely.'
	},
	{
		cat: 'first',
		ah: 279,
		when: 'd. 279 AH',
		who: 'Imam al-Tirmidhi',
		work: 'Al-Ilal as-Sagheer',
		note: 'A student of al-Bukhari. He placed it at the end of his Jami. It covers the types of transmission, ijazah, ziyadah al-thiqah and the permissibility of critiquing narrators. His Al-Ilal al-Kabeer is also published.'
	},
	{
		cat: 'first',
		ah: 354,
		when: 'd. 354 AH',
		who: 'Ibn Hibban al-Busti',
		work: 'Al-Thiqaat, Al-Majrooheen and his Sahih',
		note: 'In Al-Thiqaat he outlined the conditions for a reliable narrator. In Al-Majrooheen he listed twenty types of narrator criticism. The introduction to his Sahih summarises his conditions for authenticity.'
	},
	{
		cat: 'books',
		ah: 360,
		when: 'd. 360 AH',
		who: 'Qadi al-Ramahurmuzi',
		work: 'Al-Muhaddith al-Fasil bayn al-Rawi wa al-Waiee',
		note: 'It is not a book on every type of hadith science. It covers the etiquettes of narration, the qualities of a hadith student, high and low chains, and travel. al-Dhahabi said: “what an excellent book it is!”'
	},
	{
		cat: 'books',
		ah: 405,
		when: 'd. 405 AH',
		who: 'al-Hakim al-Naysaburi',
		work: 'Marifat Ulum al-Hadith',
		note: 'It encompasses most branches of the hadith sciences, with their types. Some scholars even consider it the pioneering work. He could not complete it.'
	},
	{
		cat: 'books',
		ah: 430,
		when: 'd. 430 AH',
		who: 'Abu Nuaym al-Asbahani',
		work: 'Al-Mustakhraj ala Kitab al-Hakim',
		note: 'He completed al-Hakim’s book and critiqued some of its points. As Ibn Hajar noted, he did not fully perfect it.'
	},
	{
		cat: 'books',
		ah: 446,
		when: 'd. 446 AH',
		who: 'Abu Yala al-Khalili',
		work: 'Al-Irshad fi Marifat Ulama al-Hadith',
		note: 'Its introduction covers the authentic hadith, hidden defects, oddity, unique and rejected narrations, high and low chains, and the tiers of the huffaz.'
	},
	{
		cat: 'books',
		ah: 463,
		when: 'd. 463 AH',
		who: 'al-Khatib al-Baghdadi',
		work: 'Al-Kifayah fee Ilm al-Riwayah, and Al-Jami li-Adab al-Shaykh wa al-Sami',
		note: 'Al-Kifayah is a foundational book on the principles of hadith transmission. Ibn Hajar says he wrote a book in every branch of the science. Whoever came after him took benefit from Al-Kifayah.'
	},
	{
		cat: 'books',
		ah: 507,
		when: 'd. 507 AH',
		who: 'al-Hafiz Muhammad bin Tahir al-Maqdisi',
		work: 'A book on high and low chains',
		note: 'On al-uluww wa al-nuzool.'
	},
	{
		cat: 'books',
		ah: 544,
		when: 'd. 544 AH',
		who: 'Qadi Iyad',
		work: 'Al-Ilma fi Dhabt ar-Riwayah wa Taqyeed as-Sama',
		note: 'Composed by Qadi Iyad.'
	},
	{
		cat: 'books',
		ah: 580,
		when: 'd. 580 AH',
		who: 'Abu Hafs al-Mayyanji',
		work: 'Ma La Yasa al-Muhaddith Jahluh',
		note: 'A concise treatise.'
	},
	{
		cat: 'salah',
		ah: 643,
		when: 'd. 643 AH',
		who: 'Ibn al-Salah',
		work: 'Marifat Anwa Ulum al-Hadith, known as Muqaddimah Ibn al-Salah',
		note: 'A scholar of Damascus. When he was appointed to teach hadith at Al-Madrasah al-Ashrafiyyah, he compiled what had been scattered across the works before him. It marked a turning point in the field.'
	},
	{
		cat: 'salah',
		ah: 676,
		when: 'd. 676 AH',
		who: 'Imam al-Nawawi',
		work: 'Irshad Tullab al-Haqaaiq, and Al-Taqreeb wa al-Tayseer',
		note: 'Two books on the hadith sciences. Irshad is the first abridgment of Ibn al-Salah (printed). Al-Suyuti later explained Al-Taqreeb in Tadreeb al-Rawi.'
	},
	{
		cat: 'salah',
		ah: 774,
		when: 'd. 774 AH',
		who: 'Ibn Kathir',
		work: 'Ikhtisar Uloom al-Hadith',
		note: 'Very famous. Ahmad Shakir wrote its famous commentary, Al-Baith al-Hathith.'
	},
	{
		cat: 'salah',
		ah: 805,
		when: 'd. 805 AH',
		who: 'al-Bulqini',
		work: 'Mahasin al-Istilah wa Tadmin Kitab Ibn al-Salah',
		note: 'A teacher of Ibn Hajar. He added five new categories to Ibn al-Salah’s original seventy.'
	},
	{
		cat: 'salah',
		ah: 806,
		when: 'd. 806 AH',
		who: 'al-Iraqi',
		work: 'Al-Tabsirah wa al-Tadhkirah, and Al-Taqyeed wa al-Eedah',
		note: 'The first is a 1000-line poem on Ibn al-Salah, for easy memorisation. The second clarifies the ambiguous points of Ibn al-Salah’s book.'
	},
	{
		cat: 'salah',
		ah: 911,
		when: 'd. 911 AH',
		who: 'al-Suyuti',
		work: 'Tadreeb al-Rawi, and Nazm al-Durar fee Ilm al-Athar',
		note: 'Tadreeb al-Rawi explains al-Nawawi\u2019s Al-Taqreeb. Nazm al-Durar is a poem, with his own incomplete commentary Al-Bahr al-Ladhi Zakhar (printed).'
	},
	{
		cat: 'salah',
		ah: 1182,
		when: 'd. 1182 AH',
		who: 'Muhammad ibn Ismail al-Amir as-San\u2019ani',
		work: 'Tawdhih al-Afkar, sharh Tanqih al-Anzar',
		note: 'From the notes\u2019 list of books on the science. He also versified Nukhbat al-Fikr, in Isbal al-Matar ala Qasab al-Sukkar.'
	},
	{
		cat: 'salah',
		ah: 902,
		when: 'd. 902 AH',
		who: 'al-Sakhawi',
		work: 'Fath al-Mugheeth',
		note: 'A student of Ibn Hajar. A comprehensive hadith manual, explaining and expanding on al-Iraqi’s poem.'
	},
	{
		cat: 'salah',
		ah: 852,
		when: 'd. 852 AH',
		who: 'Ibn Hajar al-Asqalani',
		work: 'Nukhbat al-Fikar, and its commentary Nuzhat al-Nazar',
		note: 'A concise treatise, followed by his own commentary on it. Scholars relied on it for its conciseness, organisation and accuracy.'
	},
	{
		cat: 'salah',
		ah: 1080,
		when: 'd. 1080 AH',
		who: 'Umar bin Muhammad al-Bayquni',
		work: 'Mandhumah al-Bayquniyyah',
		note: 'A short didactic poem of only 34 verses. Despite its brevity, it is one of the most famous and beneficial abridgments in hadith terminology.'
	},
	{
		cat: 'salah',
		ah: 1332,
		when: 'd. 1332 AH',
		who: 'Muhammad Jamal al-Deen al-Qasimi',
		work: 'Qawaid al-Tahdith',
		note: 'A well-researched and highly beneficial work on hadith principles.'
	}
];

const catOrder = Object.keys(CATS);
/** Categories in reading order, and inside a category by date. */
export const TIMELINE: Entry[] = [...entries].sort(
	(a, b) => catOrder.indexOf(a.cat) - catOrder.indexOf(b.cat) || (a.ah ?? 0) - (b.ah ?? 0)
);

/* ------------------------------------------------------------------ */
/* The books around the books                                           */
/* ------------------------------------------------------------------ */

export type GroupKey = 'abridged' | 'explained' | 'critique' | 'poem' | 'sharh';

export const GROUPS: Record<GroupKey, { label: string; hue: Hue }> = {
	abridged: { label: 'Abridgments', hue: 'purple' },
	explained: { label: 'Commentaries', hue: 'blue' },
	critique: { label: 'Critical notes', hue: 'pink' },
	poem: { label: 'Poems', hue: 'green' },
	sharh: { label: 'On Nuzhat al-Nazar', hue: 'purple' }
};

export type Work = { title: string; by: string; when?: string; note?: string };

export type Family = {
	id: string;
	tab: string;
	title: string;
	blurb: string;
	groups: Partial<Record<GroupKey, Work[]>>;
};

export const FAMILIES: Family[] = [
	{
		id: 'salah',
		tab: 'Ibn al-Salah',
		title: 'Muqaddimah Ibn al-Salah',
		blurb: 'Later scholars had little to do beyond rearranging its contents, simplifying it through abridgments or versification, or clarifying some of its objectives.',
		groups: {
			abridged: [
				{ title: 'Irshad Tullab al-Haqaaiq ila Marifat Sunan Khayr al-Khalaiq', by: 'al-Nawawi', when: 'd. 676 AH', note: 'The first abridgment of Ibn al-Salah’s Muqaddimah (printed).' },
				{ title: 'Al-Taqreeb wa al-Tayseer li-Marifat Sunan al-Basheer al-Nadheer', by: 'al-Nawawi', note: 'Later explained by al-Suyuti (d. 911 AH) in Tadreeb al-Rawi.' },
				{ title: 'Al-Iqtirah fee Funoon al-Istilah', by: 'Ibn Daqeeq al-Eed', when: 'd. 702 AH', note: 'A concise yet rich work on hadith terminology (printed).' },
				{ title: 'Al-Manhal al-Rawi fee Uloom al-Hadith al-Nabawi', by: 'Badr al-Deen bin Jamaah', when: 'd. 733 AH', note: 'Printed.' },
				{ title: 'Ikhtisar Uloom al-Hadith', by: 'Ibn Kathir', when: 'd. 774 AH' },
				{ title: 'Al-Muqni fee Uloom al-Hadith', by: 'Siraj al-Deen bin al-Mulaqqin', when: 'd. 804 AH', note: 'Printed.' },
				{
					title: 'Mahasin al-Istilah wa Tadmin Kitab Ibn al-Salah',
					by: 'al-Bulqini',
					when: 'd. 805 AH',
					note: 'Added five new categories to Ibn al-Salah’s original seventy: Companions narrating from each other, Successors narrating from each other, narrators sharing common traits (jurisprudence, region and so on), the causes behind certain hadith (asbab al-wurud), and the historical context of hadith texts.'
				}
			],
			critique: [
				{ title: 'Al-Nukat ala Muqaddimah Ibn al-Salah', by: 'al-Zarkashi', when: 'd. 794 AH', note: 'A critical analysis (printed).' },
				{ title: 'Al-Taqyeed wa al-Eedah li-ma Ubhima wa Ughliqa min Kitab Ibn al-Salah', by: 'al-Iraqi', when: 'd. 806 AH', note: 'Clarifies ambiguous points and corrects misconceptions about Ibn al-Salah’s work (printed).' },
				{ title: 'An-Nukat ala Ibn al-Salah', by: 'Ibn Hajar al-Asqalani', when: 'd. 852 AH', note: 'A detailed critique covering both Ibn al-Salah and al-Iraqi’s notes, marked with (ص) for Ibn al-Salah and (ع) for al-Iraqi. It is now published with takhreej by Shaykh Rabi.' }
			],
			poem: [
				{ title: 'Al-Tabsirah wa al-Tadhkirah', by: 'al-Iraqi', note: 'A 1000-line poem. He also wrote its commentary.' },
				{ title: 'Fath al-Mugheeth', by: 'al-Sakhawi', when: 'd. 902 AH', note: 'A comprehensive hadith manual explaining and expanding on the poem.' },
				{ title: 'Nazm al-Durar fee Ilm al-Athar', by: 'al-Suyuti', note: 'With his own incomplete commentary, Al-Bahr al-Ladhi Zakhar (printed).' },
				{ title: 'Manhaj Dhawi al-Nazar', by: 'al-Tarmasi', when: 'd. 1329 AH' }
			],
			explained: [
				{ title: 'A modern explanation', by: 'Ahmad Shakir', when: 'd. 1377 AH', note: 'The Brief History lists the modern explanations after the poems.' },
				{ title: 'A modern explanation', by: 'Muhammad Abdul Hameed', note: 'Printed.' },
				{ title: 'A modern explanation', by: 'Muhammad bin Adam al-Ethiopee', note: '2 volumes, printed. There are others too.' }
			]
		}
	},
	{
		id: 'nukhba',
		tab: 'Nukhbat al-Fikar',
		title: 'Nukhbat al-Fikar by Ibn Hajar',
		blurb: 'A concise treatise by Ibn Hajar, with his own commentary Nuzhat al-Nazar. Scholars turned to it for its conciseness, organisation and accuracy, and it became a focus of study.',
		groups: {
			explained: [
				{ title: 'Nuzhat al-Nazar fee Tawdih Nukhbat al-Fikar', by: 'Ibn Hajar al-Asqalani', note: 'The explanation of Nukhbat al-Fikr written by Ibn Hajar himself.' },
				{ title: 'An explanation of Nukhbat al-Fikr', by: 'Muhammad ibn Ahmad ibn Hajar', note: 'Ibn Hajar’s son.' },
				{ title: 'Annotations on the explanation of Nukhbat al-Fikr', by: 'Zain al-Din Qasim bin Qutlubugha al-Hanafi', when: 'd. 879 AH', note: 'A student of the author.' },
				{ title: 'Mustalahat Ahl al-Athar', by: 'Mulla Ali al-Qari', when: 'd. 1014 AH' },
				{ title: 'Al-Yawaqit wa al-Durar', by: 'Muhammad Abdul-Raouf al-Munawi al-Haddadi', when: 'd. 1031 AH' },
				{ title: 'An explanation of Nukhbat al-Fikr', by: 'Muhammad Sadiq bin Abdul-Hadi as-Sindi' },
				{ title: 'Bahjat al-Nazar', by: 'Abu al-Hasan al-Sindi', when: 'd. 1138 AH' }
			],
			sharh: [
				{ title: 'Hashiyah ala Nuzhat al-Nazar', by: 'Kamal al-Din Muhammad bin Muhammad bin Abi Sharif al-Shafii', when: 'd. 906 AH' },
				{ title: 'Sharh Nuzhat al-Nazar', by: 'Wajih al-Din al-Alawi (al-Ghujrati)', when: 'd. 978 AH' },
				{ title: 'Qada al-Watr fi Nuzhat al-Nazar', by: 'Ibrahim al-Laqani', when: 'd. 1040 AH' },
				{ title: 'Al-Nukat ala Nuzhat al-Nazar fi Tawdih Nukhbat al-Fikr', by: 'Ali Hasan bin Abdul Hameed al-Halabi', note: 'With comments from Shaykh al-Albani.' }
			],
			poem: [
				{ title: 'Uyun al-Maani, nazm of Nukhbat al-Fikr', by: 'Ahmad bin Sadaqa al-Sirfi al-Shafii al-Asqalani', when: 'd. 905 AH' },
				{ title: 'Nazm Nukhbat al-Fikr', by: 'Muhammad al-Shumni', note: 'His son Taqi al-Din Ahmad bin Muhammad al-Shumni explained it in Al-Ali al-Rutba fi Sharh Nazm al-Nukhba.' },
				{ title: 'Nazm Nukhbat al-Fikr', by: 'Shihab al-Din Ahmad bin Muhammad al-Tufi', when: 'd. 883 AH', note: 'Nukhbat al-Fikr was converted into a poem for easy memorisation.' },
				{ title: 'Aqd al-Durar fi Nazm Nukhbat al-Fikr', by: 'Abu Hamid Muhammad al-Arabi ibn Yusuf al-Fasi', when: 'd. 1052 AH' },
				{ title: 'Isbal al-Matar ala Qasab al-Sukkar', by: 'Muhammad bin Ismail al-Amir al-Sanani al-Yamani', when: 'd. 1182 AH', note: 'And so on.' }
			]
		}
	},
	{
		id: 'ikhtisar',
		tab: 'Ikhtisar Uloom al-Hadith',
		title: 'Ikhtisar Uloom al-Hadith by Ibn Kathir',
		blurb: 'Not part of the book we are studying, but very famous.',
		groups: {
			explained: [
				{ title: 'Al-Baith al-Hathith', by: 'Ahmad Shakir', note: 'The famous commentary. It is also published with beneficial footnotes from Muhammad Nasiruddin al-Albani. A copy exists with the notes of Shaykh al-Albani and Ali al-Halabi in it.' },
				{ title: 'Al-Sayr al-Hatheeth Sharh Ikhtisar Uloom al-Hadith', by: 'Muqbil bin Hadee al-Wadiee' },
				{ title: 'Fath al-Mugheeth fee Taleeq ala Kitab Ikhtisar Uloom al-Hadith', by: 'Amr Abdul Munim Saleem' },
				{ title: 'Al-Sayeeul-Hatheeth ila Sharh Ikhtisar Uloom al-Hadith', by: 'Abdul Azeez bin Sagheer' },
				{ title: 'Sharh Ikhtisar Uloom al-Hadith', by: 'Ibrahim al-Lahm' },
				{ title: 'Al-Ghayth al-Mugheeth Sharh Ikhtisar Uloom al-Hadith', by: 'Mustafa bin Ismail al-Sulaymani' }
			]
		}
	},
	{
		id: 'bayquni',
		tab: 'Al-Bayquniyyah',
		title: 'Mandhumah al-Bayquniyyah',
		blurb: 'A short didactic poem of only 34 verses by Umar bin Muhammad al-Bayquni (d. 1080 AH). Despite its brevity, it is one of the most famous and beneficial abridgments in hadith terminology.',
		groups: {
			explained: [
				{ title: 'Al-Arjuun fi Sharh al-Bayqoon', by: 'Nawab Siddiq Hasan Khan', when: 'd. 1307 AH', note: 'He wrote books in all fields of Islam. Shaykh Uzair Shams says he was an ummah in his own because of his works.' }
			]
		}
	}
];

/* ------------------------------------------------------------------ */
/* Quiz                                                                  */
/* ------------------------------------------------------------------ */

export type Question = { q: string; options: string[]; answer: number; why: string };

export const QUIZ: Question[] = [
	{
		q: 'Whose collection is As-Sahifa as-Sadiqa?',
		options: ['Hammam ibn Munabbah', 'Abdullah ibn Amr al-As', 'Abu Hurayrah'],
		answer: 1,
		why: 'As-Sahifa as-Sadiqa is by Abdullah ibn Amr al-As. As-Sahifa as-Sahiha is by Hammam ibn Munabbah, a student of Abu Hurayrah.'
	},
	{
		q: 'Every hadith in As-Sahifa as-Sahiha is found in...',
		options: ['Bukhari and Muslim', 'Sunan Abu Dawood', 'Jami al-Tirmidhi'],
		answer: 0,
		why: 'And its sanad is very short: Hammam, Abu Hurayrah, the Prophet (ﷺ).'
	},
	{
		q: 'What did Abdullah bin al-Mubarak say the chain (isnad) is?',
		options: ['A matter of style', 'Part of the religion', 'Needed only for the Sahabah'],
		answer: 1,
		why: '“The chain of narration is part of the religion. Were it not for the chain, anyone could say whatever they wanted.”'
	},
	{
		q: 'Which book is a fiqh book that also deals with usul al-fiqh, yet has some benefits on the hadith sciences?',
		options: ['Kitab al-Umm', 'Al-Kifayah', 'Muqaddimah Ibn al-Salah'],
		answer: 0,
		why: 'Kitab al-Umm, by Imam al-Shafi’i. Kitab ar-Risalah is the first book written on these topics.'
	},
	{
		q: 'What happened to the Old Risalah?',
		options: ['It is read today beside the New Risalah', 'It has been lost', 'It was renamed Kitab al-Umm'],
		answer: 1,
		why: 'The Old Risalah has been lost. What people have today is only the New Risalah.'
	},
	{
		q: 'Who compiled what was scattered across earlier works, marking a turning point in the field?',
		options: ['al-Khatib al-Baghdadi', 'Ibn al-Salah', 'al-Hakim'],
		answer: 1,
		why: 'Ibn al-Salah, in Marifat Anwa Ulum al-Hadith, known as Muqaddimah Ibn al-Salah.'
	},
	{
		q: 'How many verses does Al-Bayquniyyah have?',
		options: ['34', '100', '1000'],
		answer: 0,
		why: 'Only 34. The 1000-line poem is al-Iraqi’s, on Ibn al-Salah.'
	},
	{
		q: 'Which of these huffaz lived in the East?',
		options: ['Ibn Hazm', 'Ibn Abd al-Barr', 'al-Khatib al-Baghdadi'],
		answer: 2,
		why: 'West: Ibn Hazm and Ibn Abd al-Barr. East: al-Khatib al-Baghdadi and al-Bayhaqi.'
	}
];

/* ------------------------------------------------------------------ */
/* Put the story in order                                               */
/* ------------------------------------------------------------------ */

/** Six milestones the reader puts in order before seeing the timeline.
 *  Every line and date is from the lesson; listed here in the right order. */
export type Milestone = { ah: number; work: string; who: string; line: string };

export const MILESTONES: Milestone[] = [
	{ ah: 204, work: 'Al-Risalah', who: 'Imam al-Shafi’i', line: 'The first to author a work in this noble science.' },
	{ ah: 279, work: 'Al-Ilal as-Sagheer', who: 'Imam al-Tirmidhi', line: 'Placed at the end of his Al-Jami al-Kabeer.' },
	{ ah: 360, work: 'Al-Muhaddith al-Fasil', who: 'al-Ramahurmuzi', line: 'Singled out the science of mustalah for authorship, in a rudimentary state.' },
	{ ah: 463, work: 'Al-Kifayah fee Ilm al-Riwayah', who: 'al-Khatib al-Baghdadi', line: 'Everyone who came after al-Khatib became dependent on his books.' },
	{ ah: 643, work: 'Muqaddimah Ibn al-Salah', who: 'Ibn al-Salah', line: 'Compiled what had been scattered; a turning point in the field.' },
	{ ah: 852, work: 'Nukhbat al-Fikar', who: 'Ibn Hajar al-Asqalani', line: 'Scholars turned to it for its conciseness, organisation and accuracy.' }
];
