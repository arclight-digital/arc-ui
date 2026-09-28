/**
 * arc-lightplay.js — ARC UI hero background
 *
 * Plasma and caustics as one material. Slow ridged-noise filaments are the
 * structure; the gas between them carries a fine caustic shimmer; both read
 * one domain warp, so they drift and turn over together. The red and blue
 * channels read everything a hair apart (chromatic aberration), which
 * fringes every filament like a hologram. Behind the copy the field goes
 * out of focus rather than dark: filaments open into broad dim glows and
 * the shimmer fades, so the light stays alive around the text with nothing
 * sharp to fight the letters. Film grain, one screen pixel per grain,
 * re-seeded 24 times a second. The light comes up once on load; nothing
 * follows the pointer.
 *
 * Drop-in for arcui.dev:
 *   - Colors are read LIVE from var(--accent-primary) / var(--accent-secondary)
 *     on :root, and re-read whenever html[data-theme] (or class/style) mutates —
 *     so it follows your existing theme system, including the light-theme teal
 *     deepening, with zero configuration. No other colour appears.
 *   - Theme detection: html[data-theme="light"|"dark"], falling back to
 *     prefers-color-scheme.
 *   - Performance: the light renders at 0.75x into a texture (about twenty
 *     2D value-noise lookups per pixel, no raymarching); a second trivial
 *     pass draws it at native device pixels and adds the grain there, so the
 *     grain is crisp and the expensive pass costs about half. Paused when
 *     offscreen or tab-hidden; a static frame under prefers-reduced-motion.
 *   - `quiet`: up to four elements (the copy, the top bar, a panel); the
 *     field defocuses behind them, re-measured on resize and scroll.
 *
 * Usage (Astro):
 *   <canvas class="lightplay" data-lightplay></canvas>
 *   <script>
 *     import { initLightplay } from '../scripts/arc-lightplay.js';
 *     const dispose = initLightplay(document.querySelector('[data-lightplay]'));
 *     // call dispose() on teardown if the hero ever unmounts (SPA transitions)
 *   </script>
 */

const DEFAULTS = {
  quiet: [],           // up to four elements the field defocuses behind
  igniteDur: 2.6,      // seconds for the light to come up on load
  dprCap: 2,           // devicePixelRatio ceiling for the grain pass
  lightScale: 0.75,    // light pass resolution relative to the grain pass
};

