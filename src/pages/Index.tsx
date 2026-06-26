import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import LogoCloud from "@/components/site/LogoCloud";
import CaseStudies from "@/components/site/CaseStudies";
import Metrics from "@/components/site/Metrics";
import Bento from "@/components/site/Bento";
import Playground from "@/components/site/Playground";
import Pricing from "@/components/site/Pricing";
import PricingEstimator from "@/components/site/PricingEstimator";
import Testimonials from "@/components/site/Testimonials";
import FAQ from "@/components/site/FAQ";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[color:var(--c-forsythia)] focus:text-[color:var(--c-oceanic)]">Skip to content</a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <LogoCloud />
        <CaseStudies />
        <Bento />
        <Playground />
        <Metrics />
        <Pricing />
        <PricingEstimator />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
