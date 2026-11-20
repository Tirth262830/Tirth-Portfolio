/*
 * Hero forest.
 * A small cellular automaton: trees grow, fire spreads to neighbours,
 * burnt cells turn to ash and then grow back. Trees grow much faster
 * inside the letters of the name, so the name keeps re-appearing.
 * The cursor is a spark.
 */
(function () {
  const canvas = document.querySelector(".hero__forest");
  if (!canvas) return;
  const hero = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const EMPTY = 0, TREE = 1, FIRE = 2, ASH = 3;
  const BG = [11, 12, 10];

  let W, H, cell, N;
  let state, next, heat, nheat, mask, seed;
  let img, glowImg, small, smallCtx, glow, glowCtx;
  let running = false, visible = true, last = 0, acc = 0, lastPointer = 0;
  let prev = null;

  // fire colour lookup: index 0 = dying ember, 63 = white hot
  const FIRE_LUT = [];
  for (let i = 0; i < 64; i++) {
    const t = i / 63;
    const stops = [[150, 30, 12], [235, 80, 25], [255, 150, 45], [255, 238, 190]];
    const p = t * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(p)), f = p - k;
    FIRE_LUT.push(stops[k].map((c, j) => Math.round(c + (stops[k + 1][j] - c) * f)));
  }

  function build() {
    const rect = hero.getBoundingClientRect();
    cell = Math.max(4, Math.round(rect.width / 230));
    W = Math.ceil(rect.width / cell);
    H = Math.ceil(rect.height / cell);
    N = W * H;

    state = new Uint8Array(N); next = new Uint8Array(N);
    heat = new Float32Array(N); nheat = new Float32Array(N);
    mask = new Uint8Array(N); seed = new Float32Array(N);
    for (let i = 0; i < N; i++) seed[i] = Math.random();

    buildMask();

    // sparse background forest starts already grown; the name grows in
    for (let i = 0; i < N; i++) {
      if (!mask[i] && seed[i] < 0.09 && Math.random() < 0.7) { state[i] = TREE; heat[i] = 1; }
      if (reduced && mask[i]) { state[i] = TREE; heat[i] = 1; }
    }

    small = document.createElement("canvas"); small.width = W; small.height = H;
    smallCtx = small.getContext("2d");
    glow = document.createElement("canvas"); glow.width = W; glow.height = H;
    glowCtx = glow.getContext("2d");
    img = smallCtx.createImageData(W, H);
    glowImg = glowCtx.createImageData(W, H);

    canvas.width = W * cell; canvas.height = H * cell;
    draw();
  }

  function buildMask() {
    const m = document.createElement("canvas"); m.width = W; m.height = H;
    const c = m.getContext("2d");
    const narrow = W < H * 1.1;
    const lines = ["TIRTH", "PARIKH"];
    const family = '"Space Grotesk", system-ui, sans-serif';
    // fit the longest line to the width, cap total height
    c.font = `700 100px ${family}`;
    const widest = Math.max(...lines.map(l => c.measureText(l).width));
    let size = Math.floor(100 * (W * (narrow ? 0.9 : 0.8)) / widest);
    size = Math.min(size, Math.floor((H * 0.56) / (lines.length * 0.86)));
    c.font = `700 ${size}px ${family}`;
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
    const lh = size * 0.86;
    const top = H * (narrow ? 0.36 : 0.4) - (lh * (lines.length - 1)) / 2;
    lines.forEach((l, k) => c.fillText(l, W / 2, top + k * lh));
    const d = c.getImageData(0, 0, W, H).data;
    for (let i = 0; i < N; i++) mask[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  }

  function ignite(x, y, r) {
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const px = cx + dx, py = cy + dy;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const i = py * W + px;
      if (state[i] === TREE) { state[i] = FIRE; heat[i] = 1; }
    }
  }

  function step() {
    next.set(state); nheat.set(heat);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x, s = state[i];
        if (s === FIRE) {
          // spread to neighbours that are trees
          const h = heat[i];
          if (h > 0.25) {
            if (x > 0 && state[i - 1] === TREE && Math.random() < 0.55) { next[i - 1] = FIRE; nheat[i - 1] = 1; }
            if (x < W - 1 && state[i + 1] === TREE && Math.random() < 0.55) { next[i + 1] = FIRE; nheat[i + 1] = 1; }
            if (y > 0 && state[i - W] === TREE && Math.random() < 0.62) { next[i - W] = FIRE; nheat[i - W] = 1; } // fire climbs
            if (y < H - 1 && state[i + W] === TREE && Math.random() < 0.4) { next[i + W] = FIRE; nheat[i + W] = 1; }
          }
          const nh = h - (0.05 + seed[i] * 0.04);
          if (nh <= 0) { next[i] = ASH; nheat[i] = 1; } else nheat[i] = nh;
        } else if (s === ASH) {
          const nh = heat[i] - 0.014;
          if (nh <= 0) { next[i] = EMPTY; nheat[i] = 0; } else nheat[i] = nh;
        } else if (s === EMPTY) {
          if (mask[i] ? Math.random() < 0.02 : seed[i] < 0.09 && Math.random() < 0.0025) {
            next[i] = TREE; nheat[i] = 0;
          }
        } else if (s === TREE && heat[i] < 1) {
          nheat[i] = Math.min(1, heat[i] + 0.05);
        }
      }
    }
    [state, next] = [next, state];
    [heat, nheat] = [nheat, heat];
  }

  function draw() {
    const d = img.data, g = glowImg.data;
    for (let i = 0; i < N; i++) {
      const s = state[i], h = heat[i], o = i * 4;
      let r = BG[0], gg = BG[1], b = BG[2];
      g[o + 3] = 0;
      if (s === TREE) {
        const v = 0.82 + seed[i] * 0.18;
        const c = mask[i] ? [236 * v, 233 * v, 222 * v] : [48 * v, 58 * v, 40 * v];
        r = BG[0] + (c[0] - BG[0]) * h; gg = BG[1] + (c[1] - BG[1]) * h; b = BG[2] + (c[2] - BG[2]) * h;
      } else if (s === FIRE) {
        const c = FIRE_LUT[Math.max(0, Math.min(63, Math.round(h * 63)))];
        r = c[0]; gg = c[1]; b = c[2];
        g[o] = c[0]; g[o + 1] = c[1]; g[o + 2] = c[2]; g[o + 3] = 255;
      } else if (s === ASH) {
        r = BG[0] + (70 - BG[0]) * h; gg = BG[1] + (42 - BG[1]) * h; b = BG[2] + (30 - BG[2]) * h;
      }
      d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
    }
    smallCtx.putImageData(img, 0, 0);
    glowCtx.putImageData(glowImg, 0, 0);

    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
    // soft glow around the flames
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.filter = `blur(${cell * 2.2}px)`;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glow, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(100, t - (last || t));
    last = t; acc += dt;
    // simulation at ~30 steps per second regardless of screen refresh rate
    let steps = 0;
    while (acc >= 33 && steps < 3) { step(); acc -= 33; steps++; }
    // an occasional lightning strike when nobody is playing with it
    if (t - lastPointer > 5000 && Math.random() < 0.006) strike();
    if (steps) draw();
    requestAnimationFrame(loop);
  }

  function strike() {
    for (let tries = 0; tries < 40; tries++) {
      const i = (Math.random() * N) | 0;
      if (mask[i] && state[i] === TREE) { state[i] = FIRE; heat[i] = 1; return; }
    }
  }

  function setRunning() {
    const should = visible && !document.hidden && !reduced;
    if (should && !running) { running = true; last = 0; requestAnimationFrame(loop); }
    if (!should) running = false;
  }

  function local(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  hero.addEventListener("pointermove", (e) => {
    if (reduced) return;
    lastPointer = performance.now();
    const [x, y] = local(e);
    // fill the gap between pointer events so fast strokes leave a line
    if (prev) {
      const dx = x - prev[0], dy = y - prev[1];
      const n = Math.min(30, Math.ceil(Math.hypot(dx, dy) / cell));
      for (let k = 1; k <= n; k++) ignite(prev[0] + (dx * k) / n, prev[1] + (dy * k) / n, 1);
    } else ignite(x, y, 1);
    prev = [x, y];
  });
  hero.addEventListener("pointerleave", () => { prev = null; });
  hero.addEventListener("pointerdown", (e) => {
    if (reduced) return;
    lastPointer = performance.now();
    const [x, y] = local(e);
    ignite(x, y, 4);
  });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; setRunning(); }).observe(hero);
  document.addEventListener("visibilitychange", setRunning);

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      // phones fire resize when the URL bar hides; only rebuild on real size changes
      const r = hero.getBoundingClientRect();
      if (Math.abs(Math.ceil(r.width / cell) - W) > 1 || Math.abs(Math.ceil(r.height / cell) - H) > 6) build();
    }, 200);
  });

  // wait for the display font so the name is drawn in it
  const start = () => { build(); setRunning(); };
  (document.fonts && document.fonts.load ? document.fonts.load('700 100px "Space Grotesk"').catch(() => {}) : Promise.resolve())
    .then(start, start);

  // used by the command palette
  window.Forest = {
    burn() {
      if (reduced || !state) return;
      for (let k = 0; k < 14; k++) strike();
      lastPointer = performance.now();
    },
  };
})();
