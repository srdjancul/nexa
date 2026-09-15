"use client";

import { useEffect, useRef } from "react";

/**
 * Spectrum field, v2 — ribbons, not wires.
 *
 * A handful of thick luminous ribbons enter from each viewport edge, arc
 * through slow S-curves and dissolve before the centre. Modelled on soft
 * out-of-focus light: each ribbon is drawn as overlapping round-cap
 * segments with a variable width profile onto a LOW-RESOLUTION offscreen
 * canvas, then composited twice at different blur radii. The softness comes
 * from optics (low-res upscale + blur), never from thin strokes.
 *
 * Canvas 2D, zero dependencies. Safari without ctx.filter still works —
 * the low-res upscale alone provides the diffusion.
 */

type RibbonSpec = {
  hue: [number, number, number];
  y0: number; // entry height, fraction of H
  y1: number; // height where it dissolves, fraction of H
  width: number; // max width, fraction of H
  amp: number; // undulation amplitude, fraction of H
  freq: number; // undulations along the run
  speed: number;
  phase: number;
  gain: number; // brightness multiplier
};

// Locked ramp hues only: cyan, blue, indigo, violet, ember.
const SIDE: RibbonSpec[] = [
  { hue: [0, 229, 255],  y0: 0.18, y1: 0.34, width: 0.085, amp: 0.10, freq: 1.9, speed: 0.24, phase: 0.0, gain: 1.0 },
  { hue: [109, 91, 255], y0: 0.38, y1: 0.52, width: 0.130, amp: 0.13, freq: 1.4, speed: 0.18, phase: 2.1, gain: 1.1 },
  { hue: [180, 76, 255], y0: 0.60, y1: 0.50, width: 0.095, amp: 0.11, freq: 1.7, speed: 0.21, phase: 4.0, gain: 0.9 },
  { hue: [255, 122, 69], y0: 0.80, y1: 0.66, width: 0.120, amp: 0.09, freq: 1.3, speed: 0.15, phase: 5.3, gain: 1.0 },
  { hue: [47, 123, 255], y0: 0.94, y1: 0.86, width: 0.060, amp: 0.07, freq: 2.2, speed: 0.28, phase: 1.2, gain: 0.7 },
];

const SEGMENTS = 72;
const REACH = 0.46; // how far toward centre a ribbon travels, fraction of W
const OFFSCALE = 0.22; // offscreen resolution — low on purpose

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Width profile: tapered entry, fat middle, dissolving tail. */
const widthAt = (t: number) => 0.3 + 0.7 * Math.sin(Math.PI * Math.min(t, 1)) ** 0.75;

/** Alpha profile: quick rise, long hold, fade as it nears the centre. */
const alphaAt = (t: number) =>
  smooth(Math.min(t / 0.12, 1)) * (1 - smooth(Math.max((t - 0.62) / 0.38, 0)));

export default function SpectrumField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { alpha: true });
    if (!octx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFilter = typeof ctx.filter === "string";

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let t = reduced ? 4.2 : 0; // a flattering static pose for reduced motion

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Math.max(2, Math.round(w * OFFSCALE));
      off.height = Math.max(2, Math.round(h * OFFSCALE));
    };

    /** Draw one side's ribbons onto the offscreen at its own scale. */
    const drawSide = (dir: 1 | -1) => {
      const ow = off.width;
      const oh = off.height;
      const edgeX = dir === 1 ? -0.08 * ow : 1.08 * ow;
      const run = REACH * ow * dir;

      for (const r of SIDE) {
        const drift = Math.sin(t * r.speed + r.phase + (dir === -1 ? 2.6 : 0));
        const [cr, cg, cb] = r.hue;
        let px = 0;
        let py = 0;

        for (let s = 0; s <= SEGMENTS; s++) {
          const p = s / SEGMENTS;
          const x = edgeX + run * p + pointer.x * (1 - p) * OFFSCALE * dir;
          const wave =
            Math.sin(p * Math.PI * r.freq + t * r.speed * 2 + r.phase) *
            r.amp *
            oh *
            (0.35 + 0.65 * Math.sin(Math.PI * p));
          const y =
            (r.y0 + (r.y1 - r.y0) * smooth(p)) * oh +
            wave +
            drift * oh * 0.03 +
            pointer.y * (1 - p) * OFFSCALE;

          if (s > 0) {
            const a = alphaAt(p) * 0.16 * r.gain;
            const lw = Math.max(1, r.width * oh * widthAt(p));
            octx.lineCap = "round";
            // Body.
            octx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${a})`;
            octx.lineWidth = lw;
            octx.beginPath();
            octx.moveTo(px, py);
            octx.lineTo(x, y);
            octx.stroke();
            // Hot core, offset slightly upward like a lit tube.
            octx.strokeStyle = `rgba(${Math.min(cr + 80, 255)}, ${Math.min(cg + 80, 255)}, ${Math.min(cb + 80, 255)}, ${a * 0.9})`;
            octx.lineWidth = lw * 0.38;
            octx.beginPath();
            octx.moveTo(px, py - lw * 0.14);
            octx.lineTo(x, y - lw * 0.14);
            octx.stroke();
          }
          px = x;
          py = y;
        }
      }
    };

    const draw = () => {
      if (!w || !h) return;

      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, off.width, off.height);
      octx.globalCompositeOperation = "lighter";
      drawSide(1);
      drawSide(-1);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fog pass — wide, dim, fills the room with colour.
      if (hasFilter) ctx.filter = `blur(${Math.max(24, w * 0.02)}px)`;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(off, 0, 0, w, h);

      // Body pass — the ribbon itself, still soft.
      if (hasFilter) ctx.filter = `blur(${Math.max(6, w * 0.005)}px)`;
      ctx.globalAlpha = 1;
      ctx.drawImage(off, 0, 0, w, h);

      if (hasFilter) ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = () => {
      if (!running) return;
      t += 0.016;
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 36;
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
