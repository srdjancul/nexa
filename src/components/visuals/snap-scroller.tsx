"use client";

import { useEffect } from "react";
import { stepConsumerFor } from "@/lib/section-steps";

/**
 * Section-to-section wheel scrolling with a real tween. A section can
 * register a StepConsumer to take gestures for internal steps (card
 * carousels) before the page moves on. Desktop only; touch stays native;
 * reduced motion opts out.
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

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section]"));

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
      const els = sections();
      if (els.length < 2) return;
      const stops = els.map(el => Math.max(0, el.offsetTop - HEADER));
      const y = window.scrollY;
      if (y > stops[stops.length - 1] + 4) return; // beyond managed region

      let idx = 0;
      for (let i = 0; i < stops.length; i++) {
        if (Math.abs(y - stops[i]) < Math.abs(y - stops[idx])) idx = i;
      }
      const atStop = Math.abs(y - stops[idx]) < 30;
      const consumer = atStop ? stepConsumerFor(els[idx]) : undefined;
      const dirNow: 1 | -1 = e.deltaY > 0 ? 1 : -1;

      // At the very last stop, scrolling down with nothing left to consume
      // hands over to native scroll.
      if (
        idx === stops.length - 1 &&
        dirNow === 1 &&
        !(consumer && consumer.will(1))
      )
        return;

      e.preventDefault();
      if (animating) return;

      const now = performance.now();
      if (now - lastWheel > 250) acc = 0;
      lastWheel = now;
      acc += e.deltaY;
      if (Math.abs(acc) < 40) return;

      const dir: 1 | -1 = acc > 0 ? 1 : -1;
      acc = 0;

      // The section itself eats the gesture (card carousel etc.).
      if (consumer && consumer.will(dir)) {
        consumer.step(dir);
        return;
      }
      // Coming back up from below: settle on the nearest stop first.
      if (dir === -1 && y > stops[idx] + 30) {
        animateTo(stops[idx]);
        return;
      }
      const next = Math.min(stops.length - 1, Math.max(0, idx + dir));
      if (next !== idx) animateTo(stops[next]);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}
