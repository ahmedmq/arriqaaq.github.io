/**
 * Interactive widget registry, referenced from markdown as `[[WIDGET:name]]`
 * on its own line. Each entry: { g: legacy global name (unused), t: title
 * shown as the figure caption, s: one-line description }.
 *
 * To add a widget (DESIGN.md → "Rich posts"):
 * 1. Register it here:  'tajweed-madd': { g: '', t: 'Hear the madd lengths', s: '…' }
 * 2. Create src/lib/widgets/tajweed-madd.ts exporting
 *      export function init(el: HTMLElement): void | (() => void)
 *    It owns the DOM inside `el`. Use the design tokens and shared classes
 *    (.tabs, .segmented, .chip, .btn) so it matches the site. Return a
 *    cleanup function if it adds listeners.
 * 3. Put [[WIDGET:tajweed-madd]] on its own line in the post.
 * The parser emits the mount point and records the widget on the post; the
 * WidgetHydrator component loads and initialises it in the browser, and
 * only on posts that use it.
 */

export type WidgetMeta = { g: string; t: string; s: string };

export const widgets: Record<string, WidgetMeta> = {};
