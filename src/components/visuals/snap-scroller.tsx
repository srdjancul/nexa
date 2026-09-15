"use client";

import { useEffect } from "react";

/**
 * Section-to-section wheel scrolling with a real tween. CSS scroll-snap only
 * snaps AFTER a gesture ends, which reads as a jump — this instead animates
 * the whole travel, fullpage-style. Desktop only, skipped for reduced
 * motion, and touch input is left completely native.
 */
export default function SnapScroller() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const HEADER = 68;
    const DURATION = 950;
    let animating = false;
    let acc = 0;
    let lastWheel = 0;

    const targets = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section]")).map(
        el => Math.max(0, el.offsetTop - HEADER),
      );

    // Quintic in-out: gentle launch, long braking tail into the stop.
    const ease = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

    const animateTo = (toY: number) => {
      animating = true;
      const fromY = window.scrollY;
      const startAt = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - startAt) / DURATION);
        window.scrollTo({ top: fromY + (toY - fromY) * ease(p), behavior: "instant" as ScrollBehavior });
        if (p < 1) requestAnimationFrame(step);
        else {
          animating = false;
          acc = 0;
        }
      };
      requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1024) return;
      const stops = targets();
      if (stops.length < 2) return;
      // Only manage the region the sections cover.
      if (window.scrollY > stops[stops.length - 1] + 4) return;

      e.preventDefault();
      if (animating) return;

      const now = performance.now();
      if (now - lastWheel > 250) acc = 0;
      lastWheel = now;
      acc += e.deltaY;
      if (Math.abs(acc) < 40) return;

      const dir = acc > 0 ? 1 : -1;
      let idx = 0;
      for (let i = 0; i < stops.length; i++) {
        if (Math.abs(window.scrollY - stops[i]) < Math.abs(window.scrollY - stops[idx])) idx = i;
      }
      const next = Math.min(stops.length - 1, Math.max(0, idx + dir));
      if (next !== idx) animateTo(stops[next]);
      acc = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}
