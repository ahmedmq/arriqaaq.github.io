/**
 * Instagram launch for Mustalah Hadith Made Easy, in two carousels (1080x1440):
 *   instagram/mustalah-launch/series/   the SERIES: why it matters, what it is, what
 *                                       it covers, the book it follows, how a lesson works
 *   instagram/mustalah-launch/part-1/   the FIRST POST: real phone screenshots of the
 *                                       story, the chain, the game, Pause and check,
 *                                       scholar cards and the quiz
 * Every claim is the lesson's own words (the post's opening, its definition and its
 * sources) or a topic heading in the owner's class notes; quotations keep their
 * citation. Topics after Part 1 are named, never numbered or dated.
 *   npm run dev      then      npm run instagram:mustalah
 * Needs playwright-core and system Chrome.
 * No people in any frame: only text, diagrams and interface.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright-core';

const SITE = process.env.SITE ?? 'http://127.0.0.1:5173';
const POST = `${SITE}/mustalah-hadith-made-easy-part-1-brief-history/`;
const root = resolve(process.cwd(), 'instagram/mustalah-launch');
const tmp = resolve(root, '.tmp');
for (const d of ['series', 'part-1']) {
	rmSync(resolve(root, d), { recursive: true, force: true });
	mkdirSync(resolve(root, d), { recursive: true });
}
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const p: Page = await ctx.newPage();
await p.goto(POST, { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
await p.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));

const el = async (sel: string, name: string, nth = 0) => {
	const l = p.locator(sel).nth(nth);
	await l.scrollIntoViewIfNeeded();
	await p.waitForTimeout(700);
	await l.screenshot({ path: resolve(tmp, `${name}.png`) });
};
const tap = async (sel: string, nth = 0) => {
	await p.locator(sel).nth(nth).scrollIntoViewIfNeeded();
	await p.locator(sel).nth(nth).tap();
	await p.waitForTimeout(500);
};

// the five-step story
await el('.prose figure >> nth=0', 'story');

// before the fitnah / after: the chain began to matter
await tap('.widget-mount[data-widget=mh-fitnah] [data-next]');
await el('.widget-mount[data-widget=mh-fitnah]', 'fitnah');

// take a narrator out of the chain
await tap('.widget-mount[data-widget=isnad-chain] [data-i="1"]');
await el('.widget-mount[data-widget=isnad-chain]', 'chain');

// put the six books in order, then check: the ruler to scale
const order = '.widget-mount[data-widget=mh-order]';
for (let m = 0; m < 6; m++) await tap(`${order} [data-pick="${m}"]`);
await tap(`${order} [data-check]`);
await p.waitForTimeout(1500);
await el(order, 'order');

// Pause and check, one answer open
await tap('.pause details summary, .pause details > :first-child', 0).catch(() => {});
await el('.pause >> nth=0', 'pause');

// the quiz, one answer given
const quiz = '.widget-mount[data-widget=mh-quiz-1]';
await tap(`${quiz} [data-o="1"]`); // the correct answer, so its explanation shows
await el(quiz, 'quiz');

// a scholar card (bottom sheet)
await p.evaluate(() => scrollTo(0, 0));
await p.locator('.prose .sch').first().scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.locator('.prose .sch').first().tap();
await p.waitForTimeout(1200);
await p.locator('.sch-card').screenshot({ path: resolve(tmp, 'scholar.png') });

// the course page
const c = await ctx.newPage();
await c.goto(`${SITE}/courses/mustalah-hadith/`, { waitUntil: 'networkidle' });
await c.waitForTimeout(1500);
await c.screenshot({ path: resolve(tmp, 'course.png') });
await ctx.close();

// ---- slides -------------------------------------------------------------------------------
const flower = `<svg width="46" height="46" viewBox="-9 -9 18 18"><g fill="#ff00a0"><circle cx="0" cy="-4.4" r="3.2"/><circle cx="4.18" cy="-1.36" r="3.2"/><circle cx="2.59" cy="3.56" r="3.2"/><circle cx="-2.59" cy="3.56" r="3.2"/><circle cx="-4.18" cy="-1.36" r="3.2"/></g><circle r="2.1" fill="#ffbe00"/></svg>`;
const css = `
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1440px;background:#fff;color:#0d0c13;font-family:Inter,system-ui,sans-serif;position:relative;overflow:hidden}
.top{position:absolute;left:88px;right:88px;top:84px;display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:14px;font-size:38px;font-weight:600;letter-spacing:-.02em}
.count{font:500 28px 'JetBrains Mono',ui-monospace,monospace;color:#6b6a78;letter-spacing:.04em}
.eyebrow{position:absolute;left:88px;top:204px;font-size:30px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
h1{position:absolute;left:88px;right:88px;top:262px;font-size:112px;line-height:1.02;letter-spacing:-.045em;font-weight:500;text-wrap:balance}
.panel{position:absolute;left:56px;right:56px;bottom:0;border-radius:64px 64px 0 0}
.card{position:absolute;background:#fff;border:6px solid #0d0c13;border-bottom:0;border-radius:44px 44px 0 0;overflow:hidden}
.card img{display:block;width:100%}
.phone{position:absolute;border:8px solid #0d0c13;border-bottom:0;border-radius:72px 72px 0 0;overflow:hidden;background:#fff}
.phone img{display:block;width:100%}
.ar{font-family:'IBM Plex Sans Arabic','Noto Naskh Arabic',sans-serif;font-weight:500;direction:rtl}
`;
type Slide = { name: string; hue: string; eyebrow: string; title: string; shot?: string; kind?: string; top?: number; w?: number };
const P = '#9800ff', B = '#0066ff', G = '#00c25a', K = '#ff00a0';
const em = (t: string, c: string) => `<span style="color:${c}">${t}</span>`;
const url = (n: string) => pathToFileURL(resolve(tmp, `${n}.png`)).href;
const COURSE = 'arriqaaq.com/courses/mustalah-hadith';
const LESSON = 'arriqaaq.com/mustalah-hadith-made-easy-part-1-brief-history';

const part1: Slide[] = [
	{ name: 'cover', hue: P, eyebrow: 'Mustalah Hadith Made Easy · Part 1', title: `A brief ${em('history.', P)}`, kind: 'p1cover' },
	{ name: 'story', hue: G, eyebrow: 'Part 1', title: `The story in ${em('five steps.', G)}`, shot: 'story', top: 700, w: 520 },
	{ name: 'chain', hue: B, eyebrow: 'Try it yourself', title: `Take a narrator ${em('out of the chain.', B)}`, shot: 'chain', top: 700, w: 640 },
	{ name: 'fitnah', hue: K, eyebrow: 'Why the chain matters', title: `Then they began ${em('to ask.', K)}`, shot: 'fitnah', top: 740, w: 760 },
	{ name: 'order', hue: P, eyebrow: 'A game', title: `Put the books ${em('in order.', P)}`, shot: 'order', top: 700, w: 640 },
	{ name: 'pause', hue: G, eyebrow: 'After every section', title: `Pause and ${em('check yourself.', G)}`, shot: 'pause', top: 760, w: 760 },
	{ name: 'scholars', hue: B, eyebrow: 'Every scholar named', title: `Tap a name. ${em('Meet the scholar.', B)}`, shot: 'scholar', top: 800, w: 760 },
	{ name: 'quiz', hue: K, eyebrow: 'End of the lesson', title: `Eight questions. ${em('Each one explained.', K)}`, shot: 'quiz', top: 700, w: 520 },
	{ name: 'start', hue: P, eyebrow: 'Part 1 is out', title: `Read the ${em('first lesson.', P)}`, kind: 'p1end' }
];

const series: Slide[] = [
	{ name: 'cover', hue: P, eyebrow: 'A new course', title: `Mustalah Hadith ${em('Made Easy.', P)}`, kind: 's-cover' },
	{ name: 'question', hue: K, eyebrow: 'Start with a question', title: `How do we know a hadith ${em('is authentic?', K)}`, kind: 's-question' },
	{ name: 'quote', hue: B, eyebrow: 'Abdullah bin al-Mubarak', title: `The chain is ${em('part of the religion.', B)}`, kind: 's-quote' },
	{ name: 'science', hue: P, eyebrow: 'The science', title: `It tells us which hadith are ${em('authentic.', P)}`, kind: 's-science' },
	{ name: 'covers', hue: G, eyebrow: 'The road ahead', title: `What the course ${em('covers.', G)}`, kind: 's-road' },
	{ name: 'book', hue: K, eyebrow: 'The book we follow', title: `Taught based on ${em('the book.', K)}`, kind: 's-book' },
	{ name: 'lesson', hue: B, eyebrow: 'How a lesson works', title: `Read it. ${em('Then try it.', B)}`, kind: 's-lesson' },
	{ name: 'start', hue: P, eyebrow: 'Free, from the start', title: `Begin with ${em('Part 1.', P)}`, kind: 's-end' }
];

const nodeBox = (hue: string, label: string, title: string, w = 400) =>
	`<div style="background:${hue};border:4px solid #0d0c13;border-radius:28px;padding:26px 30px;color:#fff;width:${w}px;height:178px;display:flex;flex-direction:column;justify-content:center;gap:8px"><div style="font-size:21px;font-weight:600;letter-spacing:.1em;text-transform:uppercase">${label}</div><div style="font-size:38px;font-weight:600;letter-spacing:-.02em;line-height:1.12">${title}</div></div>`;
const darrow = (dir: 'r' | 'l' | 'd') =>
	dir === 'd'
		? `<svg width="40" height="56" viewBox="0 0 40 56"><line x1="20" y1="2" x2="20" y2="42" stroke="#0d0c13" stroke-width="4" stroke-dasharray="10 8"/><path d="M8,40 L20,54 L32,40 Z" fill="#0d0c13"/></svg>`
		: dir === 'r'
			? `<svg width="60" height="40" viewBox="0 0 60 40"><line x1="2" y1="20" x2="46" y2="20" stroke="#0d0c13" stroke-width="4" stroke-dasharray="10 8"/><path d="M44,8 L58,20 L44,32 Z" fill="#0d0c13"/></svg>`
			: `<svg width="60" height="40" viewBox="0 0 60 40"><line x1="58" y1="20" x2="14" y2="20" stroke="#0d0c13" stroke-width="4" stroke-dasharray="10 8"/><path d="M16,8 L2,20 L16,32 Z" fill="#0d0c13"/></svg>`;
const bigText = (t: string, top: number, size = 64, color = '#0d0c13') => `<div style="position:absolute;left:112px;right:112px;top:${top}px;font-size:${size}px;font-weight:500;letter-spacing:-.03em;line-height:1.18;color:${color}">${t}</div>`;
const pill = (t: string, hue: string) => `<span style="display:inline-block;background:${hue};color:#fff;border-radius:999px;padding:10px 26px;font-size:30px;font-weight:600;letter-spacing:-.01em">${t}</span>`;

function seriesBody(s: Slide) {
	const panel = (top: number) => `<div class="panel" style="background:${s.hue};top:${top}px"></div>`;
	switch (s.kind) {
		case 's-cover':
			return `<div class="ar" style="position:absolute;left:88px;top:640px;font-size:110px">مصطلح الحديث</div>
<div style="position:absolute;left:88px;right:88px;top:800px;font-size:42px;line-height:1.3;color:#45434f;letter-spacing:-.01em">How scholars tell the authentic hadith from the weak, and where the science came from.</div>
${panel(1010)}
<div style="position:absolute;left:112px;top:1070px;display:grid;grid-template-columns:repeat(6,72px);gap:12px">${Array.from({ length: 18 }, (_, i) => `<i style="display:block;width:72px;height:72px;background:${[3, 10, 14].includes(i) ? K : '#fff'};opacity:${[3, 10, 14].includes(i) ? 1 : [0, 1, 6, 7, 8, 13, 17].includes(i) ? 1 : 0.35}"></i>`).join('')}</div>
<div style="position:absolute;left:112px;right:112px;bottom:56px;display:flex;justify-content:space-between;color:#fff;font-size:38px;font-weight:600;letter-spacing:-.02em"><span>Beginner friendly</span><span>arriqaaq.com</span></div>`;
		case 's-question':
			return `${panel(660)}${bigText('Islam is the most important thing in a Muslim’s life. Yet we are some 1,400 years from the time of the Prophet (ﷺ).', 730, 54, '#fff')}${bigText('Trust and authenticity matter more than we sometimes realise.', 1080, 54, '#fff')}`;
		case 's-quote':
			return `${panel(640)}<div style="position:absolute;left:112px;right:112px;top:700px;color:#fff"><div style="font-size:70px;font-weight:500;letter-spacing:-.035em;line-height:1.14">“The Isnaad (chain of narration) is part of the Deen. Were it not for the Isnaad, anyone could say whatever they wanted.”</div><div style="margin-top:44px;font:500 28px/1.5 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase">Abdullah bin al-Mubarak<br>Sahih Muslim, Introduction 32</div></div>`;
		case 's-science':
			return `${panel(640)}<div style="position:absolute;left:112px;right:112px;top:700px;color:#fff;display:grid;gap:34px">
<div style="font-size:44px;font-weight:500;letter-spacing:-.02em;line-height:1.3">That science is called <b style="font-weight:600">Mustalah al-Hadith</b>. It distinguishes the authentic hadith from the weak, and the sound from the flawed.</div>
<div style="font:600 24px 'Inter';letter-spacing:.12em;text-transform:uppercase;margin-top:14px">Two things rest upon it</div>
<div style="background:#fff;color:#0d0c13;border-radius:30px;padding:30px 36px;font-size:36px;font-weight:500;letter-spacing:-.02em;line-height:1.25">The derivation of rulings from the Sunnah is based upon it.</div>
<div style="background:#fff;color:#0d0c13;border-radius:30px;padding:30px 36px;font-size:36px;font-weight:500;letter-spacing:-.02em;line-height:1.25">Through it, proper emulation of the Messenger (ﷺ) is achieved.</div></div>`;
		case 's-road':
			return `<div style="position:absolute;left:0;right:0;top:600px;display:flex;flex-direction:column;align-items:center">
<div style="display:flex;align-items:center;gap:20px">${nodeBox(G, 'Part 1 · live', 'A brief history')}${darrow('r')}${nodeBox(P, 'Next', 'Definitions and terms')}</div>
<div style="align-self:flex-end;margin-right:210px">${darrow('d')}</div>
<div style="display:flex;align-items:center;gap:20px">${nodeBox(K, 'Then', 'Sahih and hasan')}${darrow('l')}${nodeBox(B, 'Then', 'Mutawatir and ahad')}</div>
<div style="align-self:flex-start;margin-left:210px">${darrow('d')}</div>
<div style="display:flex;align-items:center;gap:20px">${nodeBox(P, 'Then', 'Weak chains')}${darrow('r')}${nodeBox(G, 'Then', 'When hadith seem to differ')}</div></div>
<div style="position:absolute;left:88px;right:88px;bottom:70px;font-size:30px;line-height:1.35;color:#6b6a78">Topics from the course notes. The order of what follows Part 1 may change.</div>`;
		case 's-book':
			return `${panel(640)}<div style="position:absolute;left:112px;right:112px;top:700px;color:#fff;display:grid;gap:30px">
<div style="font-size:76px;font-weight:500;letter-spacing:-.04em;line-height:1.04;font-style:italic">Min Atyab al-Minah fi Ilm al-Mustalah</div>
<div style="font-size:40px;font-weight:500;letter-spacing:-.02em;line-height:1.3">by Shaykh Abdul Muhsin Al-Abbad and Shaykh Abdul Kareem al-Murad</div>
<div style="background:#fff;color:#0d0c13;border-radius:30px;padding:32px 36px;font-size:36px;font-weight:500;letter-spacing:-.02em;line-height:1.3;margin-top:10px">Not too simple, like Nukhbat al-Fikr. Not too detailed. Short and concise, and taught in institutes of knowledge in Madinah.</div></div>`;
		case 's-lesson':
			return `${panel(1040)}
<div style="position:absolute;left:112px;right:112px;top:640px;display:flex;flex-wrap:wrap;gap:18px 16px">${[['The story, drawn', G], ['A game', P], ['Pause and check', B], ['Every scholar named', K], ['A quiz', G], ['Sources cited', P]].map(([t, h]) => pill(t, h)).join('')}</div>
<div class="card" style="left:56px;top:830px;width:330px;border-radius:30px 30px 0 0;transform:rotate(-3deg)"><img src="${url('chain')}"></div>
<div class="card" style="left:370px;top:790px;width:350px;border-radius:30px 30px 0 0"><img src="${url('order')}"></div>
<div class="card" style="left:704px;top:850px;width:330px;border-radius:30px 30px 0 0;transform:rotate(3deg)"><img src="${url('quiz')}"></div>`;
		case 's-end':
			return `${panel(640)}<div style="position:absolute;left:112px;right:112px;top:704px;display:grid;gap:26px;color:#fff">
<div style="font-size:84px;font-weight:600;letter-spacing:-.045em;line-height:1">${COURSE.replace('/courses/', '/courses/<br>')}</div>
<div style="font-size:40px;font-weight:500;letter-spacing:-.02em;line-height:1.3">Free, on your phone or computer.<br>Part 1, a brief history, is ready to read.</div></div>
<div class="phone" style="left:300px;top:1090px;width:480px;height:400px"><img src="${url('course')}"></div>`;
	}
	return '';
}

const body = (s: Slide, i: number, all: Slide[]) => {
	const head = `<div class="top"><div class="brand">${flower}arriqaaq</div><div class="count">${String(i + 1).padStart(2, '0')} / ${String(all.length).padStart(2, '0')}</div></div>
<div class="eyebrow" style="color:${s.hue}">${s.eyebrow}</div><h1>${s.title}</h1>`;
	if (s.kind?.startsWith('s-')) return head + seriesBody(s);
	if (s.kind === 'p1cover')
		return `${head}<div class="panel" style="background:${s.hue};top:830px"></div>
<div style="position:absolute;left:88px;right:88px;top:560px;font-size:42px;line-height:1.3;color:#45434f;letter-spacing:-.01em">The first lesson of the series. Where the science came from, and the books it grew around.</div>
<div class="card" style="left:70px;top:920px;width:300px;border-radius:30px 30px 0 0;transform:rotate(-4deg)"><img src="${url('story')}"></div>
<div class="card" style="left:360px;top:880px;width:380px;border-radius:30px 30px 0 0"><img src="${url('chain')}"></div>
<div class="card" style="left:690px;top:940px;width:340px;border-radius:30px 30px 0 0;transform:rotate(4deg)"><img src="${url('order')}"></div>`;
	if (s.kind === 'p1end')
		return `${head}<div class="panel" style="background:${s.hue};top:640px"></div>
<div style="position:absolute;left:112px;right:112px;top:704px;display:grid;gap:26px;color:#fff">
<div style="font-size:70px;font-weight:600;letter-spacing:-.045em;line-height:1.02">${LESSON.replace('com/', 'com/<br>')}</div>
<div style="font-size:40px;font-weight:500;letter-spacing:-.02em;line-height:1.3">About 21 minutes. Free, no sign-up.<br>The next post begins on the science itself.</div></div>
<div class="phone" style="left:300px;top:1090px;width:480px;height:400px"><img src="${url('course')}"></div>`;
	return `${head}<div class="panel" style="background:${s.hue};top:${s.top! - 50}px"></div><div class="card" style="left:${(1080 - s.w!) / 2}px;top:${s.top}px;width:${s.w}px"><img src="${url(s.shot!)}"></div>`;
};

const page = await browser.newPage({ viewport: { width: 1080, height: 1440 } });
for (const [dir, set] of [['series', series], ['part-1', part1]] as const) {
	for (const [i, s] of set.entries()) {
		const f = resolve(tmp, `${dir}-slide-${i}.html`);
		writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=IBM+Plex+Sans+Arabic:wght@500&family=JetBrains+Mono:wght@500&display=swap"><style>${css}</style></head><body>${body(s, i, set)}</body></html>`);
		await page.goto(pathToFileURL(f).href, { waitUntil: 'networkidle' }).catch(() => {});
		await page.evaluate(() => document.fonts.ready);
		const name = `${String(i + 1).padStart(2, '0')}-${s.name}.png`;
		await page.screenshot({ path: resolve(root, dir, name) });
		console.log('wrote', dir, name);
	}
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
