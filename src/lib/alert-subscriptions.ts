import { useSyncExternalStore, useCallback } from "react";

const KEY = "terralens:alert-subscriptions";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(slugs)]));
    window.dispatchEvent(new Event("terralens:alerts-changed"));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  } catch {
    // ignore
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("terralens:alerts-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("terralens:alerts-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

const snap = () => JSON.stringify(read());
const serverSnap = () => JSON.stringify([]);

export function useAlertSubscriptions() {
  const serialized = useSyncExternalStore(subscribe, snap, serverSnap);
  const subs: string[] = JSON.parse(serialized);
  const isSubscribed = useCallback((slug: string) => subs.includes(slug), [subs]);
  const toggle = useCallback((slug: string) => {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    write(next);
    return next.includes(slug);
  }, []);
  return { subs, isSubscribed, toggle, count: subs.length };
}
