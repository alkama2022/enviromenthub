import { createFileRoute, Link } from "@tanstack/react-router";
import { Siren, Phone, Navigation, MapPin, Clock, ShieldAlert, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { LOCATIONS } from "@/lib/locations";
import { placesForLocation } from "@/lib/places";
import { PlaceMap } from "@/components/place-map";
import { ReadAloud } from "@/components/voice-input";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency — Find Help Fast | Environment Hub" },
      { name: "description", content: "Verified emergency facilities, hospitals, police and fire services with directions. For emergencies call 112 in Nigeria." },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const [slug, setSlug] = useState(LOCATIONS[0]!.slug);
  const area = LOCATIONS.find(l => l.slug === slug)!;
  const emergencyPlaces = placesForLocation(slug).filter(p => p.emergency);
  const hospitals = placesForLocation(slug).filter(p => p.category === "healthcare" && p.emergency);
  const police = placesForLocation(slug).filter(p => p.category === "emergency" && p.subtype.toLowerCase().includes("police"));
  const fire = placesForLocation(slug).filter(p => p.subtype.toLowerCase().includes("fire") || p.subtype.toLowerCase().includes("ambulance"));

  return (
    <div id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="flex items-start gap-2 text-sm font-bold text-destructive"><Siren className="mt-0.5 h-5 w-5 shrink-0" /> Emergency — Call 112 in Nigeria immediately if life is at risk. Do not wait for this page. Go to the nearest emergency facility.</p>
      </div>

      <header className="mt-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Emergency — Find Help Fast</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Fast, clear emergency information. Only verified facilities from the sample directory are shown. We never invent phone numbers or addresses. Always confirm.</p>
        <div className="mt-3"><ReadAloud text="Emergency — Call 112 for life threatening emergencies. Find nearest hospital and police." /></div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> Area
          <select value={slug} onChange={e => setSlug(e.target.value)} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
            {LOCATIONS.map(l => <option key={l.slug} value={l.slug}>{l.name}, {l.state}</option>)}
          </select>
        </label>
        <a href="tel:112" className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground hover:bg-destructive/90"><Phone className="h-4 w-4" /> Call 112</a>
        <Link to="/healthcare" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">Hospitals</Link>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Map — Emergency facilities</h2>
        <div className="mt-3"><PlaceMap places={emergencyPlaces} origin={area.coords} /></div>
        <p className="mt-2 text-[11px] text-muted-foreground">🟢 Verified sample records only. No invented numbers. Source: sample place directory (demo) — not a verified registry.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-bold"><Siren className="h-4 w-4 text-destructive" /> Hospitals with 24h emergency</h3>
          <ul className="mt-3 space-y-3">
            {hospitals.map(p => (
              <li key={p.id} className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.address}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5 text-primary" />{p.hours.summary} · 24h</p>
                <div className="mt-2 flex gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.coords[0]},${p.coords[1]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"><Navigation className="h-3 w-3" /> Directions</a>
                  <span className="text-[11px] text-muted-foreground">{p.phone ? <a href={`tel:${p.phone}`} className="underline">{p.phone}</a> : "Phone unavailable — use 112"}</span>
                </div>
              </li>
            ))}
            {hospitals.length===0 && <li className="text-xs text-muted-foreground">No 24h hospital record in demo for this area — call 112 and check nearest general hospital.</li>}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-bold"><ShieldAlert className="h-4 w-4 text-primary" /> Police / Fire</h3>
          <ul className="mt-3 space-y-3">
            {[...police, ...fire].map(p => (
              <li key={p.id} className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.subtype} · {p.address}</p>
                <div className="mt-2 flex gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.coords[0]},${p.coords[1]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"><Navigation className="h-3 w-3" /> Directions</a>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Source: sample feed · Not verified — confirm via 112.</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> We do not invent emergency numbers, addresses or availability. If a facility shows “Phone unavailable”, use 112 or go directly. Reports are sample only — verify on arrival.</p>
      </div>
    </div>
  );
}
