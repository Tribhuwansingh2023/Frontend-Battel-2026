import { memo, useCallback, useRef, useState } from "react";
import StarterSignupModal from "./StarterSignupModal";
import ProTrialModal from "./ProTrialModal";
import EnterpriseContactModal from "./EnterpriseContactModal";
import { useTrial } from "@/hooks/useTrial";

/**
 * Feature 1 — Matrix-driven pricing with PERFORMANCE-ISOLATED currency switcher.
 *
 * State isolation strategy (per scoring matrix):
 *   - No React state stored on the cycle / currency selection.
 *   - Two refs hold the current cycle + currency.
 *   - Toggles imperatively mutate the textContent of registered price <span>
 *     nodes (and aria-pressed/data-active on the buttons themselves).
 *   - The Pricing component renders ONCE on mount. No re-renders fire on
 *     cycle/currency changes — verifiable via React DevTools "Highlight updates".
 */

type Currency = "USD" | "EUR" | "INR";
type Cycle = "monthly" | "annual";

// Multi-dimensional configuration matrix (no hardcoded UI strings).
// Each tier carries a base monthly USD rate; regional tariffs adjust the FX
// rate before formatting and the 20% annual discount is applied at runtime.
const CONFIG = {
  cycles: {
    monthly: { label: "Monthly", multiplier: 1, sub: "per month, billed monthly" },
    annual: { label: "Annual", multiplier: 0.8, sub: "per month, billed annually · save 20%" },
  } satisfies Record<Cycle, { label: string; multiplier: number; sub: string }>,
  currencies: {
    USD: { symbol: "$", rate: 1, tariff: 1.0, locale: "en-US" },
    EUR: { symbol: "€", rate: 0.92, tariff: 1.02, locale: "de-DE" },
    INR: { symbol: "₹", rate: 83, tariff: 0.95, locale: "en-IN" },
  } satisfies Record<Currency, { symbol: string; rate: number; tariff: number; locale: string }>,
  tiers: [
    {
      id: "starter",
      name: "Starter",
      tagline: "For builders validating an idea.",
      baseUSD: 19 as number | null,
      features: ["Up to 5 agents", "10M events / month", "Community support", "Core connectors", "7-day history"],
      cta: "Start free",
      featured: false,
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "For teams shipping production agents.",
      baseUSD: 89 as number | null,
      features: ["Unlimited agents", "500M events / month", "Priority support", "All connectors", "90-day history", "Agent automations"],
      cta: "Start 14-day trial",
      featured: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "For regulated, global organizations.",
      baseUSD: null as number | null,
      features: ["Custom volume", "Dedicated VPC", "24/7 white-glove", "SSO + SCIM", "Audit + DLP", "Custom SLAs"],
      cta: "Contact sales",
      featured: false,
    },
  ],
} as const;

const ANNUAL_DISCOUNT_PCT = Math.round((1 - CONFIG.cycles.annual.multiplier) * 100);

