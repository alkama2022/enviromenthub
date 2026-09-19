import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  Info,
  AlertTriangle,
  Briefcase,
  HeartPulse,
  Plane,
  Home,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Landmark,
  ShieldAlert,
  ChevronRight,


} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CATEGORY_LABELS,
  MOCK_DISCLAIMER,
  getLocation,
} from "@/lib/locations";
import { PERSONAS, analyzeSuitability, type PersonaKey } from "@/lib/personas";
import { ChangeBadge, ScoreBar, ScorePill } from "@/components/score-bar";
import { SourceBadge } from "@/components/source-badge";
import { FavoriteButton } from "@/components/favorite-button";
import { LocationMiniMap } from "@/components/interactive-map";
import { LiveEnvironment } from "@/components/live-environment";
import { AlertSubscribeButton } from "@/components/alert-subscribe-button";
import { ReportForm } from "@/components/report-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlainScore, SimpleStat } from "@/components/plain-language";
import { ReadAloud } from "@/components/voice-input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Wind, Droplets, Waves, Hospital, Bus, GraduationCap, Store, Home as HomeIcon, Wifi, Banknote, Landmark as CultureIcon, MapPinned, CloudSun, Siren } from "lucide-react";

export const Route = createFileRoute("/location/$slug")({
  head: ({ params }) => {
    const loc = getLocation(params.slug);
    const title = loc
      ? `${loc.name}, ${loc.state} — Environmental Profile | TerraLens`
      : "Location not found | TerraLens";
    const description = loc
      ? `Environmental intelligence profile for ${loc.name}, ${loc.state}: overall score ${loc.overallScore}/100, category scores, safety trends and decision analysis.`
      : "This location is not in the demo dataset.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LocationPage,
});

const PERSONA_ICONS: Record<PersonaKey, typeof Briefcase> = {
  business: Briefcase,
  health: HeartPulse,
  tourism: Plane,
  living: Home,
};

const SEVERITY_STYLE = {
  critical: { icon: AlertTriangle, classes: "border-score-low/40 bg-score-low/10 text-score-low" },
  warning: { icon: AlertTriangle, classes: "border-score-mid/40 bg-score-mid/10 text-score-mid" },
  info: { icon: Info, classes: "border-chart-2/40 bg-chart-2/10 text-chart-2" },
} as const;

function plainForScore(score: number, t: (k: string) => string) {
  if (score >= 72) return { band: "Good", cls: "text-score-high" };
  if (score >= 55) return { band: "Okay", cls: "text-score-mid" };
  return { band: "Be careful", cls: "text-score-low" };
}

function LocationPage() {
  const { slug } = Route.useParams();
  const location = getLocation(slug);
  const { t, easyMode } = useI18n();
  const [persona, setPersona] = useState<PersonaKey>("business");

  if (!location) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold">Location not in dataset</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This demo covers five Nigerian locations. Search again or pick one of
          the examples on the home page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const suitability = analyzeSuitability(location, persona);
  const activePersona = PERSONAS.find((p) => p.key === persona)!;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {location.state}, {location.country} · {location.coords[0].toFixed(3)}°N,{" "}
            {location.coords[1].toFixed(3)}°E
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {location.name}
            </h1>
            <FavoriteButton slug={location.slug} />
            <AlertSubscribeButton slug={location.slug} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{location.tagline}</p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {location.summary}
          </p>
          <div className="mt-4">
            <LocationMiniMap coords={location.coords} label={`${location.name}, ${location.state}`} />
            <p className="mt-1 text-[11px] text-muted-foreground">OpenStreetMap · {location.coords[0].toFixed(3)}°N, {location.coords[1].toFixed(3)}°E — pan and zoom to explore surroundings.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-5 rounded-xl border border-border bg-muted/40 p-5">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border-8"
            style={{
              borderColor:
                location.overallScore >= 72
                  ? "var(--score-high)"
                  : location.overallScore >= 55
                    ? "var(--score-mid)"
                    : "var(--score-low)",
            }}
          >
            <span className="font-display text-3xl font-extrabold tabular-nums">
              {location.overallScore}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overall environment score
            </p>
            <p className="mt-1 text-sm text-muted-foreground">out of 100</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Weighted across 10 categories
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions for this place - large, simple */}
      <section className="mt-6" aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="sr-only">What do you want to know about this place?</h2>
        <div className={`grid gap-3 ${easyMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
          <Link to="/discover" search={{ q: `Find hospital near ${location.name}` } as any} className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/30 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 text-white"><Hospital className="h-6 w-6" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold">{t("home.actions.findHealthcare.title")}</span><span className="text-xs text-muted-foreground">{location.name}</span></span>
          </Link>
          <Link to="/discover" search={{ q: `Emergency help near ${location.name}` } as any} className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white"><Siren className="h-6 w-6" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold text-destructive">Emergency</span><span className="text-xs text-muted-foreground">112 · Nearest help</span></span>
          </Link>
          <button type="button" onClick={() => document.getElementById("environment-data")?.scrollIntoView({ behavior: "smooth" })} className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/30 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white"><CloudSun className="h-6 w-6" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold">Weather & Air</span><span className="text-xs text-muted-foreground">Today's conditions</span></span>
          </button>
          <Link to="/discover" search={{ q: `Business opportunities in ${location.name}` } as any} className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/30 hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white"><Store className="h-6 w-6" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold">Business</span><span className="text-xs text-muted-foreground">Opportunities</span></span>
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ReadAloud text={`${location.name} ${location.tagline} ${location.summary}`} />
        </div>
      </section>

      {/* Plain-language summary - replaces technical score alone */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-labelledby="plain-summary">
        <h2 id="plain-summary" className="sr-only">Plain language summary</h2>
        <PlainScore
          score={location.overallScore}
          title={location.name + " — Overall"}
          plainHigh="This place looks good overall. Most services and conditions are okay."
          plainMid="This place is okay. Some things are good, some need attention."
          plainLow="Be careful. Some conditions here need attention before you decide."
          whatItMeans={location.summary}
          whoCareful={location.categories.find((c) => c.score < 55)?.explanation}
          whatYouCanDo="Check the details below. Talk to local people. Visit in person if you can before making big decisions."
          source={`All 10 categories · Updated ${location.quickFacts[0]?.source.date ?? "recently"}`}
          trustLabel="estimated"
        />
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-base font-bold">What does the score mean?</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-score-high" aria-hidden="true" /> <span><strong>72–100 Good</strong> — Most things are okay here.</span></li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-score-mid" aria-hidden="true" /> <span><strong>55–71 Okay</strong> — Mixed. Check details.</span></li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-score-low" aria-hidden="true" /> <span><strong>0–54 Be careful</strong> — Needs attention.</span></li>
          </ul>
          <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">{t("common.trust.disclaimer")}</p>
        </div>
      </section>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="overview">Simple overview</TabsTrigger>
          <TabsTrigger value="twin">Details</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="assistant">Help me decide</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-8">
          <section aria-labelledby="category-scores">
            <h2 id="category-scores" className="font-display text-xl font-bold">
              Category scores — and why
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every score is explained by the underlying data. Nothing is
              presented without a reason.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {location.categories.map((cat) => (
                <Link
                  key={cat.key}
                  to="/insight/$slug/$category"
                  params={{ slug: location.slug, category: cat.key }}
                  className="group block rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <ScoreBar score={cat.score} label={CATEGORY_LABELS[cat.key]} />
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {cat.explanation}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    View full intelligence report
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>

          </section>

          {/* 15-section plain intelligence - spec 12 */}
          <section aria-labelledby="intel-sections" className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 id="intel-sections" className="font-display text-lg font-bold">{t("location.sections.location")} • {t("location.sections.weather")} • {t("location.sections.air")} — Plain overview</h2>
            <p className="mt-1 text-xs text-muted-foreground">Each section: What it is → What it means → Why it matters. Tap for details. <ReadAloud text={`Overview for ${location.name}. Weather, air, water, flooding, healthcare and more explained simply.`} /></p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SimpleStat icon={MapPin} title={`${t("location.sections.location")}: ${location.name}`} valuePlain={`${location.state}, ${location.country} · ${location.tagline}`} valueTechnical={`${location.coords[0].toFixed(3)}°N, ${location.coords[1].toFixed(3)}°E`} source={`Demo dataset`} trust="community" />
              <SimpleStat icon={CloudSun} title={t("location.sections.weather")} valuePlain={location.environmentData.find((f) => f.label.includes("Weather"))?.value ?? "Weather information"} valueTechnical={location.categories.find((c) => c.key === "weather")?.explanation} source={location.environmentData.find((f) => f.label.includes("Weather"))?.source.name} trust="estimated" />
              <SimpleStat icon={Wind} title={t("location.sections.air")} valuePlain={(() => { const v = location.environmentData.find((f) => f.label.includes("Air quality"))?.value ?? ""; if (v.includes("Unhealthy")) return t("environment.air.bad") + " · " + v; if (v.includes("Moderate")) return t("environment.air.moderate") + " · " + v; return t("environment.air.good") + " · " + v; })()} valueTechnical={location.categories.find((c) => c.key === "environment")?.explanation} source={location.environmentData.find((f) => f.label.includes("Air quality"))?.source.name} trust="estimated" />
              <SimpleStat icon={Droplets} title={t("location.sections.water")} valuePlain={location.environmentData.find((f) => f.label.includes("Water"))?.value ?? t("environment.water.available")} valueTechnical={location.environmentData.find((f) => f.label.includes("Water"))?.note} source={location.environmentData.find((f) => f.label.includes("Water"))?.source.name} trust="estimated" />
              <SimpleStat icon={Waves} title={t("location.sections.flooding")} valuePlain={(() => { const v = location.environmentData.find((f) => /Flood|erosion/i.test(f.label))?.value ?? ""; if (/High/i.test(v)) return t("environment.flooding.plain.high"); if (/Moderate/i.test(v)) return t("environment.flooding.plain.moderate"); return t("environment.flooding.plain.low"); })()} valueTechnical={location.environmentData.find((f) => /Flood|erosion/i.test(f.label))?.value + (location.environmentData.find((f) => /Flood|erosion/i.test(f.label))?.note ? " — " + location.environmentData.find((f) => /Flood|erosion/i.test(f.label))!.note : "")} source={location.environmentData.find((f) => /Flood|erosion/i.test(f.label))?.source.name} trust="verified" />
              <SimpleStat icon={Hospital} title={t("location.sections.healthcare")} valuePlain={`${location.quickFacts.find((f) => /Hospitals/i.test(f.label))?.value ?? "Healthcare information"} — ${location.categories.find((c) => c.key === "healthcare")?.explanation.slice(0,120) ?? ""}`} source={location.quickFacts.find((f) => /Hospitals/i.test(f.label))?.source.name} trust="community" />
              <SimpleStat icon={Siren} title={t("location.sections.emergency")} valuePlain={`Emergency services: ${location.categories.find((c) => c.key === "publicSafety")?.explanation.slice(0,110) ?? "Aggregated safety data only"}`} source="Sample feed" trust="verified" />
              <SimpleStat icon={Bus} title={t("location.sections.transportation")} valuePlain={location.categories.find((c) => c.key === "transportation")?.explanation ?? "Transport information"} source="OpenStreetMap" trust="community" />
              <SimpleStat icon={GraduationCap} title={t("location.sections.education")} valuePlain={`${location.quickFacts.find((f) => /Schools/i.test(f.label))?.value ?? ""} — ${location.categories.find((c) => c.key === "education")?.explanation.slice(0,110) ?? ""}`} source={location.quickFacts.find((f) => /Schools/i.test(f.label))?.source.name} trust="community" />
              <SimpleStat icon={Store} title={t("location.sections.businesses")} valuePlain={`${location.quickFacts.find((f) => /Registered businesses/i.test(f.label))?.value ?? ""} — ${location.categories.find((c) => c.key === "business")?.explanation.slice(0,110) ?? ""}`} source={location.quickFacts.find((f) => /Registered businesses/i.test(f.label))?.source.name} trust="estimated" />
              <SimpleStat icon={HomeIcon} title={t("location.sections.housing")} valuePlain={location.quickFacts.find((f) => /rent/i.test(f.label))?.value ?? "Housing information where available"} valueTechnical={location.quickFacts.find((f) => /Cost of living/i.test(f.label))?.value} source={location.quickFacts.find((f) => /rent/i.test(f.label))?.source.name} trust="estimated" />
              <SimpleStat icon={Wifi} title={t("location.sections.connectivity")} valuePlain={location.quickFacts.find((f) => /coverage/i.test(f.label))?.value ?? "Connectivity information"} source={location.quickFacts.find((f) => /coverage/i.test(f.label))?.source.name} trust="estimated" />
              <SimpleStat icon={Banknote} title={t("location.sections.cost")} valuePlain={location.quickFacts.find((f) => /Cost of living/i.test(f.label))?.value ?? "Cost information"} valueTechnical={location.quickFacts.find((f) => /rent/i.test(f.label))?.value} source={location.quickFacts.find((f) => /Cost of living/i.test(f.label))?.source.name} trust="estimated" />
              <SimpleStat icon={CultureIcon} title={t("location.sections.culture")} valuePlain={`${location.categories.find((c) => c.key === "tourism")?.explanation.slice(0,120) ?? "Local cultural information"}`} source="Sample dataset" trust="community" />
              <SimpleStat icon={MapPinned} title={t("location.sections.tourism")} valuePlain={`${location.categories.find((c) => c.key === "tourism")?.explanation.slice(0,130) ?? "Tourism information"}`} source="Sample dataset" trust="community" />
            </div>
            <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">{t("common.trust.disclaimer")} — {t("common.trust.mayBeOutdated")}</p>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="key-facts"
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 id="key-facts" className="font-display text-lg font-bold">
                Key facts
              </h2>
              <ul className="mt-4 space-y-4">
                {location.quickFacts.map((fact) => (
                  <li key={fact.label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{fact.label}</span>
                      <span className="text-right text-sm font-semibold text-foreground">
                        {fact.value}
                      </span>
                    </div>
                    {fact.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{fact.note}</p>
                    )}
                    <SourceBadge source={fact.source} className="mt-1.5" />
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="environment-data"
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 id="environment-data" className="font-display text-lg font-bold">
                Environment &amp; hazards
              </h2>
              <div className="mt-3">
                <LiveEnvironment coords={location.coords} fallbackAqi={location.environmentData.find((f) => f.label.includes("Air quality"))?.value ?? "—"} />
              </div>
              <ul className="mt-4 space-y-4">
                {location.environmentData.map((fact) => (
                  <li key={fact.label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{fact.label}</span>
                      <span className="text-right text-sm font-semibold text-foreground">
                        {fact.value}
                      </span>
                    </div>
                    {fact.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{fact.note}</p>
                    )}
                    <SourceBadge source={fact.source} className="mt-1.5" />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </TabsContent>

        {/* DIGITAL TWIN */}
        <TabsContent value="twin" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="twin-scores"
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 id="twin-scores" className="font-display text-lg font-bold">
                Living digital profile
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Score bars with change vs. previous period.
              </p>
              <div className="mt-5 space-y-4">
                {location.twin.map((t) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <div className="flex-1">
                      <ScoreBar score={t.score} label={t.label} size="sm" />
                    </div>
                    <ChangeBadge changePct={t.changePct} />
                  </div>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="trend-changes"
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 id="trend-changes" className="font-display text-lg font-bold">
                What changed — and why
              </h2>
              <ul className="mt-4 space-y-3">
                {location.trends.map((trend) => {
                  const sev = SEVERITY_STYLE[trend.severity];
                  return (
                    <li
                      key={trend.label}
                      className={cn("rounded-lg border p-4", sev.classes)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <sev.icon className="h-4 w-4" aria-hidden="true" />
                          {trend.label}
                        </span>
                        <ChangeBadge changePct={trend.changePct} />
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {trend.reason}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <section
            aria-labelledby="gov-actions"
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 id="gov-actions" className="flex items-center gap-2 font-display text-lg font-bold">
              <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
              Recommended government actions
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {location.recommendations.map((rec) => (
                <li
                  key={rec.text}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4"
                >
                  <span
                    className={cn(
                      "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      rec.priority === "high" && "bg-score-low/15 text-score-low",
                      rec.priority === "medium" && "bg-score-mid/15 text-score-mid",
                      rec.priority === "low" && "bg-score-high/15 text-score-high",
                    )}
                  >
                    {rec.priority}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">{rec.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>

        {/* SAFETY */}
        <TabsContent value="safety" className="mt-6 space-y-6">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                This section shows <strong className="text-foreground">aggregated incident intelligence</strong> —
                counts and trends for an area. It never identifies, profiles or
                labels individuals.
              </span>
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="incident-table"
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 id="incident-table" className="font-display text-lg font-bold">
                Incident intelligence
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {location.incidents[0]?.period} · verified sample feed
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-3 font-semibold">Type</th>
                      <th className="pb-2 pr-3 text-right font-semibold">Count</th>
                      <th className="pb-2 pr-3 text-right font-semibold">Previous</th>
                      <th className="pb-2 text-right font-semibold">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {location.incidents.map((inc) => (
                      <tr key={inc.type} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-3 font-medium text-foreground">{inc.type}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">{inc.count}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-muted-foreground">
                          {inc.previousCount}
                        </td>
                        <td className="py-2.5 text-right">
                          <ChangeBadge changePct={inc.changePct} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              aria-labelledby="incident-trend"
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 id="incident-trend" className="font-display text-lg font-bold">
                Incident volume — last 6 months
              </h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={location.monthlyIncidents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ASSISTANT */}
        <TabsContent value="assistant" className="mt-6 space-y-6">
          <section
            aria-labelledby="persona-picker"
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 id="persona-picker" className="font-display text-lg font-bold">
              What are you looking for?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a goal — the analysis re-weights the category scores for{" "}
              {location.name} accordingly.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PERSONAS.map((p) => {
                const Icon = PERSONA_ICONS[p.key];
                const active = p.key === persona;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPersona(p.key)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      active
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-card hover:border-primary/40 hover:bg-accent/50",
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")}
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-bold text-foreground">{p.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.headline}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <strong className="text-foreground">{activePersona.label} analysis weighs:</strong>{" "}
              {activePersona.consideration}
            </p>
          </section>

          <section
            aria-labelledby="suitability-result"
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="suitability-result" className="font-display text-lg font-bold">
                  {activePersona.label} suitability — {location.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {suitability.bandLabel}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ScorePill score={suitability.score} />
              </div>
            </div>
            <div className="mt-4 max-w-md">
              <ScoreBar score={suitability.score} showValue={false} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-score-high" aria-hidden="true" />
                  Advantages
                </h3>
                <ul className="mt-2 space-y-2">
                  {suitability.advantages.length === 0 && (
                    <li className="text-xs text-muted-foreground">
                      No category currently clears the strong-advantage threshold for this goal.
                    </li>
                  )}
                  {suitability.advantages.map((a) => (
                    <li key={a} className="rounded-lg bg-score-high/10 p-3 text-xs leading-relaxed text-foreground">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <XCircle className="h-4 w-4 text-score-low" aria-hidden="true" />
                  Challenges
                </h3>
                <ul className="mt-2 space-y-2">
                  {suitability.challenges.length === 0 && (
                    <li className="text-xs text-muted-foreground">
                      No major challenge categories detected for this goal.
                    </li>
                  )}
                  {suitability.challenges.map((c) => (
                    <li key={c} className="rounded-lg bg-score-low/10 p-3 text-xs leading-relaxed text-foreground">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Lightbulb className="h-4 w-4 text-score-mid" aria-hidden="true" />
                  Recommendation
                </h3>
                <p className="mt-2 rounded-lg bg-score-mid/10 p-3 text-xs leading-relaxed text-foreground">
                  {suitability.recommendation}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <h3 className="text-sm font-bold text-foreground">Factor breakdown</h3>
              <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {suitability.factors.map((f) => (
                  <ScoreBar
                    key={f.label}
                    score={f.score}
                    label={`${f.label} (weight ${(f.weight * 100).toFixed(0)}%)`}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex flex-wrap gap-2 print:hidden">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={async () => {
            const url = `${window.location.origin}/location/${location.slug}`;
            try {
              await navigator.clipboard.writeText(url);
            } catch {
              // ignore
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          Copy link
        </button>
      </div>

      <div className="mt-8">
        <ReportForm slug={location.slug} />
      </div>

      <p className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
        {MOCK_DISCLAIMER}
      </p>
    </div>
  );
}
