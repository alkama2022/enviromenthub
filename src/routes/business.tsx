import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, TrendingUp, MapPin, AlertTriangle, Lightbulb, Building2, Users, Bus, GraduationCap, Hospital, ShieldCheck, Info } from "lucide-react";
import { useState, useMemo } from "react";
import { LOCATIONS } from "@/lib/locations";
import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "@/components/voice-input";
import { ScorePill } from "@/components/score-bar";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Find Business Opportunities — Environment Hub" },
      { name: "description", content: "Investigate locations for business opportunities based on population, nearby services, transport, competition and available datasets." },
    ],
  }),
  component: BusinessPage,
});

const OPPORTUNITIES = [
  { key: "pharmacy", label: "Pharmacy", query: "Where should I open a pharmacy?", need: "healthcare + foot traffic" },
  { key: "restaurant", label: "Restaurant", query: "Where should a restaurant serve an underserved area?", need: "population + schools + transport" },
  { key: "school", label: "School / training", query: "Which areas have nearby schools but limited listed services?", need: "education + competition gap" },
  { key: "retail", label: "Retail / market", query: "Which area is good for opening a small shop?", need: "existing businesses + accessibility" },
] as const;

function BusinessPage() {
  const { t } = useI18n();
  const [goal, setGoal] = useState<typeof OPPORTUNITIES[number]["key"]>("pharmacy");

  const ranked = useMemo(() => {
    return [...LOCATIONS].map(loc => {
      const business = loc.categories.find(c => c.key === "business")!.score;
      const healthcare = loc.categories.find(c => c.key === "healthcare")!.score;
      const transport = loc.categories.find(c => c.key === "transportation")!.score;
      const economic = loc.categories.find(c => c.key === "economic")!.score;
      const pop = loc.quickFacts.find(f => f.label.includes("Population"))?.value ?? "—";
      const businesses = loc.quickFacts.find(f => f.label.includes("Registered businesses"))?.value ?? "—";
      // Simple potential score: lower healthcare coverage = more opportunity for pharmacy; high population + mid business = opportunity
      let potential = 0;
      if (goal === "pharmacy") potential = (100 - healthcare) * 0.4 + business * 0.3 + transport * 0.2 + economic * 0.1;
      else if (goal === "restaurant") potential = business * 0.2 + healthcare * 0.1 + transport * 0.3 + economic * 0.4;
      else potential = business * 0.3 + economic * 0.3 + transport * 0.2 + healthcare * 0.2;
      return { loc, business, healthcare, transport, economic, pop, businesses, potential: Math.round(potential) };
    }).sort((a,b) => b.potential - a.potential);
  }, [goal]);

  return (
    <div id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"><Store className="h-3.5 w-3.5 text-primary" /> Business Intelligence</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Find Business Opportunities</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Investigate locations based on available data: population indicators, existing businesses, accessibility, nearby services, transport and competition. Results are <strong>potential opportunities to investigate</strong> — not guaranteed success.</p>
        <div className="mt-3"><ReadAloud text="Find Business Opportunities. Potential locations to investigate." /></div>
      </header>

      <div className="flex flex-wrap gap-2">
        {OPPORTUNITIES.map(o => (
          <button key={o.key} type="button" onClick={() => setGoal(o.key)} aria-pressed={goal === o.key} className={`rounded-full px-4 py-2 text-xs font-semibold ${goal === o.key ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-accent"}`}>{o.label}</button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Examples: “{OPPORTUNITIES.find(o=>o.key===goal)?.query}”</p>

      <div className="mt-6 grid gap-4">
        {ranked.map(({ loc, business, healthcare, transport, economic, pop, businesses, potential }, idx) => (
          <div key={loc.slug} className={`rounded-2xl border bg-card p-5 shadow-sm ${idx===0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><MapPin className="h-4 w-4" /></span>
                  <h3 className="font-display text-lg font-bold">{loc.name}, {loc.state}</h3>
                  {idx===0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Top to investigate</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{pop} · {businesses} · {loc.tagline}</p>
              </div>
              <div className="flex items-center gap-2"><ScorePill score={business} /> <span className="text-xs text-muted-foreground">Business {business}/100</span></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <span className="rounded-lg bg-secondary/60 px-2 py-1.5"><Hospital className="mr-1 inline h-3 w-3" /> Healthcare {healthcare}</span>
              <span className="rounded-lg bg-secondary/60 px-2 py-1.5"><Bus className="mr-1 inline h-3 w-3" /> Transport {transport}</span>
              <span className="rounded-lg bg-secondary/60 px-2 py-1.5"><TrendingUp className="mr-1 inline h-3 w-3" /> Economic {economic}</span>
              <span className="rounded-lg bg-primary/10 px-2 py-1.5 font-semibold text-primary"><Lightbulb className="mr-1 inline h-3 w-3" /> Potential {potential}/100</span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Potential opportunity to investigate — based on {goal==="pharmacy" ? "lower healthcare density + accessibility + transport" : "population + competition indicators"}. Verify foot traffic and licensing locally.</span>
            </div>
            <div className="mt-3 rounded-lg bg-secondary/40 p-3">
              <p className="text-xs font-semibold text-foreground">Why this location?</p>
              <ul className="mt-1 list-disc pl-5 text-xs leading-relaxed text-muted-foreground">
                <li>Business score {business}/100: {loc.categories.find(c=>c.key==="business")!.explanation.slice(0,120)}.</li>
                <li>Competition proxy: {businesses} registered businesses — check OSM places for nearby {goal} saturation.</li>
                <li>Access: Transport {transport}/100; Healthcare {healthcare}/100 as demand proxy.</li>
              </ul>
              <p className="mt-2 text-[11px] text-muted-foreground">Source: National Bureau of Statistics (sample) · OSM POI extract (sample) · {loc.quickFacts[0]?.source.date} · <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">🟡 Estimated</span></p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/location/$slug" params={{ slug: loc.slug }} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">View full report</Link>
              <Link to="/discover" search={{ q: `${OPPORTUNITIES.find(o=>o.key===goal)?.query} in ${loc.name}` } as any} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">Ask Hub about {loc.name}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <p className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>Methodology:</strong> Potential = weighted blend of Business, Healthcare, Transport, Economic. Healthcare inverted for pharmacy (less coverage = larger gap). All inputs are sample data — do not present as market research. Visit and validate before investing.</span></p>
      </div>
    </div>
  );
}
