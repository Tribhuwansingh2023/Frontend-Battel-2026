import { useState } from "react";
import PageShell from "@/components/site/PageShell";

const SLOTS = ["Mon 10:00", "Mon 14:30", "Tue 09:00", "Tue 16:00", "Wed 11:00", "Thu 13:30", "Fri 09:30"];

export default function BookCallPage() {
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <PageShell eyebrow="// confirmed" title="You're booked.">
        <p>We sent a calendar invite for <strong className="text-[color:var(--c-forsythia)]">{pick}</strong>. Looking forward to the call.</p>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="// book a call" title="Grab 30 minutes with a solutions engineer.">
      <p className="text-muted-foreground">Pick a slot that works — all times are Pacific. We'll confirm by email.</p>
      <div className="not-prose mt-6 grid sm:grid-cols-3 gap-2.5">
        {SLOTS.map((s) => (
          <button
            key={s}
            onClick={() => setPick(s)}
            aria-pressed={pick === s}
            className={`px-4 py-3 rounded-xl text-sm mono focus-ring border transition-colors ${pick === s ? "bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] border-[color:var(--c-forsythia)]" : "border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06]"}`}
          >{s}</button>
        ))}
      </div>
      <button
        disabled={!pick}
        onClick={() => setDone(true)}
        className="not-prose mt-6 btn-primary mono inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >Confirm booking →</button>
    </PageShell>
  );
}
