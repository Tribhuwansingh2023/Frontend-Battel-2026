import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Feature 2 — Bento (desktop) ↔ Accordion (mobile) with state persistence.
 *
 * The user's active feature index is held in a SINGLE state value and shared
 * across both layouts. When the viewport crosses the md breakpoint, the same
 * `active` value is reused — desktop hover state seamlessly becomes the
 * opened accordion panel on mobile, satisfying the Context Lock Constraint.
 *
 * Zero external UI/animation deps — all transitions are native CSS.
 */

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: string; // path under /svgs
  span: string; // desktop grid placement
  visual: ReactNode;
};

const features: Feature[] = [
  {
    id: "agents",
    title: "Autonomous agents",
    desc: "Describe an outcome in natural language — Armory agents design, deploy, and monitor end-to-end workflows.",
    icon: "/svgs/cube-16-solid.svg",
    span: "md:col-span-4 md:row-span-2",
    visual: null,
  },
  {
    id: "connectors",
    title: "300+ native connectors",
    desc: "Postgres → Snowflake, Kafka → Stripe, Slack → Linear — link every source into one neural fabric.",
    icon: "/svgs/link-solid.svg",
    span: "md:col-span-2 md:row-span-1",
    visual: null,
  },
  {
    id: "observability",
    title: "Real-time observability",
    desc: "Anomaly detection, lineage, SLO alerting — built in, not bolted on.",
    icon: "/svgs/chart-pie.svg",
    span: "md:col-span-2 md:row-span-1",
    visual: null,
  },
  {
    id: "governance",
    title: "Enterprise governance",
    desc: "Row-level policies, audit logs, SOC 2, HIPAA, GDPR — ready for the toughest reviews.",
    icon: "/svgs/cog-8-tooth.svg",
    span: "md:col-span-2 md:row-span-1",
    visual: null,
  },
  {
    id: "perf",
    title: "Petabyte performance",
    desc: "Vectorized compute and adaptive caching keep latency low as you grow.",
    icon: "/svgs/arrow-trending-up.svg",
    span: "md:col-span-2 md:row-span-1",
    visual: null,
  },
];

