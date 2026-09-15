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
