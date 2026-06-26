import { useMemo, useState } from "react";

/** Per-tier base plus marginal pricing for events & seats. */
const TIERS = [
  { id: "starter", name: "Starter", base: 19, includedEvents: 10, includedSeats: 3, eventCost: 1.2, seatCost: 9, maxEvents: 100 },
  { id: "pro",     name: "Pro",     base: 89, includedEvents: 100, includedSeats: 10, eventCost: 0.6, seatCost: 7, maxEvents: 1500 },
  { id: "ent",     name: "Enterprise", base: 499, includedEvents: 1000, includedSeats: 25, eventCost: 0.3, seatCost: 5, maxEvents: 50000 },
];

type Cycle = "monthly" | "annual";

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function PricingEstimator() {
  const [events, setEvents] = useState(50); // millions / month
  const [seats, setSeats] = useState(5);
  const [cycle, setCycle] = useState<Cycle>("monthly");

  // Suggest best tier by lowest computed total
  const computed = useMemo(() => {
    return TIERS.map((t) => {
      const extraEvents = Math.max(0, events - t.includedEvents);
      const extraSeats = Math.max(0, seats - t.includedSeats);
      const monthly = t.base + extraEvents * t.eventCost + extraSeats * t.seatCost;
      const total = cycle === "annual" ? Math.round(monthly * 0.8 * 12) : Math.round(monthly);
      const perMonth = cycle === "annual" ? Math.round(monthly * 0.8) : Math.round(monthly);
      return { ...t, monthly, total, perMonth, fits: events <= t.maxEvents };
    });
  }, [events, seats, cycle]);

  const recommended = useMemo(() => {
    const fitting = computed.filter((c) => c.fits);
    return (fitting[0] ? fitting.reduce((a, b) => (a.perMonth <= b.perMonth ? a : b)) : computed[computed.length - 1]).id;
  }, [computed]);

  return (
    <section id="estimator" className="py-16 sm:py-20 scroll-mt-24">
      <div className="container-px mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <p className="eyebrow">// estimator</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Estimate your <span className="accent-text">monthly bill</span>.</h2>
          <p className="mt-3 text-muted-foreground text-sm">Slide to model usage. Totals update in real time and recommend the lowest-cost plan that fits.</p>
        </header>

        <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* Controls */}
          <div className="card-surface ring-grad p-6 space-y-7">
            <Slider
              label="Events / month"
              value={events}
              min={1}
              max={2000}
              step={1}
              unit="M"
              onChange={setEvents}
            />
            <Slider
              label="Team seats"
              value={seats}
              min={1}
              max={100}
              step={1}
              onChange={setSeats}
            />

            <div>
              <p className="eyebrow mb-2">Billing</p>
              <div role="tablist" aria-label="Billing cycle" className="inline-flex glass rounded-full p-1 text-sm mono">
                {(["monthly", "annual"] as Cycle[]).map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cycle === c}
                    onClick={() => setCycle(c)}
                    className={`px-4 py-1.5 rounded-full focus-ring transition-colors ${cycle === c ? "bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)]" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {c === "monthly" ? "Monthly" : "Annual −20%"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tier cards */}
          <div className="grid sm:grid-cols-3 gap-3" aria-live="polite">
            {computed.map((t) => {
              const isRec = t.id === recommended;
              return (
                <article
                  key={t.id}
                  className={`relative card-surface ring-grad p-5 transition-transform ${isRec ? "scale-[1.02] shadow-[0_30px_80px_-40px_rgba(255,200,1,.35)]" : ""}`}
                  aria-current={isRec ? "true" : undefined}
                >
                  {isRec && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] mono">
                      Best fit
                    </span>
                  )}
                  <h3 className="text-sm font-semibold mono">{t.name}</h3>
                  <p className="mt-3 text-3xl font-semibold mono tabular-nums text-[color:var(--c-forsythia)] transition-[font-size]">
                    {fmtUSD(t.perMonth)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mono">/ month{cycle === "annual" ? " · billed annually" : ""}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {cycle === "annual" ? `${fmtUSD(t.total)} / year total` : `${fmtUSD(t.monthly * 12)} / year`}
                  </p>
                  {!t.fits && (
                    <p className="mt-3 text-[11px] text-destructive">Above {t.maxEvents}M events — upgrade required.</p>
                  )}
                  <dl className="mt-4 text-[11px] text-muted-foreground space-y-1 mono">
                    <div className="flex justify-between"><dt>Included events</dt><dd>{t.includedEvents}M</dd></div>
                    <div className="flex justify-between"><dt>Extra event cost</dt><dd>${t.eventCost.toFixed(2)} / M</dd></div>
                    <div className="flex justify-between"><dt>Included seats</dt><dd>{t.includedSeats}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label, value, min, max, step, onChange, unit,
}: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (n: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="eyebrow">{label}</label>
        <output className="text-2xl mono font-semibold tabular-nums text-[color:var(--c-forsythia)]">
          {value}{unit}
        </output>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full appearance-none h-2 rounded-full bg-foreground/10 focus-ring"
        style={{
          background: `linear-gradient(to right, var(--c-forsythia) 0%, var(--c-saffron) ${pct}%, hsl(0 0% 100% / 0.08) ${pct}%)`,
        }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground mono">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}
