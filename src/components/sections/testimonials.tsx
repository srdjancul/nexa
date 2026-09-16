"use client";

import { useEffect, useState } from "react";
import { useLoop } from "@/components/visuals/bento-visuals";

/**
 * Testimonials — quote top-left with muted highlight, author beneath,
 * slide dashes bottom-right of the quote block. Below, 48px down, a
 * FOLDER (tab and all) holds the stat and gauge cards and stretches to
 * the bottom of the section; the caption sits outside the folder, to the
 * right. No arrows — slides rotate on their own, dashes jump on click.
 *
 * NOTE: names, companies and numbers are INVENTED placeholders — swap in
 * real ones during the content pass.
 */

const SLIDES = [
  {
    quote: [
      "Since Nexa, our agents stopped being a black box — ",
      "every incident is one replay away",
      ".",
    ],
    name: "Maya Lindqvist",
    role: "Head of Platform — Corely",
    initials: "ML",
    stat: { big: "1.2M", label: "Runs traced", sub: "this quarter" },
    pct: 43,
    pctLabel: "fewer hours spent on incident forensics.",
    caption:
      "Full-run replay turned incident reviews from day-long digs into ten-minute reads.",
  },
  {
    quote: [
      "We found the feature that was ",
      "quietly burning our model budget",
      " in one afternoon.",
    ],
    name: "Daniel Okafor",
    role: "CTO — Brightloop",
    initials: "DO",
    stat: { big: "31%", label: "Model spend", sub: "down in 60 days" },
    pct: 31,
    pctLabel: "lower model spend after per-feature cost breakdown.",
    caption:
      "Cost per run, per agent and per customer made the expensive path obvious — and fixable.",
  },
  {
    quote: [
      "A policy caught a rogue action ",
      "before it reached a customer",
      ". That alone paid for the year.",
    ],
    name: "Ana Petrović",
    role: "VP Engineering — Fieldnote",
    initials: "AP",
    stat: { big: "0", label: "Unreviewed actions", sub: "in production" },
    pct: 87,
    pctLabel: "of agent actions verified automatically.",
    caption:
      "Guardrails run inline, so the dangerous step is stopped in the run — not found in the postmortem.",
  },
] as const;

/** Animated arc gauge — faint track, blue glowing sweep, dot at the tip. */
function Gauge({ pct }: { pct: number }) {
  const ref = useLoop((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h * 0.92;
    const r = Math.min(w * 0.42, h * 0.8);
    const p = Math.min(1, t * 0.7) * (pct / 100);

    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0, false);
    ctx.stroke();

    ctx.globalCompositeOperation = "lighter";
    const end = Math.PI * (1 + p);
    ctx.strokeStyle = "rgba(47, 123, 255, 0.25)";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, end, false);
    ctx.stroke();
    ctx.strokeStyle = "rgba(47, 123, 255, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, end, false);
    ctx.stroke();

    const tx = cx + Math.cos(end) * r;
    const ty = cy + Math.sin(end) * r;
    const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 12);
    g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(0.4, "rgba(47, 123, 255, 0.5)");
    g.addColorStop(1, "rgba(47, 123, 255, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(tx, ty, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  });
  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />;
}

export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const s = SLIDES[idx];

  // Auto-rotate; a manual jump resets the clock. Reduced motion: no auto.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(id);
  }, [idx]);

  return (
    <section
      id="testimonials"
      data-snap-section
      className="relative scroll-mt-[68px] overflow-hidden lg:h-[calc(100dvh-68px)]"
    >
      <div className="mx-auto flex h-full max-w-page flex-col px-4 py-16 sm:px-5">
        {/* Quote block; slide dashes sit at its bottom edge, right side. */}
        <div className="flex shrink-0 items-end justify-between gap-6">
          <div key={idx} className="t-slide max-w-[640px]">
            <blockquote className="font-display text-[clamp(1.6rem,2.8vw,2.5rem)] leading-[1.25] font-medium tracking-[-0.02em]">
              <span className="text-ink-faint">&ldquo; </span>
              <span className="text-ink">{s.quote[0]}</span>
              <span className="text-ink-muted">{s.quote[1]}</span>
              <span className="text-ink">{s.quote[2]}</span>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <span className="border-line bg-elevated text-ink-muted grid h-11 w-11 place-items-center rounded-full border font-mono text-xs tracking-[0.08em]">
                {s.initials}
              </span>
              <span>
                <span className="text-ink block text-sm font-medium">{s.name}</span>
                <span className="text-ink-faint block text-sm">{s.role}</span>
              </span>
            </figcaption>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 pb-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setIdx(i)}
                className="group p-1.5"
              >
                <span
                  className={`block h-1 rounded-full transition-all duration-300 ${
                    i === idx ? "w-6 bg-ink" : "group-hover:bg-white/40 w-3 bg-white/20"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 80px below: the folder (cards inside) + caption outside right. */}
        <div
          key={`panel-${idx}`}
          className="t-slide t-slide-late mt-20 grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-[1.55fr_1fr]"
        >
          {/* The folder. */}
          <div className="relative h-full min-h-[260px] pt-[16px]">
            {/* Tab. */}
            <div className="border-line bg-surface absolute top-0 left-7 flex h-[26px] w-32 items-center justify-center rounded-t-[10px] border border-b-0">
              <span className="h-1 w-9 rounded-full bg-white/15" />
            </div>
            {/* Body. */}
            <div className="border-line bg-surface relative grid h-full grid-cols-1 gap-4 rounded-[20px] rounded-tl-none border p-5 md:grid-cols-2">
              <div className="border-line bg-elevated flex h-full flex-col rounded-[12px] border p-5">
                <p className="text-ink-faint font-mono text-label tracking-[0.16em] uppercase">
                  {s.stat.label}
                </p>
                <p className="font-display text-ink mt-auto text-5xl font-medium tracking-[-0.02em]">
                  {s.stat.big}
                </p>
                <p className="text-ink-faint mt-2 text-sm">{s.stat.sub}</p>
              </div>

              <div className="border-line relative flex h-full flex-col overflow-hidden rounded-[12px] border bg-[linear-gradient(180deg,rgba(47,123,255,0.14),rgba(47,123,255,0.02))] p-5">
                <p className="font-display text-ink text-4xl font-medium tracking-[-0.02em]">
                  {s.pct}%
                </p>
                <p className="text-ink-muted mt-1 max-w-[24ch] text-sm">{s.pctLabel}</p>
                <div className="relative mt-2 min-h-[90px] flex-1">
                  <Gauge key={idx} pct={s.pct} />
                </div>
              </div>
            </div>
          </div>

          {/* Caption — outside the folder, resting on its baseline. */}
          <p className="text-ink-muted max-w-[36ch] self-end pb-1 text-base leading-relaxed">
            {s.caption}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes t-slide-in {
          from { opacity: 0; transform: translateX(22px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .t-slide { animation: t-slide-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .t-slide-late { animation-delay: 90ms; }
      `}</style>
    </section>
  );
}
