export default function CTA() {
  return (
    <section id="cta" className="pt-20 sm:pt-28 pb-10">
      <div className="container-px mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl ring-grad card-surface p-10 sm:p-16">
          <div className="absolute -z-10 inset-0 grid-bg opacity-60" aria-hidden />
          <div
            className="absolute -z-10 -top-32 left-1/2 -translate-x-1/2 h-72 w-[700px] max-w-[120vw] rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, var(--c-forsythia), transparent 60%)" }}
            aria-hidden
          />
          <div className="grid lg:grid-cols-[2fr_1fr] gap-10 items-center">
            <div>
              <p className="eyebrow">// get started</p>
              <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
                Get smarter about<br /><span className="accent-text">AI systems.</span>
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">Weekly insights on automation, AI workflows, and real builds. No fluff — just what works.</p>
            </div>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="cta-email" className="eyebrow">your email</label>
              <div className="flex gap-2">
                <input
                  id="cta-email"
                  type="email"
                  required
                  placeholder="jane@team.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 focus-ring placeholder:text-muted-foreground/70 mono text-sm"
                />
                <button type="submit" className="btn-primary mono inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold focus-ring whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">14-day Pro trial · No card required</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
