import { Button } from "@/components/ui/button";
import SpectrumField from "@/components/visuals/spectrum-field";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-bleed spectrum field, behind everything. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <SpectrumField />
      </div>

      {/* Quiet pocket behind the copy so it never fights the light. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_52%_60%_at_50%_50%,var(--color-ground)_30%,transparent_100%)]"
      />

      {/* Column rules — copy and light both band to the same 12-col grid. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-page px-4 sm:px-5"
      >
        <div className="h-full w-full opacity-35 [background-image:repeating-linear-gradient(to_right,var(--color-line)_0_1px,transparent_1px_calc(100%/12))]" />
      </div>

      <div className="mx-auto max-w-page px-4 sm:px-5">
        <div className="flex min-h-[640px] flex-col items-center justify-center py-24 text-center lg:min-h-[760px] lg:py-32">
          <p className="rise border-line bg-white/[0.03] text-ink-muted inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 font-mono text-label tracking-[0.14em] uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="bg-spectrum-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-spectrum-1 relative inline-flex h-1.5 w-1.5 rounded-full" />
            </span>
            Now in open beta
          </p>

          <h1
            className="rise font-display mt-7 max-w-[15ch] text-display leading-[0.94] font-extrabold tracking-[-0.04em] text-balance"
            style={{ animationDelay: "60ms" }}
          >
            Know what your agents{" "}
            <span className="bg-[linear-gradient(100deg,var(--color-spectrum-1),var(--color-spectrum-3)_52%,var(--color-spectrum-5))] bg-clip-text text-transparent">
              actually did
            </span>
          </h1>

          <p
            className="rise text-ink-muted mt-6 max-w-[36rem] text-lead leading-[1.5] text-pretty"
            style={{ animationDelay: "120ms" }}
          >
            Tracing, cost and control for AI agents in production.
          </p>

          <div
            className="rise mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "180ms" }}
          >
            <Button href="#start">Start free</Button>
            <Button href="#how" variant="secondary">
              See how it works
            </Button>
          </div>

          <p
            className="rise text-ink-faint mt-8 font-mono text-label tracking-[0.12em] uppercase"
            style={{ animationDelay: "240ms" }}
          >
            Free during beta · No card required
          </p>
        </div>
      </div>
    </section>
  );
}
