import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name too long"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password too long"),
});

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function SignUp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => { document.title = "Sign up · Armory"; }, []);
  useEffect(() => { if (user) navigate("/dashboard", { replace: true }); }, [user, navigate]);

  const strength = passwordStrength(password);
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][strength];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const key = i.path[0] as string;
        if (!fe[key]) fe[key] = i.message;
      }
      setErrors(fe);
      setStatus("error");
      return;
    }

    setStatus("loading");
    const { error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.fullName },
      },
    });

    if (err) {
      const msg = err.message.toLowerCase().includes("already registered") || err.message.toLowerCase().includes("already been registered")
        ? "An account with this email already exists."
        : err.message;
      setSubmitError(msg);
      setStatus("error");
      toast.error("Sign up failed", { description: msg });
      return;
    }

    setStatus("ok");
    toast.success("Account created", { description: "Check your inbox to confirm your email." });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-forsythia)", opacity: 0.08 }} />
          <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-saffron)", opacity: 0.06 }} />
        </div>

        <div className="container-px mx-auto max-w-md">
          <div className="text-center">
            <p className="eyebrow">// access</p>
            <h1 className="mt-3 text-4xl sm:text-5xl tracking-tight">
              Create your <span className="accent-text">workspace.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Start orchestrating in under a minute.</p>
          </div>

          <div className="mt-10 card-surface ring-grad rounded-2xl p-6 sm:p-7">
            {status === "ok" ? (
              <div className="text-center py-6">
                <div className="mx-auto h-10 w-10 rounded-full grid place-items-center border border-[color:var(--c-forsythia)]/30 bg-[color:var(--c-forsythia)]/10 text-[color:var(--c-forsythia)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6l8 8 8-8M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 className="mt-4 mono text-lg font-semibold">Check your inbox</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We sent a confirmation link to <span className="text-foreground">{email}</span>.
                </p>
                <Link to="/signin" className="btn-primary mono inline-flex mt-5 px-4 py-2 rounded-lg text-sm font-semibold">Back to sign in</Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <FormField id="name" label="Full name" type="text" autoComplete="name" value={fullName} onChange={setFullName} error={errors.fullName} placeholder="Ada Lovelace" />
                <FormField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} error={errors.email} placeholder="you@company.com" />

                <div>
                  <label htmlFor="password" className="block text-xs mono text-muted-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      placeholder="At least 8 characters"
                      className={`w-full px-3 py-2.5 pr-12 rounded-lg bg-foreground/[.03] border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${errors.password ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                    />
                    <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-[10px] mono text-muted-foreground hover:text-foreground rounded-md focus-ring">
                      {show ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-4 gap-1">
                        {[0,1,2,3].map(i => (
                          <span key={i} className="h-1 rounded-full transition-colors" style={{
                            background: i < strength
                              ? (strength <= 1 ? "hsl(0 70% 55%)" : strength === 2 ? "var(--c-saffron)" : "var(--c-forsythia)")
                              : "hsl(var(--foreground) / .1)",
                          }} />
                        ))}
                      </div>
                      <span className="text-[10px] mono text-muted-foreground w-16 text-right">{strengthLabel}</span>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{errors.password}</p>}
                </div>

                {submitError && (
                  <div role="alert" className="rounded-lg border border-[color:var(--c-saffron)]/30 bg-[color:var(--c-saffron)]/5 px-3 py-2 text-xs text-[color:var(--c-saffron)]">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg focus-ring mono disabled:opacity-60"
                >
                  {status === "loading" && <Spinner />}
                  {status === "loading" ? "Creating…" : "Create account"}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-[color:var(--c-forsythia)] hover:underline">Sign in</Link>
                </p>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] mono text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="hover:text-foreground">Terms</Link> and <Link to="/privacy" className="hover:text-foreground">Privacy</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FormField({ id, label, type, value, onChange, error, placeholder, autoComplete }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs mono text-muted-foreground mb-1.5">{label}</label>
      <input
        id={id} type={type} autoComplete={autoComplete} required
        value={value} onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error} placeholder={placeholder}
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
