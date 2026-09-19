import { useEffect, useRef, useState } from "react";
import type { Place, PlaceCategory } from "@/lib/places";
import { PLACE_CATEGORY_LABELS } from "@/lib/places";
import { haversineKm, travelMinutes } from "@/lib/category-intel";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

declare global { interface Window { L?: any } }

function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = LEAFLET_CSS; document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => window.L ? resolve(window.L) : reject(new Error("Leaflet failed")));
      existing.addEventListener("error", () => reject(new Error("Leaflet failed")));
      return;
    }
    const s = document.createElement("script"); s.src = LEAFLET_JS; s.async = true;
    s.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet failed"));
    s.onerror = () => reject(new Error("Leaflet failed"));
    document.head.appendChild(s);
  });
}

const CAT_COLOR: Record<PlaceCategory, string> = {
  healthcare: "#e11d48", emergency: "#dc2626", pharmacy: "#f97316",
  education: "#7c3aed", tourism: "#059669", recreation: "#06b6d4",
  entertainment: "#8b5cf6", restaurant: "#f59e0b", shopping: "#10b981",
  religious: "#6366f1", government: "#475569", transportation: "#0ea5e9",
  accommodation: "#14b8a6", cultural: "#a855f7", outdoor: "#22c55e", business: "#eab308",
};

export function PlaceMap({ places, origin, onSelectPlace }: { places: Place[]; origin?: [number, number] | null; onSelectPlace?: (p: Place) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Set<PlaceCategory>>(new Set(["healthcare","pharmacy","emergency","education","restaurant","shopping","transportation","outdoor"] as PlaceCategory[]));
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  const cats = Array.from(new Set(places.map(p => p.category))).sort();
  const visible = places.filter(p => active.has(p.category));

  const toggle = (c: PlaceCategory) => {
    setActive(prev => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c); else n.add(c);
      return n;
    });
  };

  useEffect(() => {
    let cancelled = false; let map: any = null;
    loadLeaflet().then(L => {
      if (cancelled || !ref.current) return;
      if ((ref.current as any)._leaflet_id) return;
      const center: [number, number] = origin ?? (visible[0]?.coords ?? places[0]?.coords ?? [9.08, 7.5]);
      map = L.map(ref.current, { zoomControl: true }).setView(center, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
      mapRef.current = map;
      if (origin) {
        const oIcon = L.divIcon({ className:"", html:`<span style="display:block;width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,.4)"></span>`, iconSize:[14,14], iconAnchor:[7,7]});
        L.marker(origin, { icon: oIcon }).addTo(map).bindPopup("Your location / area centre");
      }
      visible.forEach(p => {
        const color = CAT_COLOR[p.category] ?? "#3b82f6";
        const icon = L.divIcon({ className:"", html:`<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,.35);color:white;font-size:13px">●</span>`, iconSize:[28,28], iconAnchor:[14,14]});
        const m = L.marker(p.coords, { icon }).addTo(map);
        const dist = origin ? haversineKm(origin, p.coords) : null;
        const distText = dist !== null ? `${dist.toFixed(1)} km · ~${travelMinutes(dist)} min` : "Distance unavailable";
        const phoneLine = p.phone ? `<a href="tel:${p.phone}" style="color:#2563eb;font-size:11px">${p.phone}</a>` : `<span style="font-size:11px;color:#888">Phone unavailable</span>`;
        const services = p.services.slice(0,3).join(" · ");
        const wa = `https://wa.me/?text=${encodeURIComponent(p.name + " — " + p.address + " https://www.google.com/maps/dir/?api=1&destination=" + p.coords[0] + "," + p.coords[1])}`;
        const popup = `<div style="min-width:210px;font-family:sans-serif"><strong style="font-size:13px">${p.name}</strong><br/><span style="font-size:11px;color:#666">${PLACE_CATEGORY_LABELS[p.category]} · ${p.subtype} · ${p.ownership}</span><br/><span style="font-size:11px">📍 ${p.address}</span><br/><span style="font-size:11px">📏 ${distText}</span><br/><span style="font-size:11px">🕐 ${p.hours.summary}</span><br/><span style="font-size:11px">📞 ${phoneLine}</span><br/><span style="font-size:11px">🛎️ ${services}</span><br/><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><a href="https://www.google.com/maps/dir/?api=1&destination=${p.coords[0]},${p.coords[1]}" target="_blank" style="background:#2563eb;color:white;padding:4px 8px;border-radius:6px;font-size:11px;text-decoration:none">Directions</a><a href="${wa}" target="_blank" style="background:#25D366;color:white;padding:4px 8px;border-radius:6px;font-size:11px;text-decoration:none">Share</a></div><div style="margin-top:4px;font-size:10px;color:#888">Source: ${p.source.name} · ${p.source.date}</div></div>`;
        m.bindPopup(popup);
        m.on("click", () => onSelectPlace?.(p));
      });
      setTimeout(() => map?.invalidateSize(), 120);
    }).catch(e => !cancelled && setError(e.message));
    return () => { cancelled = true; try{ if(map) map.remove(); }catch{} mapRef.current = null; };
  }, [visible, origin, places]);

  // Rebuild when active changes via dependency on visible length/key
  // Simplified: force rebuild by toggling effect via active count

  if (error) return <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">Map failed: {error}</div>;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {cats.map(c => {
          const on = active.has(c);
          return (
            <button key={c} type="button" onClick={() => toggle(c)} aria-pressed={on} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-accent"}`}>
              <span className="h-2 w-2 rounded-full" style={{ background: CAT_COLOR[c] }} aria-hidden="true" />
              {PLACE_CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </div>
      <div ref={ref} className="h-[360px] w-full overflow-hidden rounded-xl border border-border" role="img" aria-label="Interactive map with place layers — toggle categories above" />
      <p className="text-[11px] text-muted-foreground">{visible.length} of {places.length} places shown. Layers are filterable above. Tap a pin for details, Call/Directions in popup.</p>
    </div>
  );
}
