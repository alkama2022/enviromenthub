import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "terralens:favorites";
const EVENT_KEY = "terralens:favorites-changed";

function readFavorites(): string[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === "string");
  } catch {
    return [];
  }
}

function writeFavorites(slugs: string[]) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(slugs)]));
    window.dispatchEvent(new Event(EVENT_KEY));
    // Also dispatch storage event for same-tab sync via custom event
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  } catch {
    // quota or private mode - silently ignore
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_KEY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT_KEY, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot() {
  return JSON.stringify(readFavorites());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

/**
 * Hook to access favorite location slugs persisted in localStorage.
 * Designed to gracefully upgrade to Supabase sync when auth is present
 * without breaking anonymous usage.
 */
export function useFavorites() {
  const serialized = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorites: string[] = JSON.parse(serialized);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const toggleFavorite = useCallback((slug: string) => {
    const current = readFavorites();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    writeFavorites(next);
    return next.includes(slug);
  }, []);

  const addFavorite = useCallback((slug: string) => {
    const current = readFavorites();
    if (!current.includes(slug)) writeFavorites([...current, slug]);
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    const current = readFavorites();
    writeFavorites(current.filter((s) => s !== slug));
  }, []);

  const clearFavorites = useCallback(() => writeFavorites([]), []);

  return { favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite, clearFavorites, count: favorites.length };
}

// Non-hook helpers for server/sync contexts
export function getFavorites(): string[] {
  return readFavorites();
}

export function isFavoriteSlug(slug: string): boolean {
  return readFavorites().includes(slug);
}

export function toggleFavoriteSlug(slug: string): boolean {
  const current = readFavorites();
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  writeFavorites(next);
  return next.includes(slug);
}
