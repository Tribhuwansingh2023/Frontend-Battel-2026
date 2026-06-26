import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "./Modal";
import { Field, SubmitButton } from "./FormBits";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().max(100).optional().or(z.literal("")),
});

export default function StarterSignupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ name, email, company });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
      setErrors(fe);
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("success");
    toast.success("Welcome to Armory", { description: `Account created for ${parsed.data.email}` });
  }

  function reset() {
    setName(""); setEmail(""); setCompany(""); setErrors({}); setStatus("idle");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={reset}
      title="Start free on Starter"
      description="Spin up your workspace in under a minute. No credit card required."
    >
      {status === "success" ? (
        <div className="text-center py-2">
          <Check />
          <p className="mt-4 font-medium">Account created</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground">{email}</span>.
          </p>
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={reset} className="btn-primary mono text-sm px-4 py-2.5 rounded-lg">
              Done
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="space-y-3.5">
          <Field id="s-name" label="Name" value={name} onChange={setName} error={errors.name} autoComplete="name" placeholder="Ada Lovelace" />
          <Field id="s-email" label="Work email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="you@company.com" />
          <Field id="s-company" label="Company (optional)" value={company} onChange={setCompany} error={errors.company} autoComplete="organization" placeholder="Acme Inc." />
          <SubmitButton loading={status === "loading"} label="Create free account" />
          <p className="text-center text-[11px] mono text-muted-foreground">No card. Cancel anytime.</p>
        </form>
      )}
    </Modal>
  );
}

function Check() {
  return (
    <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-[color:var(--c-forsythia)]/15 text-[color:var(--c-forsythia)] ring-1 ring-[color:var(--c-forsythia)]/40 animate-[reveal_.25s_ease-out_forwards] opacity-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
