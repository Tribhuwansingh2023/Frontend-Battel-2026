import Logo from "./Logo";

/**
 * Hero — matches demo.mp4's left-aligned display title, monospace eyebrow,
 * lightning bolt mark, and "Build a Workflow" CTA over a layered backdrop.
 */
export default function Hero() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-20 overflow-hidden" aria-labelledby="hero-title">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 grid-bg" aria-hidden />
      <div
        className="absolute -z-10 right-[-15%] top-[-10%] h-[600px] w-[900px] max-w-[120vw] rounded-full opacity-50 blur-3xl float-slow"
        style={{ background: "radial-gradient(circle at 40% 40%, var(--c-forsythia), transparent 60%)" }}
        aria-hidden
      />
      <div
        className="absolute -z-10 left-[-20%] top-40 h-[420px] w-[620px] rounded-full opacity-50 blur-3xl float-slow"
        style={{ background: "radial-gradient(circle, var(--c-nocturnal), transparent 60%)", animationDelay: "-3s" }}
        aria-hidden
      />

      <div className="container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-end">
          {/* Headline column */}
          <div>
            <p className="reveal eyebrow inline-flex items-center gap-2">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-[color:var(--c-forsythia)] pulse-soft" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-[color:var(--c-forsythia)]" />
              </span>
              // · Introducing Armory v3
            </p>

            <h1 id="hero-title" className="reveal reveal-2 mt-5 text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.03em]">
              Power your<br />
              <span className="inline-flex items-center gap-3 sm:gap-4">
                future with
                <span className="text-[color:var(--c-forsythia)] inline-flex items-center"><Logo size={64} /></span>
                <span className="accent-text">AI</span>
              </span>
            </h1>

            <p className="reveal reveal-3 mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
              Deploy custom enterprise agents and automate complex workflows.
              Scale your intelligence with Armory today.
            </p>

            <div className="reveal reveal-4 mt-8 flex flex-wrap items-center gap-3">
              <a href="#cta" className="btn-primary mono inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl focus-ring">
                Build a Workflow
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("armory:open-demo"))}
                className="btn-ghost inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl focus-ring"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg>
                Watch 2-min demo
              </button>
            </div>

            <dl className="reveal reveal-5 mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { k: "12ms", l: "Real-time inference" },
                { k: "10×", l: "Faster automations" },
                { k: "97%", l: "Critical uptime" },
              ].map((m) => (
                <div key={m.k}>
                  <dt className="text-3xl mono font-semibold text-[color:var(--c-forsythia)]">{m.k}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground leading-snug">{m.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual column */}
          <div className="reveal reveal-3 relative">
            <div className="card-surface ring-grad relative p-3 rounded-2xl overflow-hidden">
              <div className="absolute -inset-px rounded-2xl pointer-events-none shimmer opacity-30" aria-hidden />
              <div className="rounded-xl overflow-hidden border border-foreground/10 bg-[hsl(200_41%_10%)]">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-foreground/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--c-saffron)]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--c-forsythia)]/80" />
                  <span className="ml-3 text-[11px] text-muted-foreground mono">armory.app/agents/prod</span>
                </div>
                <Mock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mock() {
  const bars = [42, 58, 70, 49, 88, 64, 92, 76, 110, 82, 98, 120, 96, 130, 118];
  return (
    <div className="p-4 sm:p-5 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Events / sec", v: "128.4k", d: "+18.2%" },
          { l: "Agents", v: "42", d: "+3" },
          { l: "Cost / 1M", v: "$0.12", d: "−24%" },
        ].map((m) => (
          <div key={m.l} className="rounded-lg border border-foreground/10 bg-foreground/[.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">{m.l}</div>
            <div className="mt-1 text-base sm:text-lg font-semibold mono">{m.v}</div>
            <div className="text-[10px] text-[color:var(--c-forsythia)]">{m.d}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-foreground/10 bg-foreground/[.02] p-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2 mono">
          <span>Throughput · last 24h</span><span>live</span>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${(b / 130) * 100}%`,
                background: `linear-gradient(180deg, var(--c-forsythia) ${0.3 + (i / bars.length) * 50}%, var(--c-saffron))`,
                opacity: 0.5 + (i / bars.length) * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
