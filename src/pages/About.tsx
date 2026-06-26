import PageShell from "@/components/site/PageShell";

export default function AboutPage() {
  return (
    <PageShell eyebrow="// about" title="We build the armory for the agentic web.">
      <p>Armory was founded in 2023 by a team of infrastructure engineers from Stripe, Vercel, and Anthropic. We believe production AI deserves the same rigor as production payments.</p>
      <p className="text-muted-foreground">Today we power agent workflows for over 4,000 teams across fintech, logistics, and consumer software — processing more than 12B events per month with a 99.99% SLA.</p>
      <div className="grid sm:grid-cols-3 gap-4 not-prose mt-8">
        {[
          { k: "2023", l: "Founded" },
          { k: "$28M", l: "Series A · Sequoia" },
          { k: "42", l: "Engineers · 11 countries" },
        ].map((s) => (
          <div key={s.k} className="card-surface ring-grad p-5">
            <div className="text-3xl mono font-semibold text-[color:var(--c-forsythia)]">{s.k}</div>
            <div className="mt-1 text-xs text-muted-foreground mono">{s.l}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
