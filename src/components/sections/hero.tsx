import { Button } from "@/components/ui/button";
import SpectrumField from "@/components/visuals/spectrum-field";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-bleed ribbon field, behind everything. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <SpectrumField />
      </div>

      {/* Quiet pocket behind the copy so it never fights the light. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_48%_56%_at_50%_50%,var(--color-ground)_22%,transparent_100%)]"
      />

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
            className="rise font-display mt-7 max-w-[16ch] text-display leading-[1.02] font-medium tracking-[-0.03em] text-balance"
            style={{ animationDelay: "60ms" }}
          >
            Know what your agents actually did
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
