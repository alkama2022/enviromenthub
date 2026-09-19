import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, CloudRain, Waves, Construction, ShieldAlert, Hospital } from "lucide-react";
import { useAlertSubscriptions } from "@/lib/alert-subscriptions";
import { LOCATIONS } from "@/lib/locations";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Environment Hub" },
      { name: "description", content: "Location-based alerts for weather, flood, road and health — only when reliable data exists." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { subscriptions, toggle } = useAlertSubscriptions();
  const subs = LOCATIONS.filter(l => subscriptions.includes(l.slug));

  return (
    <div id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><BellRing className="h-6 w-6 text-primary" /> Alerts</h1>
      <p className="mt-2 text-sm text-muted-foreground">Subscribe to a location to get optional alerts. Only sent when reliable data exists — no false emergencies.</p>

      {subs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No subscribed locations yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Go to any location report and tap <strong>Get alerts</strong>.</p>
          <Link to="/" className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Browse places</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {subs.map(loc => (
            <div key={loc.slug} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{loc.name}, {loc.state}</h3>
                <button onClick={() => toggle(loc.slug)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent">Unsubscribe</button>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2 py-1.5"><CloudRain className="h-3.5 w-3.5" /> Weather — when reliable</span>
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2 py-1.5"><Waves className="h-3.5 w-3.5" /> Flood / hazards — when verified</span>
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2 py-1.5"><Construction className="h-3.5 w-3.5" /> Road disruptions — when confirmed</span>
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2 py-1.5"><Hospital className="h-3.5 w-3.5" /> Healthcare notices — when verified</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Demo: no real push sent — this shows subscription state locally. For emergencies call 112.</p>
              <Link to="/location/$slug" params={{ slug: loc.slug }} className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">View report</Link>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
        <p className="flex items-start gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 text-primary" /> Alerts are privacy-conscious and never expose precise user location. No false emergency alerts are generated.</p>
      </div>
    </div>
  );
}
