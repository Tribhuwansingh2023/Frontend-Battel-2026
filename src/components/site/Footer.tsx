import { Link } from "react-router-dom";
import Logo from "./Logo";

const cols = [
  { h: "Quick links", l: [
    { label: "Home", to: "/" },
    { label: "Pricing", to: "/pricing" },
    { label: "Projects", to: "/projects" },
    { label: "Articles", to: "/articles" },
  ]},
  { h: "Company", l: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Book a call", to: "/book" },
    { label: "More templates", to: "/templates" },
  ]},
  { h: "Policies", l: [
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Privacy policy", to: "/privacy" },
  ]},
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-foreground/5 overflow-hidden">
      <div className="container-px mx-auto max-w-7xl py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 focus-ring" aria-label="Armory home">
            <span className="text-[color:var(--c-forsythia)]"><Logo size={22} /></span>
            <span className="mono font-semibold tracking-tight">armory</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Weekly insights on automation, AI workflows, and real builds. No fluff — just what works.
          </p>
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("email") as HTMLInputElement);
              if (input?.value) {
                input.value = "";
                (e.currentTarget.querySelector("[data-ok]") as HTMLElement).textContent = "✓ Subscribed";
              }
            }}
          >
            <input
              name="email"
              type="email"
              required
              placeholder="jane@team.com"
              aria-label="Email address"
              className="flex-1 px-3 py-2 rounded-lg bg-foreground/5 border border-foreground/10 focus-ring text-sm mono"
            />
            <button type="submit" className="btn-primary mono px-3 py-2 rounded-lg text-sm font-semibold focus-ring">
              Subscribe
            </button>
            <span data-ok className="sr-only" aria-live="polite" />
          </form>
        </div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <h3 className="eyebrow">{c.h}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {c.l.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="text-foreground/80 hover:text-foreground transition-colors duration-150 focus-ring rounded">{i.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Oversized wordmark */}
      <div className="relative -mt-6 select-none w-full" aria-hidden>
        <div
          className="leading-none tracking-[-0.08em] font-black w-full text-center whitespace-nowrap"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(5rem, 27.5vw, 32rem)",
            lineHeight: 0.82,
            backgroundImage: "linear-gradient(180deg, var(--c-forsythia), var(--c-saffron))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: "scaleX(1.08)",
            transformOrigin: "center",
          }}
        >
          armory
        </div>
      </div>


      <div className="border-t border-foreground/5">
        <div className="container-px mx-auto max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground mono">
          <p>© {new Date().getFullYear()} Armory Labs, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
