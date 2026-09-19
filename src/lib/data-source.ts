// Central data source registry - real-world APIs can replace mocks via this adapter
export type DataStatus = "verified" | "estimated" | "community" | "unavailable";
export type SourceCategory = "weather" | "air" | "water" | "health" | "maps" | "economy" | "hazards" | "transport" | "education";

export interface DataSource {
  name: string;
  category: SourceCategory;
  url?: string;
  lastUpdated: string; // ISO or human e.g. "Aug 2026"
  status: DataStatus;
  attribution?: string;
}

export const SOURCES: Record<string, DataSource> = {
  nbs: { name: "National Bureau of Statistics", category: "economy", lastUpdated: "Jun 2026", status: "estimated", url: "https://www.nigerianstat.gov.ng" },
  sema: { name: "State Emergency Management", category: "hazards", lastUpdated: "Aug 2026", status: "verified" },
  osm: { name: "OpenStreetMap", category: "maps", lastUpdated: "Jul 2026", status: "community", url: "https://www.openstreetmap.org", attribution: "© OpenStreetMap contributors" },
  met: { name: "Meteorological Service", category: "weather", lastUpdated: "Aug 2026", status: "estimated" },
  envAgency: { name: "Environmental Protection Agency", category: "air", lastUpdated: "Aug 2026", status: "estimated" },
  telecom: { name: "Telecom Coverage Registry", category: "transport", lastUpdated: "Jul 2026", status: "estimated" },
  samplePlaces: { name: "Sample Place Directory (demo)", category: "health", lastUpdated: "Aug 2026", status: "community" },
};

export function sourceBadgeProps(source: { name: string; date: string }) {
  // Map legacy SourceInfo to DataSource-like badge
  const entry = Object.values(SOURCES).find((s) => source.name.includes(s.name.split(" ")[0])) ?? SOURCES.samplePlaces!;
  const status: DataStatus = source.name.toLowerCase().includes("sample") ? "community" : entry.status;
  return { name: source.name, date: source.date, status };
}

// Future real API adapters - keep interface stable
export interface WeatherResult {
  tempC: number | null;
  humidity: number | null;
  description: string;
  source: DataSource;
  error?: string;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  // Open-Meteo real API with fallback to unavailable
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const cur = j.current ?? {};
    return {
      tempC: cur.temperature_2m ?? null,
      humidity: cur.relative_humidity_2m ?? null,
      description: cur.temperature_2m != null ? `${cur.temperature_2m}°C · humidity ${cur.relative_humidity_2m ?? "—"}%` : "Weather unavailable",
      source: { ...SOURCES.met, lastUpdated: new Date().toISOString().slice(0, 10) },
    };
  } catch (e) {
    return {
      tempC: null,
      humidity: null,
      description: "Weather unavailable right now",
      source: { ...SOURCES.met, status: "unavailable" as const },
      error: String(e),
    };
  }
}
