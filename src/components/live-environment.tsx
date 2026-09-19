import { useEffect, useState } from "react";
import { Thermometer, Wind, Droplets } from "lucide-react";

interface LiveData {
  temp: number | null;
  aqi: string | null;
  humidity: number | null;
  source: string;
}

// Free tier: open-meteo without key for temperature; AQI mocked as derived
async function fetchLive(coords: [number, number]): Promise<LiveData> {
  try {
    const [lat, lon] = coords;
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    const temp = json?.current?.temperature_2m ?? null;
    const humidity = json?.current?.relative_humidity_2m ?? null;
    // derive AQI band from temp/humidity as placeholder — never presented as measured
    const aqi = temp !== null ? (temp > 32 ? "Moderate (live temp high)" : "Good (live temp)") : null;
    return { temp, humidity, aqi, source: "open-meteo.com (live)" };
  } catch {
    return { temp: null, aqi: null, humidity: null, source: "unavailable" };
  }
}

export function LiveEnvironment({ coords, fallbackAqi }: { coords: [number, number]; fallbackAqi: string }) {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLive(coords).then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  if (loading) return <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">Loading live environment data…</div>;
  if (!data || data.temp === null) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold text-foreground">Live data unavailable</p>
        <p className="mt-1 text-xs text-muted-foreground">Showing dataset value: {fallbackAqi}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">Live environment (experimental)</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <span className="flex items-center gap-1.5 rounded bg-card px-2 py-1.5"><Thermometer className="h-3.5 w-3.5 text-primary" /> {data.temp}°C</span>
        <span className="flex items-center gap-1.5 rounded bg-card px-2 py-1.5"><Droplets className="h-3.5 w-3.5 text-primary" /> {data.humidity ?? "—"}%</span>
        <span className="flex items-center gap-1.5 rounded bg-card px-2 py-1.5"><Wind className="h-3.5 w-3.5 text-primary" /> {data.aqi}</span>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">Source: {data.source} · {new Date().toLocaleTimeString()} · AQI shown is estimated from live temperature, not a measured pollutant reading. Dataset AQI: {fallbackAqi}</p>
    </div>
  );
}
