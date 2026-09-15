# Nexa — project conventions

## What this is

A modernized rebuild of the **Nicaea** Framer template (owned by the repo author),
rebuilt as a real Next.js site. The template's structure and visual rhythm are the
starting point; the identity, copy and imagery are our own.

Product definition is **not settled yet** — do not invent product copy, feature
names, customer logos, testimonials or stats. Placeholder text must read as
placeholder.

## Stack

- Next.js (App Router) + TypeScript — `src/` directory, `@/*` import alias
- Tailwind CSS v4 (CSS-first config; no `tailwind.config.js`)
- Deploy target: Vercel via the GitHub integration

## Visual direction (decided)

- Typeface: **Manrope** via `next/font/google`, exposed as `--font-manrope`
  and consumed through role tokens (`--font-display`, `--font-body`).
- Colour: near-black ground, off-white ink, and a **locked five-stop spectrum
  ramp** (`--color-spectrum-1..5`: cyan → blue → indigo → violet → ember),
  always in that order. No hues outside the ramp. Ember is the sparing one.
- Light is the material: glows, beams and backlit edges, never flat chromatic
  fills. No photography, no people.
- Hero: centred copy, short; a full-bleed **mirrored field of soft spectrum
  ribbons** entering from both viewport edges
  (`src/components/visuals/spectrum-field.tsx`) — thick, blurred, out-of-focus
  light, never thin wires. Canvas 2D, zero dependencies.
- Type weight caps at **500 (medium)** for headlines and labels — nothing
  bolder, and headline letters are never coloured or gradient-filled.
- Buttons: liquid-metal component (source to be supplied by the owner);
  primary is light, secondary is dark. `src/components/ui/button.tsx` holds
  the interim styles and the stable API.
- Logo is a text placeholder until a mark exists.

## Conventions

- **Tokens over literals.** Colors, type sizes and spacing that recur go in the
  `@theme` block in `src/app/globals.css` as role-based names (`--color-ink`,
  `--color-surface`), not literal names (`--color-gray-400`). Components use the
  generated utilities (`text-ink-muted`), not raw hex.
- **Server Components by default.** Add `"use client"` only where interaction or
  browser APIs genuinely require it, and push it to the smallest leaf.
- **One section per file** under `src/components/sections/`. Shared primitives
  (buttons, pills, containers) under `src/components/ui/`.
- **No CSS-in-JS, no component libraries.** Tailwind utilities plus the odd
  `globals.css` rule for things utilities can't express.
- **Responsive:** design mobile-first. Page gutter 20px desktop / 16px mobile,
  container max-width 1400px.
- **Section rhythm (fixed):** every section gets 64px top and bottom padding,
  and the gap between a section headline and its content is 48px. Full-screen
  sections are `calc(100dvh - 68px)` tall (68px = header) and scroll
  section-to-section via the SnapScroller tween.
- **Motion** stays subtle and CSS-driven where possible; reach for a JS animation
  library only when a section actually needs it, and respect
  `prefers-reduced-motion`.
- **Accessibility:** real landmarks, one `h1` per page, visible focus states,
  alt text on every meaningful image.

## Commands

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm run lint
npm run typecheck
```

## Workflow notes

- Pushes are run by the repo author from their own machine.
- Before adding a section, check the Figma source for structure — don't guess at
  layout from memory.
