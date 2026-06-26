const items = [
  { quote: "Armory integrated with our entire neural stack in five days. We went from prototype to production in a single quarter.", name: "Maya Tran", role: "VP Engineering · Cigna", brand: "cigna" },
  { quote: "The observability alone saved us months of R&D. We finally see exactly how every agent decision is reached.", name: "Daniel Park", role: "Director of AI Ops · Aetna", brand: "aetna" },
  { quote: "Precision in every inference. Armory's guardrails are the only reason we shipped to regulated markets this year.", name: "Priya Shah", role: "Chief Data Officer · Anthem", brand: "Anthem" },
  { quote: "Enterprise-grade by default. SSO, audit logs, DLP — all out of the box. Exactly what procurement asked for.", name: "Léo Martin", role: "CISO · CVS Health", brand: "CVS" },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <p className="eyebrow">// testimonials</p>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Trusted by the <span className="accent-text">pioneers.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">From high-growth startups to enterprise research labs, Armory is the chosen infrastructure for teams building the next era of AI.</p>
        </header>
        <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((t) => (
            <li key={t.name} className="card-surface ring-grad p-6 flex flex-col">
              <p className="eyebrow !text-muted-foreground">// {t.brand}</p>
              <div className="mt-3 flex gap-0.5 text-[color:var(--c-forsythia)]" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>
                ))}
              </div>
              <blockquote className="mt-3 text-sm text-foreground/90 flex-1">“{t.quote}”</blockquote>
              <footer className="mt-5 pt-4 border-t border-foreground/10">
                <p className="text-sm font-semibold mono">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
