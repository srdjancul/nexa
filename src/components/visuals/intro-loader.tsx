"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Intro loader — matched to the reference frame:
 * empty black space on the left, the small wordmark sitting just before the
 * point where the light starts, and ONE smooth cone of white-blue light
 * opening from that point across the right side of the screen — thin bright
 * core along the axis, soft wide falloff. Brand blue/cyan from the locked
 * ramp instead of the reference's cold gray.
 *
 * Plays once per browser session (?intro forces a replay), skipped under
 * prefers-reduced-motion, ~1.9s. Canvas 2D, low-res + blur optics. The
 * "seen" flag is written only when the animation completes (dev
 * strict-mode safe).
 */

const BLUE: [number, number, number] = [47, 123, 255]; // --color-spectrum-2
const CYAN: [number, number, number] = [0, 229, 255]; // --color-spectrum-1
const SOFT_WHITE: [number, number, number] = [240, 245, 252];

const APEX_X = 0.3; // where the light starts, fraction of width
const OFFSCALE = 0.16;
const TOTAL_MS = 2300;
const FADE_AT_MS = 1700;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] =>
  [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export default function IntroLoader() {
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef(false);

  useLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("nexa-intro") === "1";
    } catch {
      seen = false;
    }
    const forced = window.location.search.includes("intro");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ((seen && !forced) || reduced) {
      skipRef.current = true;
      setDone(true);
    }
  }, []);

  useEffect(() => {
    if (skipRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { alpha: true });
    if (!octx) return;
    const maskC = document.createElement("canvas");
    const mctx = maskC.getContext("2d", { alpha: true });
    if (!mctx) return;
    const hasFilter = typeof ctx.filter === "string";

    let w = 0;
    let h = 0;
    let raf = 0;
    let stopped = false;
    let flagged = false;
    const start = performance.now();

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
      maskC.width = off.width;
      maskC.height = off.height;
    };

    const draw = (elapsed: number) => {
      const ow = off.width;
      const oh = off.height;
      const oax = APEX_X * ow;
      const oay = 0.5 * oh;

      const open = easeOutCubic(clamp01((elapsed - 250) / 950)); // cone opens

      /* ---------- soft layer: the cone body ---------- */
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, ow, oh);
      octx.globalCompositeOperation = "lighter";

      if (open > 0) {
        const RAYS = 38;
        const spread = lerp(0.14, 0.5, open);
        const len = ow * 1.3 * open;
        octx.lineCap = "butt";
        for (let i = 0; i < RAYS; i++) {
          const k = (i / (RAYS - 1)) * 2 - 1; // -1 top … 1 bottom
          const angle = k * spread;
          // White-blue: whitest along the axis, blue at the cone's edges,
          // a whisper of cyan in the upper half. Nothing outside the ramp.
          const edge = mix(BLUE, CYAN, clamp01((-k + 1) / 2) * 0.35);
          const rgb = mix(edge, SOFT_WHITE, (1 - Math.abs(k)) ** 1.4 * 0.85);
          const alpha = (0.10 + 0.55 * (1 - Math.abs(k)) ** 2.3) * open * 0.9;
          const ex = oax + Math.cos(angle) * len;
          const ey = oay + Math.sin(angle) * len;
          // Inverted falloff: the light ACCUMULATES with distance, so the
          // apex stays a pin-point and the right side becomes the wall of
          // light. This also prevents the rays stacking into a blob at the
          // origin under additive blending.
          // Visible from the very tip (that concentration IS the spitz),
          // still accumulating toward the right so the far side is the
          // brightest part of the frame.
          const g = octx.createLinearGradient(oax, oay, ex, ey);
          g.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * 0.05})`);
          g.addColorStop(0.3, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha * 0.35})`);
          g.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`);
          octx.strokeStyle = g;
          octx.lineWidth = Math.max(1.5, oh * 0.03);
          octx.beginPath();
          octx.moveTo(oax, oay);
          octx.lineTo(ex, ey);
          octx.stroke();
        }
      }


      /* ---------- composite soft layer ---------- */
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (hasFilter) ctx.filter = `blur(${Math.max(40, w * 0.042)}px)`;
      ctx.globalAlpha = 1;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = `blur(${Math.max(16, w * 0.016)}px)`;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = "none";

      // Clip ALL light — fog included — to a feathered wedge whose vertex
      // is the apex. The wedge collapses to a single point there: that point
      // is the spitz. Nothing can exist behind or around it.
      {
        const mw = maskC.width;
        const mh = maskC.height;
        const max = APEX_X * mw;
        const may = 0.5 * mh;
        const wedge = 0.56; // slightly wider than the widest cone spread
        const far = mw * 1.6;
        mctx.setTransform(1, 0, 0, 1, 0, 0);
        mctx.clearRect(0, 0, mw, mh);
        if (typeof mctx.filter === "string") mctx.filter = "blur(1.5px)";
        mctx.fillStyle = "#fff";
        mctx.beginPath();
        mctx.moveTo(max, may);
        mctx.lineTo(max + far, may - Math.tan(wedge) * far);
        mctx.lineTo(max + far, may + Math.tan(wedge) * far);
        mctx.closePath();
        mctx.fill();
        if (typeof mctx.filter === "string") mctx.filter = "none";
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskC, 0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
      }

      /* ---------- crisp layer: the core line along the axis ---------- */
      if (open > 0) {
        const ax = APEX_X * w;
        const ay = 0.5 * h;
        const tip = ax + w * 1.3 * open;
        // One thin line only — it IS the reflection's axis, starting at
        // the spitz. Any width around it comes from the blurred soft layer,
        // never from a stroked band.
        // The line is a whisper: faint from the start, dissolved before the
        // middle of the VISIBLE frame (the old gradient ran to an off-screen
        // endpoint, which is why it never seemed to fade).
        const visEnd = Math.min(tip, w);
        const core = ctx.createLinearGradient(ax, ay, visEnd, ay);
        core.addColorStop(0, "rgba(255, 255, 255, 0.7)");
        core.addColorStop(0.06, "rgba(255, 255, 255, 0.5)");
        core.addColorStop(0.3, "rgba(255, 255, 255, 0.16)");
        core.addColorStop(0.55, "rgba(240, 246, 255, 0)");
        ctx.strokeStyle = core;
        ctx.lineWidth = 1;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(visEnd, ay);
        ctx.stroke();
        // Needle: short, thin, only at the tip.
        const needle = ctx.createLinearGradient(ax, ay, ax + w * 0.05, ay);
        needle.addColorStop(0, `rgba(255, 255, 255, ${0.8 * open})`);
        needle.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.strokeStyle = needle;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + w * 0.05, ay);
        ctx.stroke();
        // The spitz: one tiny intense point exactly where the line begins.
        const glint = ctx.createRadialGradient(ax, ay, 0, ax, ay, 3);
        glint.addColorStop(0, `rgba(255, 255, 255, ${0.75 * open})`);
        glint.addColorStop(0.5, `rgba(255, 255, 255, ${0.22 * open})`);
        glint.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glint;
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (now: number) => {
      if (stopped) return;
      const elapsed = now - start;
      draw(elapsed);
      if (elapsed >= FADE_AT_MS) {
        setFading(true);
        if (!flagged) {
          flagged = true;
          try {
            sessionStorage.setItem("nexa-intro", "1");
          } catch {
            /* fine */
          }
        }
      }
      if (elapsed >= TOTAL_MS) {
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      className={`bg-ground fixed inset-0 z-[100] transition-opacity duration-500 ease-out ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Small wordmark in the empty space, just before the light starts. */}
      <span className="intro-wordmark font-display text-ink absolute top-1/2 right-[72.5%] text-[1.0625rem] leading-none font-medium tracking-[-0.01em] whitespace-nowrap">
        Nexa
      </span>
      <style>{`
        .intro-wordmark {
          opacity: 0;
          transform: translateY(-44%);
          animation: intro-wordmark-in 550ms ease-out 1050ms both;
        }
        @keyframes intro-wordmark-in {
          from { opacity: 0; transform: translateY(-44%); }
          to { opacity: 1; transform: translateY(-44%); }
        }
      `}</style>
    </div>
  );
}
