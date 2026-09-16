"use client";

import { useEffect, useRef, useState } from "react";
import { registerStepConsumer } from "@/lib/section-steps";

/**
 * How it works — one screen, three cards, stepped by single scroll gestures.
 *
 * Composition mirrors the SearchGPT reference: the hero's OWN soft spectrum
 * ribbons (same rendering: low-res buffer + double blur, solid ramp hues,
 * hot core) flow in from the left and slip under the card; from the card's
 * right edge one thin cold white line runs to the viewport edge, joined by
 * a bright connector dot on the card itself. One scroll: the card leaves,
 * the next arrives from the right. Mobile stacks everything, no canvas.
 */

const CARD_W = 460;

type RibbonSpec = {
  hue: [number, number, number];
  y0: number;
  width: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  gain: number;
};

// Same family as the hero field (spectrum-field v2).
const RIBBONS: RibbonSpec[] = [
  { hue: [0, 229, 255], y0: 0.22, width: 0.085, amp: 0.1, freq: 1.9, speed: 0.24, phase: 0.0, gain: 1.0 },
  { hue: [109, 91, 255], y0: 0.42, width: 0.13, amp: 0.13, freq: 1.4, speed: 0.18, phase: 2.1, gain: 1.1 },
  { hue: [180, 76, 255], y0: 0.62, width: 0.095, amp: 0.11, freq: 1.7, speed: 0.21, phase: 4.0, gain: 0.9 },
  { hue: [255, 122, 69], y0: 0.8, width: 0.12, amp: 0.09, freq: 1.3, speed: 0.15, phase: 5.3, gain: 1.0 },
];

const SEGMENTS = 72;
const OFFSCALE = 0.22;
const smooth = (t: number) => t * t * (3 - 2 * t);

