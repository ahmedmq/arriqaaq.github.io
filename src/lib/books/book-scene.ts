// The hero book on a book page, in WebGL (three.js). A hardcover with a board cover
// on a hinge, a striped page block, a spine in the shelf colour, soft lighting and a
// contact shadow. Once open it turns through three spreads (six real pages), flips back,
// closes and loops. Drag to turn it; the button stops and starts the loop. Loaded
// lazily and only where WebGL works; the CSS book stays as the fallback. It renders
// on demand and pauses off-screen, so it costs nothing while the book is still.
import {
	BoxGeometry,
	CanvasTexture,
	Color,
	DirectionalLight,
	Group,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
	type Texture
} from 'three';

export type SceneBook = {
	title: string;
	surname: string;
	ratio: number; // cover width / height
	pageRatio: number; // page width / height
	pages: number; // page count of the book (sets the thickness)
	cover: string | null; // url
	spreads: string[]; // page images in reading order: left, right, left, right ...
};

export type BookScene = { setOpen(open: boolean): void; destroy(): void };

const loader = new TextureLoader();
const load = (url: string | null) =>
	new Promise<Texture | null>((resolve) => {
		if (!url) return resolve(null);
		loader.load(
			url,
			(t) => {
				t.colorSpace = SRGBColorSpace;
				t.anisotropy = 4;
				resolve(t);
			},
			undefined,
			() => resolve(null)
		);
	});

function typeCover(b: SceneBook, colour: string) {
	const c = document.createElement('canvas');
	c.width = 600;
	c.height = Math.round(600 / b.ratio);
	const g = c.getContext('2d')!;
	g.fillStyle = colour;
	g.fillRect(0, 0, c.width, c.height);
	g.fillStyle = '#fff';
	g.font = '500 28px Inter, sans-serif';
	g.fillText('ARRIQAAQ', 56, 80);
	g.font = '500 64px Inter, sans-serif';
	let line = '', y = 200;
	for (const w of b.title.split(' ')) {
		if (g.measureText(line + w).width > c.width - 112 && line) { g.fillText(line.trim(), 56, y); y += 74; line = ''; }
		line += w + ' ';
	}
	g.fillText(line.trim(), 56, y);
	g.font = '500 28px Inter, sans-serif';
	g.fillText(b.surname.toUpperCase(), 56, c.height - 56);
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	return t;
}

