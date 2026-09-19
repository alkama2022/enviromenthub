import { useEffect, useRef, useState } from "react";
import { LOCATIONS } from "@/lib/locations";

// Leaflet loaded via CDN — use any to avoid requiring npm package at build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletNS = any;

declare global {
  interface Window {
    L?: LeafletNS;
  }
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet(): Promise<LeafletNS> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => (window.L ? resolve(window.L) : reject(new Error("Leaflet load failed"))));
      existing.addEventListener("error", () => reject(new Error("Leaflet load failed")));
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error("Leaflet load failed")));
    script.onerror = () => reject(new Error("Leaflet load failed"));
    document.head.appendChild(script);
  });
}

function severityOf(slug: string): "critical" | "warning" | "ok" {
  const loc = LOCATIONS.find((l) => l.slug === slug);
  if (!loc) return "ok";
  if (loc.trends.some((t) => t.severity === "critical")) return "critical";
  if (loc.trends.some((t) => t.severity === "warning")) return "warning";
  return "ok";
}

function colorFor(sev: "critical" | "warning" | "ok"): string {
  if (sev === "critical") return "var(--score-low, #ef4444)";
  if (sev === "warning") return "var(--score-mid, #f59e0b)";
  return "var(--score-high, #22c55e)";
}

export function GovernmentMap({
  selectedSlug,
  onSelect,
}: {
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markers: any[] = [];

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        // Avoid double init
        if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

        map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([9.08, 7.5], 5.5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add markers
        LOCATIONS.forEach((loc) => {
          const sev = severityOf(loc.slug);
          const isSelected = loc.slug === selectedSlug;
          const color = colorFor(sev);
          const icon = L.divIcon({
            className: "",
            html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);${isSelected ? "outline:4px solid rgba(59,130,246,0.35)" : ""}"></span><span style="position:absolute;left:50%;top:22px;transform:translateX(-50%);background:white;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2)">${loc.name}</span>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          const marker = L.marker([loc.coords[0], loc.coords[1]], { icon }).addTo(map!);
          marker.on("click", () => onSelect(loc.slug));
          marker.bindTooltip(`${loc.name}, ${loc.state} — ${sev === "ok" ? "no active flags" : `${sev} flag`}`, { direction: "top" });
          markers.push(marker);
        });

        mapRef.current = map as unknown as typeof mapRef.current;

        // Fit bounds to Nigeria
        const bounds = L.latLngBounds(LOCATIONS.map((l) => [l.coords[0], l.coords[1]] as [number, number]));
        map.fitBounds(bounds.pad(0.6));
        setTimeout(() => map?.invalidateSize(), 100);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Map failed to load");
      });

    // Update marker highlight when selectedSlug changes - rely on effect re-run
    return () => {
      cancelled = true;
      try {
        if (map) map.remove();
      } catch {
        // ignore
      }
      mapRef.current = null;
      markers.length = 0;
    };
  }, [selectedSlug, onSelect]);

  // Re-render when selected changes - we tear down and rebuild markers via dependency
  // Simpler to rebuild entirely; performance is negligible for 5 markers.

  if (error) {
    return (
      <div className="mt-4 flex h-80 items-center justify-center rounded-lg border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Map failed to load ({error}). Showing schematic fallback below.
      </div>
    );
  }

  return <div ref={containerRef} className="mt-4 h-80 w-full overflow-hidden rounded-lg border border-border" role="img" aria-label="Interactive map of Nigeria with monitored location pins (OpenStreetMap)" />;
}

export function LocationMiniMap({ coords, label }: { coords: [number, number]; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;
        map = L.map(containerRef.current, { zoomControl: false, attributionControl: true, dragging: true, scrollWheelZoom: false }).setView(coords, 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:var(--primary,#3b82f6);border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker(coords, { icon }).addTo(map!).bindPopup(label);
        setTimeout(() => map?.invalidateSize(), 100);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Map failed"));
    return () => {
      cancelled = true;
      try {
        if (map) map.remove();
      } catch {
        // ignore
      }
    };
  }, [coords, label]);

  if (error) return <div className="h-64 rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">{error}</div>;
  return <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-lg border border-border" aria-label={`Map for ${label}`} />;
}
