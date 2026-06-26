import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";

const projects = [
  { slug: "stripe-radar", name: "Stripe Radar", blurb: "Fraud signals enriched in 38ms p99.", tag: "Fintech" },
  { slug: "vercel-edge", name: "Vercel Edge", blurb: "Personalization agents at the edge.", tag: "Infra" },
  { slug: "linear-flow", name: "Linear Flow", blurb: "Auto-triage 22k issues / week.", tag: "Productivity" },
  { slug: "openai-ops", name: "OpenAI Ops", blurb: "Cost-aware model routing.", tag: "AI" },
];

export default function ProjectsPage() {
  return (
    <PageShell eyebrow="// projects" title="What teams ship with Armory.">
      <div className="grid sm:grid-cols-2 gap-4 not-prose mt-6">
        {projects.map((p) => (
          <Link key={p.slug} to="/articles" className="card-surface ring-grad p-5 group focus-ring rounded-2xl">
            <p className="eyebrow">{p.tag}</p>
            <h2 className="mt-2 text-xl font-semibold mono group-hover:text-[color:var(--c-forsythia)] transition-colors">{p.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs mono text-[color:var(--c-forsythia)]">Read case study →</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
