import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";

export default function PageShell({
  title, eyebrow, children,
}: { title: string; eyebrow?: string; children: ReactNode }) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · Armory`;
    return () => { document.title = prev; };
  }, [title]);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[color:var(--c-forsythia)] focus:text-[color:var(--c-oceanic)]">Skip to content</a>
      <ScrollProgress />
      <Navbar />
      <main id="main" className="flex-1 pt-28 pb-20">
        <div className="container-px mx-auto max-w-4xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl sm:text-5xl tracking-tight">{title}</h1>
          <div className="mt-8 text-foreground/85 leading-relaxed space-y-5">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
