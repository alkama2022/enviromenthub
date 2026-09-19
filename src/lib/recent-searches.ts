import { useSyncExternalStore, useCallback } from "react";

const KEY = "terralens:recent-searches";
const MAX = 8;

function read(): string[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(values: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(values.slice(0, MAX)));
    window.dispatchEvent(new Event("terralens:recent-changed"));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  } catch {
    // ignore
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("terralens:recent-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("terralens:recent-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

const snap = () => JSON.stringify(read());
const serverSnap = () => JSON.stringify([]);

export function useRecentSearches() {
  const serialized = useSyncExternalStore(subscribe, snap, serverSnap);
  const recent: string[] = JSON.parse(serialized);
  const push = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) return;
    const cur = read();
    const next = [trimmed, ...cur.filter((v) => v.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX);
    write(next);
  }, []);
  const clear = useCallback(() => write([]), []);
  return { recent, push, clear };
}

export function pushRecentSearch(q: string) {
  const trimmed = q.trim();
  if (!trimmed || trimmed.length < 2) return;
  const cur = read();
  const next = [trimmed, ...cur.filter((v) => v.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX);
  write(next);
}
