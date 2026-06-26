import { useState } from "react";

const items = [
  { q: "Who is Armory designed for?", a: "Armory is built for engineering, data, and ML teams shipping production AI agents — from scrappy startups to Fortune 100 enterprises." },
  { q: "Does Armory provide pre-built agents?", a: "Yes. We ship 40+ blueprint agents covering data ingestion, transformation, observability, and customer-facing copilots — all customizable." },
  { q: "How does it differ from a standard chatbot?", a: "Armory orchestrates multi-step autonomous workflows with guardrails, audit logs and rollbacks — not single-turn chat." },
  { q: "Can I use my own custom domain?", a: "Yes. Bring a custom domain, configure SSO, and enforce SCIM provisioning on every plan above Starter." },
  { q: "Is there a limit to how many agents I can build?", a: "Starter caps at 5; Pro and Enterprise are unlimited. Volume pricing applies past 500M events / month." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number>(0);
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
          <header className="sticky top-28 self-start">
            <p className="eyebrow">// faq</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">Common <br /><span className="accent-text">inquiries.</span></h2>
            <p className="mt-4 text-muted-foreground max-w-sm">Everything you need to know about deploying, scaling, and securing your AI workflows with Armory.</p>
            <a href="#cta" className="mt-6 inline-flex items-center gap-2 text-xs mono px-4 py-2.5 rounded-full bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] hover:brightness-105 transition focus-ring">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Contact us
            </a>
          </header>

          <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <li key={it.q}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left focus-ring"
                  >
                    <span className="text-base sm:text-lg font-medium mono">{it.q}</span>
                    <span className={`shrink-0 h-8 w-8 rounded-full grid place-items-center border border-foreground/10 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-45 bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] border-transparent" : ""}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 text-sm text-muted-foreground max-w-xl">{it.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
