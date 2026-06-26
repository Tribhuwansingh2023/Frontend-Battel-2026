import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";

const templates = [
  { name: "Fraud triage", desc: "Score events, route to humans on risk > 0.7." },
  { name: "Lead enrichment", desc: "Clearbit + LinkedIn + CRM in one workflow." },
  { name: "Support copilot", desc: "Classify, draft, and hand off to agents." },
  { name: "Doc Q&A", desc: "RAG over your knowledge base with citations." },
  { name: "Code review", desc: "Lint + summarize PRs for reviewers." },
  { name: "Churn radar", desc: "Detect at-risk accounts before they leave." },
];

export default function TemplatesPage() {
  return (
    <PageShell eyebrow="// templates" title="Start from a battle-tested workflow.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 not-prose mt-6">
        {templates.map((t) => (
          <Link key={t.name} to="/projects" className="card-surface ring-grad p-5 group focus-ring rounded-2xl">
            <h2 className="text-lg font-semibold mono group-hover:text-[color:var(--c-forsythia)] transition-colors">{t.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
