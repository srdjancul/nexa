"use client";

import { useEffect, useRef } from "react";

/**
 * Animated centrepieces for the bento cards — the hero of each card.
 * Canvas 2D, additive light, ramp colours only. Depth comes from floor
 * reflections, volume gradients and layered bloom, not from a 3D library.
 * Everything pauses offscreen and freezes under prefers-reduced-motion.
 */

const CYAN = "0, 229, 255";
const BLUE = "47, 123, 255";
const EMBER = "255, 122, 69";

export function useLoop(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let t = reduced ? 3.3 : 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = () => {
      if (!running) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t);
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) {
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

export const glowStroke = (
  ctx: CanvasRenderingContext2D,
  path: () => void,
  rgb: string,
  alpha: number,
  lw: number,
) => {
  ctx.lineCap = "round";
  const passes: Array<[number, number]> = [
    [lw * 7, alpha * 0.14],
    [lw * 2.6, alpha * 0.35],
    [lw, alpha],
  ];
  for (const [width, a] of passes) {
    ctx.strokeStyle = `rgba(${rgb}, ${a})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    path();
    ctx.stroke();
  }
};

/** Mirror `paint` beneath floorY and fade it out — instant depth. */
const reflect = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  floorY: number,
  paint: () => void,
) => {
  paint();
  ctx.save();
  ctx.translate(0, 2 * floorY);
  ctx.scale(1, -1);
  ctx.globalAlpha = 0.22;
  paint();
  ctx.restore();
  ctx.globalAlpha = 1;
  const fade = ctx.createLinearGradient(0, floorY, 0, h);
  fade.addColorStop(0, "rgba(0, 0, 0, 0.3)");
  fade.addColorStop(0.75, "rgba(0, 0, 0, 1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = fade;
  ctx.fillRect(0, floorY, w, h - floorY);
  ctx.globalCompositeOperation = "source-over";
};

/** A pulse of light travelling along a chain of chips, mirrored on a floor. */
export function TraceChain() {
  const ref = useLoop((ctx, w, h, t) => {
    const y = h * 0.42;
    const floorY = h * 0.66;
    const nodes = [0.1, 0.37, 0.63, 0.9].map(f => f * w);
    const p = (t * 0.22) % 1;
    const seg = Math.min(Math.floor(p * 3), 2);
    const local = p * 3 - seg;

    const bez = (i: number, s: number) => {
      const a = nodes[i];
      const b = nodes[i + 1];
      const c1x = a + (b - a) * 0.4, c2x = b - (b - a) * 0.4;
      const mt = 1 - s;
      return {
        x: mt ** 3 * a + 3 * mt * mt * s * c1x + 3 * mt * s * s * c2x + s ** 3 * b,
        y: mt ** 3 * y + 3 * mt * mt * s * (y - h * 0.16) + 3 * mt * s * s * (y + h * 0.16) + s ** 3 * y,
      };
    };

    reflect(ctx, w, h, floorY, () => {
      ctx.globalCompositeOperation = "lighter";
      // Wires.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        ctx.moveTo(a, y);
        ctx.bezierCurveTo(a + (b - a) * 0.4, y - h * 0.16, b - (b - a) * 0.4, y + h * 0.16, b, y);
      }
      ctx.stroke();

      // Pulse trail.
      for (let i = 0; i < 14; i++) {
        const s = Math.max(0, local - i * 0.045);
        const pt = bez(seg, s);
        const fadeT = 1 - i / 14;
        ctx.fillStyle = `rgba(${i === 0 ? "255, 255, 255" : BLUE}, ${0.85 * fadeT})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (i === 0 ? 4.5 : 3.2) * fadeT + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chips with volume: lit top edge, dark base, glow when active.
      ctx.globalCompositeOperation = "source-over";
      nodes.forEach((nx, i) => {
        const active = seg === i || (seg === i - 1 && local > 0.85);
        const r = 12;
        const body = ctx.createLinearGradient(nx, y - r, nx, y + r);
        body.addColorStop(0, "rgba(46, 54, 68, 1)");
        body.addColorStop(0.5, "rgba(20, 24, 32, 1)");
        body.addColorStop(1, "rgba(8, 10, 14, 1)");
        ctx.fillStyle = body;
        ctx.strokeStyle = `rgba(255, 255, 255, ${active ? 0.55 : 0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nx - r, y - r, r * 2, r * 2, 5);
        ctx.fill();
        ctx.stroke();
        // Top highlight — the "3D" edge.
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo(nx - r + 3, y - r + 1);
        ctx.lineTo(nx + r - 3, y - r + 1);
        ctx.stroke();
        ctx.globalCompositeOperation = "lighter";
        if (active) {
          const g = ctx.createRadialGradient(nx, y, 0, nx, y, 26);
          g.addColorStop(0, `rgba(${CYAN}, 0.5)`);
          g.addColorStop(1, `rgba(${CYAN}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(nx, y, 26, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      });
    });
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}

/** A rising cost curve on a receding grid, glowing tracker dot on top. */
export function CostCurve() {
  const ref = useLoop((ctx, w, h, t) => {
    const x0 = w * 0.06;
    const x1 = w * 0.94;
    const baseY = h * 0.86;
    const yAt = (f: number) => h * (0.78 - 0.55 * f * f);
    const N = 48;

    // Receding floor grid — cheap perspective.
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const gy = baseY - i * h * 0.16;
      ctx.beginPath();
      ctx.moveTo(x0, gy);
      ctx.lineTo(x1, gy);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const gx = x0 + ((x1 - x0) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(gx, baseY);
      ctx.lineTo(gx, baseY - h * 0.52);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "lighter";
    // Volume under the curve.
    const area = ctx.createLinearGradient(0, yAt(1), 0, baseY);
    area.addColorStop(0, `rgba(${BLUE}, 0.28)`);
    area.addColorStop(1, `rgba(${BLUE}, 0)`);
    ctx.fillStyle = area;
    ctx.beginPath();
    ctx.moveTo(x0, baseY);
    for (let i = 0; i <= N; i++) {
      const f = i / N;
      ctx.lineTo(x0 + (x1 - x0) * f, yAt(f));
    }
    ctx.lineTo(x1, baseY);
    ctx.closePath();
    ctx.fill();

    // The curve.
    glowStroke(
      ctx,
      () => {
        for (let i = 0; i <= N; i++) {
          const f = i / N;
          const x = x0 + (x1 - x0) * f;
          if (i === 0) ctx.moveTo(x, yAt(f));
          else ctx.lineTo(x, yAt(f));
        }
      },
      BLUE,
      0.9,
      1.8,
    );

    // Tracker dot with a reading line.
    const p = 0.5 + 0.42 * Math.sin(t * 0.5);
    const dx = x0 + (x1 - x0) * p;
    const dy = yAt(p);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(dx, dy - 8);
    ctx.lineTo(dx, h * 0.08);
    ctx.stroke();
    ctx.setLineDash([]);
    const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 20);
    g.addColorStop(0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.3, `rgba(${BLUE}, 0.55)`);
    g.addColorStop(1, `rgba(${BLUE}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(dx, dy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}

/** The infinity loop — warm and cool halves, mirrored on a dark floor. */
export function InfinityLoop() {
  const ref = useLoop((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h * 0.42;
    const floorY = h * 0.78;
    const A = Math.min(w * 0.38, h * 0.9);
    const B = Math.min(h * 0.4, w * 0.17);
    const pt = (s: number) => {
      const d = 1 + Math.cos(s) ** 2;
      return { x: cx + (A * Math.cos(s)) / d, y: cy + (B * Math.sin(s) * Math.cos(s)) / d };
    };

    reflect(ctx, w, h, floorY, () => {
      ctx.globalCompositeOperation = "lighter";
      // Faint full path.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const s = (i / 120) * Math.PI * 2;
        const q = pt(s);
        if (i === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      }
      ctx.stroke();

      // Two glowing heads, half a lap apart.
      for (const offset of [0, Math.PI]) {
        const head = t * 0.7 + offset;
        const SEGS = 30;
        for (let i = 0; i < SEGS; i++) {
          const s0 = head - i * 0.05;
          const s1 = head - (i + 1) * 0.05;
          const q0 = pt(s0);
          const q1 = pt(s1);
          const rgb = q0.x < cx ? EMBER : BLUE;
          const fade = (1 - i / SEGS) ** 1.3;
          glowStroke(
            ctx,
            () => {
              ctx.moveTo(q0.x, q0.y);
              ctx.lineTo(q1.x, q1.y);
            },
            rgb,
            0.6 * fade,
            2,
          );
        }
        const hq = pt(head);
        const g = ctx.createRadialGradient(hq.x, hq.y, 0, hq.x, hq.y, 13);
        g.addColorStop(0, "rgba(255, 255, 255, 1)");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hq.x, hq.y, 13, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    });
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}