export default function Bento() {
  const [active, setActive] = useState<string>(features[0].id);
  const [isDesktop, setIsDesktop] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  // Tracks hover focus on desktop; preserved on resize down to mobile.
  const hoveredRef = useRef<string>(features[0].id);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      // Context Lock: when collapsing to mobile, persist last-hovered feature
      // as the open accordion panel.
      if (!e.matches) setActive(hoveredRef.current);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="container-px mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <p className="eyebrow">// our product</p>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Build logic <span className="accent-text">at scale.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Design, deploy, and manage sophisticated AI workflows through an intuitive visual interface. No complex coding — just pure logic.
          </p>
        </header>

        {isDesktop ? (
          <div className="mt-12 grid grid-cols-6 auto-rows-[200px] gap-4">
            {features.map((f) => (
              <article
                key={f.id}
                className={`card-surface ring-grad group relative overflow-hidden rounded-2xl p-6 ${f.span} transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-30px_rgba(255,200,1,.35)] hover:border-[color:var(--c-forsythia)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--c-forsythia)]/40`}
                onMouseEnter={() => {
                  hoveredRef.current = f.id;
                  setActive(f.id);
                }}
                onFocus={() => { hoveredRef.current = f.id; setActive(f.id); }}
                tabIndex={0}
                aria-current={active === f.id}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 0% 0%, rgba(255,200,1,.08), transparent 60%)",
                  }}
                />
                <div className="relative flex flex-col h-full">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--c-forsythia)]/10 border border-[color:var(--c-forsythia)]/20 text-[color:var(--c-forsythia)] transition-transform duration-200 ease-out group-hover:scale-105">
                    <img src={f.icon} alt="" width={16} height={16} aria-hidden style={{ filter: "invert(78%) sepia(94%) saturate(900%) hue-rotate(0deg) brightness(105%)" }} />
                  </span>
                  <h3 className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight mono transition-colors duration-200 ease-out group-hover:text-[color:var(--c-forsythia)]">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">{f.desc}</p>
                </div>
              </article>

            ))}
          </div>
        ) : (
          <div className="mt-10 space-y-3">
            {features.map((f) => {
              const open = active === f.id;
              return (
                <div key={f.id} className="card-surface ring-grad overflow-hidden">
                  <button
                    onClick={() => { const next = open ? "" : f.id; hoveredRef.current = next || hoveredRef.current; setActive(next); }}
                    aria-expanded={open}
                    aria-controls={`panel-${f.id}`}
                    className="w-full flex items-center justify-between gap-3 p-5 text-left focus-ring"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--c-forsythia)]/10 border border-[color:var(--c-forsythia)]/20">
                        <img src={f.icon} alt="" width={14} height={14} aria-hidden />
                      </span>
                      <span className="text-base font-semibold mono">{f.title}</span>
                    </span>
                    <span className={`shrink-0 h-7 w-7 rounded-full grid place-items-center border border-foreground/10 transition-transform duration-300 ease-in-out ${open ? "rotate-45" : ""}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                  </button>
                  <div
                    id={`panel-${f.id}`}
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <p className="text-sm text-muted-foreground">{f.desc}</p>
                        {f.visual ? (
                          <div className="mt-4 relative h-36 rounded-lg overflow-hidden border border-foreground/10">
                            {f.visual}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function AgentsVisual() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute right-6 bottom-6 w-72 max-w-[80%] rounded-xl border border-foreground/10 bg-[hsl(200_41%_10%)]/85 backdrop-blur p-3 text-xs space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--c-forsythia)] pulse-soft" /> agent.armory
        </div>
        <div className="mono text-[11px] leading-relaxed text-foreground/90">
          <div><span className="text-[color:var(--c-forsythia)]">▸</span> ingest stripe.events → warehouse</div>
          <div><span className="text-[color:var(--c-forsythia)]">▸</span> infer schema · dedupe · enrich</div>
          <div><span className="text-[color:var(--c-forsythia)]">▸</span> deploy · monitor · alert</div>
          <div className="text-muted-foreground">✓ pipeline live · 12.4k rows/s</div>
        </div>
      </div>
      <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full blur-3xl float-slow" style={{ background: "var(--c-forsythia)", opacity: .15 }} />
    </div>
  );
}
function ConnectorsVisual() {
  const dots = Array.from({ length: 18 });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-6 gap-2 p-4 opacity-80">
        {dots.map((_, i) => (
          <div key={i} className="aspect-square rounded-md border border-foreground/10 bg-foreground/[.02] grid place-items-center">
            <div className="h-2 w-2 rounded-sm" style={{ background: i % 2 === 0 ? "var(--c-forsythia)" : "var(--c-saffron)", opacity: 0.7 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
function ObsVisual() {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 200 80" className="absolute bottom-0 left-0 w-full h-24">
        <defs>
          <linearGradient id="og" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--c-forsythia)" stopOpacity=".5" />
            <stop offset="100%" stopColor="var(--c-forsythia)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,60 C30,40 50,55 70,40 C90,25 110,55 130,35 C150,18 170,38 200,22 L200,80 L0,80 Z" fill="url(#og)" />
        <path d="M0,60 C30,40 50,55 70,40 C90,25 110,55 130,35 C150,18 170,38 200,22" fill="none" stroke="var(--c-forsythia)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
function GovVisual() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 rounded-full border border-foreground/10 spin-slow" />
        <div className="absolute inset-3 rounded-full border border-foreground/10" style={{ animation: "spin 16s linear infinite reverse" }} />
        <div className="absolute inset-0 grid place-items-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke="var(--c-forsythia)" strokeWidth="1.5" /></svg>
        </div>
      </div>
    </div>
  );
}
function PerfVisual() {
  return (
    <div className="absolute inset-0 flex items-end gap-1.5 p-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${20 + (Math.sin(i * 0.7) + 1) * 30 + (i / 24) * 20}%`,
            background: `linear-gradient(180deg, var(--c-forsythia), var(--c-saffron))`,
            opacity: 0.4 + (i / 24) * 0.5,
          }}
        />
      ))}
    </div>
  );
}
