"use client";

import { useEffect, useRef, useState } from "react";
import { registerStepConsumer } from "@/lib/section-steps";
import { ReplayScan, CostSpike, PolicyCatch } from "@/components/visuals/audience-visuals";

/**
 * Who it's for — through the star into a new world.
 *
 * Beat one: a caustic light-star (two crossing luminous blades, white-hot
 * core) alone in the dark, slowly turning. One scroll: the camera dives
 * INTO the core — the star swells, the screen floods with light — and on
 * the other side the flash decays into the content: an H2 and three cards,
 * each with its own animated visual, bento-style. Scroll up dives back out.
 *
 * Mobile: no star, no beats — headline and cards stack and scroll.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

const CARDS = [
  {
    tag: "For AI engineers",
    lead: "You shipped an agent.",
    copy: "And you can't explain what it did. Every step goes on tape — replay it like film.",
    Visual: ReplayScan,
  },
  {
    tag: "For platform teams",
    lead: "The bill tripled.",
    copy: "Nobody knows which feature did it. Spend breaks down per run, per agent, per customer.",
    Visual: CostSpike,
  },
  {
    tag: "For product orgs",
    lead: "An action nobody approved.",
    copy: "It happened in production. Policies catch the rogue step before it ships.",
    Visual: PolicyCatch,
  },
] as const;

export function Audience() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    return registerStepConsumer(el, {
      will: dir => {
        if (window.innerWidth < 1024) return false;
        if (busyRef.current) return true;
        return dir === 1 ? stepRef.current < 1 : stepRef.current > 0;
      },
      step: dir => {
        if (busyRef.current) return;
        const next = stepRef.current + dir;
        if (next < 0 || next > 1) return;
        busyRef.current = true;
        stepRef.current = next;
        setStep(next);
        window.setTimeout(() => {
          busyRef.current = false;
        }, 1100);
      },
    });
  }, []);

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
    const OFF = 0.35;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let t = reduced ? 2 : 0;
    let zoom = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Math.max(2, Math.round(w * OFF));
      off.height = Math.max(2, Math.round(h * OFF));
    };

    /**
     * A FILLED four-point star with concave edges — volume, not strokes.
     * Tips sit on the diagonals (slightly uneven arms, like the reference);
     * between tips the outline is pulled hard toward the centre.
     */
    const starPath = (
      c: CanvasRenderingContext2D,
      R: number,
      arms: number[],
      rot: number,
      pinch: number,
    ) => {
      const tip = (i: number): [number, number] => {
        const a = rot + Math.PI / 4 + (i * Math.PI) / 2;
        return [Math.cos(a) * R * arms[i % 4], Math.sin(a) * R * arms[i % 4]];
      };
      c.beginPath();
      const [sx, sy] = tip(0);
      c.moveTo(sx, sy);
      for (let i = 0; i < 4; i++) {
        const [nx, ny] = tip(i + 1);
        const am = rot + Math.PI / 2 + (i * Math.PI) / 2;
        c.quadraticCurveTo(Math.cos(am) * R * pinch, Math.sin(am) * R * pinch, nx, ny);
      }
      c.closePath();
    };

    const draw = () => {
      const target = stepRef.current === 1 ? 1 : 0;
      zoom += (target - zoom) * (reduced ? 1 : 0.055);
      const z = smooth(clamp01(zoom));

      const scale = 1 + z * z * 9; // the dive
      const starA = 1 - smooth(clamp01((z - 0.7) / 0.3));
      const flashA = Math.sin(clamp01((z - 0.25) / 0.75) * Math.PI) * 0.85;
      const ambientA = smooth(clamp01((z - 0.8) / 0.2));

      /* ---- soft layer: the star, as filled light ---- */
      const ow = off.width;
      const oh = off.height;
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, ow, oh);

      if (starA > 0.01) {
        octx.save();
        octx.translate(ow / 2, oh * 0.5);
        octx.globalAlpha = starA;
        octx.globalCompositeOperation = "lighter";
        const rot = Math.sin(t * 0.15) * 0.06 - 0.1;
        const arms = [0.9, 1.08, 0.86, 1.02];
        const R = Math.min(ow, oh) * 0.36 * scale;

        // Upward light shaft leaking from the core.
        const shaft = octx.createLinearGradient(0, 0, 0, -R * 1.5);
        shaft.addColorStop(0, "rgba(255, 255, 255, 0.22)");
        shaft.addColorStop(1, "rgba(180, 76, 255, 0)");
        octx.fillStyle = shaft;
        octx.beginPath();
        octx.moveTo(-R * 0.06, 0);
        octx.lineTo(-R * 0.3, -R * 1.5);
        octx.lineTo(R * 0.3, -R * 1.5);
        octx.lineTo(R * 0.06, 0);
        octx.closePath();
        octx.fill();

        // Body: white-hot centre falling through violet to blue at the tips.
        starPath(octx, R, arms, rot, 0.15);
        const body = octx.createRadialGradient(0, 0, 0, 0, 0, R);
        body.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        body.addColorStop(0.28, "rgba(242, 214, 255, 0.75)");
        body.addColorStop(0.58, "rgba(180, 76, 255, 0.42)");
        body.addColorStop(1, "rgba(47, 123, 255, 0)");
        octx.fillStyle = body;
        octx.fill();

        // Inner fold: a smaller, rotated star in pink — the iridescent crease.
        starPath(octx, R * 0.6, [1, 0.9, 1.06, 0.94], rot + 0.24, 0.2);
        const fold = octx.createRadialGradient(0, 0, 0, 0, 0, R * 0.6);
        fold.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        fold.addColorStop(0.5, "rgba(255, 170, 235, 0.45)");
        fold.addColorStop(1, "rgba(255, 170, 235, 0)");
        octx.fillStyle = fold;
        octx.fill();

        // Bright rim along the blade edges.
        starPath(octx, R, arms, rot, 0.15);
        octx.strokeStyle = "rgba(170, 240, 255, 0.75)";
        octx.lineWidth = Math.max(1, R * 0.012);
        octx.stroke();

        // Core.
        const pulse = 1 + Math.sin(t * 1.1) * 0.05;
        const core = octx.createRadialGradient(0, 0, 0, 0, 0, R * 0.24 * pulse);
        core.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        core.addColorStop(0.4, "rgba(242, 214, 255, 0.45)");
        core.addColorStop(1, "rgba(180, 76, 255, 0)");
        octx.fillStyle = core;
        octx.beginPath();
        octx.arc(0, 0, R * 0.24 * pulse, 0, Math.PI * 2);
        octx.fill();

        octx.restore();
        octx.globalAlpha = 1;
      }

      /* ---- composite with the house optics ---- */
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (hasFilter) ctx.filter = `blur(${Math.max(20, w * 0.018)}px)`;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = `blur(${Math.max(4, w * 0.0035)}px)`;
      ctx.globalAlpha = 1;
      ctx.drawImage(off, 0, 0, w, h);
      if (hasFilter) ctx.filter = "none";

      const cx = w / 2;
      const cy = h * 0.5;
      if (flashA > 0.01) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.8);
        flash.addColorStop(0, `rgba(255, 255, 255, ${flashA})`);
        flash.addColorStop(0.45, `rgba(140, 180, 255, ${flashA * 0.5})`);
        flash.addColorStop(1, "rgba(140, 180, 255, 0)");
        ctx.fillStyle = flash;
        ctx.fillRect(0, 0, w, h);
      }
      if (ambientA > 0.01) {
        const bed = ctx.createRadialGradient(cx, h * 0.35, 0, cx, h * 0.35, h * 0.9);
        bed.addColorStop(0, `rgba(47, 123, 255, ${0.12 * ambientA})`);
        bed.addColorStop(1, "rgba(47, 123, 255, 0)");
        ctx.fillStyle = bed;
        ctx.fillRect(0, 0, w, h);
      }
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

  return (
    <section
      ref={sectionRef}
      id="who"
      data-snap-section
      className="relative scroll-mt-[68px] overflow-hidden lg:h-[calc(100dvh-68px)]"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full lg:block"
      />

      {/* The new world: H2 + three cards. Hidden behind the star until the
          dive; always visible on mobile. */}
      <div
        className={`relative z-10 mx-auto flex h-full max-w-page flex-col px-4 py-16 transition-[opacity,transform] duration-700 ease-out sm:px-5 ${
          step === 1
            ? "lg:translate-y-0 lg:opacity-100 lg:delay-[450ms]"
            : "lg:pointer-events-none lg:translate-y-4 lg:opacity-0 lg:delay-0"
        }`}
      >
        <header className="mb-12 shrink-0 text-center">
          <h2 className="font-display text-title leading-[1.05] font-medium tracking-[-0.02em]">
            For the teams flying blind.
          </h2>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map(c => (
            <article
              key={c.tag}
              className="border-line bg-surface flex min-h-0 flex-col overflow-hidden rounded-[16px] border p-5"
            >
              <p className="text-ink-faint font-mono text-label tracking-[0.16em] uppercase">
                {c.tag}
              </p>
              <p className="mt-3 max-w-[52ch] text-base leading-relaxed">
                <strong className="text-ink font-medium">{c.lead}</strong>{" "}
                <span className="text-ink-muted">{c.copy}</span>
              </p>
              <div className="relative mt-4 min-h-[150px] flex-1 lg:min-h-0">
                <c.Visual />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
