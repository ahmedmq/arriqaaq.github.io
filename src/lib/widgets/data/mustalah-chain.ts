/**
 * Text for the two chain widgets. Sources: the course notes, Class 1 (the
 * chain of As-Sahifa as-Sahiha) and "Brief History of Mustalah al-Hadith"
 * (the words of Abdullah bin al-Mubarak and Muhammad bin Sireen).
 */

export const CHAIN = {
	/**
	 * The chain as the notes draw it by hand: the Prophet (ﷺ) at the top, then
	 * Abu Hurayrah, then Hammam ibn Munabbah. (The typed note reads the sanad
	 * the other way: Hammam, Abu Hurayrah, the Prophet (ﷺ).) Only the narrators
	 * can be taken out; the Prophet (ﷺ) is where the report starts.
	 */
	links: [
		{ name: 'The Prophet (ﷺ)', role: 'Where the report starts', narrator: false },
		{ name: 'Abu Hurayrah', role: 'A narrator', narrator: true },
		{ name: 'Hammam ibn Munabbah', role: 'A student of Abu Hurayrah', narrator: true }
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
