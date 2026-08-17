/**
 * arc-lightplay.js — ARC UI hero background
 *
 * Caustic lightplay: blue->teal caustic fields over nebula lobes, two parallel
 * light shafts, cursor-as-lens, click refraction ripples, two drifting light
 * motes with trails, and a faint dot grid lit by the shared energize field.
 *
 * Drop-in for arcui.dev:
 *   - Colors are read LIVE from var(--accent-primary) / var(--accent-secondary)
 *     on :root, and re-read whenever html[data-theme] (or class/style) mutates —
 *     so it follows your existing theme system, including the light-theme teal
 *     deepening, with zero configuration.
 *   - Theme detection: html[data-theme="light"|"dark"], falling back to
 *     prefers-color-scheme.
 *   - Performance: single cheap fragment pass (no raymarch), dpr-capped,
 *     pauses when offscreen or tab-hidden, static frame under
 *     prefers-reduced-motion (click ripples still animate one burst).
 *   - Ripples only fire for pointerdowns inside the canvas bounds.
 *
 * Usage (Astro):
 *   ---
 *   // Hero.astro
 *   ---
 *   <section class="hero">
 *     <canvas class="lightplay" data-lightplay></canvas>
 *     <!-- hero content -->
 *   </section>
 *   <style>
 *     .lightplay{ position:absolute; inset:0; width:100%; height:100%;
 *                 display:block; pointer-events:none; }
 *   </style>
 *   <script>
 *     import { initLightplay } from '../scripts/arc-lightplay.js';
 *     const dispose = initLightplay(document.querySelector('[data-lightplay]'));
 *     // call dispose() on teardown if the hero ever unmounts (SPA transitions)
 *   </script>
 */

const DEFAULTS = {
  lensRadius: 220,     // higher = tighter cursor lens (gaussian falloff constant)
  rippleSpeed: 0.28,   // click wavefront speed, screen-heights/sec (max radius ~0.5)
  rippleAmp: 0.035,    // refraction displacement amplitude
  rippleLife: 2.6,     // seconds; smooth fade over the final 0.6s
  maxRipples: 14,      // simultaneous ripples (expired slots reused first)
  moteCount: 4,        // drifting light bits (0 disables them entirely)
  moteSpeed: 0.055,    // mote drift speed, screen-heights/sec
  dprCap: 1.5,         // devicePixelRatio ceiling
  dotGrid: true,       // faint dot grid, lit by the energize field
};

