/**
 * Registry of inline SVG diagrams, referenced from markdown as `[[SVG:name]]`
 * on its own line. Diagrams live in scripts/diagrams/*.ts, one module per
 * batch, each built with scripts/diagram-kit.ts. Add a new module, then
 * import and spread it below. Names must be unique across modules (checked
 * at build time).
 */
import type { Diagram } from './diagram-kit.js';
import { diagrams as takhsisCopyright } from './diagrams/uf-takhsis-copyright.js';
import { diagrams as parts1to5 } from './diagrams/uf-parts-1-5.js';
import { diagrams as istinbat } from './diagrams/uf-istinbat.js';
import { diagrams as ilm } from './diagrams/ilm.js';
import { diagrams as misc } from './diagrams/uf-misc.js';

export type { Diagram };

const modules: Record<string, Record<string, Diagram>> = {
	'uf-takhsis-copyright': takhsisCopyright,
	'uf-parts-1-5': parts1to5,
	'uf-istinbat': istinbat,
	ilm,
	'uf-misc': misc
};

export const diagrams: Record<string, Diagram> = {};
for (const [mod, entries] of Object.entries(modules)) {
	for (const [name, d] of Object.entries(entries)) {
		if (diagrams[name]) throw new Error(`Duplicate diagram name "${name}" in ${mod}`);
		diagrams[name] = d;
	}
}
