import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";

const posts = [
  { slug: "ship-agents", title: "How to ship reliable agents in 2026", date: "Jun 24, 2026", read: "8 min" },
  { slug: "rag-cost", title: "Cutting RAG cost by 64% with smarter caching", date: "Jun 12, 2026", read: "6 min" },
  { slug: "observability", title: "Observability primitives for agent workflows", date: "May 30, 2026", read: "11 min" },
];

export default function ArticlesPage() {
  return (
    <PageShell eyebrow="// writing" title="Articles & engineering notes.">
      <ul className="not-prose mt-6 divide-y divide-foreground/10">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link to="/articles" className="flex items-baseline justify-between gap-6 py-5 group focus-ring rounded">
              <span className="text-lg font-medium group-hover:text-[color:var(--c-forsythia)] transition-colors">{p.title}</span>
              <span className="text-[11px] mono text-muted-foreground whitespace-nowrap">{p.date} · {p.read}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
