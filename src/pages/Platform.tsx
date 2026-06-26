import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ScrollProgress from "@/components/site/ScrollProgress";
import Bento from "@/components/site/Bento";
import Metrics from "@/components/site/Metrics";
import LogoCloud from "@/components/site/LogoCloud";
import CTA from "@/components/site/CTA";

export default function Platform() {
  useEffect(() => {
    document.title = "Platform · Armory";
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[color:var(--c-forsythia)] focus:text-[color:var(--c-oceanic)]">Skip to content</a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1 pt-28">
        <section className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-forsythia)", opacity: 0.08 }} />
            <div className="absolute -bottom-32 -right-24 h-[24rem] w-[24rem] rounded-full blur-3xl" style={{ background: "var(--c-saffron)", opacity: 0.06 }} />
          </div>
          <div className="container-px mx-auto max-w-7xl pb-16">
            <p className="eyebrow">// platform</p>
            <h1 className="mt-4 text-4xl sm:text-6xl tracking-tight leading-[1.02] max-w-3xl">
              The complete <span className="accent-text">agentic data platform</span>.
            </h1>
            <p className="mt-5 text-muted-foreground text-base max-w-2xl">
              Eleven first-party primitives that compose into anything from a single workflow to a petabyte-scale data mesh — governed end-to-end.
            </p>
            <dl className="mt-10 grid sm:grid-cols-4 gap-3 text-sm">
              {[
                ["Connectors", "300+"],
                ["Median latency", "47 ms"],
                ["Event throughput", "8.2B / day"],
                ["Compliance", "SOC2 · ISO · HIPAA"],
              ].map(([k, v]) => (
                <div key={k} className="card-surface ring-grad p-4 rounded-xl">
                  <dt className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-lg font-semibold mono text-[color:var(--c-forsythia)]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <Metrics />
        <Bento />
        <LogoCloud />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