export function initLightplay(canvas, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return () => {};

  const VERT = `
    attribute vec2 a;
    void main(){ gl_Position = vec4(a, 0.0, 1.0); }
  `;

  // The field itself. Reads q (aspect-corrected position), uv, aspect, t,
  // igE (0 -> 1 load-in) and blur (0 -> 1 behind the copy); writes em.
  const BODY = `
      vec2 P = q * 1.25 + vec2(-t * 0.018, t * 0.011 - u_scroll * 0.4);
      vec2 w = (vec2(n2(P * 0.7 + t * 0.028), n2(P * 0.7 + vec2(5.2, 1.3) - t * 0.023)) - 0.5) * 2.2;
      // Chromatic aberration: R and B read everything a hair apart,
      // wider toward the edges
      vec2 ca = normalize(vec2(1.0, 0.6)) * (0.008 + length(uv - 0.5) * 0.012) * (1.0 + blur * 1.5);

      // ---- filaments: out of focus behind the copy, a sharp vein opens
      // into a broad, dim glow ----
      float vx = mix(16.0, 2.2, blur), va = mix(1.1, 0.16, blur);
      vec3 vein;
      for (int k = 0; k < 3; k++){
        vec2 pp = P * 1.6 + w + ca * (float(k) - 1.0) * 1.6;
        float n = n2(pp) * 0.6 + n2(pp * 2.2 + 7.1) * 0.4;
        float r = 1.0 - abs(n * 2.0 - 1.0);
        float v = pow(r, vx) * va + pow(r, 5.0) * 0.18 * (1.0 - blur * 0.5);
        if (k == 0) vein.r = v; else if (k == 1) vein.g = v; else vein.b = v;
      }

      // ---- gas, and the caustic shimmer that lives in it ----
      float gas = smoothstep(0.22, 0.9, n2(P * 0.9 + w * 0.5 + 3.0));
      vec2 pc = q * 2.4 + w * 0.45;
      float m2 = fbm(pc * 1.31 + vec2(-t * 0.041, t * 0.057) + 3.7);
      vec2 tc = vec2(t * 0.050, t * 0.033);
      vec3 cs = vec3(fbm(pc + ca * 1.4 + tc), fbm(pc + tc), fbm(pc - ca * 1.4 + tc));
      vec3 caus = pow(clamp(cs * m2 * 2.9, 0.0, 1.0), vec3(3.0));
      caus = caus / (1.0 + caus * 0.6);

      float region = mix(0.55, 1.0, smoothstep(0.15, 1.0, uv.x * 0.9 + uv.y * 0.3));
      vec3 cg = mix(u_c1, u_c2, gas);
      vec3 cv = mix(u_c2, u_c1, gas);
      vec3 pale = vec3(dot(cv, vec3(0.333)));
      em = cg * gas * 0.16;
      em += cg * caus * (0.4 + gas * 0.8) * (1.0 - blur * 0.9);
      em += (cv * 0.8 + pale * 0.45) * vein * (0.3 + gas * 1.1);
      em *= region * igE * 1.5;
      // Soft shoulder: highlights roll off instead of clipping to white
      em = em / (1.0 + em * 0.55);
      em += mix(u_c1, u_c2, uv.x) * (0.03 + blur * 0.02) * igE;
  `;

  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec3  u_c1;
    uniform vec3  u_c2;
    uniform float u_light;
    uniform float u_ignite;
    uniform float u_scroll;
    uniform vec4  u_quiet[4]; // uv boxes the field defocuses behind (x0, y0, x1, y1)

    float h2(vec2 p){
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float n2(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(i),             h2(i + vec2(1,0)), u.x),
                 mix(h2(i + vec2(0,1)), h2(i + vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 3; i++){ v += a * n2(p); p = p * 2.07 + vec2(13.7, 5.1); a *= 0.5; }
      return v;
    }

    void main(){
      vec2 frag = gl_FragCoord.xy;
      vec2 uv = frag / u_res;
      float aspect = u_res.x / u_res.y;
      vec2 q = vec2(uv.x * aspect, uv.y);
      float t = u_time;
      float igE = u_ignite * u_ignite * (3.0 - 2.0 * u_ignite);
      // ---- depth of field: behind the copy the field is out of focus.
      // The body reads this to soften its sharp detail rather than darken,
      // so the light stays alive around the text with nothing hard to
      // fight the letters.
      // The zone is a superellipse around each box, not the box: a flat
      // rectangle with a feathered rim showed its straight edges wherever
      // the copy was wide. Distance is normalized to the box plus a fixed
      // pad, so a big box gets a long falloff and a thin one (the top bar)
      // still fades out over a real distance instead of a hard line.
      float blur = 0.0;
      for (int i = 0; i < 4; i++){
        vec4 b = u_quiet[i];
        vec2 qc = (b.xy + b.zw) * 0.5;
        vec2 hs = abs(b.zw - b.xy) * 0.5 * vec2(aspect, 1.0);
        vec2 n = abs(uv - qc) * vec2(aspect, 1.0) / (hs + 0.12);
        float d = pow(pow(n.x, 3.0) + pow(n.y, 3.0), 1.0 / 3.0);
        blur = max(blur, (1.0 - smoothstep(0.6, 1.3, d)) * step(0.0001, hs.x));
      }

      vec3 em = vec3(0.0);
      ${BODY}

      float vig = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.28);
      em *= mix(0.7, 1.0, vig) * (1.0 - u_scroll * 0.4);
      // Edge fades. The bottom one is long and gentle, but must still reach
      // zero at the edge or the hero shows a seam against the page. The top
      // one is shorter and only dims, since nothing sits above the hero.
      float feather = pow(smoothstep(0.0, 0.36, uv.y), 0.7)
                    * mix(0.4, 1.0, pow(smoothstep(0.0, 0.22, 1.0 - uv.y), 0.7));

      float luma = dot(em, vec3(0.299, 0.587, 0.114));
      float a; vec3 rgb;
      if (u_light > 0.5){
        vec3 pig = em / max(luma * 2.4, 1e-3);
        pig = mix(pig, pig * pig, 0.34);
        a = clamp(luma * 2.4, 0.0, 1.0) * 0.72;
        rgb = pig * a;
      } else {
        rgb = em;
        a = clamp(luma * 1.9, 0.0, 1.0) * 0.94;
      }
      gl_FragColor = vec4(rgb, a) * feather;
    }
  `;

  // Pass 2, at native device pixels: put the reduced-resolution light on the
  // screen and add the grain one real pixel at a time. The grain also
  // dithers away the 8-bit banding the smooth gradients would otherwise show.
  const GRAIN = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform sampler2D u_tex;
    uniform vec2  u_res;
    uniform vec2  u_seed;     // new every 1/24 s, always small
    uniform float u_light;

    // Hash without sine (Dave Hoskins): stable over the whole screen, no
    // lattice or banding at large coordinates
    float hash(vec2 p){
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main(){
      vec4 c = texture2D(u_tex, gl_FragCoord.xy / u_res);
      float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float gr = hash(gl_FragCoord.xy + u_seed) - 0.5;
      float amt = (0.010 + luma * 0.07) * (u_light > 0.5 ? 0.5 : 1.0);
      gl_FragColor = vec4(max(c.rgb + gr * amt * c.a, 0.0), c.a);
    }
  `;

  // ---------------- GL setup ----------------
  function compile(type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT);
  function program(src){
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    const U = n => gl.getUniformLocation(p, n);
    return { p, U };
  }
  const L = program(FRAG), G = program(GRAIN);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0, 0, 0, 0);

  const u_res = L.U('u_res'), u_time = L.U('u_time'),
        u_c1 = L.U('u_c1'), u_c2 = L.U('u_c2'), u_light = L.U('u_light'),
        u_ignite = L.U('u_ignite'), u_scroll = L.U('u_scroll'), u_quiet = L.U('u_quiet[0]');
  const g_tex = G.U('u_tex'), g_res = G.U('u_res'), g_seed = G.U('u_seed'), g_light = G.U('u_light');

  // The reduced-resolution target the light pass draws into
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  let lw = 1, lh = 1;

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
  // Theme changes are eased, not cut. The page's own CSS transitions its
  // colors, and a shader that snapped to the new accents or scheme on the
  // next frame read as a flicker against it: most of all while the hue
  // dial streams values, and on a light/dark switch, where the whole field
  // inverted in one frame. syncTheme sets targets; the frame loop chases
  // them. The first read, and reduced motion, snap.
  const cur = { c1: [0, 0, 0], c2: [0, 0, 0], light: 0 };
  const tgt = { c1: [0, 0, 0], c2: [0, 0, 0], light: 0 };
  let themeSeeded = false;
  function syncTheme(){
    const cs = getComputedStyle(document.documentElement);
    const attr = document.documentElement.dataset.theme;
    const light = attr === 'light' || attr === 'dark' ? attr === 'light'
                : !matchMedia('(prefers-color-scheme: dark)').matches;
    tgt.c1 = parseColor(cs.getPropertyValue('--accent-primary'));
    tgt.c2 = parseColor(cs.getPropertyValue('--accent-secondary'));
    tgt.light = light ? 1 : 0;
    if (!themeSeeded || staticMode){
      themeSeeded = true;
      cur.c1 = tgt.c1.slice(); cur.c2 = tgt.c2.slice(); cur.light = tgt.light;
    }
    uploadTheme();
    kick();
  }
  function uploadTheme(){
    gl.useProgram(L.p);
    gl.uniform3fv(u_c1, cur.c1);
    gl.uniform3fv(u_c2, cur.c2);
    gl.uniform1f(u_light, cur.light);
    gl.useProgram(G.p);
    gl.uniform1f(g_light, cur.light);
  }
  // One step toward the targets; dt in seconds, ~200ms to settle
  function stepTheme(dt){
    const k = 1 - Math.exp(-dt / 0.07);
    let moving = false;
    const mix = (a, b) => {
      const v = a + (b - a) * k;
      if (Math.abs(b - v) > 1e-3) { moving = true; return v; }
      return b;
    };
    cur.c1 = cur.c1.map((v, i) => mix(v, tgt.c1[i]));
    cur.c2 = cur.c2.map((v, i) => mix(v, tgt.c2[i]));
    cur.light = mix(cur.light, tgt.light);
    uploadTheme();
    return moving;
  }
  const themeObs = new MutationObserver(() => { syncTheme(); if (staticMode) drawOnce(); });
  themeObs.observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
  const schemeMQ = matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => { syncTheme(); if (staticMode) drawOnce(); };
  schemeMQ.addEventListener('change', onScheme);

  // ---------------- sizing / input / loop ----------------
  // Returns whether the drawing buffer was reallocated. Reallocating clears
  // it, so the caller redraws at once: waiting for the next animation frame
  // put one empty frame on screen, a flash on every layout change.
  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, o.dprCap);
    const w = Math.max(1, Math.round(canvas.clientWidth  * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h){
      canvas.width = w; canvas.height = h;
      lw = Math.max(1, Math.round(w * o.lightScale));
      lh = Math.max(1, Math.round(h * o.lightScale));
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lw, lh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(L.p);
      gl.uniform2f(u_res, lw, lh);
      gl.useProgram(G.p);
      gl.uniform2f(g_res, w, h);
      gl.uniform1i(g_tex, 0);
      return true;
    }
    return false;
  }
  // The focus boxes, in the canvas's uv space (y up). A missing or hidden
  // element sends a zero-size box, which the shader reads as "nothing here".
  const quietEls = [].concat(o.quiet ?? []).filter(Boolean).slice(0, 4);
  const quietBoxes = new Float32Array(16);
  function measureQuiet(){
    const cr = canvas.getBoundingClientRect();
    quietBoxes.fill(0);
    if (cr.width >= 1) quietEls.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1) return;
      quietBoxes.set([(r.left - cr.left) / cr.width, 1 - (r.bottom - cr.top) / cr.height,
                      (r.right - cr.left) / cr.width, 1 - (r.top - cr.top) / cr.height], i * 4);
    });
    gl.useProgram(L.p);
    gl.uniform4fv(u_quiet, quietBoxes);
  }
  const onResize = () => {
    const realloc = resize();
    measureQuiet();
    if (staticMode || realloc) drawOnce();
  };
  addEventListener('resize', onResize);
  // The canvas's own box, not the window's: the hero changes size after init
  // — custom elements upgrade, the code window hydrates, fonts land — and a
  // window listener hears none of it.
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);
  quietEls.forEach((el) => ro.observe(el));

  let scroll = 0;
  const onScroll = () => {
    const r = canvas.getBoundingClientRect();
    scroll = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
    // A fixed top bar moves against the hero as the page scrolls
    if (quietEls.length) measureQuiet();
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let staticMode = reduced.matches;
  const onReduced = e => { staticMode = e.matches; kick(); };
  reduced.addEventListener('change', onReduced);

  let visible = true, raf = 0, disposed = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);

  // The load-in runs on the animation clock, so a hero that loads offscreen
  // or in a background tab still gets it the first time it is seen.
  let ignite = 0;
  let lastT = 0;
  function draw(t){
    // Pass 1: the light, at reduced resolution, into the texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, lw, lh);
    gl.disable(gl.BLEND);
    gl.useProgram(L.p);
    gl.uniform1f(u_time, t);
    gl.uniform1f(u_ignite, staticMode ? 1 : ignite);
    gl.uniform1f(u_scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Pass 2: onto the screen at native pixels, with the grain
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(G.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const k = Math.floor(t * 24);
    gl.uniform2f(g_seed, (k * 37) % 997, (k * 61) % 991);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(){
    raf = 0;
    if (disposed || !visible || document.hidden || staticMode) return;
    const t = now();
    // A looser step cap than a physics loop would use: at a low frame rate a
    // 50ms cap would stretch the load-in into a crawl
    const dt = Math.min(t - lastT, 0.25);
    ignite = Math.min(ignite + dt / o.igniteDur, 1);
    stepTheme(dt);
    lastT = t;
    draw(t);
    raf = requestAnimationFrame(frame);
  }
  function drawOnce(){
    if (disposed) return;
    draw(now());
  }
  function kick(){
    if (disposed) return;
    if (staticMode){ if (raf) cancelAnimationFrame(raf), raf = 0; drawOnce(); return; }
    if (!raf && visible && !document.hidden){ lastT = now(); raf = requestAnimationFrame(frame); }
  }

  resize();
  measureQuiet();
  syncTheme();
  kick();

  return function dispose(){
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    removeEventListener('resize', onResize);
    removeEventListener('scroll', onScroll);
    reduced.removeEventListener('change', onReduced);
    schemeMQ.removeEventListener('change', onScheme);
    document.removeEventListener('visibilitychange', onVis);
    themeObs.disconnect();
    io.disconnect();
    ro.disconnect();
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  };
}
