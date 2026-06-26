import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => { document.title = "Sign in · Armory"; }, []);
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, from, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setUnconfirmed(false);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fe: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "email" | "password";
        if (!fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      setStatus("error");
      return;
    }

    setStatus("loading");
    const { error: err } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("not verified") || msg.includes("confirm")) {
        setUnconfirmed(true);
        setError("Please confirm your email to continue.");
      } else if (msg.includes("invalid login")) {
        setError("Email or password is incorrect.");
      } else {
        setError(err.message);
      }
      setStatus("error");
      toast.error("Sign in failed");
      return;
    }

    toast.success("Signed in");
  }

  async function resendVerification() {
    if (!email) {
      setFieldErrors({ email: "Enter your email above first" });
      return;
    }
    setResending(true);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setResending(false);
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Verification email sent", { description: `Check ${email}` });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[color:var(--c-forsythia)] focus:text-[color:var(--c-oceanic)]">Skip to content</a>
      <Navbar />
      <main id="main" className="flex-1 pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-forsythia)", opacity: 0.08 }} />
          <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-saffron)", opacity: 0.06 }} />
        </div>

        <div className="container-px mx-auto max-w-md">
          <div className="text-center">
            <p className="eyebrow">// access</p>
            <h1 className="mt-3 text-4xl sm:text-5xl tracking-tight">
              Welcome <span className="accent-text">back.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Sign in to your Armory workspace.</p>
          </div>

          <div className="mt-10 card-surface ring-grad rounded-2xl p-6 sm:p-7">
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <Field
                id="email" label="Email" type="email" autoComplete="email"
                value={email} onChange={setEmail} error={fieldErrors.email}
                placeholder="you@company.com"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs mono text-muted-foreground">Password</label>
                  <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-[color:var(--c-forsythia)] transition-colors">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!fieldErrors.password}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2.5 pr-12 rounded-lg bg-foreground/[.03] border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${fieldErrors.password ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-[10px] mono text-muted-foreground hover:text-foreground rounded-md focus-ring"
                  >
                    {show ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{fieldErrors.password}</p>}
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-[color:var(--c-saffron)]/30 bg-[color:var(--c-saffron)]/5 px-3 py-2 text-xs text-[color:var(--c-saffron)]">
                  {error}
                  {unconfirmed && (
                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={resending}
                      className="block mt-1.5 text-foreground underline underline-offset-2 hover:text-[color:var(--c-forsythia)] disabled:opacity-60"
                    >
                      {resending ? "Sending…" : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg focus-ring mono disabled:opacity-60"
              >
                {status === "loading" && <Spinner />}
                {status === "loading" ? "Signing in…" : "Sign in"}
                {status !== "loading" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                New to Armory?{" "}
                <Link to="/signup" className="text-[color:var(--c-forsythia)] hover:underline">Create an account</Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] mono text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="hover:text-foreground">Terms</Link> and{" "}
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  id, label, type, value, onChange, error, placeholder, autoComplete,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs mono text-muted-foreground mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${error ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
      />
      {error && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