export function initLightplay(canvas, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return () => {};

  const MAX_CLICKS = o.maxRipples;
  const N_MOTE = Math.max(0, o.moteCount | 0);
  const TRAIL = 16;
  const f = n => Number(n).toFixed(4); // GLSL float literal

  const VERT = `
    attribute vec2 a;
    void main(){ gl_Position = vec4(a, 0.0, 1.0); }
  `;

  const MOTE_UNIFORMS = N_MOTE > 0 ? `
    uniform vec2  u_mote[${N_MOTE}];
    uniform float u_moteB[${N_MOTE}];
    uniform vec2  u_trail[${N_MOTE * TRAIL}];
  ` : '';

  const MOTE_ENERGIZE = N_MOTE > 0 ? `
      for (int i = 0; i < ${N_MOTE}; i++){
        vec2 dw = q - u_mote[i];
        E += exp(-dot(dw, dw) * 500.0) * 0.8 * u_moteB[i];
      }
  ` : '';

  const MOTE_DRAW = N_MOTE > 0 ? `
      vec3 moteCol = mix(lcol, vec3(1.0), 0.45);
      for (int i = 0; i < ${N_MOTE}; i++){
        float B = u_moteB[i];
        vec2 dw = q - u_mote[i];
        float d2w = dot(dw, dw);
        em += moteCol * (exp(-d2w * 26000.0) * 1.2 + exp(-d2w * 2800.0) * 0.35) * B;
      }
      for (int i = 0; i < ${N_MOTE * TRAIL}; i++){
        float B = u_moteB[i / ${TRAIL}];
        float fade = float(i - (i / ${TRAIL}) * ${TRAIL}) / float(${TRAIL});
        vec2 dt2 = q - u_trail[i];
        em += moteCol * exp(-dot(dt2, dt2) * 11000.0) * fade * fade * 0.4 * B;
      }
  ` : '';

  const DOT_GRID = o.dotGrid ? `
      vec2 df = fract(frag / (u_res.y * 0.03)) - 0.5;
      float dotm = smoothstep(0.055, 0.03, length(df));
      em += vec3(1.0) * dotm * (0.03 + clamp(E, 0.0, 1.5) * 0.05);
  ` : '';

  const FRAG = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform vec3  u_c1;
    uniform vec3  u_c2;
    uniform float u_light;
    uniform vec3  u_clicks[${MAX_CLICKS}];
    ${MOTE_UNIFORMS}

    float hash(vec2 p){
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p), fr = fract(p);
      vec2 u = fr * fr * (3.0 - 2.0 * fr);
      return mix(mix(hash(i),             hash(i + vec2(1,0)), u.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 3; i++){
        v += a * noise(p);
        p = p * 2.07 + vec2(13.7, 5.1);
        a *= 0.5;
      }
      return v;
    }

    void main(){
      vec2 frag = gl_FragCoord.xy;
      vec2 uv = frag / u_res;
      float aspect = u_res.x / u_res.y;
      vec2 q = vec2(uv.x * aspect, uv.y);
      float t = u_time;

      // ---- energize field: cursor lens + click ripples (+ motes) ----
      vec2 mq = vec2(u_mouse.x * aspect, u_mouse.y);
      vec2 dmq = q - mq;
      float d2m = dot(dmq, dmq);
      float lens = exp(-d2m * ${f(o.lensRadius)});
      float E = lens * 1.2;

      vec2 disp = vec2(0.0);
      float ringE = 0.0;
      for (int i = 0; i < ${MAX_CLICKS}; i++){
        vec3 c = u_clicks[i];
        if (c.z < 0.0) continue;                     // empty slot: skip (uniform branch)
        float age = t - c.z;
        float valid = step(0.0, c.z) * step(0.0, age)
                    * (1.0 - smoothstep(${f(o.rippleLife - 0.6)}, ${f(o.rippleLife)}, age));
        vec2 cq = vec2(c.x * aspect, c.y);
        vec2 dv = q - cq;
        float rd = length(dv);
        float R = age * ${f(o.rippleSpeed)};
        float band = exp(-pow((rd - R) * 12.0, 2.0)) * exp(-age * 1.6) * valid;
        disp += (dv / max(rd, 1e-3)) * sin((rd - R) * 55.0) * band * ${f(o.rippleAmp)};
        ringE += band;
        E += band * 1.0 + exp(-dot(dv, dv) * 300.0) * exp(-age * 4.5) * 1.6 * valid;
      }
      ${MOTE_ENERGIZE}
      vec2 pull = -dmq * lens * 0.10;

      // ---- nebula lobes ----
      float driftT = sin(t * 0.10) * 0.03;
      float neb = 0.70 + 0.6 * fbm(q * 1.4 + vec2(t * 0.012, -t * 0.007));
      vec2 lc1 = vec2(0.22 * aspect, 0.72 + driftT);
      vec2 lc2 = vec2(0.86 * aspect, 0.42 - driftT);
      vec2 lc3 = vec2(0.55 * aspect, -0.05);
      vec3 em = (u_c1 * exp(-dot(q-lc1,q-lc1) / 0.60) * 0.115
               + u_c2 * exp(-dot(q-lc2,q-lc2) / 0.75) * 0.135
               + u_c1 * exp(-dot(q-lc3,q-lc3) / 0.50) * 0.07) * neb;

      // ---- caustic light: domain-warped (liquid), chromatic (holographic) ----
      vec2 pc = q * 2.6 + disp + pull;
      // fluid swirl: warp the sampling domain with a second, slower field
      vec2 wp = vec2(fbm(pc * 0.85 + vec2(t * 0.020, -t * 0.016)),
                     fbm(pc * 0.85 + vec2(4.7, 9.1) + vec2(-t * 0.014, t * 0.019)));
      pc += (wp - 0.5) * 0.55;
      float n2 = fbm(pc * 1.31 + vec2(-t * 0.041, t * 0.057) + 3.7);
      // thin-film fringe: R/B sample the field at tiny opposed offsets
      vec2 chOff = vec2(0.013, -0.009);
      float n1g = fbm(pc + vec2(t * 0.050, t * 0.033));
      float n1r = fbm(pc + chOff + vec2(t * 0.050, t * 0.033));
      float n1b = fbm(pc - chOff + vec2(t * 0.050, t * 0.033));
      float focus = 3.4 - lens * 1.1 - clamp(ringE, 0.0, 1.0) * 0.8;
      vec3 ca3 = vec3(pow(clamp(n1r * n2 * 2.9, 0.0, 1.0), focus),
                      pow(clamp(n1g * n2 * 2.9, 0.0, 1.0), focus),
                      pow(clamp(n1b * n2 * 2.9, 0.0, 1.0), focus));
      // Soft knee on the filament peaks: dims a full-brightness caustic by
      // about a third while leaving the dim and mid filaments nearly alone,
      // so the field keeps its detail without the hot spots.
      ca3 = ca3 / (1.0 + ca3 * 0.85);
      float ca = ca3.g;

      vec2 p2 = q * 1.15 + disp * 0.6 + (wp - 0.5) * 0.35 + vec2(-t * 0.014, t * 0.010);
      float n3 = fbm(p2);
      float n4 = fbm(p2 * 1.27 + 7.9);
      float ca2 = pow(clamp(n3 * n4 * 2.6, 0.0, 1.0), 3.2);
      ca2 = ca2 / (1.0 + ca2 * 0.85);

      // holographic sheen: hue slides along the filaments over time
      float cm = clamp(0.5 + (n1g - 0.5) * 1.5
                       + 0.18 * sin(t * 0.12 + q.x * 2.3 + wp.x * 3.0), 0.0, 1.0);
      vec3 lcol = mix(u_c1, u_c2, cm);
      em += lcol * ca3 * (0.24 + E * 0.45);   // per-channel -> chromatic fringing
      em += lcol * ca2 * 0.11;

      // ---- parallel light shafts (one implied source; cannot converge) ----
      float ba = 0.62 + sin(t * 0.021) * 0.035;
      vec2 bn = vec2(-sin(ba), cos(ba));
      float b1 = exp(-pow(dot(q - vec2(0.10 * aspect, 1.02), bn), 2.0) / 0.012);
      float b2 = exp(-pow(dot(q - vec2(0.38 * aspect, 1.06), bn), 2.0) / 0.030);
      float b3 = exp(-pow(dot(q - vec2(0.66 * aspect, 1.10), bn), 2.0) / 0.018);
      float b4 = exp(-pow(dot(q - vec2(0.92 * aspect, 1.14), bn), 2.0) / 0.040);
      em += u_c1 * b1 * 0.040 * (0.85 + 0.15 * sin(t * 0.31));
      em += u_c2 * b2 * 0.036 * (0.85 + 0.15 * sin(t * 0.26 + 1.4));
      em += u_c1 * b3 * 0.034 * (0.85 + 0.15 * sin(t * 0.29 + 3.1));
      em += u_c2 * b4 * 0.038 * (0.85 + 0.15 * sin(t * 0.23 + 4.5));
      em += lcol * ca * (b1 + b2 + b3 + b4) * 0.16;

      ${MOTE_DRAW}
      ${DOT_GRID}

      // ---- vignette ----
      float vig = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.35);
      em *= mix(0.50, 1.0, vig);

      // ---- theme compositing (premultiplied alpha) ----
      float luma = dot(em, vec3(0.299, 0.587, 0.114));
      float a; vec3 rgb;
      if (u_light > 0.5){
        vec3 pig = em / max(luma * 2.4, 1e-3);
        // Less of the squared (deepened) pigment and a lower ceiling on
        // coverage: light mode reads as washes of tint, not dark smudges.
        pig = mix(pig, pig * pig, 0.25);
        a = clamp(luma * 2.4, 0.0, 1.0) * 0.62;
        rgb = pig * a;
        float edge = 1.0 - vig;
        rgb += vec3(0.030, 0.034, 0.048) * edge;
        a = min(a + edge * 0.20, 1.0);
      } else {
        // Dark mode runs well under unity gain — the field is a backdrop for
        // the copy and the cluster, not the subject.
        rgb = em * 0.8;
        a = clamp(luma * 1.6, 0.0, 1.0) * 0.8;
      }
      float gr = hash(frag + fract(t * 0.617) * vec2(173.1, 91.7)) - 0.5;
      rgb = max(rgb + gr * (0.020 + luma * 0.060), 0.0);
      a = min(a + abs(gr) * 0.012, 1.0);
      gl_FragColor = vec4(rgb, a);
    }
  `;

  // ---------------- GL setup ----------------
  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const aloc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aloc);
  gl.vertexAttribPointer(aloc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const U = n => gl.getUniformLocation(prog, n);
  const u_res = U('u_res'), u_time = U('u_time'), u_mouse = U('u_mouse'),
        u_c1 = U('u_c1'), u_c2 = U('u_c2'), u_light = U('u_light'),
        u_clicks = U('u_clicks[0]'),
        u_mote = N_MOTE > 0 ? U('u_mote[0]') : null,
        u_moteB = N_MOTE > 0 ? U('u_moteB[0]') : null,
        u_trail = N_MOTE > 0 ? U('u_trail[0]') : null;

  const clicks = new Float32Array(MAX_CLICKS * 3).fill(-1);

  // ---------------- motes ----------------
  const motePos  = new Float32Array(Math.max(N_MOTE, 1) * 2);
  const moteB    = new Float32Array(Math.max(N_MOTE, 1));
  const trailPos = new Float32Array(Math.max(N_MOTE, 1) * TRAIL * 2).fill(-10);
  const motes = [];

  function spawnMote(w, aspect){
    w.x = (0.25 + Math.random() * 0.6) * aspect;
    w.y = 0.15 + Math.random() * 0.7;
    w.h = Math.random() * Math.PI * 2;
    w.p1 = Math.random() * 10; w.p2 = Math.random() * 10;
    w.aphase = Math.random() * Math.PI * 2;
    w.age = 0;
    w.life = 8 + Math.random() * 6;
    for (let j = 0; j < TRAIL; j++){
      trailPos[(w.idx * TRAIL + j) * 2]     = -10;
      trailPos[(w.idx * TRAIL + j) * 2 + 1] = -10;
    }
  }
  for (let i = 0; i < N_MOTE; i++){
    const w = { idx: i };
    spawnMote(w, 1.8);
    w.age = Math.random() * 5;
    motes.push(w);
  }
  function stepMote(w, dt, t, aspect){
    w.age += dt;
    if (w.age > w.life) spawnMote(w, aspect);
    const fadeIn  = Math.min(w.age / 0.7, 1);
    const fadeOut = Math.min((w.life - w.age) / 0.7, 1);
    moteB[w.idx] = Math.max(0, Math.min(fadeIn, fadeOut));
    w.h += (Math.sin(t * 0.31 + w.p1) + Math.sin(t * 0.53 + w.p2)) * 0.55 * dt;
    const ax = aspect * (0.55 + 0.30 * Math.sin(t * 0.061 + w.aphase));
    const ay = 0.5 + 0.28 * Math.sin(t * 0.047 + w.aphase * 1.7);
    w.x += (Math.cos(w.h) * o.moteSpeed + (ax - w.x) * 0.12) * dt;
    w.y += (Math.sin(w.h) * o.moteSpeed + (ay - w.y) * 0.12) * dt;
    motePos[w.idx * 2]     = w.x;
    motePos[w.idx * 2 + 1] = w.y;
  }
  let lastTrail = 0;
  function sampleTrails(tNow){
    if (tNow - lastTrail < 0.05) return;
    lastTrail = tNow;
    for (let i = 0; i < N_MOTE; i++){
      const base = i * TRAIL * 2;
      trailPos.copyWithin(base, base + 2, base + TRAIL * 2);
      trailPos[base + (TRAIL - 1) * 2]     = motePos[i * 2];
      trailPos[base + (TRAIL - 1) * 2 + 1] = motePos[i * 2 + 1];
    }
  }

  // ---------------- theme ----------------
  function parseColor(str){
    str = str.trim();
    let m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
    if (m) return [m[1]/255, m[2]/255, m[3]/255];
    m = str.match(/^#([0-9a-f]{6})$/i);
    if (m){
      const n = parseInt(m[1], 16);
      return [(n>>16 & 255)/255, (n>>8 & 255)/255, (n & 255)/255];
    }
    m = str.match(/^#([0-9a-f]{3})$/i);
    if (m){
      const h = m[1];
      return [parseInt(h[0]+h[0],16)/255, parseInt(h[1]+h[1],16)/255, parseInt(h[2]+h[2],16)/255];
    }
    return [0.3, 0.5, 0.97];
  }
  function syncTheme(){
    const cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(u_c1, parseColor(cs.getPropertyValue('--accent-primary')));
    gl.uniform3fv(u_c2, parseColor(cs.getPropertyValue('--accent-secondary')));
    const attr = document.documentElement.dataset.theme;
    const light = attr ? attr === 'light'
                       : !matchMedia('(prefers-color-scheme: dark)').matches;
    gl.uniform1f(u_light, light ? 1 : 0);
  }
  const themeObs = new MutationObserver(() => { syncTheme(); if (staticMode) drawOnce(); });
  themeObs.observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
  const schemeMQ = matchMedia('(prefers-color-scheme: dark)');
  schemeMQ.addEventListener('change', syncTheme);

  // ---------------- sizing / input / loop ----------------
  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, o.dprCap);
    const w = Math.max(1, Math.round(canvas.clientWidth  * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h){
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u_res, w, h);
    }
  }
  const onResize = () => { resize(); if (staticMode) drawOnce(); };
  addEventListener('resize', onResize);
  // The canvas's own box, not the window's. The hero changes size after init
  // — custom elements upgrade, the code window hydrates, fonts land — and a
  // window listener hears none of it, so the backing store kept its first
  // (short) measurement and the whole field rendered stretched. Observing the
  // canvas re-measures on the real trigger; resize() already no-ops when
  // nothing actually moved.
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);

  const mouse = { x: -10, y: -10, tx: -10, ty: -10 };
  function toUV(e){
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, r];
  }
  const onMove = e => {
    const [x, y] = toUV(e);
    mouse.tx = x; mouse.ty = y;
    if (mouse.x < -5){ mouse.x = x; mouse.y = y; }
  };
  addEventListener('pointermove', onMove, { passive: true });

  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  const onDown = e => {
    const [x, y, r] = toUV(e);
    if (e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top  || e.clientY > r.bottom) return; // only inside the hero
    const tNow = now();
    let slot = -1, oldest = 0, oldestT = Infinity;
    for (let i = 0; i < MAX_CLICKS; i++){
      const ts = clicks[i * 3 + 2];
      if (ts < 0 || tNow - ts > o.rippleLife){ slot = i; break; }
      if (ts < oldestT){ oldestT = ts; oldest = i; }
    }
    if (slot < 0) slot = oldest;
    clicks[slot * 3]     = x;
    clicks[slot * 3 + 1] = y;
    clicks[slot * 3 + 2] = tNow;
    if (staticMode) staticBurst();
  };
  addEventListener('pointerdown', onDown);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let staticMode = reduced.matches;
  const onReduced = e => { staticMode = e.matches; kick(); };
  reduced.addEventListener('change', onReduced);

  let visible = true, raf = 0, disposed = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);

  let lastT = 0;
  function setFrameUniforms(t){
    gl.uniform2f(u_mouse, mouse.x, mouse.y);
    gl.uniform1f(u_time, t);
    gl.uniform3fv(u_clicks, clicks);
    if (N_MOTE > 0){
      gl.uniform2fv(u_mote, motePos);
      gl.uniform1fv(u_moteB, moteB);
      gl.uniform2fv(u_trail, trailPos);
    }
  }
  function draw(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(){
    raf = 0;
    if (disposed || !visible || document.hidden || staticMode) return;
    const t = now();
    const dt = Math.min(t - lastT, 0.05);
    lastT = t;
    mouse.x += (mouse.tx - mouse.x) * 0.10;
    mouse.y += (mouse.ty - mouse.y) * 0.10;
    const aspect = canvas.width / canvas.height;
    for (const w of motes) stepMote(w, dt, t, aspect);
    sampleTrails(t);
    setFrameUniforms(t);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function drawOnce(){
    if (disposed) return;
    const aspect = canvas.width / canvas.height;
    for (const w of motes) stepMote(w, 0, now(), aspect);
    setFrameUniforms(now());
    draw();
  }
  let burstUntil = 0, burstRaf = 0;
  function staticBurst(){
    burstUntil = performance.now() + (o.rippleLife * 1000 + 200);
    if (!burstRaf) burstRaf = requestAnimationFrame(function loop(){
      burstRaf = 0;
      drawOnce();
      if (!disposed && performance.now() < burstUntil)
        burstRaf = requestAnimationFrame(loop);
    });
  }
  function kick(){
    if (disposed) return;
    if (staticMode){ if (raf) cancelAnimationFrame(raf), raf = 0; drawOnce(); return; }
    if (!raf && visible && !document.hidden){ lastT = now(); raf = requestAnimationFrame(frame); }
  }

  resize();
  syncTheme();
  kick();

  return function dispose(){
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    if (burstRaf) cancelAnimationFrame(burstRaf);
    removeEventListener('resize', onResize);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerdown', onDown);
    reduced.removeEventListener('change', onReduced);
    schemeMQ.removeEventListener('change', syncTheme);
    document.removeEventListener('visibilitychange', onVis);
    themeObs.disconnect();
    io.disconnect();
    ro.disconnect();
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  };
}
