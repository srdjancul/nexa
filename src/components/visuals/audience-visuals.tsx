"use client";

import { useLoop } from "@/components/visuals/bento-visuals";

/**
 * Animated centrepieces for the "Who it's for" cards — same family as the
 * bento visuals: canvas 2D, additive light, ramp colours only.
 */

const BLUE = "47, 123, 255";
const CYAN = "0, 229, 255";
const EMBER = "255, 122, 69";

/** A replay: rows of log bars lit by a scanline sweeping down. */
export function ReplayScan() {
  const ref = useLoop((ctx, w, h, t) => {
    const rows = [0.62, 0.78, 0.45, 0.7, 0.52];
    const top = h * 0.16;
    const bottom = h * 0.88;
    const rowH = (bottom - top) / rows.length;
    const scan = top + ((t * 0.22) % 1) * (bottom - top);

    ctx.globalCompositeOperation = "lighter";
    rows.forEach((frac, i) => {
      const y = top + i * rowH + rowH / 2;
      const passed = y < scan;
      ctx.fillStyle = passed ? `rgba(${BLUE}, 0.55)` : "rgba(255, 255, 255, 0.10)";
      ctx.beginPath();
      ctx.roundRect(w * 0.12, y - 3, w * frac * 0.76, 6, 3);
      ctx.fill();
      if (passed) {
        ctx.fillStyle = `rgba(${CYAN}, 0.5)`;
        ctx.beginPath();
        ctx.arc(w * 0.12 - 10, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Scanline.
    const g = ctx.createLinearGradient(0, scan - 14, 0, scan + 14);
    g.addColorStop(0, "rgba(255, 255, 255, 0)");
    g.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(w * 0.06, scan - 14, w * 0.88, 28);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, scan);
    ctx.lineTo(w * 0.94, scan);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}

/** A bar chart where one month has gone wrong, glowing ember. */
export function CostSpike() {
  const ref = useLoop((ctx, w, h, t) => {
    const N = 7;
    const base = [0.2, 0.24, 0.22, 0.28, 0.78, 0.3, 0.26];
    const bw = (w * 0.8) / N;
    const x0 = w * 0.1;
    const floor = h * 0.86;

    ctx.globalCompositeOperation = "lighter";
    // Baseline.
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 - 6, floor);
    ctx.lineTo(x0 + N * bw + 6, floor);
    ctx.stroke();

    for (let i = 0; i < N; i++) {
      const spike = i === 4;
      const pulse = spike ? 1 + Math.sin(t * 1.6) * 0.06 : 1 + Math.sin(t * 0.9 + i) * 0.02;
      const bh = h * 0.62 * base[i] * pulse;
      const x = x0 + i * bw + bw * 0.18;
      const grad = ctx.createLinearGradient(0, floor - bh, 0, floor);
      if (spike) {
        grad.addColorStop(0, `rgba(${EMBER}, 0.95)`);
        grad.addColorStop(1, `rgba(${EMBER}, 0.15)`);
      } else {
        grad.addColorStop(0, `rgba(${BLUE}, 0.5)`);
        grad.addColorStop(1, `rgba(${BLUE}, 0.08)`);
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, floor - bh, bw * 0.64, bh, 3);
      ctx.fill();
      if (spike) {
        const glow = ctx.createRadialGradient(x + bw * 0.32, floor - bh, 0, x + bw * 0.32, floor - bh, 30);
        glow.addColorStop(0, `rgba(${EMBER}, 0.5)`);
        glow.addColorStop(1, `rgba(${EMBER}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x + bw * 0.32, floor - bh, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}

/** A run where one step goes rogue — and a policy ring catches it. */
export function PolicyCatch() {
  const ref = useLoop((ctx, w, h, t) => {
    const y = h * 0.52;
    const N = 5;
    const xs = Array.from({ length: N }, (_, i) => w * (0.14 + (0.72 * i) / (N - 1)));
    const CAUGHT = 3;
    const cycle = (t % 3.4) / 3.4;

    ctx.globalCompositeOperation = "lighter";
    // Wire.
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xs[0], y);
    ctx.lineTo(xs[N - 1], y);
    ctx.stroke();

    // Travelling pulse for the first half of the cycle.
    if (cycle < 0.5) {
      const p = cycle / 0.5;
      const px = xs[0] + (xs[CAUGHT] - xs[0]) * p;
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(px, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nodes.
    xs.forEach((x, i) => {
      const hot = i === CAUGHT && cycle >= 0.5;
      ctx.fillStyle = hot ? `rgba(${EMBER}, 0.95)` : `rgba(${BLUE}, 0.6)`;
      ctx.beginPath();
      ctx.arc(x, y, i === CAUGHT ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // The catch: a ring snaps closed around the rogue step, then holds.
    if (cycle >= 0.5) {
      const q = Math.min(1, (cycle - 0.5) / 0.2);
      const r = 26 - 12 * q;
      const fade = cycle > 0.9 ? 1 - (cycle - 0.9) / 0.1 : 1;
      ctx.strokeStyle = `rgba(${EMBER}, ${0.8 * fade})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(xs[CAUGHT], y, r, 0, Math.PI * 2);
      ctx.stroke();
      const glow = ctx.createRadialGradient(xs[CAUGHT], y, 0, xs[CAUGHT], y, 24);
      glow.addColorStop(0, `rgba(${EMBER}, ${0.35 * fade})`);
      glow.addColorStop(1, `rgba(${EMBER}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(xs[CAUGHT], y, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}
