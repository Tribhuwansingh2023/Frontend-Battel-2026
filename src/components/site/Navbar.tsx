import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SignInDrawer from "./SignInDrawer";

const links = [
  { href: "/platform", label: "Platform" },
  { href: "/playground", label: "Playground" },
  { href: "/cases", label: "Case studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const renderLink = (l: { href: string; label: string }) => {
    const isHash = l.href.startsWith("/#");
    return isHash
      ? <a href={l.href} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 focus-ring">{l.label}</a>
      : <Link to={l.href} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-150 focus-ring">{l.label}</Link>;
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ease-out ${scrolled ? "py-2" : "py-4"}`}>
      <div className="container-px mx-auto max-w-7xl">
        <nav
          aria-label="Primary"
          className={`glass ring-grad rounded-2xl flex items-center justify-between gap-4 px-3 sm:px-5 h-14 transition-shadow duration-200 ${scrolled ? "shadow-[0_10px_40px_-20px_rgba(0,0,0,.7)]" : ""}`}
        >
          <Link to="/" className="flex items-center gap-2 focus-ring px-1" aria-label="Armory home">
            <span className="text-[color:var(--c-forsythia)]"><Logo size={22} /></span>
            <span className="mono font-semibold tracking-tight text-[15px]">armory</span>
          </Link>

          <ul className="hidden md:flex items-center gap-1 text-sm">
            {links.map((l) => <li key={l.href}>{renderLink(l)}</li>)}
          </ul>

          <div className="flex items-center gap-2">
            <button
              data-tour="cmdk"
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }))}
              aria-label="Open command palette"
              className="hidden lg:inline-flex items-center gap-2 text-xs mono px-2.5 py-1.5 rounded-lg border border-foreground/10 bg-foreground/[.03] text-muted-foreground hover:text-foreground hover:bg-foreground/[.06] transition-colors focus-ring"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Search
            </button>

            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:inline-flex text-sm px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors focus-ring">Dashboard</Link>
                <button
                  onClick={async () => {
                    await signOut();
                    toast.success("Signed out");
                    navigate(pathname.startsWith("/dashboard") || pathname.startsWith("/account") ? "/" : pathname, { replace: true });
                  }}
                  className="btn-primary inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg focus-ring mono"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setSignInOpen(true)} className="hidden sm:inline-flex text-sm px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors focus-ring">Sign in</button>
                <Link to="/signup" className="btn-primary inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg focus-ring mono">
                  Get started
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg btn-ghost focus-ring"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </nav>

        {open && (
          <div id="mobile-menu" className="md:hidden mt-2 glass ring-grad rounded-2xl p-2">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("/#")
                    ? <a onClick={() => setOpen(false)} href={l.href} className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5">{l.label}</a>
                    : <Link onClick={() => setOpen(false)} to={l.href} className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5">{l.label}</Link>}
                </li>
              ))}
              <li className="pt-1">
                <Link onClick={() => setOpen(false)} to="/contact" className="btn-primary block text-center text-sm font-semibold px-3.5 py-2.5 rounded-lg mono">Get started</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
      <SignInDrawer open={signInOpen} onOpenChange={setSignInOpen} />
    </header>
  );
}
