/** Small helpers shared by the interactive widgets. */

export const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** True when the reader asked for less motion. Widgets then skip animation. */
export const reducedMotion = () =>
	typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Palette hue name -> the CSS variables a widget reads. */
export const hueClass = (hue: string) => `wd-hue--${hue}`;
