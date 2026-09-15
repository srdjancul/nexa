"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor sparks: tiny white embers that fall out of the pointer and die.
 * A burst on every click, an occasional single spark while hovering
 * anything interactive. Canvas overlay, zero DOM churn — the rAF loop only
 * runs while sparks are alive. Skipped under prefers-reduced-motion.
 */

type Spark = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
};

export default function CursorSparks() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    let lastHoverSpark = 0;
    const sparks: Spark[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (x: number, y: number, n: number) => {
      // A real spark burst: every ember leaves the SAME point, ejected
      // upward-outward at its own angle, then gravity bends it into a
      // falling arc — like sparks off a welding tip.
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        // Fan from ~200° to ~-20° (up-left to up-right), jittered.
        const angle = Math.PI * (1.1 - 1.2 * t) + (Math.random() - 0.5) * 0.35;
        const speed = 130 + Math.random() * 150;
        sparks.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(angle) * speed,
          vy: -Math.abs(Math.sin(angle)) * speed * 0.9,
          age: 0,
          ttl: 0.5 + Math.random() * 0.3,
        });
      }
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        if (s.age >= s.ttl) {
          sparks.splice(i, 1);
          continue;
        }
        s.px = s.x;
        s.py = s.y;
        s.vy += 950 * dt; // gravity
        s.vx *= 1 - 1.6 * dt; // air drag
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const lifeLeft = 1 - s.age / s.ttl;
        // A falling ember: short bright streak with a soft halo.
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * lifeLeft})`;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(214, 231, 255, ${0.25 * lifeLeft})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (sparks.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const onDown = (e: PointerEvent) => spawn(e.clientX, e.clientY, 4 + Math.floor(Math.random() * 3));
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest?.("a, button")) return;
      const now = performance.now();
      if (now - lastHoverSpark < 240) return;
      lastHoverSpark = now;
      spawn(e.clientX, e.clientY, 1);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90]"
    />
  );
}
