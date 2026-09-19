import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Home, Hospital, GraduationCap, Hotel, Store, MapPin, GitCompareArrows, Briefcase, Compass } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Me Decide — Environment Hub" },
      { name: "description", content: "Tell us what you want to do — live, visit, start a business, find healthcare or schools — and get potential locations to investigate with evidence." },
    ],
  }),
  component: HelpPage,
});

const GOALS = [
  { key: "live", label: "Live somewhere", icon: Home, desc: "Find a neighbourhood to live with family", query: "Is this place good for my family to live?" },
  { key: "visit", label: "Visit somewhere", icon: Compass, desc: "Weekend, holiday, sightseeing", query: "Where should I go for my public holiday?" },
  { key: "business", label: "Start a business", icon: Store, desc: "Pharmacy, restaurant, shop, office", query: "Where should I open a pharmacy in Kano?" },
  { key: "healthcare", label: "Find healthcare", icon: Hospital, desc: "Hospital, clinic, pharmacy near you", query: "Where can I find a hospital near me?" },
  { key: "school", label: "Find a school", icon: GraduationCap, desc: "Schools, training, universities", query: "Find schools near this location" },
  { key: "accommodation", label: "Find accommodation", icon: Hotel, desc: "Hotel, lodge, short stay", query: "Find accommodation near me" },
  { key: "services", label: "Find services", icon: Briefcase, desc: "Government, transport, markets", query: "What services are near this location?" },
  { key: "compare", label: "Compare locations", icon: GitCompareArrows, desc: "Compare Wuse 2 vs Garki", query: "" },
  { key: "opportunities", label: "Find opportunities", icon: Lightbulb, desc: "Business and investment insights", query: "Which areas have limited services but good population?" },
] as const;

function HelpPage() {
  const { t } = useI18n();
  const [goal, setGoal] = useState<string | null>(null);
  const [city, setCity] = useState("Wuse 2, Abuja");
  const [budget, setBudget] = useState("");

  const selected = GOALS.find(g => g.key === goal);

  return (
    <div id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"><Lightbulb className="h-3.5 w-3.5 text-primary" /> Help Me Decide</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">What do you want to accomplish?</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose a goal — we’ll ask only what’s needed and show <strong>potential locations to investigate</strong> with evidence, never fabricated “best” claims.</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GOALS.map(g => (
          <button key={g.key} type="button" onClick={() => setGoal(g.key)} aria-pressed={goal === g.key} className={`rounded-2xl border p-4 text-left shadow-sm transition-all ${goal === g.key ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
            <g.icon className={`h-6 w-6 ${goal === g.key ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
            <p className="mt-2 text-sm font-bold">{g.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
          </button>
        ))}
      </div>

      {selected && selected.key !== "compare" && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold">Tell us a bit more</h2>
          <div className="mt-4 grid gap-4">
            <label className="text-sm font-medium">City / area <input value={city} onChange={e => setCity(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. Kano, Wuse 2, Ikeja" /></label>
            <label className="text-sm font-medium">Budget / priority (optional) <input value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. low cost, near schools, quiet" /></label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/discover" search={{ q: `${selected.query} in ${city}${budget ? ` — ${budget}` : ""}` } as any} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              See potential locations
            </Link>
            <Link to="/compare" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent">Compare locations</Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Results are <strong>potential locations to investigate</strong> based on available datasets. We explain the factors used: {selected.key === "business" ? "population indicators, nearby services, transport, existing competition" : selected.key === "live" ? "healthcare, schools, transport, environment, hazards, cost" : "proximity, services, verified availability"}.</p>
        </div>
      )}

      {selected?.key === "compare" && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium">Compare up to 3 locations side by side.</p>
          <Link to="/compare" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Go to Compare</Link>
        </div>
      )}

      <p className="mx-auto mt-8 max-w-3xl rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">We never call a location “the best” without a defined factual criterion. Every recommendation shows factors used. If reliable data is unavailable we show: <strong>“Data unavailable”</strong> — never fabricated statistics.</p>
    </div>
  );
}
