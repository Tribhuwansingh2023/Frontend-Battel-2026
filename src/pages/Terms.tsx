import PageShell from "@/components/site/PageShell";

export default function TermsPage() {
  return (
    <PageShell eyebrow="// legal" title="Terms & Conditions">
      <p className="text-muted-foreground text-sm">Last updated: June 26, 2026</p>
      <h2 className="text-xl mono mt-8">1. Acceptance</h2>
      <p>By accessing Armory, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>
      <h2 className="text-xl mono mt-6">2. Acceptable use</h2>
      <p>You may not use Armory to violate any law, infringe IP rights, or generate content prohibited by our AUP.</p>
      <h2 className="text-xl mono mt-6">3. Subscription & billing</h2>
      <p>Plans renew automatically. You may cancel at any time from your dashboard.</p>
      <h2 className="text-xl mono mt-6">4. Liability</h2>
      <p>Armory is provided "as is" without warranties beyond those required by law.</p>
    </PageShell>
  );
}
