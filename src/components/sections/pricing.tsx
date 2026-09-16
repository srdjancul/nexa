import { Button } from "@/components/ui/button";

/**
 * Pricing — the beam picks the plan.
 *
 * Three tiers sitting on the site's cold light line. The beam runs behind
 * all three, but it DOCKS into the featured tier: bright connector dots on
 * its edges, a spectrum gradient border, and a slow aurora drifting inside
 * its surface. Side tiers recede slightly — quiet, legible, clearly not
 * the protagonist. No toggle, no feature-matrix wall: five lines per tier.
 *
 * All prices and limits are placeholder until the content pass.
 */

const TIERS = [
  {
    name: "Solo",
    tagline: "For the first agent.",
    price: "$0",
    unit: "forever",
    features: ["1 agent", "10k runs / month", "7-day trace retention", "Community support"],
    cta: "Start solo",
    featured: false,
  },
  {
    name: "Growth",
    tagline: "Most teams land here.",
    price: "$49",
    unit: "/ month",
    features: [
      "Unlimited agents",
      "1M runs / month",
      "90-day trace retention",
      "Policies, alerts & replay",
      "Slack support",
    ],
    cta: "Start free",
    featured: true,
  },
  {
    name: "Scale",
    tagline: "For fleets in production.",
    price: "Custom",
    unit: "annual",
    features: ["Self-host or SSO", "Unlimited retention", "99.9% SLA", "Dedicated support"],
    cta: "Talk to us",
    featured: false,
  },
] as const;

export function Pricing() {
  return (
    <section
      id="pricing"
      data-snap-section
      className="relative scroll-mt-[68px] overflow-hidden lg:h-[calc(100dvh-68px)]"
    >
      <div className="mx-auto flex h-full max-w-page flex-col px-4 py-16 sm:px-5">
        <header className="mb-12 shrink-0 text-center">
          <h2 className="font-display text-title leading-[1.05] font-medium tracking-[-0.02em]">
            Pricing that doesn&apos;t need a meeting.
          </h2>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center">
          {/* The cold line, passing behind all three tiers. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-1/2 hidden lg:block">
            <div className="h-[3px] w-full bg-[linear-gradient(90deg,transparent,rgba(214,231,255,0.06)_12%,rgba(214,231,255,0.1)_50%,rgba(214,231,255,0.06)_88%,transparent)] blur-[2px]" />
            <div className="-mt-[2px] h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35)_12%,rgba(255,255,255,0.6)_50%,rgba(255,255,255,0.35)_88%,transparent)]" />
          </div>

          <div className="relative z-10 grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-3 lg:gap-8">
            {TIERS.map(tier =>
              tier.featured ? (
                /* Featured: spectrum border, aurora surface, beam docks in. */
                <div key={tier.name} className="relative lg:-my-4">
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -left-[7px] z-20 hidden h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_6px_rgba(255,255,255,0.45)] lg:block"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -right-[7px] z-20 hidden h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_6px_rgba(255,255,255,0.45)] lg:block"
                  />
                  <div className="rounded-[20px] p-px shadow-[0_24px_80px_-24px_rgba(47,123,255,0.45)] [background:linear-gradient(160deg,rgba(0,229,255,0.55),rgba(47,123,255,0.2)_45%,rgba(180,76,255,0.55))]">
                    <article className="bg-surface relative overflow-hidden rounded-[19px] p-7">
                      {/* Aurora drifting inside the surface. */}
                      <div aria-hidden="true" className="pricing-aurora-a absolute -top-16 -left-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.22),transparent_70%)] blur-2xl" />
                      <div aria-hidden="true" className="pricing-aurora-b absolute -right-10 -bottom-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(180,76,255,0.2),transparent_70%)] blur-2xl" />

                      <p className="border-line bg-ink text-ground absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[8px] px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase">
                        Most popular
                      </p>

                      <div className="relative">
                        <h3 className="font-display text-xl font-medium">{tier.name}</h3>
                        <p className="text-ink-faint mt-1 text-sm">{tier.tagline}</p>
                        <p className="mt-6 flex items-baseline gap-2">
                          <span className="font-display text-ink text-6xl font-medium tracking-[-0.03em]">
                            {tier.price}
                          </span>
                          <span className="text-ink-faint font-mono text-sm">{tier.unit}</span>
                        </p>
                        <ul className="divide-line/60 mt-6 divide-y">
                          {tier.features.map(f => (
                            <li key={f} className="text-ink-muted py-2.5 text-base">
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-7">
                          <Button href="#start">{tier.cta}</Button>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              ) : (
                /* Side tiers: quiet, slightly receding. */
                <article
                  key={tier.name}
                  className="border-line bg-surface/80 rounded-[18px] border p-6 lg:scale-[0.96] lg:opacity-90"
                >
                  <h3 className="font-display text-xl font-medium">{tier.name}</h3>
                  <p className="text-ink-faint mt-1 text-sm">{tier.tagline}</p>
                  <p className="mt-6 flex items-baseline gap-2">
                    <span className="font-display text-ink text-5xl font-medium tracking-[-0.03em]">
                      {tier.price}
                    </span>
                    <span className="text-ink-faint font-mono text-sm">{tier.unit}</span>
                  </p>
                  <ul className="divide-line/60 mt-6 divide-y">
                    {tier.features.map(f => (
                      <li key={f} className="text-ink-muted py-2.5 text-base">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Button href="#start" variant="secondary" size="sm">
                      {tier.cta}
                    </Button>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pricing-aurora-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(26px, 18px); }
        }
        @keyframes pricing-aurora-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-22px, -16px); }
        }
        .pricing-aurora-a { animation: pricing-aurora-a 9s ease-in-out infinite; }
        .pricing-aurora-b { animation: pricing-aurora-b 11s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
