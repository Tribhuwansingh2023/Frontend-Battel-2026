import PageShell from "@/components/site/PageShell";
import PricingEstimator from "@/components/site/PricingEstimator";
import Pricing from "@/components/site/Pricing";

export default function PricingPage() {
  return (
    <PageShell eyebrow="// pricing" title="Usage-fair pricing for every stage.">
      <p className="text-muted-foreground">Pick a plan, or model your own usage below. All plans include unlimited seats during trial.</p>
      <div className="not-prose -mx-4">
        <Pricing />
        <PricingEstimator />
      </div>
    </PageShell>
  );
}
