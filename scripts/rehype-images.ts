/**
 * rehype plugin: article images in their lightest form. For each <img> whose
 * source has an entry with a WebP in content/images.json (written by
 * `npm run images:optimize`): set width and height, so the page does not jump
 * as images load, and wrap it in <picture> with the WebP as the first source.
 * Browsers without WebP keep the original. Images without a WebP entry (the
 * pages DESIGN.md says never to touch) are left exactly as they are.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { visit, SKIP } from 'unist-util-visit';

type Entry = { w: number; h: number; webp?: string };

const file = resolve(process.cwd(), 'content/images.json');
const manifest: Record<string, Entry> = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};

export default function rehypeImages() {
	return (tree: any) => {
		visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
			if (node.tagName !== 'img' || !parent || index === undefined || parent.tagName === 'picture') return;
			const src = String(node.properties?.src ?? '');
			let key = src;
			try {
				key = decodeURI(src);
			} catch {
				/* keep as written */
			}
			const e = manifest[key];
			if (!e?.webp) return;
			node.properties = {
				...node.properties,
				width: node.properties.width ?? e.w,
				height: node.properties.height ?? e.h,
				decoding: 'async'
			};
			parent.children[index] = {
				type: 'element',
				tagName: 'picture',
				properties: {},
				children: [{ type: 'element', tagName: 'source', properties: { srcSet: encodeURI(e.webp), type: 'image/webp' }, children: [] }, node]
			};
			return SKIP;
		});
	};
}