function pageEdge(rep: number) {
	const c = document.createElement('canvas');
	c.width = 8;
	c.height = 64;
	const g = c.getContext('2d')!;
	g.fillStyle = '#ffffff';
	g.fillRect(0, 0, 8, 64);
	g.fillStyle = '#d6d5de';
	for (let y = 0; y < 64; y += 4) g.fillRect(0, y, 8, 1);
	const t = new CanvasTexture(c);
	t.wrapS = t.wrapT = RepeatWrapping;
	t.repeat.set(1, rep);
	t.colorSpace = SRGBColorSpace;
	return t;
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export async function mountBookScene(host: HTMLElement, b: SceneBook): Promise<BookScene | null> {
	const probe = document.createElement('canvas');
	if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;
	const canvas = document.createElement('canvas');
	canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab';
	let renderer: WebGLRenderer;
	try {
		renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
	} catch {
		return null;
	}

	const colour = getComputedStyle(host).getPropertyValue('--bk').trim() || '#9800ff';
	const [coverTex, ...pageTex] = await Promise.all([load(b.cover), ...b.spreads.map((u) => load(u))]);
	host.appendChild(canvas);

	// ---- dimensions: height 3 units, everything else follows ------------------
	let H = 3;
	let W = H * b.ratio;
	if (W > 3.6) { W = 3.6; H = W / b.ratio; }
	const D = Math.min(0.32, Math.max(0.1, 0.08 + b.pages * 0.0011)); // page block depth
	const T = 0.035; // board thickness
	const PW = Math.min(W - 0.06, (H - 0.06) * b.pageRatio); // a page, kept in its own proportions
	const PH = PW / b.pageRatio;
	const PX = 0.03 + PW / 2; // page centre, measured from the spine
	const LEAVES = Math.max(0, Math.min(2, Math.floor((pageTex.length - 2) / 2)));

	const scene = new Scene();
	const camera = new PerspectiveCamera(26, 1, 0.1, 100);
	scene.add(new HemisphereLight(0xffffff, 0xe8e7ee, 1.15));
	const sun = new DirectionalLight(0xffffff, 1.5);
	sun.position.set(-3, 5, 6);
	scene.add(sun);

	// Soft contact shadow: a blurred ellipse on the floor (cheaper and softer than a shadow map).
	const sc = document.createElement('canvas');
	sc.width = sc.height = 128;
	const sg = sc.getContext('2d')!;
	const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
	grad.addColorStop(0, 'rgba(13,12,19,0.38)');
	grad.addColorStop(1, 'rgba(13,12,19,0)');
	sg.fillStyle = grad;
	sg.fillRect(0, 0, 128, 128);
	const shadowTex = new CanvasTexture(sc);
	const floor = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -H / 2 - 0.002;
	scene.add(floor);

	const mat = (o: ConstructorParameters<typeof MeshStandardMaterial>[0]) => new MeshStandardMaterial({ roughness: 0.6, metalness: 0, ...o });
	const boardCol = mat({ color: new Color(colour) });
	const edge = pageEdge(Math.max(2, Math.round(D * 40)));
	const edgeMat = mat({ map: edge, roughness: 0.9 });
	const paper = mat({ color: 0xffffff, roughness: 0.95 });
	const coverMat = mat({ map: coverTex ?? typeCover(b, colour), roughness: 0.5 });
	// A little emissive lift keeps white paper white under the soft lighting.
	const pageMat = (i: number) => mat({ map: pageTex[i] ?? null, color: pageTex[i] ? 0xffffff : 0xf4f4f7, roughness: 0.95, emissive: 0xffffff, emissiveMap: pageTex[i] ?? null, emissiveIntensity: 0.55 });

	const book = new Group();
	scene.add(book);

	// back board, page block, spine
	const back = new Mesh(new BoxGeometry(W, H, T), boardCol);
	back.position.z = -D / 2 - T / 2;
	const block = new Mesh(new BoxGeometry(W - 0.06, H - 0.06, D), [edgeMat, edgeMat, edgeMat, edgeMat, paper, paper]);
	block.position.x = 0.015;
	const spine = new Mesh(new BoxGeometry(T, H, D + 2 * T), boardCol);
	spine.position.x = -W / 2 + T / 2;
	book.add(back, block, spine);

	const hingeZ = D / 2 + T / 2;
	const hingeX = -W / 2;

	// the right-hand page showing on the block; changes as leaves turn
	const rightMat = pageMat(1);
	const right = new Mesh(new PlaneGeometry(PW, PH), rightMat);
	right.position.set(hingeX + PX, 0, D / 2 + 0.0015);
	book.add(right);

	// front cover on a hinge; its inside carries the first left-hand page
	const cover = new Group();
	cover.position.set(hingeX, 0, hingeZ);
	const front = new Mesh(new BoxGeometry(W, H, T), [boardCol, boardCol, boardCol, boardCol, coverMat, paper]);
	front.position.x = W / 2;
	const leftFirst = new Mesh(new PlaneGeometry(PW, PH), pageMat(0));
	leftFirst.rotation.y = Math.PI;
	leftFirst.position.set(PX, 0, -T / 2 - 0.0015);
	cover.add(front, leftFirst);
	book.add(cover);

	// page leaves: front is the right page being turned, back is the left page it lands as
	const leaves: Group[] = [];
	for (let k = 1; k <= LEAVES; k++) {
		const g = new Group();
		g.position.set(hingeX, 0, hingeZ);
		const f = new Mesh(new PlaneGeometry(PW, PH), pageMat(2 * k - 1));
		f.position.x = PX;
		const r = new Mesh(new PlaneGeometry(PW, PH), pageMat(2 * k));
		r.rotation.y = Math.PI;
		r.position.x = PX;
		g.add(f, r);
		leaves.push(g);
		book.add(g);
	}

	// ---- state --------------------------------------------------------------------
	const val: Record<string, number> = { cover: 0, 1: 0, 2: 0 };
	let yaw = 0, pitch = 0, yawGoal = 0, pitchGoal = 0;
	let raf = 0, last = 0;
	let anim: { key: string; from: number; to: number; t0: number; dur: number; then: () => void } | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let token = 0; // bumps whenever the loop is stopped or restarted
	let wanted = false; // the reader wants the book open and playing
	let visible = true;

	function pose() {
		const c = val.cover;
		cover.rotation.y = -c * Math.PI * 0.985;
		book.position.x = (W / 2) * c;
		book.rotation.y = 0.55 * (1 - c) + yaw;
		book.rotation.x = 0.08 * (1 - c) + pitch;
		floor.position.x = book.position.x;
		floor.scale.set(W * (1.25 + 0.95 * c), D + 1.1, 1);
		leaves.forEach((g, i) => {
			const k = i + 1;
			const p = val[k];
			g.rotation.y = -p * Math.PI * 0.985;
			// resting on the right stack (higher for earlier leaves), landing on the left stack (higher for later ones)
			const rest = 0.0035 * (LEAVES + 1 - k) + 0.0015;
			const lands = T / 2 + 0.003 * k + 0.002; // above the open cover's inside face
			g.position.z = hingeZ + (rest - T / 2) * (1 - p) + lands * p;
		});
	}

	function fit() {
		const w = host.clientWidth || 300;
		const h = host.clientHeight || 300;
		renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		const t = Math.tan((camera.fov * Math.PI) / 360);
		const spread = 2 * W + 0.5;
		const distV = (H * 1.28) / (2 * t);
		const distH = spread / camera.aspect / (2 * t);
		camera.position.set(0, H * 0.06, Math.max(distV, distH) + D);
		camera.lookAt(0, 0, 0);
		camera.updateProjectionMatrix();
	}

	function frame(now: number) {
		raf = 0;
		const dt = Math.min(0.05, (now - (last || now)) / 1000);
		last = now;
		let moving = false;
		if (anim) {
			const a = anim;
			const x = Math.min(1, (now - a.t0) / a.dur);
			val[a.key] = a.from + (a.to - a.from) * ease(x);
			if (x >= 1) {
				val[a.key] = a.to;
				anim = null;
				if (a.key !== 'cover' && a.to === 0) showRight(Number(a.key) - 1); // landed back on the right: reveal its own page underneath
				a.then();
			}
			moving = true;
		}
		const k = 1 - Math.exp(-dt * 10);
		yaw += (yawGoal - yaw) * k;
		pitch += (pitchGoal - pitch) * k;
		pose();
		renderer.render(scene, camera);
		if (anim || moving || Math.abs(yawGoal - yaw) > 0.001 || Math.abs(pitchGoal - pitch) > 0.001) request();
		else last = 0;
	}
	const request = () => { if (!raf) raf = requestAnimationFrame(frame); };

	// the page under the leaf that is about to turn (or has just come back)
	function showRight(turned: number) {
		const t = pageTex[2 * turned + 1];
		rightMat.map = t ?? null;
		rightMat.emissiveMap = t ?? null;
		rightMat.color.set(t ? 0xffffff : 0xf4f4f7);
		rightMat.needsUpdate = true;
	}

	function tween(key: string, to: number, dur: number, then: () => void) {
		if (key !== 'cover' && to === 1) showRight(Number(key)); // reveal the next right page as the leaf lifts
		anim = { key, from: val[key], to, t0: performance.now(), dur, then };
		last = 0;
		request();
	}

	// ---- the loop: open, three spreads, flip back, close, repeat ------------------------
	type Step = [string, number, number, number]; // key, to, duration, wait after
	const forward: Step[] = [['cover', 1, 1100, 1700]];
	for (let k = 1; k <= LEAVES; k++) forward.push([String(k), 1, 900, k === LEAVES ? 2400 : 1500]);
	const backward: Step[] = [];
	for (let k = LEAVES; k >= 1; k--) backward.push([String(k), 0, 480, k === 1 ? 160 : 40]);
	backward.push(['cover', 0, 900, 1200]);
	const seq = [...forward, ...backward];

	function run(i: number, mine: number) {
		if (mine !== token) return;
		const [key, to, dur, wait] = seq[i % seq.length];
		tween(key, to, dur, () => {
			timer = setTimeout(() => run(i + 1, mine), wait);
		});
	}

	// close whatever is open, quickly and in order, then continue
	function settle(then: () => void, mine: number) {
		const open = [...Array(LEAVES)].map((_, i) => String(LEAVES - i)).filter((k) => val[k] > 0.001);
		const step = (): void => {
			if (mine !== token) return;
			const next = open.shift();
			if (next) return tween(next, 0, 320, step);
			if (val.cover > 0.001) return tween('cover', 0, 600, then);
			then();
		};
		step();
	}

	function stop() {
		token++;
		clearTimeout(timer);
		anim = null;
	}

	function apply() {
		stop();
		const mine = token;
		if (wanted && visible) settle(() => run(0, mine), mine);
		else if (!wanted) settle(() => {}, mine);
	}

	// ---- drag to turn ---------------------------------------------------------
	let down: { x: number; y: number; yaw: number; pitch: number } | null = null;
	canvas.addEventListener('pointerdown', (e) => {
		down = { x: e.clientX, y: e.clientY, yaw: yawGoal, pitch: pitchGoal };
		canvas.setPointerCapture(e.pointerId);
		canvas.style.cursor = 'grabbing';
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!down) return;
		yawGoal = Math.max(-0.7, Math.min(0.7, down.yaw + (e.clientX - down.x) / 220));
		pitchGoal = Math.max(-0.25, Math.min(0.25, down.pitch + (e.clientY - down.y) / 400));
		request();
	});
	const release = () => {
		down = null;
		canvas.style.cursor = 'grab';
		yawGoal = 0; // eases back to facing the reader
		pitchGoal = 0;
		request();
	};
	canvas.addEventListener('pointerup', release);
	canvas.addEventListener('pointercancel', release);

	const ro = new ResizeObserver(() => { fit(); request(); });
	ro.observe(host);
	const io = new IntersectionObserver((es) => {
		const v = es[0].isIntersecting;
		if (v === visible) return;
		visible = v;
		if (wanted) apply(); // off-screen: stop spending frames; back on-screen: start again
	});
	io.observe(host);
	fit();
	pose();
	renderer.render(scene, camera);

	return {
		setOpen(open) {
			if (open === wanted && token > 0) return;
			wanted = open;
			apply();
		},
		destroy() {
			stop();
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			scene.traverse((o) => {
				const m = o as Mesh;
				m.geometry?.dispose();
			});
			for (const t of [coverTex, ...pageTex, edge, shadowTex]) t?.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			canvas.remove();
		}
	};
}
