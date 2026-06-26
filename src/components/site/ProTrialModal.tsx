import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "./Modal";
import { Field, SubmitButton, Select } from "./FormBits";
import { useTrial, formatDate, daysRemaining } from "@/hooks/useTrial";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(1, "Company is required").max(120),
  teamSize: z.string().min(1, "Select a team size"),
});

const TEAM_SIZES = ["1–5", "6–20", "21–100", "101–500", "500+"];

export default function ProTrialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { trial, start } = useTrial();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  // If a trial already exists, show that view.
  if (trial) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="You already have an active trial"
        description="Only one trial per workspace. Pick up where you left off."
      >
        <ActiveTrialView
          trial={trial}
          onGoDashboard={() => {
            onClose();
            navigate("/dashboard");
          }}
        />
      </Modal>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ fullName, email, company, teamSize });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
      setErrors(fe);
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 700));
    const t = start({
      fullName: parsed.data.fullName!,
      email: parsed.data.email!,
      company: parsed.data.company!,
      teamSize: parsed.data.teamSize!,
    });
    setStatus("idle");
    toast.success("14-day trial activated", {
      description: `Expires ${formatDate(t.expiresAt)}`,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start your free 14-day trial"
      description="Full Pro features. No credit card. Cancel anytime."
      size="lg"
    >
      <form noValidate onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field id="p-name" label="Full name" value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="name" placeholder="Ada Lovelace" />
          <Field id="p-email" label="Work email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="you@company.com" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field id="p-company" label="Company" value={company} onChange={setCompany} error={errors.company} autoComplete="organization" placeholder="Acme Inc." />
          <Select id="p-team" label="Team size" value={teamSize} onChange={setTeamSize} error={errors.teamSize} options={TEAM_SIZES} placeholder="Select…" />
        </div>
        <ul className="grid sm:grid-cols-3 gap-2 mt-2 text-[11px] mono text-muted-foreground">
          <li className="px-3 py-2 rounded-md border border-foreground/10 bg-foreground/[.03]">✓ Unlimited agents</li>
          <li className="px-3 py-2 rounded-md border border-foreground/10 bg-foreground/[.03]">✓ 500M events / mo</li>
          <li className="px-3 py-2 rounded-md border border-foreground/10 bg-foreground/[.03]">✓ Priority support</li>
        </ul>
        <SubmitButton loading={status === "loading"} label="Activate 14-day trial" />
        <p className="text-center text-[11px] mono text-muted-foreground">
          By continuing you agree to the Terms and Acceptable Use Policy.
        </p>
      </form>
    </Modal>
  );
}

function ActiveTrialView({
  trial,
  onGoDashboard,
}: {
  trial: ReturnType<typeof useTrial>["trial"] extends infer T ? Exclude<T, null> : never;
  onGoDashboard: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const days = daysRemaining(trial.expiresAt);

  async function copy() {
    try {
      await navigator.clipboard.writeText(trial.id);
      setCopied(true);
      toast.success("Trial ID copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[color:var(--c-forsythia)]/30 bg-[color:var(--c-forsythia)]/[.06] p-4">
        <p className="text-sm">
          Your 14-day free trial has been activated.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Trial expires on <span className="text-foreground mono">{formatDate(trial.expiresAt)}</span> ·{" "}
          <span className="text-foreground">{days}</span> day{days === 1 ? "" : "s"} remaining
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Row label="Trial ID" value={<span className="mono">{trial.id}</span>} />
        <Row label="Plan" value="Pro · monthly" />
        <Row label="Started" value={formatDate(trial.startedAt)} />
        <Row label="Expires" value={formatDate(trial.expiresAt)} />
        <Row label="Workspace" value={trial.company} />
        <Row label="Owner" value={trial.email} />
      </dl>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={copy}
          className="btn-ghost mono text-sm px-4 py-2.5 rounded-lg inline-flex items-center justify-center gap-2"
        >
          {copied ? "Copied ✓" : "Copy Trial ID"}
        </button>
        <button
          type="button"
          onClick={onGoDashboard}
          className="btn-primary mono text-sm px-4 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 flex-1"
        >
          Go to Dashboard
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-foreground/10 bg-foreground/[.02] px-3 py-2.5">
      <dt className="text-[10px] mono uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm truncate">{value}</dd>
    </div>
  );
}
