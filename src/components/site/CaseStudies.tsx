/**
 * Case studies list — mirrors the "Proven neural solutions" rows from demo.mp4.
 * Light surface (Arctic Powder) provides a strong palette beat against the dark
 * sections that bookend it.
 */
const studies = [
  {
    id: "0001",
    brand: "Cigna",
    title: "Cigna Smart Health Systems",
    desc: "Revolutionizing patient care through predictive analytics and seamless AI-driven diagnostics integration tools.",
  },
  {
    id: "0002",
    brand: "Aetna",
    title: "Aetna Health Data Ecosystem",
    desc: "An automated Aetna's member data management using secure AI to provide personalized care and clinical insights.",
  },
  {
    id: "0003",
    brand: "Anthem",
    title: "Anthem Neural Care Network",
    desc: "We deployed a custom LLM to automate Anthem's provider relations, reducing ticket latency by eighty-five percent.",
  },
];

export default function CaseStudies() {
  return (
    <section id="cases" className="py-20 sm:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="surface-light p-6 sm:p-10 lg:p-14">
          <header className="grid sm:grid-cols-[1fr_2fr] gap-6 sm:gap-12 items-end">
            <div>
              <p className="eyebrow !text-[color:var(--c-nocturnal)]">// case studies</p>
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl text-[color:var(--c-oceanic)]">
                Proven neural<br />solutions.
              </h2>
              <p className="mt-4 max-w-xl text-[color:var(--c-nocturnal)]/80 text-sm sm:text-base">
                We partner with industry leaders to deploy bespoke AI agents that solve complex operational hurdles and drive measurable growth.
              </p>
            </div>
          </header>

          <ul className="mt-10 divide-y divide-[color:var(--c-nocturnal)]/10 border-t border-b border-[color:var(--c-nocturnal)]/10">
            {studies.map((s) => (
              <li key={s.id}>
                <a
                  href="#"
                  className="group grid grid-cols-12 gap-4 sm:gap-8 items-center py-5 sm:py-7 px-1 sm:px-2 -mx-1 sm:-mx-2 rounded-lg hover:bg-[color:var(--c-mint)]/40 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--c-saffron)]"
                >
                  <span className="col-span-2 sm:col-span-1 mono text-xs text-[color:var(--c-nocturnal)]/60">//{s.id}</span>
                  <span className="col-span-10 sm:col-span-3 text-lg sm:text-xl text-[color:var(--c-oceanic)] font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.brand}
                  </span>
                  <div className="col-span-12 sm:col-span-7">
                    <h3 className="text-base sm:text-lg text-[color:var(--c-oceanic)] font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.title}</h3>
                    <p className="mt-1 text-sm text-[color:var(--c-nocturnal)]/80 max-w-2xl">{s.desc}</p>
                  </div>
                  <span className="col-span-12 sm:col-span-1 justify-self-end text-[color:var(--c-nocturnal)]/60 group-hover:translate-x-1 group-hover:text-[color:var(--c-saffron)] transition-transform duration-150">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-xs mono px-4 py-2.5 rounded-full bg-[color:var(--c-oceanic)] text-[color:var(--c-arctic)] hover:bg-[color:var(--c-nocturnal)] transition-colors focus-ring"
            >
              More projects
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
