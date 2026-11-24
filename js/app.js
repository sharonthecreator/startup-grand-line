/* Startup Grand Line — map engine.
   Left to right: the home shore and Founders' Peak, the Home Waters (seven routes), the Market Wall
   with one gate per route, the Global Waters, four beacons and Exit Island. */
(() => {
  'use strict';
  const D = window.GL;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 4800, H = 3000, MID = 1500;
  const BELT_T = [380, 560], BELT_B = [2440, 2620];
  const COAST = 300, RL2 = 2250, RL_HW = 82;
  const STAGE_X = [1120, 1500, 1880, 2700, 3200];
  const coastX = y => COAST + (fbm(y / 260, 3, 3) - 0.5) * 140;
  const laneY = i => 720 + i * 268;

  const $ = id => document.getElementById(id);
  const svg = $('sea');
  const S = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const rng = seed => { let s = (seed * 2654435761) % 4294967296; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const f1 = v => (+v).toFixed(1);

  /* ---------- noise ---------- */
  const hash = (x, y) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s / (1 - Math.pow(0.5, o)); }

  /* An organic closed shape around (cx, cy). */
  function blob(cx, cy, r, rand, n = 11, v = 0.26) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r * (1 - v / 2 + rand() * v);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    const P = i => pts[(i + n) % n];
    let d = `M${f1(P(0)[0])},${f1(P(0)[1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return d + 'Z';
  }

  /* ---------- painted ocean (rendered once to a canvas) ---------- */
  function paintOcean() {
    const sc = 6, cw = Math.ceil(W / sc), ch = Math.ceil(H / sc);
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const ctx = c.getContext('2d'), img = ctx.createImageData(cw, ch), d = img.data;
    const band = (v, a, b, s) => sm(a - s, a + s, v) * (1 - sm(b - s, b + s, v));
    const mix = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    const C = { homeTop: [20, 98, 150], homeBot: [16, 92, 138], farTop: [16, 66, 122], farBot: [22, 78, 134], home: [24, 126, 170], glob: [20, 90, 140], calm: [9, 44, 72] };
    for (let py = 0; py < ch; py++) {
      const y = py * sc;
      const calm = Math.min(1, band(y, BELT_T[0], BELT_T[1], 26) + band(y, BELT_B[0], BELT_B[1], 26));
      const gl = band(y, BELT_T[1], BELT_B[0], 26);
      for (let px = 0; px < cw; px++) {
        const x = px * sc;
        const para = 1 - sm(RL2 - 60, RL2 + 40, x);
        const outer = y < MID ? mix(C.farTop, C.homeTop, para) : mix(C.farBot, C.homeBot, para);
        const glc = mix(C.glob, C.home, para);
        let col = mix(mix(outer, glc, gl), C.calm, calm);
        const n1 = fbm(x / 760, y / 760, 3), n2 = fbm(x / 170 + 31, y / 170 + 17, 3);
        const ridge = 1 - Math.abs(2 * fbm(x / 230 + 7, y / 230 + 3, 3) - 1);
        const amp = 1 - 0.8 * calm;
        const light = ((n1 - 0.5) * 0.55 + (n2 - 0.5) * 0.2) * amp + calm * (fbm(x / 900, y / 30, 2) - 0.5) * 0.18;
        const caust = Math.pow(ridge, 14) * 30 * gl * (1 - calm);
        const e = Math.min(x, W - x, y, H - y) / 420, edge = 0.55 + 0.45 * sm(0, 1, e);
        // deep water along the foot of the Market Wall, turquoise shallows along the home shore
        const trench = (1 - 0.25 * (1 - sm(RL_HW, RL_HW + 160, Math.abs(x - RL2)))) * (1 + 0.35 * (1 - sm(0, 260, x - COAST)));
        const k = (1 + light) * edge * trench, i = (py * cw + px) * 4;
        d[i] = col[0] * k + caust * 0.55; d[i + 1] = col[1] * k + caust * 0.9; d[i + 2] = col[2] * k + caust; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/jpeg', 0.92);
  }

  /* ---------- nodes ---------- */
  const nodes = {};
  const node = (id, type, data, o) => (nodes[id] = Object.assign({ id, type, data }, o));
  node('start', 'start', D.places.start, { x: 660, y: 1500, cx: 250, cy: 1500, sail: true });
  node('lighthouse', 'place', D.places.lighthouse, { cx: 720, cy: 1320 });
  node('exit', 'exit', D.places.exit, { x: 4250, y: 1500, cx: 4420, cy: 1500, sail: true });
  node('wall', 'place', D.places.wall, { cx: RL2, cy: 1500, zoom: 0.4 });
  node('doldrums', 'place', D.places.doldrums, { cx: 1500, cy: 470, zoom: 0.45 });
  node('home', 'place', D.places.home, { cx: 1400, cy: 1500, zoom: 0.3 });
  node('global', 'place', D.places.global, { cx: 3300, cy: 1500, zoom: 0.3 });
  node('reach-us', 'reach', D.places.us, { cx: 3500, cy: 190, zoom: 0.4 });
  node('reach-far', 'reach', D.places.far, { cx: 3500, cy: 2810, zoom: 0.4 });
  const SEA_POS = { service: [895, 190], engineers: [1745, 190], scholars: [895, 2810], returning: [1745, 2810] };
  D.seas.forEach(b => node(`sea-${b.id}`, 'sea', b, { cx: SEA_POS[b.id][0], cy: SEA_POS[b.id][1], zoom: 0.4 }));
  D.lanes.forEach((lane, i) => lane.islands.forEach((isl, k) => {
    const r = 46 + k * 7;
    const x = STAGE_X[k] + Math.sin(i * 12.9 + k * 78.2) * 42;
    const y = laneY(i) + Math.cos(i * 4.1 + k * 9.7) * 28;
    node(`${lane.id}-${k}`, 'island', isl, { lane, li: i, k, x, y, cx: x, cy: y - r - 22, r, sail: true });
  }));
  // Four beacons sit in the gaps between the routes converging on Exit Island.
  const LT = nodes.exit;
  const bez = (a, t) => { const dx = (LT.x - a.x) / 2, u = 1 - t; return { x: u * u * u * a.x + 3 * u * u * t * (a.x + dx) + 3 * u * t * t * (LT.x - dx) + t * t * t * LT.x, y: u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * LT.y + t * t * t * LT.y }; };
  [[0, 1, 0.3], [2, 3, 0.5], [3, 4, 0.22], [5, 6, 0.5]].forEach(([a, b, t], j) => {
    const p = bez(nodes[`${D.lanes[a].id}-4`], t), q = bez(nodes[`${D.lanes[b].id}-4`], t);
    const bc = Object.assign({}, D.beacons[j], { name: D.beacons[j].title });
    node(`bc-${j}`, 'beacon', bc, { cx: (p.x + q.x) / 2, cy: (p.y + q.y) / 2 - 10, j });
  });

  /* ---------- layers ---------- */
  const defs = S('defs', {}, svg);
  defs.innerHTML = `
    <pattern id="wavep" width="230" height="120" patternUnits="userSpaceOnUse">
      <path d="M14 30 q14 -12 28 0 t28 0" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="3" stroke-linecap="round"/>
      <path d="M128 86 q12 -10 24 0 t24 0" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="2.5" stroke-linecap="round"/>
    </pattern>
    <pattern id="wavep2" width="410" height="260" patternUnits="userSpaceOnUse">
      <path d="M40 60 q22 -16 44 0 t44 0" fill="none" stroke="#dff6ff" stroke-opacity=".07" stroke-width="4" stroke-linecap="round"/>
      <path d="M250 190 q18 -14 36 0" fill="none" stroke="#dff6ff" stroke-opacity=".06" stroke-width="4" stroke-linecap="round"/>
    </pattern>
    <pattern id="strata" width="140" height="28" patternUnits="userSpaceOnUse">
      <path d="M0 0 H140 M0 14 H140 M35 0 V14 M105 0 V14 M0 28 H140 M70 14 V28" fill="none" stroke="#14161c" stroke-opacity=".3" stroke-width="2"/>
    </pattern>
    <clipPath id="windy">
      <rect x="-600" y="-600" width="${W + 1200}" height="${BELT_T[0] + 600}"/>
      <rect x="-600" y="${BELT_T[1]}" width="${W + 1200}" height="${BELT_B[0] - BELT_T[1]}"/>
      <rect x="-600" y="${BELT_B[1]}" width="${W + 1200}" height="900"/>
    </clipPath>
    <radialGradient id="shallow"><stop offset=".5" stop-color="#9df5e8" stop-opacity=".6"/><stop offset=".78" stop-color="#4fd0d8" stop-opacity=".28"/><stop offset="1" stop-color="#2fb5d0" stop-opacity="0"/></radialGradient>
    <linearGradient id="sandG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3cc"/><stop offset=".6" stop-color="#f0d394"/><stop offset="1" stop-color="#cfa45d"/></linearGradient>
    <linearGradient id="goldSand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c2"/><stop offset=".6" stop-color="#ffd76a"/><stop offset="1" stop-color="#d49a2a"/></linearGradient>
    <linearGradient id="grassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9be27c"/><stop offset=".55" stop-color="#55ad5a"/><stop offset="1" stop-color="#2d7442"/></linearGradient>
    <linearGradient id="hillG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fcb68"/><stop offset="1" stop-color="#2a6537"/></linearGradient>
    <linearGradient id="cliffG" x1="0" x2="1"><stop offset="0" stop-color="#22252e"/><stop offset=".16" stop-color="#4c5160"/><stop offset=".45" stop-color="#8a8f9e"/><stop offset=".6" stop-color="#7a7f8e"/><stop offset=".86" stop-color="#454956"/><stop offset="1" stop-color="#1c1e26"/></linearGradient>
    <linearGradient id="landG" x1="0" x2="1"><stop offset="0" stop-color="#2f6b3c"/><stop offset=".7" stop-color="#5aa35a"/><stop offset="1" stop-color="#7cc06a"/></linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
    <linearGradient id="calmG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfefff" stop-opacity=".07"/><stop offset=".5" stop-color="#cfefff" stop-opacity="0"/><stop offset="1" stop-color="#cfefff" stop-opacity=".07"/></linearGradient>
    <radialGradient id="gold"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset=".45" stop-color="#ffd166" stop-opacity=".4"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
    <radialGradient id="bubbleG" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".22" stop-color="#e8fbff" stop-opacity=".15"/><stop offset=".85" stop-color="#bff3ff" stop-opacity=".15"/><stop offset="1" stop-color="#eafcff" stop-opacity=".85"/></radialGradient>
    <radialGradient id="fmiG"><stop offset="0" stop-color="#9ff9ff" stop-opacity=".75"/><stop offset=".6" stop-color="#1aa6d0" stop-opacity=".45"/><stop offset="1" stop-color="#06456e" stop-opacity="0"/></radialGradient>
    <radialGradient id="cloudG"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="cloudS"><stop offset="0" stop-color="#011523" stop-opacity=".3"/><stop offset="1" stop-color="#011523" stop-opacity="0"/></radialGradient>
    <radialGradient id="snowG" cx=".4" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfdbe6"/></radialGradient>
    <radialGradient id="pool" cx=".4" cy=".4"><stop offset="0" stop-color="#bff4ff"/><stop offset="1" stop-color="#1d9ccc"/></radialGradient>
    <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07a42"/><stop offset=".5" stop-color="#7d4c22"/><stop offset="1" stop-color="#55310f"/></linearGradient>`;

  const world = S('g', { id: 'world' }, svg);
  const L = cls => S('g', { class: cls }, world);
  const gOcean = L('l-ocean'), gDecor = L('l-decor'), gRoutes = L('l-routes'), gRock = L('l-rock'),
    gPlaces = L('l-places'), gIslands = L('l-islands'), gDive = L('l-dive'), gWake = L('l-wake');
  const gShip = S('g', { id: 'ship' }, world);
  const gSky = L('clouds');

  /* ---------- ocean ---------- */
  S('rect', { x: -8000, y: -8000, width: W + 16000, height: H + 16000, fill: '#05213a' }, gOcean);
  const oceanImg = S('image', { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none' }, gOcean);
  oceanImg.setAttribute('href', paintOcean());
  const windy = S('g', { 'clip-path': 'url(#windy)' }, gOcean);
  S('rect', { class: 'waves', x: -600, y: -600, width: W + 1400, height: H + 1300, fill: 'url(#wavep)' }, windy);
  S('rect', { class: 'waves2', x: -900, y: -600, width: W + 1800, height: H + 1300, fill: 'url(#wavep2)' }, windy);
  const sparkR = rng(5);
  for (let i = 0; i < 46; i++) {
    const x = 500 + sparkR() * (W - 900), y = sparkR() < 0.75 ? BELT_T[1] + 60 + sparkR() * 1760 : (sparkR() < 0.5 ? 40 + sparkR() * 300 : 2660 + sparkR() * 300);
    S('path', { class: 'spark', d: `M${f1(x)},${f1(y - 9)} L${f1(x + 2)},${f1(y - 2)} L${f1(x + 9)},${f1(y)} L${f1(x + 2)},${f1(y + 2)} L${f1(x)},${f1(y + 9)} L${f1(x - 2)},${f1(y + 2)} L${f1(x - 9)},${f1(y)} L${f1(x - 2)},${f1(y - 2)}Z`, style: `animation-delay:${f1(-sparkR() * 6)}s` }, gOcean);
  }

  /* ---------- shared drawing helpers ---------- */
  function palm(g, x, y, s, rand) {
    S('circle', { cx: f1(x + s * 0.25), cy: f1(y + s * 0.35), r: f1(s * 0.85), fill: '#06301a', opacity: 0.25 }, g);
    const p = S('g', { transform: `translate(${f1(x)},${f1(y)}) rotate(${Math.round(rand() * 360)})` }, g);
    for (let i = 0; i < 6; i++) S('ellipse', { cx: f1(s * 0.52), cy: 0, rx: f1(s * 0.58), ry: f1(s * 0.2), fill: i % 2 ? '#2a8443' : '#3fa356', stroke: '#1d5a2e', 'stroke-width': 0.8, transform: `rotate(${i * 60 + Math.round(rand() * 14)})` }, p);
    S('circle', { r: f1(s * 0.16), fill: '#7a5228' }, p);
  }
  function house(g, x, y, w, h, col) {
    S('rect', { x: f1(x + 3), y: f1(y + 4), width: w, height: h, fill: '#05200f', opacity: 0.3 }, g);
    S('rect', { x: f1(x), y: f1(y), width: w, height: h, fill: col, stroke: '#3b2a1a', 'stroke-width': 1.3 }, g);
    S('rect', { x: f1(x), y: f1(y + h / 2), width: w, height: f1(h / 2), fill: '#000', opacity: 0.22 }, g);
    S('line', { x1: f1(x), y1: f1(y + h / 2), x2: f1(x + w), y2: f1(y + h / 2), stroke: '#3b2a1a', 'stroke-width': 1 }, g);
  }
  // Base island: shallows, shadow, foam, sand, grass, hills. Returns nothing; draws into g.
  function isle(g, cx, cy, r, rand, opt = {}) {
    S('path', { d: blob(cx, cy, r * 1.62, rand, 12, 0.22), fill: 'url(#shallow)' }, g);
    const sand = blob(cx, cy, r, rand, 11, 0.24);
    S('path', { d: sand, fill: '#03203a', opacity: 0.32, transform: 'translate(8,10)' }, g);
    S('path', { d: sand, fill: 'none', stroke: '#f4fdff', 'stroke-width': 6, opacity: 0.5, 'stroke-dasharray': '18 10', transform: `translate(${f1(cx)},${f1(cy)}) scale(1.08) translate(${f1(-cx)},${f1(-cy)})` }, g);
    S('path', { class: 'sand', d: sand, fill: opt.gold ? 'url(#goldSand)' : 'url(#sandG)' }, g);
    S('path', { class: 'grass', d: blob(cx - r * 0.05, cy - r * 0.07, r * 0.76, rand, 10, 0.3), fill: 'url(#grassG)' }, g);
    for (let h = 0; h < (opt.hills || 0); h++) {
      const a = rand() * 6.28, hx = cx + Math.cos(a) * r * 0.3, hy = cy + Math.sin(a) * r * 0.3;
      S('path', { d: blob(hx, hy, r * 0.3, rand, 8, 0.3), fill: 'url(#hillG)' }, g);
      S('ellipse', { cx: f1(hx - r * 0.07), cy: f1(hy - r * 0.08), rx: f1(r * 0.1), ry: f1(r * 0.06), fill: '#c8f0a8', opacity: 0.35 }, g);
    }
    const n = opt.palms || 0;
    for (let t = 0; t < n; t++) {
      const a = (t / n) * 6.28 + rand() * 0.6, rr = r * (0.5 + rand() * 0.18);
      palm(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 9 + rand() * 5, rand);
    }
  }
  function labels(g, x, y, name, sub, big) {
    S('text', { class: 'name' + (big ? ' big' : ''), x: f1(x), y: f1(y) }, g).textContent = name;
    if (sub) S('text', { class: 'sub' + (big ? ' big' : ''), x: f1(x), y: f1(y + (big ? 36 : 28)) }, g).textContent = sub;
  }
  const nodeGroup = (n, parent, label, extra = {}) => {
    const g = S('g', Object.assign({ class: `node ${n.type}`, id: `n-${n.id}`, tabindex: 0, role: 'button', 'aria-label': label }, extra), parent);
    n.el = g; return g;
  };

  /* ---------- decor: doldrums, origin seas, currents ---------- */
  [BELT_T, BELT_B].forEach(([a, b]) => {
    const g = S('g', { class: 'belt hit', 'data-node': 'doldrums' }, gDecor);
    S('rect', { x: -600, y: a, width: W + 1200, height: b - a, fill: 'url(#calmG)' }, g);
    [a, b].forEach(y => S('line', { x1: -600, x2: W + 600, y1: y, y2: y, class: 'belt-edge' }, g));
  });
  nodes.doldrums.el = gDecor.querySelector('.belt');

  // the four origin seas (home side) and the two global markets (far side): big clickable seas with small islands
  const HX = [COAST + 120, 1320, RL2 - RL_HW], FX = [RL2 + RL_HW, W + 600];
  const AREAS = { 'sea-service': [HX[0], 0, HX[1] - HX[0], BELT_T[0]], 'sea-engineers': [HX[1], 0, HX[2] - HX[1], BELT_T[0]],
    'sea-scholars': [HX[0], BELT_B[1], HX[1] - HX[0], H - BELT_B[1]], 'sea-returning': [HX[1], BELT_B[1], HX[2] - HX[1], H - BELT_B[1]],
    'reach-us': [FX[0], 0, FX[1] - FX[0], BELT_T[0]], 'reach-far': [FX[0], BELT_B[1], FX[1] - FX[0], H - BELT_B[1]] };
  Object.entries(AREAS).forEach(([id, [x, y, w, h]], bi) => {
    const n = nodes[id], d = n.data;
    const g = nodeGroup(n, gDecor, `${d.name}: ${d.origin || d.tagline}`, { 'data-node': id });
    const rand = rng(200 + bi);
    S('rect', { x, y, width: w, height: h, fill: 'transparent' }, g);
    for (let t = 0; t < Math.round(Math.min(w, 2400) / 380); t++) {
      const ix = x + 80 + rand() * (Math.min(w, 2400) - 160), iy = y + 70 + rand() * (h - 140);
      if (Math.abs(ix - n.cx) < 400 && Math.abs(iy - n.cy) < 90) continue;
      isle(g, ix, iy, 18 + rand() * 16, rand, { palms: 1 + Math.floor(rand() * 2) });
    }
    S('text', { class: 'sea-name', x: n.cx, y: n.cy + 10 }, g).textContent = d.name.toUpperCase();
    S('text', { class: 'sea-sub', x: n.cx, y: n.cy + 52 }, g).textContent = d.origin ? `${d.origin} · founder origin` : d.tagline;
  });

  // the four currents from the origin seas, running along the home shore into the harbour below Founders' Peak
  const CURRENTS = [
    'M1150,215 C760,215 430,250 420,560 L420,1150 Q420,1370 620,1450',
    'M2050,320 C1500,320 540,300 525,600 L525,1180 Q525,1380 660,1468',
    'M1150,2785 C760,2785 430,2750 420,2440 L420,1850 Q420,1630 620,1550',
    'M2050,2680 C1500,2680 540,2700 525,2400 L525,1820 Q525,1620 660,1532'];
  CURRENTS.forEach(d => { S('path', { class: 'current', d }, gDecor); S('path', { class: 'current-flow', d }, gDecor); });

  // region titles in the top doldrums; stage marks in the bottom one
  [['home', 1500, 'HOME WATERS', 'seven routes · Pre-Seed to Series A'], ['global', 3250, 'GLOBAL WATERS', 'beyond the Market Wall · growth to exit']].forEach(([id, x, t, s]) => {
    const g = nodeGroup(nodes[id], gDecor, nodes[id].data.name, { 'data-node': id });
    S('text', { class: 'region', x, y: 486 }, g).textContent = t;
    S('text', { class: 'region-sub', x, y: 530 }, g).textContent = s;
  });
  [[620, 482], [4300, 482], [640, 2540], [4300, 2540]].forEach(([x, y]) => { S('text', { class: 'belt-name', x, y, 'data-node': 'doldrums' }, gDecor).textContent = 'DOLDRUMS'; });
  D.stages.forEach((st, k) => {
    S('text', { class: 'stagehead', x: STAGE_X[k], y: 2545 }, gDecor).textContent = st.name.toUpperCase();
    S('text', { class: 'stagehead-sub', x: STAGE_X[k], y: 2578 }, gDecor).textContent = `stage ${k + 1} · ${st.sea}`;
  });

  // sea serpents sleeping in the doldrums
  function seaKing(x, y, s, flip, seed) {
    const o = S('g', { class: 'seaking', transform: `translate(${x},${y}) scale(${flip ? -s : s},${s})` }, gDecor);
    const g = S('g', { class: 'sk', style: `animation-delay:${-seed}s` }, o);
    [[-70, 0, 26], [-20, -6, 30], [34, 2, 28]].forEach(([sx, sy, rx]) => {
      S('ellipse', { cx: sx, cy: sy + 6, rx: rx + 16, ry: 15, fill: 'none', stroke: '#e8fbff', 'stroke-opacity': 0.25, 'stroke-width': 2 }, g);
      S('ellipse', { cx: sx, cy: sy, rx, ry: 12, fill: '#2a5a4c', stroke: '#13332a', 'stroke-width': 2 }, g);
      S('ellipse', { cx: sx - 4, cy: sy - 4, rx: rx * 0.6, ry: 3.5, fill: '#7cbf9a', opacity: 0.6 }, g);
    });
    S('path', { d: 'M62,4 C70,-16 100,-18 112,-2 C118,8 104,18 84,16 C74,15 66,12 62,4Z', fill: '#2f6a57', stroke: '#13332a', 'stroke-width': 2 }, g);
    S('circle', { cx: 100, cy: -4, r: 3.5, fill: '#ffd166' }, g);
    S('path', { d: 'M-96,0 L-122,-16 L-116,0 L-122,16Z', fill: '#2a5a4c', stroke: '#13332a', 'stroke-width': 2 }, g);
  }
  seaKing(2350, 470, 1, false, 1); seaKing(3950, 468, 0.9, true, 3); seaKing(4620, 470, 0.8, false, 5);
  seaKing(1300, 2588, 0.9, true, 2); seaKing(2250, 2580, 1.1, false, 4); seaKing(2950, 2590, 0.9, true, 6); seaKing(3900, 2582, 1, false, 7);

  // leviathans (the giants of the global market) cruising the Global Waters
  function whale(x, y, s, flip) {
    const o = S('g', { class: 'whale', transform: `translate(${x},${y}) scale(${flip ? -s : s},${s})` }, gDecor);
    const g = S('g', { class: 'sk' }, o);
    S('ellipse', { cx: 0, cy: 8, rx: 120, ry: 40, fill: 'none', stroke: '#e8fbff', 'stroke-opacity': 0.18, 'stroke-width': 3 }, g);
    S('path', { d: 'M-90,0 C-70,-32 50,-36 90,-6 C100,2 96,12 86,16 C40,34 -60,30 -90,0Z', fill: '#24465e', stroke: '#0f2333', 'stroke-width': 3 }, g);
    S('path', { d: 'M-88,0 L-130,-22 L-118,0 L-130,22Z', fill: '#24465e', stroke: '#0f2333', 'stroke-width': 3 }, g);
    S('path', { d: 'M-40,-14 C0,-24 40,-22 70,-8', fill: 'none', stroke: '#6f93ab', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }, g);
    S('circle', { cx: 62, cy: -2, r: 4, fill: '#cfe9f5' }, g);
  }
  whale(3000, 1100, 0.9, false); whale(3750, 2250, 1.1, true); whale(3700, 700, 0.8, true);

  /* ---------- routes ---------- */
  const edges = new Map(), adj = {};
  const curve = (a, b) => { const dx = (b.x - a.x) / 2; return `C${f1(a.x + dx)},${f1(a.y)} ${f1(b.x - dx)},${f1(b.y)} ${f1(b.x)},${f1(b.y)}`; };
  function addEdge(a, b, cls, lanes, color, d) {
    const A = nodes[a], B = nodes[b];
    d = d || `M${f1(A.x)},${f1(A.y)} ${curve(A, B)}`;
    const p = S('path', { class: cls, d, 'data-lanes': lanes || '', style: `--c:${color || '#fff'}` }, gRoutes);
    if (cls === 'route') S('path', { class: 'route-flow', d, 'data-lanes': lanes }, gRoutes);
    edges.set(`${a}|${b}`, p);
    (adj[a] = adj[a] || []).push(b);
    (adj[b] = adj[b] || []).push(a);
  }
  D.lanes.forEach((lane, i) => {
    const id = k => `${lane.id}-${k}`;
    addEdge('start', id(0), 'route', lane.id, lane.color);
    addEdge(id(0), id(1), 'route', lane.id, lane.color);
    addEdge(id(1), id(2), 'route', lane.id, lane.color);
    const A = nodes[id(2)], B = nodes[id(3)], G = { x: RL2, y: laneY(i) };
    addEdge(id(2), id(3), 'route', lane.id, lane.color, `M${f1(A.x)},${f1(A.y)} ${curve(A, G)} ${curve(G, B)}`);
    addEdge(id(3), id(4), 'route', lane.id, lane.color);
    addEdge(id(4), 'exit', 'route', lane.id, lane.color);
  });
  D.crossovers.forEach(c => {
    c.a = `${c.from[0]}-${c.from[1]}`; c.b = `${c.to[0]}-${c.to[1]}`;
    addEdge(c.a, c.b, 'cross', `${c.from[0]} ${c.to[0]}`);
  });

  /* ---------- the home shore ---------- */
  (() => {
    const pts = []; for (let y = -700; y <= H + 700; y += 30) pts.push([coastX(y), y]);
    const poly = off => [`-900,-700`, ...pts.map(([x, y]) => `${f1(x + off)},${y}`), `-900,${H + 700}`].join(' ');
    S('polygon', { points: poly(40), fill: '#bff3ef', opacity: 0.35 }, gRock);
    S('polygon', { points: poly(18), fill: 'url(#sandG)' }, gRock);
    S('polygon', { points: poly(0), fill: 'url(#landG)', stroke: '#2a5a32', 'stroke-width': 2 }, gRock);
    const r = rng(61);
    for (let i = 0; i < 26; i++) { const y = r() * H, x = coastX(y) - 40 - r() * 220; if (Math.abs(y - MID) > 330) palm(gRock, x, y, 11 + r() * 6, r); }
    [[150, 600], [170, 2400]].forEach(([x, y]) => { // coastal towns
      for (let h = 0; h < 7; h++) house(gRock, x + (h % 4) * 22 - 40, y + Math.floor(h / 4) * 22, 16, 13, '#d9663f');
    });
    [700, 2300].forEach(y => S('text', { class: 'shore-name', transform: `translate(90,${y}) rotate(-90)` }, gRock).textContent = 'THE HOME SHORE');
  })();

  /* ---------- the Market Wall, with one lock gate per route ---------- */
  (() => {
    const g = S('g', { class: 'redline hit', 'data-node': 'wall' }, gRock);
    nodes.wall.el = g;
    const edge = (hw, jit, s2) => {
      const Lp = [], Rp = [];
      for (let y = -700; y <= H + 700; y += 34) {
        Lp.push(`${f1(RL2 - hw - (fbm(y / 130, 11 + s2, 3) - 0.5) * jit * 2)},${y}`);
        Rp.unshift(`${f1(RL2 + hw + (fbm(y / 130, 51 + s2, 3) - 0.5) * jit * 2)},${y}`);
      }
      return Lp.concat(Rp).join(' ');
    };
    S('polygon', { points: edge(RL_HW + 24, 18, 0), fill: '#e9fbff', opacity: 0.3 }, g);
    S('polygon', { points: edge(RL_HW, 18, 0), fill: '#020f1a', opacity: 0.35, transform: 'translate(30,14)' }, g);
    S('polygon', { points: edge(RL_HW, 18, 0), fill: 'url(#cliffG)', stroke: '#14161c', 'stroke-width': 3 }, g);
    S('polygon', { points: edge(RL_HW - 16, 10, 9), fill: 'url(#strata)' }, g);
    D.lanes.forEach((lane, i) => {
      const y = laneY(i);
      S('rect', { x: RL2 - RL_HW - 26, y: y - 34, width: 2 * RL_HW + 52, height: 68, fill: '#1c7aa6', stroke: '#14161c', 'stroke-width': 3 }, g);
      S('rect', { x: RL2 - RL_HW - 26, y: y - 34, width: 2 * RL_HW + 52, height: 68, fill: 'url(#wavep)' }, g);
      [-44, 44].forEach(dx => {
        S('rect', { x: RL2 + dx - 5, y: y - 34, width: 10, height: 22, fill: '#6b4a26', stroke: '#2e1a0b', 'stroke-width': 1.5 }, g);
        S('rect', { x: RL2 + dx - 5, y: y + 12, width: 10, height: 22, fill: '#6b4a26', stroke: '#2e1a0b', 'stroke-width': 1.5 }, g);
      });
      [[-RL_HW - 26, -34], [RL_HW + 26, -34], [-RL_HW - 26, 34], [RL_HW + 26, 34]].forEach(([dx, dy]) => {
        S('circle', { cx: RL2 + dx, cy: y + dy, r: 12, fill: '#a7abb8', stroke: '#14161c', 'stroke-width': 2.5 }, g);
        S('circle', { cx: RL2 + dx, cy: y + dy, r: 5, fill: lane.color }, g);
      });
    });
    [190, 2810].forEach(y => S('text', { class: 'rl-name', transform: `translate(${RL2 + 12},${y}) rotate(90)` }, g).textContent = 'MARKET WALL');
  })();

  /* ---------- Founders' Peak ---------- */
  (() => {
    const n = nodes.start, cx = n.cx, cy = n.cy, r = rng(99);
    const g = nodeGroup(n, gRock, 'Founders’ Peak, the starting point');
    S('circle', { class: 'ring', cx: n.x - 120, cy, r: 200 }, g);
    const base = blob(cx, cy, 245, r, 14, 0.16);
    S('path', { d: base, fill: '#06301a', opacity: 0.35, transform: 'translate(22,20)' }, g);
    S('path', { d: base, fill: '#4f7a3e', stroke: '#2a4a22', 'stroke-width': 4 }, g);
    [[200, '#6b7f4a'], [155, '#87845a'], [110, '#9c8a68'], [68, '#b3a08a']].forEach(([rr, c]) => S('path', { d: blob(cx - (245 - rr) * 0.06, cy - (245 - rr) * 0.08, rr, r, 12, 0.2), fill: c }, g));
    S('path', { d: base, fill: 'url(#shade)' }, g);
    S('path', { d: blob(cx - 6, cy - 8, 42, r, 9, 0.35), fill: 'url(#snowG)' }, g);
    // the climb: a winding trail from the harbour to the summit
    S('path', { class: 'trail', d: `M${n.x - 40},${cy + 30} C430,1620 470,1560 400,1530 S330,1640 300,1580 S350,1470 290,1460 S220,1540 ${cx},${cy}` }, g);
    S('path', { d: `M${cx},${cy} v-46`, stroke: '#3a2614', 'stroke-width': 4 }, g);
    S('path', { d: `M${cx},${cy - 46} l30,9 l-30,10Z`, fill: '#ff5a5f', stroke: '#3a2614', 'stroke-width': 1.5 }, g);
    // harbour quay where the ship waits
    S('path', { d: `M${n.x - 110},${cy - 40} q60,-10 90,0 v80 q-30,10 -90,0Z`, fill: '#8a5a2b', stroke: '#2e1a0b', 'stroke-width': 2 }, g);
    labels(g, cx + 40, cy + 300, 'Founders’ Peak', 'every voyage starts with a climb', true);
  })();

  /* ---------- places ---------- */
  // Launch Lighthouse on a small cape north of the harbour
  (() => {
    const n = nodes.lighthouse, r = rng(12);
    const g = nodeGroup(n, gPlaces, 'Launch Lighthouse');
    S('circle', { class: 'ring', cx: n.cx, cy: n.cy, r: 66 }, g);
    isle(g, n.cx, n.cy, 44, r, { palms: 2 });
    const lh = S('g', { transform: `translate(${n.cx - 6},${n.cy - 10})` }, g);
    S('path', { class: 'beam', d: 'M0,0 L300,-36 A302,302 0 0 1 300,36 Z', fill: 'url(#beam)' }, lh);
    S('circle', { r: 15, fill: '#fff', stroke: '#3b2a1a', 'stroke-width': 2 }, lh);
    S('circle', { r: 10, fill: '#d9443c' }, lh);
    S('circle', { r: 5, fill: '#ffe38a' }, lh);
    labels(g, n.cx, n.cy - 78, 'Launch Lighthouse', 'incubators · grants');
  })();

  // Exit Island
  (() => {
    const n = nodes.exit, cx = n.cx, cy = n.cy, r = rng(41);
    const g = nodeGroup(n, gPlaces, 'Exit Island, the treasure at the end of the line');
    const rays = S('g', { transform: `translate(${cx},${cy})` }, g);
    const spin = S('g', { class: 'rays' }, rays);
    for (let i = 0; i < 12; i++) S('path', { d: 'M0,0 L560,-26 L560,26Z', fill: 'url(#beam)', opacity: 0.28, transform: `rotate(${i * 30})` }, spin);
    S('circle', { class: 'glow', cx, cy, r: 340, fill: 'url(#gold)' }, g);
    S('circle', { class: 'ring', cx, cy, r: 200 }, g);
    isle(g, cx, cy, 150, r, { gold: true, hills: 2, palms: 9 });
    const c = S('g', { transform: `translate(${cx},${cy}) scale(1.2)` }, g);
    S('ellipse', { cy: 28, rx: 50, ry: 12, fill: '#000', opacity: 0.25 }, c);
    S('rect', { x: -38, y: -8, width: 76, height: 36, rx: 5, fill: '#8a5a2b', stroke: '#3f2a14', 'stroke-width': 3 }, c);
    S('path', { d: 'M-38,-8 Q-38,-42 0,-42 Q38,-42 38,-8Z', fill: '#a56d36', stroke: '#3f2a14', 'stroke-width': 3 }, c);
    S('path', { d: 'M-32,-10 Q0,-32 32,-10 L28,-4 L-28,-4Z', fill: '#ffd166', stroke: '#b8860b', 'stroke-width': 2 }, c);
    [-24, 0, 24].forEach(x => S('rect', { x: x - 2, y: -8, width: 4, height: 36, fill: '#d9a441' }, c));
    S('rect', { x: -8, y: -8, width: 16, height: 17, rx: 2, fill: '#ffd166', stroke: '#3f2a14', 'stroke-width': 2 }, c);
    [[-70, 40], [60, 52], [-30, -70]].forEach(([dx, dy]) => S('circle', { cx: cx + dx, cy: cy + dy, r: 9, fill: '#ffd166', stroke: '#b8860b', 'stroke-width': 2 }, g)); // scattered coins
    labels(g, cx - 20, cy + 250, 'Exit Island', 'acquisition · IPO · the treasure', true);
  })();

  // four beacons guarding the approach
  D.beacons.forEach((p, j) => {
    const n = nodes[`bc-${j}`], r = rng(500 + j), cx = n.cx, cy = n.cy;
    const g = nodeGroup(n, gPlaces, `${p.title}`);
    S('circle', { class: 'ring', cx, cy, r: 46 }, g);
    S('circle', { class: 'glow', cx, cy, r: 70, fill: 'url(#gold)' }, g);
    S('path', { d: blob(cx, cy + 4, 34, r, 9, 0.3), fill: '#8b8070', stroke: '#4d4538', 'stroke-width': 2 }, g);
    S('circle', { cx: cx + 4, cy: cy + 6, r: 16, fill: '#000', opacity: 0.3 }, g);
    [[16, '#fff'], [12, '#2f6fb0'], [8, '#fff'], [4.5, '#ffd166']].forEach(([rr, c]) => S('circle', { cx, cy, r: rr, fill: c, stroke: rr === 16 ? '#2e1a0b' : 'none', 'stroke-width': 2 }, g));
    S('text', { class: 'pg-name', x: cx, y: cy + 62 }, g).textContent = p.name.toUpperCase();
    S('text', { class: 'pg-sub', x: cx, y: cy + 84 }, g).textContent = 'beacon';
  });

  /* ---------- lane islands ---------- */
  Object.values(nodes).filter(n => n.type === 'island').forEach(n => {
    const rand = rng(n.li * 31 + n.k * 7 + 3), c = n.lane.color;
    const g = nodeGroup(n, gIslands, `${n.data.name}: ${D.stages[n.k].name}, ${n.lane.sector}`, { 'data-lanes': n.lane.id, style: `--c:${c}` });
    S('line', { class: 'pier', x1: f1(n.x), y1: f1(n.y - 8), x2: f1(n.cx), y2: f1(n.cy + n.r * 0.7) }, g);
    isle(g, n.cx, n.cy, n.r, rand, { hills: n.k >= 2 ? 2 : 1, palms: 3 + n.k });
    const cnt = n.k + 2; // the settlement grows with each stage
    for (let h = 0; h < cnt; h++) {
      const a = (h / cnt) * 6.28 + 0.4, rr = n.r * 0.24;
      house(g, n.cx + Math.cos(a) * rr - 7, n.cy + Math.sin(a) * rr - 6, 15, 12, c);
    }
    if (n.k >= 3) { // headquarters tower
      S('circle', { cx: f1(n.cx + 3), cy: f1(n.cy + 4), r: 12, fill: '#000', opacity: 0.3 }, g);
      S('circle', { cx: f1(n.cx), cy: f1(n.cy), r: 12, fill: '#f5ecd8', stroke: '#3b2a1a', 'stroke-width': 2 }, g);
      S('circle', { cx: f1(n.cx), cy: f1(n.cy), r: 6, fill: c, stroke: '#3b2a1a', 'stroke-width': 1.2 }, g);
    }
    const fx = n.cx + n.r * 0.2, fy = n.cy - n.r * 0.45;
    S('line', { class: 'pole', x1: f1(fx), y1: f1(fy), x2: f1(fx), y2: f1(fy - 36) }, g);
    S('path', { class: 'pennant', d: `M${f1(fx)},${f1(fy - 36)} l26,8 l-26,9Z` }, g);
    S('path', { class: 'star', transform: `translate(${f1(n.cx + n.r * 0.8)},${f1(n.cy - n.r * 0.8)})`, d: 'M0,-14 L4,-5 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-5Z' }, g);
    S('circle', { class: 'ring', cx: f1(n.cx), cy: f1(n.cy), r: f1(n.r * 1.35) }, g);
    S('circle', { class: 'buoy', cx: f1(n.x), cy: f1(n.y), r: 9 }, g);
    labels(g, n.x, n.y + 50, n.data.name, D.stages[n.k].name.replace(/ \(.*/, ''));
  });

  /* ---------- clouds ---------- */
  const cr = rng(9);
  for (let i = 0; i < 9; i++) {
    const y = 150 + cr() * (H - 300), s = 0.8 + cr() * 1.1;
    const o = S('g', { transform: `translate(-900,${f1(y)}) scale(${f1(s)})` }, gSky);
    const m = S('g', { class: 'cloud', style: `animation-duration:${Math.round(260 + cr() * 200)}s;animation-delay:${Math.round(-cr() * 400)}s` }, o);
    const puffs = Array.from({ length: 7 }, () => [cr() * 260 - 130, cr() * 90 - 45, 60 + cr() * 60]);
    puffs.forEach(([x, yy, rr]) => S('circle', { cx: f1(x + 90), cy: f1(yy + 140), r: f1(rr), fill: 'url(#cloudS)' }, m));
    puffs.forEach(([x, yy, rr]) => S('circle', { cx: f1(x), cy: f1(yy), r: f1(rr), fill: 'url(#cloudG)' }, m));
  }

  /* ---------- ship ---------- */
  const shipBody = S('g', { class: 'bob' }, gShip);
  shipBody.innerHTML = `
    <path d="M-44,6 C-44,-11 -26,-15 2,-15 C28,-15 46,-6 62,6 C46,18 28,27 2,27 C-26,27 -44,23 -44,6Z" fill="#021a2c" opacity=".3"/>
    <path d="M-46,0 C-46,-17 -28,-21 0,-21 C26,-21 45,-11 60,0 C45,11 26,21 0,21 C-28,21 -46,17 -46,0Z" fill="url(#woodG)" stroke="#2e1a0b" stroke-width="3"/>
    <path d="M-39,0 C-39,-12 -25,-15 0,-15 C22,-15 37,-8 49,0 C37,8 22,15 0,15 C-25,15 -39,12 -39,0Z" fill="#c99560"/>
    <g stroke="#9c6a3a" stroke-width="1.2"><line x1="-34" y1="-7" x2="44" y2="-4"/><line x1="-37" y1="0" x2="48" y2="0"/><line x1="-34" y1="7" x2="44" y2="4"/></g>
    <line x1="58" y1="0" x2="82" y2="0" stroke="#5a3416" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="-44" y="-11" width="15" height="22" rx="3" fill="#8a5a2b" stroke="#2e1a0b" stroke-width="1.5"/>
    <path class="ship-flag" d="M-46,0 L-70,-8 L-64,0 L-70,8Z" stroke="#2e1a0b" stroke-width="1.5"/>
    <circle cx="-18" r="4" fill="#3a2412"/><circle cx="12" r="4.5" fill="#3a2412"/>
    <path class="sail" d="M-14,-31 Q4,0 -14,31 L-22,31 Q-4,0 -22,-31Z"/>
    <path class="sail" d="M16,-36 Q36,0 16,36 L6,36 Q26,0 6,-36Z"/>
    <path class="sail-stripe" d="M13,-35 Q33,0 13,35 L10,35 Q30,0 10,-35Z"/>
    <path class="sail" d="M44,-2 L60,-1 L44,-15Z"/>
    <circle cx="12" r="3" fill="#ffd166" stroke="#3a2412"/>`;
  let shipAt = 'start', sailing = false, pending = null, follow = false, currentLane = null;
  const shipPos = { x: nodes.start.x, y: nodes.start.y };
  function placeShip(x, y, deg) {
    shipPos.x = x; shipPos.y = y;
    gShip.setAttribute('transform', `translate(${f1(x)},${f1(y)}) rotate(${f1(deg)}) scale(1.25)`);

  }
  placeShip(shipPos.x, shipPos.y, 0);
  function setLane(id) {
    currentLane = id;
    const lane = D.lanes.find(l => l.id === id);
    gShip.style.setProperty('--c', lane ? lane.color : '#ff5a5f');
  }
  setLane(null);

  // foam wake
  const wake = [], wakeEls = Array.from({ length: 34 }, () => S('circle', { r: 0, fill: '#fff', opacity: 0 }, gWake));
  let wakeRunning = false, lastDrop = 0;
  function wakeLoop(now) {
    if (sailing && now - lastDrop > 45) { wake.push({ x: shipPos.x + (Math.random() - 0.5) * 14, y: shipPos.y + (Math.random() - 0.5) * 14, t: now }); lastDrop = now; }
    while (wake.length && (now - wake[0].t > 1500 || wake.length > wakeEls.length)) wake.shift();
    wakeEls.forEach((el, i) => {
      const p = wake[i];
      if (!p) { el.setAttribute('opacity', 0); return; }
      const age = (now - p.t) / 1500;
      el.setAttribute('cx', f1(p.x)); el.setAttribute('cy', f1(p.y));
      el.setAttribute('r', f1(5 + age * 18)); el.setAttribute('opacity', f1((1 - age) * 0.45));
    });
    if (sailing || wake.length) requestAnimationFrame(wakeLoop); else wakeRunning = false;
  }

  function findRoute(a, b) {
    const prev = { [a]: null }, q = [a];
    while (q.length) {
      const cur = q.shift();
      if (cur === b) break;
      for (const nx of adj[cur] || []) if (!(nx in prev)) { prev[nx] = cur; q.push(nx); }
    }
    const out = [];
    for (let c = b; c != null; c = prev[c]) out.unshift(c);
    return out;
  }

  // From Exit Island the treasure goes home: the ship fades out and reappears in the harbour below Founders' Peak.
  function sailHome() {
    sailing = true; follow = false;
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / 1600);
      gShip.style.opacity = f1(t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2);
      if (t >= 0.5 && shipAt !== 'start') { shipAt = 'start'; placeShip(nodes.start.x, nodes.start.y, 0); focusNode(nodes.start); }
      if (t < 1) return requestAnimationFrame(step);
      sailing = false; gShip.style.opacity = ''; pending = null;
      arrive('start');
    };
    requestAnimationFrame(step);
  }

  function sailTo(id) {
    if (sailing) { pending = id; return; }
    if (id === shipAt) return arrive(id);
    if (shipAt === 'exit' && id === 'start') return sailHome();
    const ids = findRoute(shipAt, id);
    const segs = [];
    for (let i = 0; i < ids.length - 1; i++) {
      let p = edges.get(`${ids[i]}|${ids[i + 1]}`), rev = false;
      if (!p) { p = edges.get(`${ids[i + 1]}|${ids[i]}`); rev = true; }
      segs.push({ p, rev, len: p.getTotalLength(), to: ids[i + 1] });
    }
    const at = (s, d) => s.p.getPointAtLength(s.rev ? s.len - d : d);
    const total = segs.reduce((t, s) => t + s.len, 0);
    const speed = Math.max(560, total / 5);
    let idx = 0, dist = 0, last = performance.now();
    sailing = true; follow = true;
    gShip.classList.add('sailing');
    if (!wakeRunning) { wakeRunning = true; requestAnimationFrame(wakeLoop); }
    const step = now => {
      dist += speed * Math.min(0.05, (now - last) / 1000); last = now;
      while (idx < segs.length && dist >= segs[idx].len) {
        dist -= segs[idx].len; shipAt = segs[idx].to; idx++;
        if (pending && idx < segs.length) { const t = pending; pending = null; sailing = false; return sailTo(t); }
      }
      if (idx >= segs.length) {
        sailing = false; gShip.classList.remove('sailing');
        const n = nodes[shipAt]; placeShip(n.x, n.y, 0);
        if (pending && pending !== shipAt) { const t = pending; pending = null; return sailTo(t); }
        pending = null;
        return arrive(shipAt);
      }
      const s = segs[idx], a = at(s, dist), b = at(s, Math.min(s.len, dist + 4));
      placeShip(a.x, a.y, Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI);
      updateNeedles();
      if (follow) centerOn(a.x, a.y - 40, cam.tk);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- logbook ---------- */
  let visited = new Set();
  try { visited = new Set(JSON.parse(localStorage.getItem('gl-visited-v2') || '[]')); } catch (e) { /* storage unavailable */ }
  const totalPlaces = Object.keys(nodes).length;
  function updateLog() {
    visited.forEach(id => nodes[id] && nodes[id].el && nodes[id].el.classList.add('visited'));
    $('log').textContent = `Logbook: ${[...visited].filter(id => nodes[id]).length} / ${totalPlaces} places charted`;
  }
  function markVisited(id) {
    visited.add(id);
    try { localStorage.setItem('gl-visited-v2', JSON.stringify([...visited])); } catch (e) { /* ignore */ }
    updateLog();
  }
  function arrive(id) {
    markVisited(id);
    const n = nodes[id];
    if (n.lane) setLane(n.lane.id);
    follow = false;
    updateLogPose();
    focusNode(n);
  }

  /* ---------- compass ---------- */
  const laneOr = () => currentLane || (focusLane || D.lanes[0].id);
  // bearings from a node: the next island on its route first, then cross-currents or the beacons
  function nextOf(id) {
    const n = nodes[id];
    if (!n) return [];
    if (id === 'start') return [`${laneOr()}-0`];
    if (id === 'exit') return ['start'];
    if (n.type !== 'island') return [];
    if (n.k === 4) {
      const bcs = D.beacons.map((_, j) => nodes[`bc-${j}`]).sort((a, b) => Math.hypot(a.cx - n.x, a.cy - n.y) - Math.hypot(b.cx - n.x, b.cy - n.y));
      return ['exit', bcs[0].id, bcs[1].id];
    }
    return [...new Set([`${n.lane.id}-${n.k + 1}`, ...D.crossovers.filter(c => c.a === id).map(c => c.b)])].slice(0, 3);
  }
  function prevOf(id) {
    const n = nodes[id];
    if (!n) return null;
    if (id === 'exit') return `${laneOr()}-4`;
    if (n.type !== 'island') return null;
    return n.k === 0 ? 'start' : `${n.lane.id}-${n.k - 1}`;
  }
  const NEEDLE = ['#ff5a5f', '#ffd166', '#bfe9ff'];
  const needles = $('lpNeedles');
  (() => { const t = $('lpTicks'); for (let i = 0; i < 24; i++) S('line', { x1: 0, y1: -44, x2: 0, y2: i % 6 ? -40 : -36, stroke: '#cfe9f5', 'stroke-opacity': 0.6, 'stroke-width': i % 6 ? 1 : 2, transform: `rotate(${i * 15})` }, t); })();
  let lpTargets = [];
  const posOf = n => (n.sail ? [n.x, n.y] : [n.cx, n.cy]);
  function updateNeedles() {
    const id = lpTargets[0];
    if (!id || !needles.children.length) return;
    const [tx, ty] = posOf(nodes[id]);
    const rot = `rotate(${f1(Math.atan2(ty - shipPos.y, tx - shipPos.x) * 180 / Math.PI + 90)})`;
    [...needles.children].forEach(el => el.setAttribute('transform', rot));
  }
  function updateLogPose() {
    lpTargets = nextOf(shipAt);
    needles.innerHTML = '';
    S('path', { d: 'M0,-40 L5,-3 L0,7 L-5,-3Z', fill: NEEDLE[0], stroke: '#1a0f06', 'stroke-width': 1 }, needles);
    S('path', { d: 'M0,40 L5,3 L0,-7 L-5,3Z', fill: '#e8eef2', stroke: '#1a0f06', 'stroke-width': 1 }, needles);
    needles.lastChild.setAttribute('class', 'tail');
    updateNeedles();
    $('lpSea').textContent = `Compass · ${shipPos.x > RL2 ? 'Global Waters' : 'Home Waters'}${lpTargets.length > 1 ? ' · bearings' : ''}`;
    $('lpTargets').innerHTML = lpTargets.map((id, i) => `<button data-go="${id}" style="--c:${NEEDLE[i]}">${esc(nodes[id].data.name)}</button>`).join('');
  }
  $('lpTargets').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) select(b.dataset.go); });
  $('lpGlobe').onclick = () => lpTargets[0] && select(lpTargets[0]);

  /* ---------- camera ---------- */
  const cam = { x: 0, y: 0, k: 1, tx: 0, ty: 0, tk: 1, moving: false };
  const panel = $('panel');
  const vw = () => window.innerWidth, vh = () => window.innerHeight;
  const mobile = () => vw() <= 760;
  const side = () => (mobile() ? 0 : 250);
  const fitK = () => Math.min((vw() - side()) / (W + 60), vh() / (H + 60));
  const clampK = k => Math.max(fitK() * 0.85, Math.min(2.4, k));
  function apply() {
    world.setAttribute('transform', `translate(${cam.x.toFixed(2)},${cam.y.toFixed(2)}) scale(${cam.k.toFixed(4)})`);
    svg.classList.toggle('far', cam.k < 0.34);
    svg.classList.toggle('near', cam.k > 0.7);
  }
  function viewCenter() {
    const open = !panel.hidden;
    return mobile() ? [vw() / 2, open ? vh() * 0.25 : vh() / 2] : [open ? (vw() - 440 + side()) / 2 : (vw() + side()) / 2, vh() / 2];
  }
  function centerOn(wx, wy, k) {
    const [cx, cy] = viewCenter();
    cam.tk = clampK(k); cam.tx = cx - wx * cam.tk; cam.ty = cy - wy * cam.tk;
    if (!cam.moving) { cam.moving = true; requestAnimationFrame(glide); }
  }
  function glide() {
    const e = 0.11;
    cam.x += (cam.tx - cam.x) * e; cam.y += (cam.ty - cam.y) * e; cam.k += (cam.tk - cam.k) * e;
    if (Math.abs(cam.tx - cam.x) + Math.abs(cam.ty - cam.y) < 0.5 && Math.abs(cam.tk - cam.k) < 0.001) {
      cam.x = cam.tx; cam.y = cam.ty; cam.k = cam.tk; cam.moving = false;
    } else if (cam.moving) requestAnimationFrame(glide);
    apply();
  }
  const closeUp = () => Math.max(0.5, Math.min(0.9, Math.min(vw(), vh()) / 1000));
  function focusNode(n) {
    if (n.zoom) return centerOn(n.cx, n.cy, Math.min(cam.tk, n.zoom * closeUp() / 0.85));
    if (n.type === 'start') return centerOn(n.x - 200, n.cy + 60, Math.max(cam.tk, closeUp() * 0.8));
    if (!n.sail || n.type === 'exit') return centerOn(n.cx, n.cy + 30, Math.max(cam.tk, closeUp() * 0.8));
    centerOn(n.cx + (n.x - n.cx) / 2, n.cy + 30, Math.max(cam.tk, closeUp()));
  }
  const fitView = () => { const k = fitK(); return [(vw() + side()) / 2 - (W / 2) * k, vh() / 2 - (H / 2) * k, k]; };
  function fitAll() { follow = false; const [, , k] = fitView(); centerOn(W / 2, H / 2, k); }
  function jump(x, y, k) { cam.moving = false; follow = false; cam.x = cam.tx = x; cam.y = cam.ty = y; cam.k = cam.tk = k; apply(); }
  function zoomAt(px, py, f) { const k = clampK(cam.k * f), r = k / cam.k; jump(px - (px - cam.x) * r, py - (py - cam.y) * r, k); }

  const ptrs = new Map();
  let moved = 0, pinch = 0;
  svg.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = 0; pinch = 0; });
  svg.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p[0], dy = e.clientY - p[1];
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved < 6) return;
    svg.classList.add('dragging');
    if (ptrs.size === 1) jump(cam.x + dx, cam.y + dy, cam.k);
    else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], dd = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, dd / pinch);
      pinch = dd;
    }
  });
  const up = e => { ptrs.delete(e.pointerId); pinch = 0; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  $('zoomIn').onclick = () => zoomAt(...viewCenter(), 1.35);
  $('zoomOut').onclick = () => zoomAt(...viewCenter(), 1 / 1.35);
  $('zoomFit').onclick = fitAll;
  window.addEventListener('resize', () => { if ($('intro').classList.contains('gone')) { cam.tk = clampK(cam.tk); apply(); } else jump(...fitView()); });

  /* ---------- info panel ---------- */
  const body = $('panelBody');
  let selected = null;
  const list = (title, items) => items && items.length ? `<h3>${title}</h3><ul>${items.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '';
  const chips = (title, items) => items && items.length ? `<h3>${title}</h3><div class="chips">${items.map(p => `<span>${esc(p)}</span>`).join('')}</div>` : '';
  const lore = t => t ? `<div class="lore"><span>☠ Sailor’s lore</span>${esc(t)}</div>` : '';
  const meaning = t => `<div class="means"><span>⚓ On the startup sea</span>${esc(t)}</div>`;
  const tag = (color, text) => `<p class="route-tag" style="--c:${color}"><i></i>${esc(text)}</p>`;
  function navButtons(id) {
    const p = prevOf(id), nx = nextOf(id);
    if (!p && !nx.length) return '';
    return `<div class="nav">${p ? `<button class="ghost" data-go="${p}">← ${esc(nodes[p].data.name)}</button>` : ''}${nx.length ? `<button data-go="${nx[0]}">${esc(nodes[nx[0]].data.name)} →</button>` : ''}</div>`;
  }

  function render(n) {
    const d = n.data;
    let h = '';
    if (n.type === 'island') {
      const st = D.stages[n.k];
      const cur = D.crossovers.filter(c => c.a === n.id || c.b === n.id).map(c => {
        const o = nodes[c.a === n.id ? c.b : c.a];
        return `<button data-go="${o.id}" style="--c:${o.lane.color}"><b>${c.a === n.id ? '→' : '←'} ${esc(o.data.name)} · ${esc(o.lane.sector)}</b>${esc(c.why)}</button>`;
      }).join('');
      h = `${tag(n.lane.color, `${n.lane.name} · ${n.lane.sector}`)}
        <h2>${esc(d.name)}</h2>
        <p class="tagline">${esc(d.tagline)}</p>
        <span class="stage">${esc(st.sea)} · island ${n.k + 1} of 5 · ${esc(st.name)}</span>
        <div class="steps">${D.stages.map((_, i) => `<span class="${i <= n.k ? 'on' : ''}${i === 3 ? ' wall' : ''}"></span>`).join('')}</div>
        <p>${esc(d.desc)}</p>
        <p class="stage-note" style="--c:${n.lane.color}"><strong>${esc(st.name)}:</strong> ${esc(st.about)}</p>
        ${list('On this island', d.points)}
        ${chips('Ships spotted here', d.legends)}
        ${chips('Famous landings from this route', d.landings)}
        ${cur ? `<h3>Cross-currents</h3><div class="currents">${cur}</div>` : ''}
        ${navButtons(n.id)}`;
    } else if (n.type === 'sea') {
      h = `${tag('#5aa9e6', `Founder origin · ${d.origin}`)}<h2>${esc(d.name)}</h2><p class="tagline">${esc(d.tagline)}</p>
        ${meaning(d.desc)}${list('Who sails from here', d.points)}
        <div class="nav"><button data-go="start">Ride the current to Founders’ Peak →</button></div>`;
    } else if (n.type === 'beacon') {
      h = `${tag('#2f6fb0', `Beacon ${n.j + 1} of 4`)}<h2>${esc(d.title)}</h2><p class="tagline">${esc(d.desc)}</p>
        ${meaning(D.beaconNote)}${list('What this light checks', d.points)}
        <h3>The other beacons</h3><div class="currents">${D.beacons.map((p, j) => j === n.j ? '' : `<button data-go="bc-${j}" style="--c:#2f6fb0"><b>${esc(p.title)}</b>${esc(p.desc)}</button>`).join('')}</div>
        <div class="nav"><button data-go="exit">Sail to Exit Island →</button></div>`;
    } else if (n.type === 'key') {
      h = `${tag('#ffd166', 'Chart key')}<h2>Reading this chart</h2><p class="tagline">Every landmark on the chart, and what it means for a startup.</p>
        <div class="keylist">${D.key.map(([a, b, go]) => `<button data-go="${go}"><b>${esc(a)}</b><span>${esc(b)}</span></button>`).join('')}</div>`;
    } else {
      const color = { start: '#87845a', exit: '#ffd166', wall: '#8a8f9e', doldrums: '#2a5a4c', lighthouse: '#d9443c', 'reach-us': '#5aa9e6', 'reach-far': '#5aa9e6' }[n.id] || '#5aa9e6';
      h = `${tag(color, d.tag)}<h2>${esc(d.name)}</h2><p class="tagline">${esc(d.tagline)}</p>
        ${lore(d.lore)}${meaning(d.desc)}${list(n.id === 'exit' ? 'Ways to land' : 'Notes from the logbook', d.points)}
        ${chips('Legendary treasures', d.legends)}`;
      if (n.id === 'start') h += `<h3>The four currents</h3><div class="pick">${D.seas.map(b => `<button data-go="sea-${b.id}" style="--c:#5aa9e6"><b>${esc(b.name)} · ${esc(b.origin)}</b>${esc(b.tagline)}</button>`).join('')}</div>`;
      if (['start', 'lighthouse', 'home'].includes(n.id)) h += `<h3>Choose your route</h3><div class="pick">${D.lanes.map(l => `<button data-go="${l.id}-0" style="--c:${l.color}"><b>${esc(l.name)} · ${esc(l.sector)}</b>${esc(l.blurb)}</button>`).join('')}</div>`;
      if (n.id === 'exit') h += `<h3>The four beacons</h3><div class="currents">${D.beacons.map((p, j) => `<button data-go="bc-${j}" style="--c:#2f6fb0"><b>${esc(p.title)}</b>${esc(p.desc)}</button>`).join('')}</div>`;
      if (n.id === 'exit') h += `<div class="nav"><button data-go="start">↺ Take the treasure home and start again</button></div>`;
      else if (n.sail) h += navButtons(n.id);
    }
    body.innerHTML = h;
    panel.hidden = false;
    panel.scrollTop = 0;
  }

  function select(id) {
    const n = id === 'key' ? { id: 'key', type: 'key', data: {} } : nodes[id];
    if (!n) return;
    if (selected && selected.el) selected.el.classList.remove('selected');
    selected = n;
    if (n.el) n.el.classList.add('selected');
    if (n.lane) setLane(n.lane.id);
    if (focusLane && n.lane && n.lane.id !== focusLane) setFocus(null);
    render(n);
    if (n.type === 'key') return;
    if (n.sail) { sailTo(id); if (!sailing) focusNode(n); }
    else { follow = false; markVisited(id); focusNode(n); }
  }
  function closePanel() {
    const was = selected;
    panel.hidden = true;
    if (was && was.el) was.el.classList.remove('selected');
    selected = null;
    if (was && nodes[was.id] && !sailing) focusNode(nodes[was.id]); // re-centre now the panel is gone
  }
  body.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) select(b.dataset.go); });
  $('panelClose').onclick = closePanel;
  $('keyBtn').onclick = () => select('key');

  world.addEventListener('click', e => {
    if (moved >= 6) return;
    const t = e.target.closest('[id^="n-"], [data-node]');
    if (!t) return;
    select(t.dataset.node || t.id.slice(2));
  });
  world.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest('[id^="n-"], [data-node]');
    if (t) { e.preventDefault(); select(t.dataset.node || t.id.slice(2)); }
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
    if (!selected || !selected.data || e.target.closest('button')) return;
    if (e.key === 'ArrowRight') { const nx = nextOf(selected.id)[0]; if (nx) select(nx); }
    if (e.key === 'ArrowLeft') { const p = prevOf(selected.id); if (p) select(p); }
  });

  /* ---------- route legend ---------- */
  const legend = $('legend'), legendList = $('legendList');
  let focusLane = null;
  legendList.innerHTML = D.lanes.map(l => `<li><button data-lane="${l.id}" aria-pressed="false" style="--c:${l.color}"><span class="dot"></span><span>${esc(l.name)}<small>${esc(l.sector)}</small></span></button></li>`).join('');
  function setFocus(id) {
    focusLane = id;
    world.querySelectorAll('[data-lanes]').forEach(el => el.classList.toggle('dim', !!id && !!el.dataset.lanes && !el.dataset.lanes.split(' ').includes(id)));
    legendList.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lane === id));
  }
  legendList.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    setFocus(focusLane === b.dataset.lane ? null : b.dataset.lane);
    legend.classList.remove('open');
  });
  $('legendToggle').onclick = e => { e.currentTarget.setAttribute('aria-expanded', legend.classList.toggle('open')); };

  /* ---------- start ---------- */
  updateLog();
  updateLogPose();
  jump(...fitView());
  $('setSail').onclick = () => {
    $('intro').classList.add('gone');
    select('start');
  };
})();
