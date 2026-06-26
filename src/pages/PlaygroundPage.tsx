import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import Playground from "@/components/site/Playground";
import CTA from "@/components/site/CTA";

export default function PlaygroundPage() {
  useEffect(() => {
    document.title = "Playground · Armory";
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[color:var(--c-forsythia)] focus:text-[color:var(--c-oceanic)]">Skip to content</a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1 pt-28">
        <section className="container-px mx-auto max-w-7xl pb-6">
          <p className="eyebrow">// playground</p>
          <h1 className="mt-4 text-4xl sm:text-6xl tracking-tight leading-[1.02] text-justify">
            Try Armory in <span className="accent-text">your browser</span>.
          </h1>
          <p className="mt-5 text-muted-foreground text-base text-justify">
            Wire connectors, run an agent, watch traces stream in real time. No signup, no install.
          </p>
        </section>
        <Playground />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
