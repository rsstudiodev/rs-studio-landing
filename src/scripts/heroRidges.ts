/*
 * The hero background: a range of ridgelines, drawn rather than photographed.
 *
 * Five layers, back to front, taken down the same green ramp the rest of the
 * page uses. Each ridge is ridged fractal noise — four octaves of folded sine —
 * so the profile peaks instead of rolling. The layers drift at different rates
 * and breathe on a slow cycle, which is what separates them in depth; scroll
 * adds parallax on top of that, and calms the whole range down as the reader
 * leaves the hero behind.
 *
 * The clock counts real time, not frames, so the range moves at one speed on a
 * 60Hz panel and a 120Hz one.
 *
 * The range sits low in the frame on purpose. The title is set over open paper,
 * and the device cluster stands on the front ridge.
 */

type Layer = {
  token: string;
  alpha: number;
  /* Baseline as a fraction of canvas height. */
  base: number;
  amplitude: number;
  frequency: number;
  drift: number;
  parallax: number;
  phase: number;
};

const LAYERS: Layer[] = [
  { token: "--ridge-1", alpha: 0.14, base: 0.52, amplitude: 0.2, frequency: 0.0032, drift: 0.00022, parallax: 0.04, phase: 0 },
  { token: "--ridge-2", alpha: 0.18, base: 0.63, amplitude: 0.17, frequency: 0.0045, drift: 0.00035, parallax: 0.08, phase: 1.9 },
  { token: "--ridge-3", alpha: 0.26, base: 0.74, amplitude: 0.14, frequency: 0.0061, drift: 0.0005, parallax: 0.13, phase: 3.4 },
  { token: "--ridge-4", alpha: 0.36, base: 0.86, amplitude: 0.11, frequency: 0.0084, drift: 0.0007, parallax: 0.19, phase: 5.1 },
  { token: "--ridge-5", alpha: 0.48, base: 0.99, amplitude: 0.08, frequency: 0.011, drift: 0.00095, parallax: 0.26, phase: 6.7 },
];

const OCTAVES = 5;
const STEP = 4;

/* Milliseconds to clock units: one unit is one frame of a 60Hz panel, which is
 * what the drift rates above are written in. */
const TICK = 0.06;

/* The swell cycle, in clock units: peaks rise and settle over about 20s. */
const SWELL_RATE = 0.0052;
const SWELL_DEPTH = 0.22;

/* A second, slower wave on the baseline, so the range shifts as well as grows. */
const SETTLE_RATE = 0.0026;
const SETTLE_DEPTH = 0.018;

/* How far the range slows once the hero has scrolled away. */
const CALM = 0.85;

/* Ridged noise: folding the sine at zero turns hills into peaks. */
/* The layer colours live in global.css so light and dark share one definition.
 * Canvas cannot read var(), so resolve the tokens against <html> - and cache
 * them, because getComputedStyle inside the draw loop forces a style recalc on
 * every frame. The theme toggle flips a class on <html>, which drops the cache. */
let palette: string[] | null = null;

function colors(): string[] {
  palette ??= LAYERS.map((layer) =>
    getComputedStyle(document.documentElement).getPropertyValue(layer.token).trim(),
  );

  return palette;
}

new MutationObserver(() => {
  palette = null;
}).observe(document.documentElement, { attributeFilter: ["class"] });

function ridge(x: number, phase: number, frequency: number): number {
  let value = 0;
  let weight = 1;
  let scale = frequency;

  for (let octave = 0; octave < OCTAVES; octave += 1) {
    value += weight * (1 - Math.abs(Math.sin(x * scale + phase * (octave + 1))));
    weight *= 0.5;
    scale *= 2.1;
  }

  /* A slow envelope over the whole width, so peaks differ in height instead of
   * marching past at one size. */
  const envelope = 0.62 + 0.5 * Math.sin(x * frequency * 0.21 + phase * 0.4);

  return (value / 1.9375) * envelope;
}

export function initHeroRidges() {
  const canvas = document.querySelector<HTMLCanvasElement>("#hero-ridges");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let clock = 0;
  let last = 0;
  let scroll = 0;

  const paint = () => {
    if (width === 0 || height === 0) return;

    context.clearRect(0, 0, width, height);

    const fills = colors();

    for (const [index, layer] of LAYERS.entries()) {
      const phase = layer.phase + clock * layer.drift;
      /* Breathe: peaks grow and shrink on one cycle, the baseline shifts on a
       * slower one, and each layer runs off its own phase. */
      const swell = 1 + Math.sin(clock * SWELL_RATE + layer.phase) * SWELL_DEPTH;
      const settle = Math.sin(clock * SETTLE_RATE + layer.phase * 1.7) * height * SETTLE_DEPTH;
      const amplitude = height * layer.amplitude * swell;
      const baseline = height * layer.base + settle - scroll * layer.parallax;

      context.beginPath();
      context.moveTo(0, height);

      for (let x = 0; x <= width + STEP; x += STEP) {
        context.lineTo(x, baseline - ridge(x, phase, layer.frequency) * amplitude);
      }

      context.lineTo(width, height);
      context.closePath();

      context.globalAlpha = layer.alpha;
      context.fillStyle = fills[index]!;
      context.fill();
      context.globalAlpha = 1;
    }
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const box = canvas.getBoundingClientRect();

    width = box.width;
    height = box.height;

    if (width === 0 || height === 0) return;

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    paint();
  };

  const draw = (now: number) => {
    frame = requestAnimationFrame(draw);

    scroll = window.scrollY;

    /* Calm: the range all but stops once the hero is off the screen. Slowing the
     * clock itself holds the phase, so it picks up where it left off. */
    const past = height === 0 ? 0 : Math.min(scroll / height, 1);
    const calm = 1 - CALM * past;

    /* Cap the step so a backgrounded tab does not jump the range on return. */
    const elapsed = last === 0 ? 0 : Math.min(now - last, 100);
    last = now;
    clock += elapsed * TICK * calm;

    paint();
  };

  const start = () => {
    if (frame === 0) {
      last = 0;
      frame = requestAnimationFrame(draw);
    }
  };

  const stop = () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
  };

  resize();
  new ResizeObserver(resize).observe(canvas);

  /* Do not burn frames on a hero the reader has scrolled past. */
  new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) start();
    else stop();
  }).observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}
