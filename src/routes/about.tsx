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
import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "@/components/voice-input";

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
  const { t } = useI18n();
  return (
    <div id="main-content" className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("about.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("about.subtitle")}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <ReadAloud text={`${t("about.title")} ${t("about.subtitle")}`} />
      </div>

      {/* Scoring */}
      <section aria-labelledby="scoring" className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 id="scoring" className="flex items-center gap-2 font-display text-xl font-bold">
          <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("about.scoring.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("about.scoring.p1")}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("about.scoring.p2")}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { range: "72 – 100", label: t("about.scoring.bands.strong"), text: t("about.scoring.bands.strongDesc"), tone: "bg-score-high" },
            { range: "55 – 71", label: t("about.scoring.bands.workable"), text: t("about.scoring.bands.workableDesc"), tone: "bg-score-mid" },
            { range: "0 – 54", label: t("about.scoring.bands.atRisk"), text: t("about.scoring.bands.atRiskDesc"), tone: "bg-score-low" },
          ].map((band) => (
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
          {t("about.ethics.title")}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { title: t("about.ethics.placesNeverPeople.title"), text: t("about.ethics.placesNeverPeople.text") },
            { title: t("about.ethics.noPrediction.title"), text: t("about.ethics.noPrediction.text") },
            { title: t("about.ethics.noDiscrimination.title"), text: t("about.ethics.noDiscrimination.text") },
            { title: t("about.ethics.transparent.title"), text: t("about.ethics.transparent.text") },
            { title: t("about.ethics.aiExplains.title"), text: t("about.ethics.aiExplains.text") },
          ].map((rule) => (
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
          {t("about.sources.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("about.sources.p")}
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
