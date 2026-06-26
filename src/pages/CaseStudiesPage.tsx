import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import CaseStudies from "@/components/site/CaseStudies";
import Testimonials from "@/components/site/Testimonials";
import LogoCloud from "@/components/site/LogoCloud";
import CTA from "@/components/site/CTA";

export default function CaseStudiesPage() {
  useEffect(() => {
    document.title = "Case studies · Armory";
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[color:var(--c-forsythia)] focus:text-[color:var(--c-oceanic)]">Skip to content</a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1 pt-28">
        <section className="container-px mx-auto max-w-7xl pb-6">
          <p className="eyebrow">// case studies</p>
          <h1 className="mt-4 text-4xl sm:text-6xl tracking-tight leading-[1.02] max-w-3xl">
            Customers shipping <span className="accent-text">in production</span>.
          </h1>
          <p className="mt-5 text-muted-foreground text-base max-w-2xl">
            From regulated banks to high-frequency e-commerce — how teams ship faster on Armory.
          </p>
        </section>
        <LogoCloud />
        <CaseStudies />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
