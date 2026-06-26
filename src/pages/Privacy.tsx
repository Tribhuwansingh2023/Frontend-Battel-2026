import PageShell from "@/components/site/PageShell";

export default function PrivacyPage() {
  return (
    <PageShell eyebrow="// legal" title="Privacy Policy">
      <p className="text-muted-foreground text-sm">Last updated: June 26, 2026</p>
      <h2 className="text-xl mono mt-8">Data we collect</h2>
      <p>Account information you provide, usage events, and minimal telemetry. We never sell personal data.</p>
      <h2 className="text-xl mono mt-6">How we use it</h2>
      <p>To operate, secure, and improve Armory; to bill you; and to communicate updates you opted in to receive.</p>
      <h2 className="text-xl mono mt-6">Your rights</h2>
      <p>Access, export, or deletion requests: <a className="underline" href="mailto:privacy@armory.dev">privacy@armory.dev</a>.</p>
    </PageShell>
  );
}
