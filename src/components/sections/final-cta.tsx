"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

/**
 * Final CTA + footer — the reference composition in our language: headline
 * and two buttons top-left, a light-cascade falling on the right into a
 * reflecting floor (our answer to the aurora waterfall — no people, no
 * photography), long supporting paragraph bottom-left, copyright underneath.
 * No navigation, no label above the headline.
 */

const RAMP: Array<[number, number, number]> = [
  [0, 229, 255], // cyan (innermost)
  [47, 123, 255],
  [109, 91, 255],
  [180, 76, 255],
  [255, 122, 69], // ember (outermost)
];

const OFFSCALE = 0.22;
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function Cascade() {
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
    let t = reduced ? 3 : 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Math.max(2, Math.round(w * OFFSCALE));
      off.height = Math.max(2, Math.round(h * OFFSCALE));
    };

    const draw = () => {
      const ow = off.width;
      const oh = off.height;
      const floorY = oh * 0.76;
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, ow, oh);

      const paint = () => {
        octx.globalCompositeOperation = "lighter";
        octx.lineCap = "round";
        const SEGS = 46;
        for (let i = 0; i < RAMP.length; i++) {
          const [cr, cg, cb] = RAMP[i];
          const baseX = ow * (0.58 + i * 0.085);
          const lean = ow * 0.11;
          const phase = i * 1.7;
          let px = 0;
          let py = 0;
          for (let s = 0; s <= SEGS; s++) {
            const p = s / SEGS;
            const x =
              lerp(baseX + lean, baseX, smooth(p)) +
              Math.sin(p * Math.PI * 1.2 + t * 0.18 + phase) * ow * 0.022 * (1 - p * 0.5);
            const y = lerp(-oh * 0.06, floorY, p);
            if (s > 0) {
              // Light accumulates as it falls — thin at the top, a wall at
              // the waterline (same physics as the intro beam).
              const a = (0.06 + 0.6 * p * p) * 0.35;
              const lw = Math.max(1.5, oh * 0.045 * (0.4 + 0.6 * p));
              octx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${a})`;
              octx.lineWidth = lw;
              octx.beginPath();
              octx.moveTo(px, py);
              octx.lineTo(x, y);
              octx.stroke();
              octx.strokeStyle = `rgba(${Math.min(cr + 40, 255)}, ${Math.min(cg + 40, 255)}, ${Math.min(cb + 40, 255)}, ${a * 0.7})`;
              octx.lineWidth = lw * 0.4;
              octx.beginPath();
              octx.moveTo(px, py);
              octx.lineTo(x, y);
              octx.stroke();
            }
            px = x;
            py = y;
          }
        }
        // The pool where the light lands.
        const poolX = ow * 0.76;
        const pool = octx.createRadialGradient(poolX, floorY, 0, poolX, floorY, ow * 0.24);
        pool.addColorStop(0, "rgba(214, 231, 255, 0.4)");
        pool.addColorStop(0.4, "rgba(47, 123, 255, 0.16)");
        pool.addColorStop(1, "rgba(47, 123, 255, 0)");
        octx.fillStyle = pool;
        octx.save();
        octx.translate(poolX, floorY);
        octx.scale(1, 0.22);
        octx.beginPath();
        octx.arc(0, 0, ow * 0.24, 0, Math.PI * 2);
        octx.fill();
        octx.restore();
      };

      // Scene + waterline reflection.
      paint();
      octx.save();
      octx.translate(0, 2 * floorY);
      octx.scale(1, -1);
      octx.globalAlpha = 0.28;
      paint();
      octx.restore();
      octx.globalAlpha = 1;
      const fade = octx.createLinearGradient(0, floorY, 0, oh);
      fade.addColorStop(0, "rgba(0, 0, 0, 0.25)");
      fade.addColorStop(0.85, "rgba(0, 0, 0, 1)");
      octx.globalCompositeOperation = "destination-out";
      octx.fillStyle = fade;
      octx.fillRect(0, floorY, ow, oh - floorY);
      octx.globalCompositeOperation = "source-over";

      /* composite */
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (hasFilter) ctx.filter = `blur(${Math.max(22, w * 0.02)}px)`;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = `blur(${Math.max(5, w * 0.0045)}px)`;
      ctx.globalAlpha = 1;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = "none";

      // Waterline.
      const fy = h * 0.76;
      const line = ctx.createLinearGradient(w * 0.45, fy, w, fy);
      line.addColorStop(0, "rgba(214, 231, 255, 0)");
      line.addColorStop(0.5, "rgba(214, 231, 255, 0.3)");
      line.addColorStop(1, "rgba(214, 231, 255, 0.08)");
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.45, fy);
      ctx.lineTo(w, fy);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = () => {
      if (!running) return;
      if (!reduced) t += 0.016;
      draw();
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) draw();
    else raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
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
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}

export function FinalCta() {
  return (
    <section
      id="start"
      data-snap-section
      className="relative scroll-mt-[68px] overflow-hidden lg:h-[calc(100dvh-68px)]"
    >
      {/* The cascade, right side. */}
      <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
        <Cascade />
      </div>
      {/* Keep the left column readable against the light. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--color-ground)_32%,transparent_68%)] lg:block"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-page flex-col px-4 py-16 sm:px-5">
        <div className="max-w-[620px]">
          <h2 className="font-display text-display leading-[1.02] font-medium tracking-[-0.03em] text-balance">
            Stop guessing. Start seeing.
          </h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="#start">Start free</Button>
            <Button href="#contact" variant="secondary">
              Talk to us
            </Button>
          </div>
        </div>

        <footer className="mt-16 flex flex-1 flex-col justify-end">
          <p className="text-ink-muted max-w-[46ch] text-base leading-relaxed">
            Nexa is the observability layer for AI agents in production —
            every step traced, every dollar accounted for, every action
            inside policy. One line of SDK, and the black box opens.
          </p>
          <div className="border-line/60 mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <p className="text-ink-faint font-mono text-label tracking-[0.12em] uppercase">
              © 2026 Nexa — All rights reserved
            </p>
            <p className="text-ink-faint flex gap-5 font-mono text-label tracking-[0.12em] uppercase">
              <a href="#privacy" className="hover:text-ink-muted transition-colors">
                Privacy
              </a>
              <a href="#terms" className="hover:text-ink-muted transition-colors">
                Terms
              </a>
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