const STEPS = [
  {
    n: "01",
    title: "Connect",
    copy: "One line of SDK. Your agents keep running exactly as they do today — nothing re-architected, nothing slowed down.",
    code: "npm i @nexa/sdk",
  },
  {
    n: "02",
    title: "Capture",
    copy: "Every run streams in raw: each step, tool call, token and cent, in the order it actually happened.",
    code: "nexa.trace(run)",
  },
  {
    n: "03",
    title: "Understand",
    copy: "Traces, spend and policy checks resolve into one picture you can search, replay and act on.",
    code: "app.nexa.dev/traces",
  },
] as const;

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const busyRef = useRef(false);

  // Wheel gestures step the cards while this section is the active stop.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    return registerStepConsumer(el, {
      will: dir => {
        if (window.innerWidth < 1024) return false;
        if (busyRef.current) return true; // swallow gestures mid-transition
        return dir === 1 ? stepRef.current < STEPS.length - 1 : stepRef.current > 0;
      },
      step: dir => {
        if (busyRef.current) return;
        const next = stepRef.current + dir;
        if (next < 0 || next > STEPS.length - 1) return;
        busyRef.current = true;
        stepRef.current = next;
        setStep(next);
        window.setTimeout(() => {
          busyRef.current = false;
        }, 900);
      },
    });
  }, []);

  // The ribbon field — hero rendering, re-aimed at the card's left edge.
  useEffect(() => {
    const canvas = canvasRef.current;
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
    let t = reduced ? 4.2 : 0;

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
      if (!w || !h) return;
      const cw = Math.min(CARD_W, w * 0.9);
      const cardLeft = (w - cw) / 2;
      const cardRight = (w + cw) / 2;
      const cy = h / 2;

      /* Soft layer: ribbons from the left, ending under the card. */
      const ow = off.width;
      const oh = off.height;
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, ow, oh);
      octx.globalCompositeOperation = "lighter";
      const oCardLeft = (cardLeft + 40) * OFFSCALE;
      const oCy = cy * OFFSCALE;

      for (const r of RIBBONS) {
        const drift = Math.sin(t * r.speed + r.phase);
        const [cr, cg, cb] = r.hue;
        let px = 0;
        let py = 0;
        for (let s = 0; s <= SEGMENTS; s++) {
          const p = s / SEGMENTS;
          const x = -0.08 * ow + (oCardLeft + 0.08 * ow) * p;
          const wave =
            Math.sin(p * Math.PI * r.freq + t * r.speed * 2 + r.phase) *
            r.amp *
            oh *
            (0.35 + 0.65 * Math.sin(Math.PI * p)) *
            (1 - p * 0.75);
          const y =
            (r.y0 * oh) * (1 - smooth(p)) +
            (oCy + (r.y0 - 0.5) * oh * 0.06) * smooth(p) +
            wave +
            drift * oh * 0.03 * (1 - p);
          if (s > 0) {
            const rise = smooth(Math.min(p / 0.12, 1));
            const a = rise * 0.16 * r.gain;
            const lw = Math.max(1, r.width * oh * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(p * 1.1, 1)) ** 0.75));
            octx.lineCap = "round";
            octx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${a})`;
            octx.lineWidth = lw;
            octx.beginPath();
            octx.moveTo(px, py);
            octx.lineTo(x, y);
            octx.stroke();
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

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (hasFilter) ctx.filter = `blur(${Math.max(24, w * 0.02)}px)`;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = `blur(${Math.max(6, w * 0.005)}px)`;
      ctx.globalAlpha = 1;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = "none";

      /* Crisp layer: the single cold line leaving the card. */
      // Wide soft haze, then the core — both dissolving well before the
      // right edge so the line sinks into depth instead of hitting a wall.
      const lineEnd = w * 1.02;
      const haze = ctx.createLinearGradient(cardRight, cy, lineEnd, cy);
      haze.addColorStop(0, "rgba(214, 231, 255, 0.16)");
      haze.addColorStop(0.55, "rgba(214, 231, 255, 0.07)");
      haze.addColorStop(0.9, "rgba(214, 231, 255, 0)");
      ctx.strokeStyle = haze;
      ctx.lineWidth = 7;
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(cardRight - 4, cy);
      ctx.lineTo(lineEnd, cy);
      ctx.stroke();
      const core = ctx.createLinearGradient(cardRight, cy, lineEnd, cy);
      core.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      core.addColorStop(0.45, "rgba(235, 243, 255, 0.45)");
      core.addColorStop(0.85, "rgba(235, 243, 255, 0)");
      ctx.strokeStyle = core;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cardRight - 4, cy);
      ctx.lineTo(lineEnd, cy);
      ctx.stroke();

      ctx.globalCompositeOperation = "source-over";
    };

    const frame = () => {
      if (!running) return;
      t += 0.016;
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

  // Leaving card fades where it stands (dot included); the next card enters
  // from the right only AFTER that fade, via its transition delay.
  const cardState = (i: number) =>
    i === step
      ? "lg:translate-x-0 lg:opacity-100 lg:delay-300 lg:duration-[550ms]"
      : i < step
        ? "lg:pointer-events-none lg:translate-x-0 lg:opacity-0 lg:delay-0 lg:duration-300"
        : "lg:pointer-events-none lg:translate-x-[70%] lg:opacity-0 lg:delay-0 lg:duration-300";

  return (
    <section
      ref={sectionRef}
      id="how"
      data-snap-section
      className="relative scroll-mt-[68px] overflow-hidden lg:h-[calc(100dvh-68px)]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full lg:block"
      />

      {/* Small headline, reference-style. */}
      <header className="relative z-10 px-4 pt-16 text-center sm:px-5 lg:absolute lg:inset-x-0 lg:top-0">
        <p className="text-[16px] font-medium">How it works</p>
      </header>

      {/* Card stage. Desktop: stacked, one visible, swapped per gesture.
          Mobile: all three in normal flow. */}
      <div className="relative mt-12 flex flex-col gap-8 px-4 pb-16 sm:px-5 lg:mt-0 lg:h-full lg:gap-0 lg:px-0 lg:pb-0">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`flex items-center justify-center transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)] lg:absolute lg:inset-0 ${cardState(i)}`}
          >
            <article className="border-line relative flex w-full max-w-[460px] flex-col rounded-panel border bg-white/[0.04] p-8 backdrop-blur-xl lg:h-[320px]">
              {/* Connector dot: where the cold line docks into the card. */}
              <span
                aria-hidden="true"
                className="absolute top-1/2 -right-2 hidden h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_7px_rgba(255,255,255,0.5)] lg:block"
              />
              <p className="text-ink-faint font-mono text-label tracking-[0.16em]">
                {s.n}
              </p>
              <h3 className="font-display mt-3 text-2xl font-medium tracking-[-0.01em]">
                {s.title}
              </h3>
              <p className="text-ink-muted mt-3 mb-6 text-base leading-relaxed">
                {s.copy}
              </p>
              <code className="border-line text-ink-muted mt-auto inline-block self-start rounded-[8px] border bg-black/40 px-3 py-2 font-mono text-sm">
                {s.code}
              </code>
            </article>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-10 z-10 hidden items-center justify-center gap-2 lg:flex">
        {STEPS.map((s, i) => (
          <span
            key={s.n}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-ink" : "w-4 bg-white/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
