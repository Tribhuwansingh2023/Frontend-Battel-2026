import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "./Modal";
import { Field, SubmitButton, Select, TextArea } from "./FormBits";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(1, "Company is required").max(120),
  size: z.string().min(1, "Select a company size"),
  country: z.string().trim().min(2, "Country is required").max(80),
  message: z.string().trim().min(10, "Tell us a bit more (min. 10 chars)").max(1000),
});

const SIZES = ["1–50", "51–250", "251–1000", "1001–5000", "5000+"];

export default function EnterpriseContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ name, email, company, size, country, message });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) fe[String(i.path[0])] = i.message;
      setErrors(fe);
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    toast.success("Request sent", { description: "Our Enterprise team will contact you within 24 hours." });
  }

  function reset() {
    setName(""); setEmail(""); setCompany(""); setSize(""); setCountry(""); setMessage("");
    setErrors({}); setStatus("idle");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={reset}
      title="Talk to our Enterprise team"
      description="Custom volume, dedicated VPC, SSO, audit & DLP. White-glove onboarding."
      size="lg"
    >
      {status === "success" ? (
        <div className="text-center py-3">
          <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-[color:var(--c-forsythia)]/15 text-[color:var(--c-forsythia)] ring-1 ring-[color:var(--c-forsythia)]/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 font-medium">Our Enterprise team will contact you within 24 hours.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll reach out to <span className="text-foreground">{email}</span>.
          </p>
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={reset} className="btn-primary mono text-sm px-4 py-2.5 rounded-lg">
              Done
            </button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field id="e-name" label="Name" value={name} onChange={setName} error={errors.name} autoComplete="name" placeholder="Ada Lovelace" />
            <Field id="e-email" label="Work email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="you@company.com" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field id="e-company" label="Company" value={company} onChange={setCompany} error={errors.company} autoComplete="organization" placeholder="Acme Inc." />
            <Select id="e-size" label="Company size" value={size} onChange={setSize} error={errors.size} options={SIZES} placeholder="Select…" />
          </div>
          <Field id="e-country" label="Country" value={country} onChange={setCountry} error={errors.country} autoComplete="country-name" placeholder="United States" />
          <TextArea id="e-message" label="How can we help?" value={message} onChange={setMessage} error={errors.message} placeholder="Use case, scale, compliance needs…" rows={4} />
          <SubmitButton loading={status === "loading"} label="Send to Enterprise team" />
        </form>
      )}
    </Modal>
  );
}
