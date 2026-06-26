import { useCallback, useEffect, useState } from "react";

const KEY = "armory.trial.v1";

export type Trial = {
  id: string;
  fullName: string;
  email: string;
  company: string;
  teamSize: string;
  startedAt: string; // ISO
  expiresAt: string; // ISO
};

function read(): Trial | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as Trial;
    if (!t.id || !t.expiresAt) return null;
    return t;
  } catch {
    return null;
  }
}

export function generateTrialId() {
  // ARM-XXXX-XXXX-XXXX
  const seg = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `ARM-${seg()}-${seg()}-${seg()}`;
}

export function useTrial() {
  const [trial, setTrial] = useState<Trial | null>(() => read());

  // Keep in sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setTrial(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const start = useCallback(
    (input: Omit<Trial, "id" | "startedAt" | "expiresAt">) => {
      const now = new Date();
      const exp = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const t: Trial = {
        ...input,
        id: generateTrialId(),
        startedAt: now.toISOString(),
        expiresAt: exp.toISOString(),
      };
      localStorage.setItem(KEY, JSON.stringify(t));
      setTrial(t);
      return t;
    },
    []
  );

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setTrial(null);
  }, []);

  return { trial, start, clear };
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export function daysRemaining(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}
