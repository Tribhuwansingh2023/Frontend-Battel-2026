import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import LeadForm from "@/components/site/LeadForm";

export default function ContactPage() {
  return (
    <PageShell eyebrow="// contact" title="Talk to the Armory team.">
      <p className="text-muted-foreground">Tell us about your workflow. We'll route you to a solutions engineer who's shipped agents at your scale.</p>
      <div className="grid md:grid-cols-[1fr_.8fr] gap-8 not-prose">
        <LeadForm />
        <aside className="space-y-5">
          <Info label="Email" value="hello@armory.dev" href="mailto:hello@armory.dev" />
          <Info label="Sales" value="sales@armory.dev" href="mailto:sales@armory.dev" />
          <Info label="Security" value="security@armory.dev" href="mailto:security@armory.dev" />
          <div className="card-surface ring-grad p-5">
            <p className="eyebrow">Office</p>
            <p className="mt-2 text-sm">548 Market St, San Francisco, CA 94104</p>
            <p className="mt-1 text-xs text-muted-foreground">Mon–Fri · 9am–6pm PT</p>
          </div>
          <Link to="/book" className="block text-sm underline underline-offset-4 hover:text-[color:var(--c-forsythia)]">Prefer a call? Book a 30-min intro →</Link>
        </aside>
      </div>
    </PageShell>
  );
}

function Info({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <a href={href} className="mt-1 inline-block text-sm hover:text-[color:var(--c-forsythia)] focus-ring rounded">{value}</a>
    </div>
  );
}
