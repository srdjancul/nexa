"use client";

import { useEffect, useRef } from "react";

/**
 * Spectrum field.
 *
 * Two mirrored stacks of lines enter from the left and right viewport edges
 * and flow toward the centre, fading out before they reach the copy. Each
 * stack runs the locked Nexa ramp top-to-bottom (cyan → ember). Lines deflect
 * gently around the centre so the headline sits in a quiet pocket of light
 * rather than on top of it.
 *
 * Canvas 2D, additive compositing, zero dependencies. Every line is stroked
 * twice — a wide faint pass and a thin bright pass — so the glow is
 * accumulated light, not a blur filter.
 */

// Locked ramp. Same order everywhere in the product.
const RAMP: Array<[number, number, number]> = [
  [0, 229, 255], // cyan
  [47, 123, 255], // blue
  [109, 91, 255], // indigo
  [180, 76, 255], // violet
  [255, 122, 69], // ember
];

const LINES_PER_SIDE = 26;
const SEGMENTS = 96;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sample the ramp at t ∈ [0, 1]. */
function ramp(t: number): [number, number, number] {
  const scaled = Math.min(Math.max(t, 0), 0.9999) * (RAMP.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = RAMP[i];
  const b = RAMP[i + 1];
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
}

const easeInCubic = (t: number) => t * t * t;

export default function SpectrumField({
  className = "",
}: {
  className?: string;
}) {
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
    let t = 0;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /**
     * Draw one stack. `dir` is +1 for lines entering from the left edge,
     * -1 for lines entering from the right.
     */
    const drawSide = (dir: 1 | -1) => {
      const reach = w * 0.52; // how far toward centre a line travels
      const edgeX = dir === 1 ? 0 : w;
      const top = h * 0.06;
      const bottom = h * 0.94;

      for (let i = 0; i < LINES_PER_SIDE; i++) {
        const k = i / (LINES_PER_SIDE - 1); // 0 top → 1 bottom
        const baseY = lerp(top, bottom, k) + pointer.y * (0.5 - k) * 0.6;
        const [r, g, b] = ramp(k);

        // Lines above centre bend up as they approach it, below bend down.
        const deflect = (k - 0.5) * h * 0.55;
        // Per-line breathing.
        const phase = i * 0.37 + (dir === 1 ? 0 : 1.9);
        const breathe = Math.sin(t * 0.55 + phase) * h * 0.012;

        const grad = ctx.createLinearGradient(
          edgeX,
          0,
          edgeX + dir * reach,
          0,
        );
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
        grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.55)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        for (let s = 0; s <= SEGMENTS; s++) {
          const p = s / SEGMENTS;
          const x = edgeX + dir * reach * p + pointer.x * 0.35 * (1 - p);
          const wave =
            Math.sin(p * 5.2 + t * 0.7 + phase) * h * 0.014 * (1 - p) +
            breathe;
          const y = baseY + deflect * easeInCubic(p) + wave;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = grad;

        // Haze pass.
        ctx.globalAlpha = 0.10;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Core pass.
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Ambient beds at both edges, so the field sits in light.
      for (const dir of [1, -1] as const) {
        const cx = dir === 1 ? 0 : w;
        const bed = ctx.createRadialGradient(cx, h * 0.5, 0, cx, h * 0.5, w * 0.42);
        bed.addColorStop(0, "rgba(47, 123, 255, 0.16)");
        bed.addColorStop(0.5, "rgba(47, 123, 255, 0.04)");
        bed.addColorStop(1, "rgba(47, 123, 255, 0)");
        ctx.fillStyle = bed;
        ctx.fillRect(0, 0, w, h);
      }

      drawSide(1);
      drawSide(-1);

      ctx.globalCompositeOperation = "source-over";
    };

    const frame = () => {
      if (!running) return;
      t += 0.016;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 28;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
    };

    resize();

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    />
  );
}
