import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LOCATIONS } from "@/lib/locations";
import { useAuth } from "@/lib/auth";
import { Shield, Database } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | TerraLens" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<unknown[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("terralens:reports");
      if (raw) setReports(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (loading) return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Sign in to access admin. Only authenticated users may view queued reports (demo).</p>
        <Link to="/auth" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Database className="h-5 w-5 text-primary" /> Admin — Data operations</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage locations and review queued reports. Writes require Supabase service role; local queue shows demo submissions.</p>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold">Locations in dataset ({LOCATIONS.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="pb-2">Slug</th><th className="pb-2">Name</th><th className="pb-2 text-right">Score</th><th className="pb-2 text-right">State</th></tr></thead>
            <tbody>
              {LOCATIONS.map((l) => (
                <tr key={l.slug} className="border-b last:border-0"><td className="py-2 font-mono text-xs">{l.slug}</td><td className="py-2">{l.name}</td><td className="py-2 text-right">{l.overallScore}</td><td className="py-2 text-right">{l.state}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">To add a real LGA: insert into <code>public.locations</code> via Supabase Dashboard → SQL (see <code>20250919000001_locations_places.sql</code>).</p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold">Queued reports (local)</h2>
        {reports.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No local reports yet — submit via any location profile.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-xs">
            {reports.slice(0, 20).map((r: unknown, i: number) => (
              <li key={i} className="rounded border border-border bg-muted/40 p-2 font-mono">{JSON.stringify(r).slice(0, 200)}</li>
            ))}
          </ul>
        )}
        <button onClick={() => { localStorage.removeItem("terralens:reports"); setReports([]); }} className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">Clear local queue</button>
      </section>
    </div>
  );
}
