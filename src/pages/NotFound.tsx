import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    document.title = "404 · Page not found · Armory";
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center px-6 pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 grid-bg" />
        <div className="text-center max-w-lg">
          <p className="eyebrow">// HTTP 404</p>
          <h1 className="mt-3 text-[clamp(5rem,16vw,10rem)] leading-none mono font-semibold accent-text">404</h1>
          <p className="mt-4 text-xl">This route doesn't exist in the armory.</p>
          <p className="mt-2 text-sm text-muted-foreground mono break-all">{location.pathname}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="btn-primary mono inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold focus-ring">← Return home</Link>
            <Link to="/contact" className="btn-ghost mono inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium focus-ring">Report broken link</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
