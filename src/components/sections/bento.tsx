import { TraceChain, CostCurve, InfinityLoop } from "@/components/visuals/bento-visuals";

/**
 * Product bento. GlassFlow-style cards: bold lead + muted copy top-left,
 * a glowing animated centrepiece below. Copy is placeholder — real content
 * lands with the content pass. Row spans mirror the reference:
 * wide/narrow/narrow over narrow/narrow/wide.
 */

function Card({
  lead,
  copy,
  span,
  children,
}: {
  lead: string;
  copy: string;
  span: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`border-line bg-surface flex min-h-0 flex-col overflow-hidden rounded-[16px] border p-5 ${span}`}
    >
      <p className="max-w-[52ch] text-base leading-relaxed">
        <strong className="text-ink font-medium">{lead}</strong>{" "}
        <span className="text-ink-muted">{copy}</span>
      </p>
      <div className="relative mt-4 min-h-[150px] flex-1 lg:min-h-0">{children}</div>
    </article>
  );
}

/* --- CSS-only centrepieces ---------------------------------------------- */

function Guardrails() {
  // A portal: two tilted rings lying on the floor, a lit orb hovering above.
  return (
    <div className="absolute inset-0 grid place-items-center [perspective:600px]">
      <div className="relative h-44 w-44">
        <div className="bento-ring border-line-strong absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border" />
        <div className="bento-ring-reverse border-line absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border" />
        <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,123,255,0.35),transparent_70%)] blur-md" />
        <div className="bento-hover absolute top-[30%] left-1/2 h-9 w-9 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff,#7db4ff_38%,#2f7bff_62%,#0a1a3a_100%)] shadow-[0_0_30px_6px_rgba(47,123,255,0.55)]" />
        <div className="absolute top-[62%] left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-[50%] bg-black/70 blur-[6px]" />
      </div>
    </div>
  );
}

function AlertToast() {
  // Perspective-tilted toast floating over its own ghost, ember underglow.
  return (
    <div className="absolute inset-0 grid place-items-center [perspective:800px]">
      <div className="relative [transform:rotateX(16deg)_rotateY(-9deg)] [transform-style:preserve-3d]">
        <div className="bg-elevated/50 border-line absolute -top-3 left-5 h-[74px] w-60 rounded-[12px] border blur-[1px]" />
        <div className="bento-float bg-elevated border-line-strong relative w-60 rounded-[12px] border p-3.5 shadow-[0_28px_50px_-18px_rgba(0,0,0,0.9),0_10px_44px_-16px_rgba(255,122,69,0.35)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[12px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="flex items-center gap-2">
            <span className="bg-spectrum-5 h-2.5 w-2.5 rounded-full shadow-[0_0_16px_4px_rgba(255,122,69,0.7)]" />
            <span className="bg-ink/80 h-2 w-24 rounded-full" />
          </div>
          <div className="mt-3 space-y-2">
            <span className="bg-ink/30 block h-1.5 w-48 rounded-full" />
            <span className="bg-ink/20 block h-1.5 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Orbit() {
  // Planet system: orbits tilted into 3D ellipses, the chip floating above.
  return (
    <div className="absolute inset-0 grid place-items-center [perspective:700px]">
      <div className="relative h-44 w-44">
        <div className="absolute inset-0 [transform:rotateX(64deg)] [transform-style:preserve-3d]">
          <div className="border-line-strong absolute inset-0 rounded-full border" />
          <div className="border-line absolute inset-7 rounded-full border" />
          <div className="bento-orbit absolute inset-0">
            <span className="bg-spectrum-1 absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_4px_rgba(0,229,255,0.55)]" />
          </div>
          <div className="bento-orbit-reverse absolute inset-7">
            <span className="bg-spectrum-4 absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full shadow-[0_0_16px_4px_rgba(180,76,255,0.55)]" />
          </div>
        </div>
        <div className="bento-hover absolute top-[26%] left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-[11px] border border-white/25 bg-[linear-gradient(180deg,#2e3644,#14181f_55%,#080a0e)] font-mono text-[10px] tracking-[0.14em] text-ink shadow-[0_18px_30px_-10px_rgba(0,0,0,0.9),0_0_24px_-4px_rgba(47,123,255,0.4)]">
          NX
        </div>
        <div className="absolute top-[68%] left-1/2 h-2.5 w-16 -translate-x-1/2 rounded-[50%] bg-black/70 blur-[6px]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export function Bento() {
  return (
    <section
      id="product"
      data-snap-section
      className="scroll-mt-[68px] lg:h-[calc(100dvh-68px)]"
    >
      <div className="mx-auto flex h-full max-w-page flex-col px-4 py-16 sm:px-5">
        <header className="mb-12 shrink-0 text-center">
          <h2 className="font-display text-title leading-[1.05] font-medium tracking-[-0.02em]">
            Every run, accounted for.
          </h2>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card
            span="lg:col-span-6"
            lead="Full-run tracing."
            copy="Every step, tool call and token your agents take, captured and replayed exactly as it happened — no more guessing what the model did between the prompt and the answer."
          >
            <TraceChain />
          </Card>
          <Card
            span="lg:col-span-3"
            lead="Cost, live."
            copy="Spend per run, per agent, per customer — before the invoice."
          >
            <CostCurve />
          </Card>
          <Card
            span="lg:col-span-3"
            lead="Guardrails built in."
            copy="Policies that stop an agent before it goes off-script."
          >
            <Guardrails />
          </Card>
          <Card
            span="lg:col-span-3"
            lead="Alerts and replay."
            copy="Know the moment a run fails. Fix it, replay it, move on."
          >
            <AlertToast />
          </Card>
          <Card
            span="lg:col-span-3"
            lead="Plugs into your stack."
            copy="OpenAI, Anthropic, LangChain or custom — one SDK."
          >
            <Orbit />
          </Card>
          <Card
            span="lg:col-span-6"
            lead="Scales with you."
            copy="From one agent on a side project to a fleet running production workloads — no message brokers to stand up, no ramp-up time for infra, no re-architecture when volume arrives."
          >
            <InfinityLoop />
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes bento-orbit-spin { to { transform: rotate(360deg); } }
        .bento-orbit { animation: bento-orbit-spin 14s linear infinite; }
        .bento-orbit-reverse { animation: bento-orbit-spin 10s linear infinite reverse; }
        @keyframes bento-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .bento-float { animation: bento-float 5s ease-in-out infinite; }
        @keyframes bento-ring-spin {
          from { transform: translate(-50%, -50%) rotateX(64deg) rotateZ(0deg); }
          to { transform: translate(-50%, -50%) rotateX(64deg) rotateZ(360deg); }
        }
        .bento-ring { animation: bento-ring-spin 16s linear infinite; border-style: dashed; }
        .bento-ring-reverse { animation: bento-ring-spin 11s linear infinite reverse; }
        @keyframes bento-hover-float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -7px); }
        }
        .bento-hover { animation: bento-hover-float 4.5s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
