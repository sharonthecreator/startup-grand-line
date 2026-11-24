/* Startup Grand Line — map engine: draws the sea chart, sails the ship, fills the info panel. */
(() => {
  const D = window.GL;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 3250, H = 2400, RED_X = 1800;
  const STAGE_X = [700, 1090, 1480, 2120, 2510];
  const laneY = i => 300 + i * 310;

  const svg = document.getElementById('sea');
  const S = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const rng = seed => {
    let s = (seed * 2654435761) % 4294967296;
    return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* An organic closed shape around (cx, cy). */
  function blob(cx, cy, r, rand, n = 11, v = 0.26) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r * (1 - v / 2 + rand() * v);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    const P = i => pts[(i + n) % n];
    let d = `M${P(0)[0].toFixed(1)},${P(0)[1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  /* ---------- nodes ---------- */
  const nodes = {};
  nodes.start = { id: 'start', type: 'start', x: 440, y: 1230, cx: 260, cy: 1230, r: 165, data: D.start };
  nodes.exit = { id: 'exit', type: 'exit', x: 2880, y: 1230, cx: 3040, cy: 1230, r: 135, data: D.exit };
  D.lanes.forEach((lane, i) => lane.islands.forEach((isl, k) => {
    const r = 44 + k * 7;
    const x = STAGE_X[k] + Math.sin(i * 12.9 + k * 78.2) * 45;
    const y = laneY(i) + Math.cos(i * 4.1 + k * 9.7) * 36;
    nodes[`${lane.id}-${k}`] = { id: `${lane.id}-${k}`, type: 'island', lane, li: i, k, x, y, cx: x, cy: y - r - 16, r, data: isl };
  }));

  /* ---------- layers ---------- */
  const defs = S('defs', {}, svg);
  defs.innerHTML = `
    <radialGradient id="deep" cx="50%" cy="50%" r="75%">
      <stop offset="0" stop-color="#2389b5"/><stop offset=".55" stop-color="#156a96"/><stop offset="1" stop-color="#0a3d63"/>
    </radialGradient>
    <pattern id="wavep" width="160" height="80" patternUnits="userSpaceOnUse">
      <path d="M10 22 q12 -10 24 0 t24 0" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M92 60 q12 -10 24 0 t24 0" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="2.5" stroke-linecap="round"/>
    </pattern>
    <radialGradient id="gold"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd166" stop-opacity=".45"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>`;
  const world = S('g', { id: 'world' }, svg);
  const gOcean = S('g', {}, world), gDecor = S('g', {}, world), gRed = S('g', {}, world), gBase = S('g', {}, world),
    gRoutes = S('g', {}, world), gIslands = S('g', {}, world), gShip = S('g', { id: 'ship' }, world);

  /* ---------- ocean & decor ---------- */
  S('rect', { x: -4000, y: -4000, width: W + 8000, height: H + 8000, fill: '#0a3d63' }, gOcean);
  S('rect', { x: -700, y: -700, width: W + 1400, height: H + 1400, fill: 'url(#deep)' }, gOcean);
  S('rect', { class: 'waves', x: -700, y: -700, width: W + 1600, height: H + 1500, fill: 'url(#wavep)' }, gOcean);

  D.stages.forEach((st, k) => { S('text', { class: 'stagehead', x: STAGE_X[k], y: 62 }, gDecor).textContent = st.name.toUpperCase(); });
  S('text', { class: 'seaname', x: 1090, y: 2365 }, gDecor).textContent = 'THE HOME WATERS';
  S('text', { class: 'seaname', x: 2330, y: 2365 }, gDecor).textContent = 'THE NEW WORLD';

  // compass rose
  const comp = S('g', { transform: 'translate(3060,2140)', opacity: '.5' }, gDecor);
  S('circle', { r: 86, fill: 'none', stroke: '#cfeaf5', 'stroke-width': 3 }, comp);
  S('circle', { r: 70, fill: 'none', stroke: '#cfeaf5', 'stroke-width': 1.5, 'stroke-dasharray': '3 8' }, comp);
  for (let a = 0; a < 8; a++) S('path', { d: a % 2 ? 'M0,-46 L8,0 L0,46 L-8,0Z' : 'M0,-82 L13,0 L0,82 L-13,0Z', fill: a % 2 ? '#9fd3e6' : '#eaf6fb', transform: `rotate(${a * 45})`, opacity: a < 4 ? 1 : 0 }, comp);
  S('text', { y: -98, 'text-anchor': 'middle', fill: '#eaf6fb', 'font-size': 30, 'font-family': 'Pirata One, serif' }, comp).textContent = 'N';

  /* ---------- the Red Line ---------- */
  const red = S('g', { class: 'redline', tabindex: 0, role: 'button', 'aria-label': 'The Red Line' }, gRed);
  const jag = (half, seed) => {
    const r = rng(seed), L = [], R = [];
    for (let y = -500; y <= H + 500; y += 46) { L.push(`${RED_X - half - r() * 24},${y}`); R.unshift(`${RED_X + half + r() * 24},${y + 20}`); }
    return L.concat(R).join(' ');
  };
  S('polygon', { class: 'rock', points: jag(34, 7) }, red);
  S('polygon', { class: 'ridge', points: jag(6, 19) }, red);
  D.lanes.forEach((_, i) => S('ellipse', { class: 'gate', cx: RED_X, cy: laneY(i), rx: 84, ry: 36 }, red));
  [150, 2330].forEach(y => { S('text', { x: RED_X, y }, red).textContent = 'THE RED LINE'; });

  /* ---------- routes ---------- */
  const edges = new Map(), adj = {};
  const curve = (a, b) => { const dx = (b.x - a.x) / 2; return `C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`; };
  function addEdge(a, b, cls, lanes, color, d) {
    d = d || `M${a.x},${a.y} ${curve(a, b)}`;
    const p = S('path', { class: cls, d, 'data-lanes': lanes, style: `--c:${color}` }, gRoutes);
    if (cls === 'route') S('path', { class: 'route-flow', d, 'data-lanes': lanes }, gRoutes);
    edges.set(`${a.id}|${b.id}`, p);
    (adj[a.id] = adj[a.id] || []).push(b.id);
    (adj[b.id] = adj[b.id] || []).push(a.id);
  }
  D.lanes.forEach((lane, i) => {
    const n = k => nodes[`${lane.id}-${k}`];
    addEdge(nodes.start, n(0), 'route', lane.id, lane.color);
    for (let k = 0; k < 4; k++) {
      let d;
      if (k === 2) { const g = { x: RED_X, y: laneY(i) }; d = `M${n(2).x},${n(2).y} ${curve(n(2), g)} ${curve(g, n(3))}`; }
      addEdge(n(k), n(k + 1), 'route', lane.id, lane.color, d);
    }
    addEdge(n(4), nodes.exit, 'route', lane.id, lane.color);
  });
  D.crossovers.forEach(c => {
    c.a = `${c.from[0]}-${c.from[1]}`; c.b = `${c.to[0]}-${c.to[1]}`;
    addEdge(nodes[c.a], nodes[c.b], 'cross', `${c.from[0]} ${c.to[0]}`, '#fff');
  });

  /* ---------- islands ---------- */
  function makeIsland(n) {
    const rand = rng(n.li * 31 + n.k * 7 + 3), c = n.lane.color;
    const g = S('g', { class: 'island', id: `n-${n.id}`, tabindex: 0, role: 'button', 'data-lanes': n.lane.id, style: `--c:${c}`,
      'aria-label': `${n.data.name}, ${D.stages[n.k].name}, ${n.lane.sector}` }, gIslands);
    S('path', { class: 'halo', d: blob(n.cx, n.cy, n.r * 1.4, rand) }, g);
    S('line', { class: 'pier', x1: n.x, y1: n.y - 8, x2: n.x, y2: n.cy + n.r * 0.6 }, g);
    S('path', { class: 'sand', d: blob(n.cx, n.cy, n.r, rand) }, g);
    S('path', { class: 'grass', d: blob(n.cx, n.cy - 2, n.r * 0.68, rand, 9, 0.3) }, g);
    for (let t = 0; t < 3 + n.k; t++) {
      const a = rand() * 6.28, rr = rand() * n.r * 0.5;
      S('circle', { class: 'tree', cx: n.cx + Math.cos(a) * rr, cy: n.cy + Math.sin(a) * rr, r: 6 + rand() * 5 }, g);
    }
    for (let h = 0; h <= n.k; h++) { // the settlement grows with each stage
      const hx = n.cx + (h - n.k / 2) * 19 - 7, hh = 11 + (h % 2) * 5 + (n.k === 4 && h === 2 ? 12 : 0), hy = n.cy + 10 - hh;
      S('rect', { class: 'hut', x: hx, y: hy, width: 14, height: hh }, g);
      S('path', { class: 'roof', d: `M${hx - 3},${hy} L${hx + 7},${hy - 9} L${hx + 17},${hy}Z` }, g);
    }
    const fx = n.cx, fy = n.cy - n.r * 0.35;
    S('line', { class: 'pole', x1: fx, y1: fy, x2: fx, y2: fy - 34 }, g);
    S('path', { class: 'pennant', d: `M${fx},${fy - 34} l24,7 l-24,8Z` }, g);
    S('path', { class: 'star', transform: `translate(${n.cx + n.r * 0.75},${n.cy - n.r * 0.75})`, d: 'M0,-14 L4,-5 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-5Z' }, g);
    S('circle', { class: 'ring', cx: n.cx, cy: n.cy, r: n.r * 1.3 }, g);
    S('circle', { class: 'buoy', cx: n.x, cy: n.y, r: 9 }, g);
    S('text', { class: 'name', x: n.x, y: n.y + 60 }, g).textContent = n.data.name;
    S('text', { class: 'sub', x: n.x, y: n.y + 86 }, g).textContent = D.stages[n.k].name.replace(/ \(.*/, '');
    n.el = g;
  }
  Object.values(nodes).filter(n => n.type === 'island').forEach(makeIsland);

  // Reverse Mountain
  (() => {
    const n = nodes.start, r = rng(99);
    const g = S('g', { class: 'island big', id: 'n-start', tabindex: 0, role: 'button', 'aria-label': 'Reverse Mountain, the starting point' }, gBase);
    S('path', { class: 'halo', d: blob(n.cx, n.cy, 215, r, 14) }, g);
    S('path', { d: blob(n.cx, n.cy, 170, r, 14, 0.2), fill: '#6f4337', stroke: '#3f241d', 'stroke-width': 4, class: 'sand' , style: 'fill:#6f4337;stroke:#3f241d' }, g);
    S('path', { d: blob(n.cx, n.cy, 128, r, 12, 0.22), fill: '#8f5646' }, g);
    S('path', { d: blob(n.cx, n.cy, 88, r, 10, 0.25), fill: '#ad6a55' }, g);
    S('path', { d: blob(n.cx, n.cy, 50, r, 9, 0.3), fill: '#cf8a70' }, g);
    for (let a = 0; a < 7; a++) { // seven streams running down to the harbour
      const ang = -1.0 + a * 0.33, mx = n.cx + Math.cos(ang) * 110, my = n.cy + Math.sin(ang) * 110;
      S('path', { d: `M${n.cx},${n.cy} Q${mx},${my} ${n.x},${n.y}`, fill: 'none', stroke: D.lanes[a].color, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.85 }, g);
    }
    S('path', { d: blob(n.cx, n.cy, 30, r, 8, 0.35), fill: '#f6f9fc', stroke: '#c9d6e2', 'stroke-width': 2 }, g);
    S('circle', { class: 'ring', cx: n.cx, cy: n.cy, r: 200 }, g);
    S('text', { class: 'name', x: n.cx + 20, y: n.cy + 250 }, g).textContent = 'Reverse Mountain';
    S('text', { class: 'sub', x: n.cx + 20, y: n.cy + 284 }, g).textContent = 'Every voyage starts here';
    n.el = g;
  })();

  // The Exit
  (() => {
    const n = nodes.exit, r = rng(41);
    const g = S('g', { class: 'island big', id: 'n-exit', tabindex: 0, role: 'button', 'aria-label': 'The Exit, the final island' }, gIslands);
    S('circle', { class: 'glow', cx: n.cx, cy: n.cy, r: 290, fill: 'url(#gold)' }, g);
    S('path', { class: 'sand', d: blob(n.cx, n.cy, 140, r, 13, 0.2), style: 'fill:#ffe08a;stroke:#c9962e' }, g);
    S('path', { class: 'grass', d: blob(n.cx, n.cy, 96, r, 11, 0.25) }, g);
    for (let t = 0; t < 9; t++) { const a = r() * 6.28; S('circle', { class: 'tree', cx: n.cx + Math.cos(a) * 72, cy: n.cy + Math.sin(a) * 72, r: 8 + r() * 6 }, g); }
    const c = S('g', { transform: `translate(${n.cx},${n.cy})` }, g); // treasure chest
    S('ellipse', { cy: 26, rx: 46, ry: 12, fill: '#000', opacity: 0.2 }, c);
    S('rect', { x: -36, y: -8, width: 72, height: 34, rx: 4, fill: '#8a5a2b', stroke: '#3f2a14', 'stroke-width': 3 }, c);
    S('path', { d: 'M-36,-8 Q-36,-40 0,-40 Q36,-40 36,-8Z', fill: '#a56d36', stroke: '#3f2a14', 'stroke-width': 3 }, c);
    S('path', { d: 'M-30,-10 Q0,-30 30,-10 L26,-4 L-26,-4Z', fill: '#ffd166', stroke: '#b8860b', 'stroke-width': 2 }, c);
    S('rect', { x: -7, y: -8, width: 14, height: 16, rx: 2, fill: '#ffd166', stroke: '#3f2a14', 'stroke-width': 2 }, c);
    S('circle', { class: 'ring', cx: n.cx, cy: n.cy, r: 170 }, g);
    S('text', { class: 'name', x: n.cx - 10, y: n.cy + 215 }, g).textContent = 'The Exit';
    S('text', { class: 'sub', x: n.cx - 10, y: n.cy + 249 }, g).textContent = 'Acquisition · IPO';
    n.el = g;
  })();

  /* ---------- ship ---------- */
  const shipBob = S('g', { class: 'bob' }, gShip);
  shipBob.innerHTML = `
    <path class="wake" d="M-30,-6 L-70,-22 M-30,6 L-70,22"/>
    <path d="M-30,0 C-30,-14 -8,-16 12,-14 C24,-11 36,-5 42,0 C36,5 24,11 12,14 C-8,16 -30,14 -30,0Z" fill="#8a5a2b" stroke="#3f2a14" stroke-width="2.5"/>
    <path d="M-22,0 C-22,-8 -6,-9 10,-8 C20,-6 28,-3 32,0 C28,3 20,6 10,8 C-6,9 -22,8 -22,0Z" fill="#c69256"/>
    <path d="M-12,-22 Q4,0 -12,22 Q-5,0 -12,-22Z" fill="#fff" stroke="#b9c4cc" stroke-width="1.5"/>
    <path d="M10,-26 Q30,0 10,26 Q18,0 10,-26Z" fill="#fff" stroke="#b9c4cc" stroke-width="1.5"/>
    <circle cx="10" cy="0" r="3.5" fill="#3f2a14"/><circle cx="-12" cy="0" r="3" fill="#3f2a14"/>
    <path d="M-30,0 l-12,-5 l0,10Z" fill="#e5484d"/>`;
  let shipAt = 'start', sailing = false, pending = null, follow = false;
  const placeShip = (x, y, deg) => gShip.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(1.35)`);
  placeShip(nodes.start.x, nodes.start.y, 0);

  function findRoute(a, b) {
    const prev = { [a]: null }, q = [a];
    while (q.length) {
      const cur = q.shift();
      if (cur === b) break;
      for (const nx of adj[cur]) if (!(nx in prev)) { prev[nx] = cur; q.push(nx); }
    }
    const out = [];
    for (let c = b; c != null; c = prev[c]) out.unshift(c);
    return out;
  }

  function sailTo(id) {
    if (sailing) { pending = id; return; }
    if (id === shipAt) return arrive(id);
    const ids = findRoute(shipAt, id);
    const segs = [];
    for (let i = 0; i < ids.length - 1; i++) {
      let p = edges.get(`${ids[i]}|${ids[i + 1]}`), rev = false;
      if (!p) { p = edges.get(`${ids[i + 1]}|${ids[i]}`); rev = true; }
      segs.push({ p, rev, len: p.getTotalLength(), to: ids[i + 1] });
    }
    const at = (s, d) => s.p.getPointAtLength(s.rev ? s.len - d : d);
    const total = segs.reduce((t, s) => t + s.len, 0);
    const speed = Math.max(520, total / 4.5); // world units per second
    let idx = 0, dist = 0, last = performance.now();
    sailing = true; follow = true;
    gShip.classList.add('sailing');
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
      if (follow) centerOn(a.x, a.y - 40, cam.tk);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- logbook ---------- */
  let visited = new Set();
  try { visited = new Set(JSON.parse(localStorage.getItem('gl-visited') || '[]')); } catch (e) { /* storage unavailable */ }
  const total = Object.keys(nodes).length;
  function updateLog() {
    visited.forEach(id => nodes[id] && nodes[id].el.classList.add('visited'));
    document.getElementById('log').textContent = `Logbook: ${[...visited].filter(id => nodes[id]).length} / ${total} islands charted`;
  }
  function arrive(id) {
    visited.add(id);
    try { localStorage.setItem('gl-visited', JSON.stringify([...visited])); } catch (e) { /* ignore */ }
    updateLog();
    follow = false;
    focusNode(nodes[id]);
  }

  /* ---------- camera ---------- */
  const cam = { x: 0, y: 0, k: 1, tx: 0, ty: 0, tk: 1, moving: false };
  const panel = document.getElementById('panel');
  const vw = () => window.innerWidth, vh = () => window.innerHeight;
  const mobile = () => vw() <= 760;
  const side = () => (mobile() ? 0 : 240); // room taken by the route legend
  const fitK = () => Math.min((vw() - side()) / (W + 60), vh() / (H + 60));
  const clampK = k => Math.max(fitK() * 0.8, Math.min(2.2, k));
  const apply = () => world.setAttribute('transform', `translate(${cam.x.toFixed(2)},${cam.y.toFixed(2)}) scale(${cam.k.toFixed(4)})`);
  function viewCenter() {
    const open = !panel.hidden;
    return mobile() ? [vw() / 2, open ? vh() * 0.24 : vh() / 2] : [open ? (vw() - 430 + side()) / 2 : (vw() + side()) / 2, vh() / 2];
  }
  function centerOn(wx, wy, k) {
    const [cx, cy] = viewCenter();
    cam.tk = clampK(k); cam.tx = cx - wx * cam.tk; cam.ty = cy - wy * cam.tk;
    if (!cam.moving) { cam.moving = true; requestAnimationFrame(glide); }
  }
  function glide() {
    const e = 0.12;
    cam.x += (cam.tx - cam.x) * e; cam.y += (cam.ty - cam.y) * e; cam.k += (cam.tk - cam.k) * e;
    if (Math.abs(cam.tx - cam.x) + Math.abs(cam.ty - cam.y) < 0.5 && Math.abs(cam.tk - cam.k) < 0.001) {
      cam.x = cam.tx; cam.y = cam.ty; cam.k = cam.tk; cam.moving = false;
    } else if (cam.moving) requestAnimationFrame(glide);
    apply();
  }
  const closeUp = () => Math.max(0.5, Math.min(0.95, Math.min(vw(), vh()) / 1000));
  const focusNode = n => centerOn(n.cx + (n.x - n.cx) / 2, n.cy + 30, Math.max(cam.tk, closeUp()));
  function fitAll() { follow = false; centerOn(W / 2, H / 2, fitK()); }
  function jump(x, y, k) { cam.moving = false; follow = false; cam.x = cam.tx = x; cam.y = cam.ty = y; cam.k = cam.tk = k; apply(); }
  function zoomAt(px, py, f) {
    const k = clampK(cam.k * f), r = k / cam.k;
    jump(px - (px - cam.x) * r, py - (py - cam.y) * r, k);
  }

  // pointer pan & pinch
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
  document.getElementById('zoomIn').onclick = () => zoomAt(...viewCenter(), 1.35);
  document.getElementById('zoomOut').onclick = () => zoomAt(...viewCenter(), 1 / 1.35);
  document.getElementById('zoomFit').onclick = fitAll;
  window.addEventListener('resize', () => { cam.tk = clampK(cam.tk); if (document.getElementById('intro').classList.contains('gone')) apply(); else jump(...fitView()); });
  const fitView = () => { const k = fitK(); return [(vw() + side()) / 2 - (W / 2) * k, vh() / 2 - (H / 2) * k, k]; };

  /* ---------- info panel ---------- */
  const body = document.getElementById('panelBody');
  let selected = null;
  const list = (title, items) => items && items.length ? `<h3>${title}</h3><ul>${items.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '';
  const chips = (title, items) => items && items.length ? `<h3>${title}</h3><div class="chips">${items.map(p => `<span>${esc(p)}</span>`).join('')}</div>` : '';
  const neighbours = n => n.type !== 'island' ? {} : {
    prev: n.k > 0 ? `${n.lane.id}-${n.k - 1}` : 'start',
    next: n.k < 4 ? `${n.lane.id}-${n.k + 1}` : 'exit'
  };

  function render(n) {
    const d = n.data;
    let h = '';
    if (n.type === 'island') {
      const st = D.stages[n.k], nb = neighbours(n);
      const cur = D.crossovers.filter(c => c.a === n.id || c.b === n.id).map(c => {
        const o = nodes[c.a === n.id ? c.b : c.a];
        return `<button data-go="${o.id}" style="--c:${o.lane.color}"><b>${c.a === n.id ? '→' : '←'} ${esc(o.data.name)} · ${esc(o.lane.sector)}</b>${esc(c.why)}</button>`;
      }).join('');
      h = `<p class="route-tag" style="--c:${n.lane.color}"><i></i>${esc(n.lane.name)} · ${esc(n.lane.sector)}</p>
        <h2>${esc(d.name)}</h2>
        <p class="tagline">${esc(d.tagline)}</p>
        <span class="stage">Island ${n.k + 1} of 5 · ${esc(st.name)}</span>
        <div class="steps">${D.stages.map((_, i) => `<span class="${i <= n.k ? 'on' : ''}"></span>`).join('')}</div>
        <p>${esc(d.desc)}</p>
        <p class="stage-note" style="--c:${n.lane.color}"><strong>${esc(st.name)}:</strong> ${esc(st.about)}</p>
        ${list('On this island', d.points)}
        ${chips('Ships spotted here', d.legends)}
        ${chips('Famous landings from this route', d.landings)}
        ${cur ? `<h3>Cross-currents</h3><div class="currents">${cur}</div>` : ''}
        <div class="nav"><button class="ghost" data-go="${nb.prev}">← ${nb.prev === 'start' ? 'Reverse Mountain' : 'Back'}</button>
        <button data-go="${nb.next}">${nb.next === 'exit' ? 'Sail to the Exit' : 'Next island'} →</button></div>`;
    } else if (n.type === 'start') {
      h = `<p class="route-tag"><i style="background:#ad6a55"></i>The starting point</p>
        <h2>${esc(d.name)}</h2><p class="tagline">${esc(d.tagline)}</p><p>${esc(d.desc)}</p>
        ${list('Why so many ships launch here', d.points)}
        <h3>Choose your route</h3><div class="pick">${D.lanes.map(l => `<button data-go="${l.id}-0" style="--c:${l.color}"><b>${esc(l.name)} · ${esc(l.sector)}</b>${esc(l.blurb)}</button>`).join('')}</div>`;
    } else if (n.type === 'exit') {
      h = `<p class="route-tag"><i style="background:#ffd166"></i>The final island</p>
        <h2>${esc(d.name)}</h2><p class="tagline">${esc(d.tagline)}</p><p>${esc(d.desc)}</p>
        ${list('Ways to land', d.points)}${chips('Legendary treasures', d.legends)}
        <div class="nav"><button data-go="start">↺ Sail again from Reverse Mountain</button></div>`;
    } else {
      h = `<p class="route-tag"><i style="background:#8a2f2b"></i>The great divide</p>
        <h2>${esc(d.name)}</h2><p class="tagline">${esc(d.tagline)}</p><p>${esc(d.desc)}</p>${list('Crossing notes', d.points)}`;
    }
    body.innerHTML = h;
    panel.hidden = false;
    panel.scrollTop = 0;
  }

  function select(id) {
    const n = nodes[id];
    if (!n) return;
    if (selected) selected.el.classList.remove('selected');
    selected = n; n.el.classList.add('selected');
    render(n);
    if (focusLane && n.lane && n.lane.id !== focusLane) setFocus(null);
    sailTo(id);
    if (!sailing) focusNode(n);
  }
  function closePanel() {
    panel.hidden = true;
    if (selected) selected.el.classList.remove('selected');
    selected = null;
  }
  body.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) select(b.dataset.go); });
  document.getElementById('panelClose').onclick = closePanel;

  const openRedLine = () => {
    if (selected) selected.el.classList.remove('selected');
    selected = null;
    render({ type: 'redline', data: D.redline });
    centerOn(RED_X, nodes[shipAt].y, Math.max(cam.tk, closeUp() * 0.8));
  };
  Object.values(nodes).forEach(n => {
    n.el.addEventListener('click', () => { if (moved < 6) select(n.id); });
    n.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); } });
  });
  red.addEventListener('click', () => { if (moved < 6) openRedLine(); });
  red.addEventListener('keydown', e => { if (e.key === 'Enter') openRedLine(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
    if (!selected || e.target.closest('button')) return;
    const nb = neighbours(selected);
    if (e.key === 'ArrowRight' && nb.next) select(nb.next);
    if (e.key === 'ArrowLeft' && nb.prev) select(nb.prev);
  });

  /* ---------- route legend ---------- */
  const legend = document.getElementById('legend'), legendList = document.getElementById('legendList');
  let focusLane = null;
  legendList.innerHTML = D.lanes.map(l => `<li><button data-lane="${l.id}" aria-pressed="false" style="--c:${l.color}"><span class="dot"></span><span>${esc(l.name)}<small>${esc(l.sector)}</small></span></button></li>`).join('');
  function setFocus(id) {
    focusLane = id;
    world.querySelectorAll('[data-lanes]').forEach(el => el.classList.toggle('dim', !!id && !el.dataset.lanes.split(' ').includes(id)));
    legendList.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lane === id));
  }
  legendList.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    setFocus(focusLane === b.dataset.lane ? null : b.dataset.lane);
    legend.classList.remove('open');
  });
  document.getElementById('legendToggle').onclick = e => {
    e.currentTarget.setAttribute('aria-expanded', legend.classList.toggle('open'));
  };

  /* ---------- start ---------- */
  updateLog();
  jump(...fitView());
  document.getElementById('setSail').onclick = () => {
    document.getElementById('intro').classList.add('gone');
    select('start');
  };
})();
