<svg class="hajj-world" viewBox="0 0 960 620" role="img" aria-label="An animated illustrated journey through a bright Hajj-inspired landscape">
	<defs>
		<filter id="wobble"><feTurbulence baseFrequency=".012" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/></filter>
		<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#83d8ec"/><stop offset="1" stop-color="#d9f4ef"/></linearGradient>
	</defs>
	<rect width="960" height="620" rx="34" fill="url(#sky)"/>
	<g class="cloud cloud-a"><path d="M96 105c8-31 54-36 68-8 22-18 57-3 54 24H82c-9-20 1-36 14-16z"/></g>
	<g class="cloud cloud-b"><path d="M686 92c10-32 55-36 70-8 22-18 58-2 54 25H671c-8-21 2-37 15-17z"/></g>
	<g class="plane"><path d="M-34 3L8-10l25-24 13 4-16 27 27 8-5 10-29-2-20 19-10-2 7-20-27 1z"/><path class="plane-route" d="M58 9c67 25 108-10 169 22"/></g>
	<g filter="url(#wobble)">
		<path class="mountain mountain-back" d="M0 337L134 186l87 99 118-161 151 213zM410 337l135-184 84 111 87-143 160 216z"/>
		<path class="sand" d="M0 327q122-39 243 15t235-8q108-51 242 4t240-7v289H0z"/>
		<path class="grass" d="M0 526q123-42 252 5t245-8q129-55 259 7t204-15v105H0z"/>
	</g>
	<path class="world-route" d="M90 506C167 456 188 403 270 421s100 65 177 35 100-122 184-91 98 92 217 40"/>
	<g class="tent tent-a" transform="translate(178 389)"><path d="M-48 47L0-18l48 65z"/><path d="M0-18v65M0 47l22-31 26 31"/></g>
	<g class="tent tent-b" transform="translate(745 410) scale(.75)"><path d="M-48 47L0-18l48 65z"/><path d="M0-18v65M0 47l22-31 26 31"/></g>
	<g class="kaaba" transform="translate(465 320)"><path class="kaaba-side" d="M69-44l35 20v105L69 99z"/><path d="M-70-42L69-44v143L-70 91z"/><path class="kaaba-top" d="M-70-42L0-73l104 49-35-20z"/><path class="gold" d="M-70-7L69-8v19L-70 13zM69-8l35 20v18L69 11z"/><rect class="door" x="25" y="42" width="25" height="57"/></g>
	<g class="palm" transform="translate(864 358)"><path d="M0 129q-7-70 7-126"/><path class="palm-leaf" d="M7 4Q-58-25-74 15-26 27 7 4zm0 0Q59-37 79 1 43 25 7 4zm0 0Q-12-56 20-69 36-30 7 4zm0 0Q58 6 62 42 29 35 7 4zm0 0Q-47 18-46 53-12 39 7 4z"/></g>
	<g class="lantern" transform="translate(67 432)"><path d="M-15-16h30l8 15-8 30h-30L-23-1zM-10-23h20M0-23v-13"/></g>
	<!-- Route stations are intentionally last so labels stay above tents, trees and terrain. -->
	<g class="station station-one" transform="translate(112 472)"><circle r="18"/><path d="M-6 0l4 5 9-12"/><g class="station-label" transform="translate(-42 25)"><rect width="84" height="25" rx="12"/><text x="42" y="17">TAJWEED</text></g></g>
	<g class="station station-two" transform="translate(259 414)"><circle r="18"/><path d="M-6 0l4 5 9-12"/><g class="station-label" transform="translate(-45 25)"><rect width="90" height="25" rx="12"/><text x="45" y="17">GRAMMAR</text></g></g>
	<g class="station station-three" transform="translate(408 456)"><circle r="18"/><path d="M-6 0l4 5 9-12"/><g class="station-label" transform="translate(-42 25)"><rect width="84" height="25" rx="12"/><text x="42" y="17">AQEEDAH</text></g></g>
	<g class="station station-four" transform="translate(548 404)"><circle r="18"/><path d="M-6 0l4 5 9-12"/><g class="station-label" transform="translate(-62 25)"><rect width="124" height="25" rx="12"/><text x="62" y="17">USUL AL-HADITH</text></g></g>
	<g class="station station-five" transform="translate(690 367)"><circle r="18"/><path d="M-6 0l4 5 9-12"/><g class="station-label" transform="translate(-56 25)"><rect width="112" height="25" rx="12"/><text x="56" y="17">USUL AL-FIQH</text></g></g>
	<g class="station station-six" transform="translate(835 407)"><circle r="18"/><path d="M-6 0l4 5 9-12"/><g class="station-label" transform="translate(-58 25)"><rect width="116" height="25" rx="12"/><text x="58" y="17">USUL AT-TAFSIR</text></g></g>
	<g class="sparkles"><path d="M270 226v-35m-18 17h36M709 236v-29m-15 14h30"/></g>
	<text class="world-note" x="66" y="565">FOLLOW THE ROUTE · GATHER KNOWLEDGE · RETURN TO THE ROOTS</text>
</svg>

<style>
	.hajj-world{width:100%;height:auto;display:block}.cloud{fill:#fff9ec;opacity:.9;animation:drift 8s ease-in-out infinite}.cloud-b{animation-delay:-4s}.plane{fill:#126a78;transform:translate(120px,150px);animation:fly 12s linear infinite}.plane-route,.world-route{fill:none;stroke:#34271f;stroke-width:4;stroke-linecap:round;stroke-dasharray:7 12}.mountain{stroke:#9b5727;stroke-width:4}.mountain-back{fill:#e58b31}.sand{fill:#efb64d;stroke:#a7652f;stroke-width:4}.grass{fill:#50a653;stroke:#276e42;stroke-width:4}.station circle{fill:#ffe45f;stroke:#34271f;stroke-width:4}.station>path{fill:none;stroke:#34271f;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.station-label rect{fill:#fff9ed;stroke:#34271f;stroke-width:2}.station-label text{font:700 8px 'Fredoka',sans-serif;text-anchor:middle;letter-spacing:.35px;fill:#34271f}.station{animation:bob 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.station-two,.station-four,.station-six{animation-delay:-1.4s}.tent{fill:#22b8c7;stroke:#34271f;stroke-width:4;stroke-linejoin:round}.tent-b{fill:#ee596f}.kaaba{stroke:#171717;stroke-width:4;stroke-linejoin:round}.kaaba>path:not(.gold):not(.kaaba-side):not(.kaaba-top){fill:#151515}.kaaba-side{fill:#242424}.kaaba-top{fill:#333}.gold{fill:#ffd43b}.door{fill:#d9a92f}.palm>path:first-child{fill:none;stroke:#79532f;stroke-width:15;stroke-linecap:round}.palm-leaf{fill:#178b50;stroke:#275f3e;stroke-width:4}.lantern{fill:#ffe45f;stroke:#34271f;stroke-width:4}.sparkles{fill:none;stroke:#fff4ad;stroke-width:7;stroke-linecap:round;animation:blink 2s ease-in-out infinite}.world-note{font:700 15px 'Fredoka',sans-serif;letter-spacing:2px;fill:#173f3c}@keyframes drift{50%{transform:translateX(18px)}}@keyframes fly{0%{transform:translate(-80px,150px)}100%{transform:translate(950px,105px)}}@keyframes bob{50%{translate:0 -7px}}@keyframes blink{50%{opacity:.25;scale:.8;transform-origin:center}}@media(prefers-reduced-motion:reduce){.cloud,.plane,.station,.sparkles{animation:none}}
</style>
