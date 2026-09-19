import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpenCheck,
  Scale,
  Database,
  ShieldCheck,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import { MOCK_DISCLAIMER } from "@/lib/locations";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Methodology & Ethics | TerraLens" },
      {
        name: "description",
        content:
          "How TerraLens scores locations, where the data comes from, and the ethical rules that keep the platform focused on places — never people.",
      },
      { property: "og:title", content: "Methodology & Ethics | TerraLens" },
      {
        property: "og:description",
        content:
          "How TerraLens scores locations, where the data comes from, and the ethical rules that keep the platform focused on places — never people.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const SCORING_BANDS = [
  { range: "72 – 100", label: "Strong", text: "Conditions are favourable relative to the dataset. Advantages outweigh challenges for most goals.", tone: "bg-score-high" },
  { range: "55 – 71", label: "Workable", text: "Usable with caveats. Specific challenges should be planned around or mitigated.", tone: "bg-score-mid" },
  { range: "0 – 54", label: "At risk", text: "Significant gaps or hazards. Decisions here need careful justification and monitoring.", tone: "bg-score-low" },
];

const ETHICS_RULES = [
  {
    title: "Places, never people",
    text: "TerraLens analyses environmental patterns in locations. It does not identify, profile, score or label individuals under any circumstances.",
  },
  {
    title: "No criminal prediction",
    text: "Public safety scores are built only from aggregated, verified incident counts. The system never predicts who might commit a crime.",
  },
  {
    title: "No proxy discrimination",
    text: "Appearance, ethnicity, neighbourhood demographics and social media activity are never inputs to any score or flag.",
  },
  {
    title: "Transparent sourcing",
    text: "Every important data point carries a source and a date. Where data is unreliable or unavailable, the interface says so instead of guessing.",
  },
  {
    title: "AI explains itself",
    text: "Every score ships with a plain-language explanation citing the underlying data, so users can challenge and verify conclusions.",
  },
];

const SOURCES = [
  "National statistics publications (population, economic activity, cost of living)",
  "State emergency management incident feeds (flooding, fire, response coverage)",
  "Open geographic data extracts (hospitals, schools, businesses, roads)",
  "Meteorological services (weather, seasonal climate patterns)",
  "Environmental protection agencies (air quality, water availability, waste)",
  "Telecom coverage registries (network availability)",
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Methodology &amp; ethics
          </h1>
          <p className="text-sm text-muted-foreground">
            How scores are built, where data comes from, and the rules we never break.
          </p>
        </div>
      </div>

      {/* Scoring */}
      <section aria-labelledby="scoring" className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 id="scoring" className="flex items-center gap-2 font-display text-xl font-bold">
          <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
          How scoring works
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Each location receives ten category scores (0–100): public safety,
          healthcare access, weather &amp; climate, business potential,
          infrastructure, environment, transportation, education, economic
          activity and tourism. Category scores combine the underlying data
          points shown on each profile — facility counts, incident trends,
          hazard exposure, coverage percentages — normalised across the
          monitored locations. The overall environment score is a weighted
          blend of all ten categories.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The Personal Decision Assistant re-weights those same category scores
          for your goal. A business query leans on economic activity,
          infrastructure and transport; a health query leans on healthcare
          access, environment and climate. The underlying data never changes —
          only the weights do.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {SCORING_BANDS.map((band) => (
            <div key={band.range} className="rounded-lg border border-border bg-muted/40 p-4">
              <span className={cnTone(band.tone)}>{band.range}</span>
              <p className="mt-2 text-sm font-bold text-foreground">{band.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{band.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ethics */}
      <section aria-labelledby="ethics" className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 id="ethics" className="flex items-center gap-2 font-display text-xl font-bold">
          <Scale className="h-5 w-5 text-primary" aria-hidden="true" />
          Ethical guidelines
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {ETHICS_RULES.map((rule) => (
            <div key={rule.title} className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                {rule.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{rule.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sources */}
      <section aria-labelledby="sources" className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 id="sources" className="flex items-center gap-2 font-display text-xl font-bold">
          <Database className="h-5 w-5 text-primary" aria-hidden="true" />
          Data sources
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          In production, TerraLens aggregates publicly available and authorised
          data from source families like these. Every data point in the
          interface carries its source family and reference date.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-score-mid/40 bg-score-mid/10 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-score-mid" aria-hidden="true" />
          <p>
            <strong className="text-foreground">Demo disclaimer:</strong> {MOCK_DISCLAIMER} Scores
            illustrate the methodology and interface; they must not be used for
            real decisions.
          </p>
        </div>
      </section>
    </div>
  );
}

function cnTone(tone: string) {
  return `inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-primary-foreground ${tone}`;
}
