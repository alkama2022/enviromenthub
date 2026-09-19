import { LOCATIONS, type LocationProfile } from "./locations";

/**
 * Fuzzy search with simple scoring:
 * - exact prefix match gets highest score
 * - substring match gets medium
 * - state match gets bonus
 * - tagline/overall heuristic
 */
function scoreLocation(loc: LocationProfile, q: string): number {
  const query = q.toLowerCase().trim();
  if (!query) return 0;
  const name = loc.name.toLowerCase();
  const state = loc.state.toLowerCase();
  const combined = `${loc.name} ${loc.state}`.toLowerCase();
  const tagline = loc.tagline.toLowerCase();

  let score = 0;

  if (name.startsWith(query)) score += 100;
  else if (name.includes(query)) score += 70;

  if (state.includes(query)) score += 50;
  if (combined.includes(query)) score += 30;
  if (tagline.includes(query)) score += 10;

  // fuzzy: allow one substitution by checking char overlap
  const qChars = new Set(query.replace(/\s/g, "").split(""));
  const nameChars = new Set(name.replace(/\s/g, "").split(""));
  let overlap = 0;
  qChars.forEach((c) => {
    if (nameChars.has(c)) overlap++;
  });
  score += overlap * 2;

  // bonus for overall score (prefer stronger locations slightly)
  score += loc.overallScore * 0.05;

  return score;
}

export function fuzzySearchLocations(query: string, limit = 6): LocationProfile[] {
  const q = query.trim();
  if (!q) return LOCATIONS.slice(0, limit);
  const scored = LOCATIONS.map((loc) => ({ loc, s: scoreLocation(loc, q) }))
    .filter((x) => x.s > 20)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.loc);
  return scored;
}

// Keyboard navigation helper
export type SearchNavState = {
  index: number; // -1 means none
  count: number;
};

export function nextIndex(current: number, count: number, dir: 1 | -1): number {
  if (count === 0) return -1;
  if (current === -1) return dir === 1 ? 0 : count - 1;
  return (current + dir + count) % count;
}
