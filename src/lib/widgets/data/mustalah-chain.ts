/**
 * Text for the two chain widgets. Sources: the course notes, Class 1 (the
 * chain of As-Sahifa as-Sahiha) and "Brief History of Mustalah al-Hadith"
 * (the words of Abdullah bin al-Mubarak and Muhammad bin Sireen).
 */

export const CHAIN = {
	/** The sanad as the notes give it: Hammam, Abu Hurayrah, the Prophet (ﷺ). Only the narrators can be taken out; the Prophet (ﷺ) is where the report ends. */
	links: [
		{ name: 'Hammam ibn Munabbah', role: 'A student of Abu Hurayrah', narrator: true },
		{ name: 'Abu Hurayrah', role: 'A narrator', narrator: true },
		{ name: 'The Prophet (ﷺ)', role: 'Where the report ends', narrator: false }
	],
	caption:
		'As-Sahifa as-Sahiha: every hadith in it is present in Bukhari and Muslim, and its sanad is very short.',
	quote:
		'The (Isnaad) chain of narration is part of the (Deen) religion. Were it not for the chain (Isnaad), anyone could say whatever they wanted.',
	by: 'Abdullah bin al-Mubarak'
};

export const FITNAH = {
	steps: [
		{ label: 'Before', text: 'They did not used to ask about the chain of narration,' },
		{ label: 'The turmoil', text: 'but when the turmoil (fitnah) occurred, they said: ‘Name your men for us.’' },
		{
			label: 'After',
			text: 'Then they would look to the people of Sunnah and accept their narrations, and look to the people of innovation and reject their narrations.'
		}
	],
	by: 'Muhammad bin Sireen'
};