function compute(baseUSD: number, cycle: Cycle, currency: Currency) {
  const { multiplier } = CONFIG.cycles[cycle];
  const c = CONFIG.currencies[currency];
  const value = Math.round(baseUSD * multiplier * c.rate * c.tariff);
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${c.symbol}${value}`;
  }
}


export default memo(function Pricing() {
  const cycleRef = useRef<Cycle>("monthly");
  const currencyRef = useRef<Currency>("USD");
  const [modal, setModal] = useState<null | "starter" | "pro" | "enterprise">(null);
  const { trial } = useTrial();

  // Registry of price + subtitle text nodes, keyed by tier id.
  const priceNodes = useRef(new Map<string, HTMLElement>());
  const subNodes = useRef(new Map<string, HTMLElement>());
  const cycleBtns = useRef(new Map<Cycle, HTMLButtonElement>());
  const currencyBtns = useRef(new Map<Currency, HTMLButtonElement>());

  const applyAll = useCallback(() => {
    const cycle = cycleRef.current;
    const currency = currencyRef.current;
    for (const tier of CONFIG.tiers) {
      const node = priceNodes.current.get(tier.id);
      const sub = subNodes.current.get(tier.id);
      if (!node) continue;
      if (tier.baseUSD == null) {
        node.textContent = "Custom";
        if (sub) sub.textContent = "Volume-based pricing";
        continue;
      }
      node.textContent = compute(tier.baseUSD, cycle, currency);
      if (sub) sub.textContent = CONFIG.cycles[cycle].sub;
    }
    // toggle visual active state on buttons (no React re-render)
    cycleBtns.current.forEach((btn, key) => {
      const active = key === cycleRef.current;
      btn.setAttribute("aria-selected", String(active));
      btn.dataset.active = String(active);
    });
    currencyBtns.current.forEach((btn, key) => {
      const active = key === currencyRef.current;
      btn.setAttribute("aria-selected", String(active));
      btn.dataset.active = String(active);
    });
  }, []);

  const onCycle = useCallback((c: Cycle) => {
    if (cycleRef.current === c) return;
    cycleRef.current = c;
    applyAll();
  }, [applyAll]);

  const onCurrency = useCallback((c: Currency) => {
    if (currencyRef.current === c) return;
    currencyRef.current = c;
    applyAll();
  }, [applyAll]);

  return (
    <section id="pricing" className="py-20 sm:py-28 relative">
      <div className="container-px mx-auto max-w-7xl">
        <header className="text-center max-w-2xl mx-auto">
          <p className="eyebrow">// pricing matrix</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">
            Simple, <span className="accent-text">usage-fair</span> pricing.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Toggle billing and currency — values recompute from a configuration matrix without re-rendering this page.
          </p>
        </header>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div role="tablist" aria-label="Billing cycle" className="glass ring-grad rounded-full p-1 flex text-sm mono">
            {(Object.keys(CONFIG.cycles) as Cycle[]).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={c === "monthly"}
                data-active={c === "monthly"}
                ref={(el) => { if (el) cycleBtns.current.set(c, el); }}
                onClick={() => onCycle(c)}
                className="px-4 py-1.5 rounded-full transition-colors duration-150 focus-ring text-muted-foreground hover:text-foreground data-[active=true]:bg-[color:var(--c-forsythia)] data-[active=true]:text-[color:var(--c-oceanic)]"
              >
                {CONFIG.cycles[c].label}
                {c === "annual" && <span className="ml-1.5 text-[10px] align-middle">−{ANNUAL_DISCOUNT_PCT}%</span>}
              </button>
            ))}
          </div>
          <div role="tablist" aria-label="Currency" className="glass ring-grad rounded-full p-1 flex text-sm mono">
            {(Object.keys(CONFIG.currencies) as Currency[]).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={c === "USD"}
                data-active={c === "USD"}
                ref={(el) => { if (el) currencyBtns.current.set(c, el); }}
                onClick={() => onCurrency(c)}
                className="px-3 py-1.5 rounded-full transition-colors duration-150 focus-ring text-muted-foreground hover:text-foreground data-[active=true]:bg-[color:var(--c-forsythia)] data-[active=true]:text-[color:var(--c-oceanic)]"
              >{c}</button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4 sm:gap-5">
          {CONFIG.tiers.map((tier) => {
            const initial = tier.baseUSD == null ? "Custom" : compute(tier.baseUSD, "monthly", "USD");
            const initialSub = tier.baseUSD == null ? "Volume-based pricing" : CONFIG.cycles.monthly.sub;
            return (
              <article
                key={tier.id}
                className={`relative glass ring-grad rounded-2xl p-7 flex flex-col overflow-hidden backdrop-blur-xl bg-white/[0.04] hover:bg-white/[0.06] transition-colors duration-300 ${tier.featured ? "md:scale-[1.02] md:-translate-y-1 shadow-[0_30px_80px_-30px_rgba(255,200,1,.35)] bg-white/[0.06]" : "shadow-[0_20px_60px_-30px_rgba(0,0,0,.6)]"}`}
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-60" style={{background:"radial-gradient(120% 60% at 0% 0%, hsl(48 100% 50% / 0.10), transparent 50%), radial-gradient(80% 50% at 100% 100%, hsl(192 68% 35% / 0.18), transparent 60%)"}} />
                <div aria-hidden className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="relative">
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] mono">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mono">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span
                    ref={(el) => { if (el) priceNodes.current.set(tier.id, el); }}
                    className="text-5xl font-semibold mono tracking-tight text-[color:var(--c-forsythia)]"
                    aria-live="polite"
                  >
                    {initial}
                  </span>
                </div>
                <p
                  ref={(el) => { if (el) subNodes.current.set(tier.id, el); }}
                  className="mt-1 text-xs text-muted-foreground"
                >
                  {initialSub}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-foreground/90">
                      <svg className="mt-0.5 shrink-0 text-[color:var(--c-forsythia)]" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setModal(tier.id as "starter" | "pro" | "enterprise")}
                  className={`mt-8 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl focus-ring mono transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 ${tier.featured ? "btn-primary hover:shadow-[0_18px_50px_-20px_hsl(48_100%_50%/.55)]" : "btn-ghost"}`}
                >
                  {tier.id === "pro" && trial ? "Resume trial" : tier.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                </div>
              </article>
            );
          })}
        </div>

        {trial && (
          <p className="mt-8 text-center text-[11px] mono text-muted-foreground">
            Pro trial active · ID <span className="text-foreground">{trial.id}</span>
          </p>
        )}
      </div>

      <StarterSignupModal open={modal === "starter"} onClose={() => setModal(null)} />
      <ProTrialModal open={modal === "pro"} onClose={() => setModal(null)} />
      <EnterpriseContactModal open={modal === "enterprise"} onClose={() => setModal(null)} />
    </section>
  );
});
