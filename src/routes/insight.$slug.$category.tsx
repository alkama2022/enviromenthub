import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  LOCATIONS,
  MOCK_DISCLAIMER,
  getLocation,
  type CategoryKey,
} from "@/lib/locations";
import {
  buildCategoryIntel,
  slugToCategory,
  weightedScore,
} from "@/lib/category-intel";
import { ScorePill } from "@/components/score-bar";
import { Expandable, KpiCard, Section, SourceList } from "@/components/intel/kpi-card";
import {
  ComparisonView,
  DiscrepancyNotice,
  IndicatorBreakdown,
  TrendChart,
} from "@/components/intel/comparison";
import {
  FacilityDirectory,
  LocationPermissionPanel,
  NearbyRecommendations,
  type ReferencePoint,
} from "@/components/intel/facility-directory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insight/$slug/$category")({
  head: ({ params }) => {
    const loc = getLocation(params.slug);
    const key = slugToCategory(params.category);
    const label = key ? CATEGORY_LABELS[key] : "Category";
    const title = loc
      ? `${label} in ${loc.name}, ${loc.state} — Intelligence Report | TerraLens`
      : "Category report not found | TerraLens";
    const description = loc
      ? `Deep-dive ${label.toLowerCase()} intelligence for ${loc.name}, ${loc.state}: score breakdown, key indicators, trends, local facilities, risks, opportunities and data sources.`
      : "This category report is not in the demo dataset.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryInsightPage,
});

type GeoStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

function CategoryInsightPage() {
  const { slug, category } = Route.useParams();
  const location = getLocation(slug);
  const key = slugToCategory(category);

  const [analyzing, setAnalyzing] = useState(true);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  useEffect(() => {
    setAnalyzing(true);
    const t = setTimeout(() => setAnalyzing(false), 450);
    return () => clearTimeout(t);
  }, [slug, category]);

  const intel = useMemo(
    () => (location && key ? buildCategoryIntel(location, key) : null),
    [location, key],
  );

  if (!location || !key || !intel) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold">Report not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No reliable data is currently available for this location and category combination in the
          demo dataset.
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

  const reference: ReferencePoint = userCoords
    ? { coords: userCoords, label: "your current location", precise: true }
    : {
        coords: location.coords,
        label: `${location.name} area centre`,
        precise: false,
      };

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  const computed = weightedScore(intel.indicators);
  const otherCategories = location.categories.filter((c) => c.key !== key);

  if (analyzing) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-foreground">
          Analyzing the latest available data…
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {intel.label} · {location.name}, {location.state}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/location/$slug"
        params={{ slug: location.slug }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to {location.name} profile
      </Link>

      {/* Header */}
      <header className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Analysis area:
              <strong className="text-foreground">
                {location.country} → {location.state} → {location.name}
              </strong>
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {intel.label}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{intel.interpretation}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Data updated: {intel.lastUpdated}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-xl border border-border bg-muted/40 p-5">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border-8"
              style={{
                borderColor:
                  intel.score >= 72
                    ? "var(--score-high)"
                    : intel.score >= 55
                      ? "var(--score-mid)"
                      : "var(--score-low)",
              }}
            >
              <span className="font-display text-2xl font-extrabold tabular-nums">{intel.score}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {intel.label} score
              </p>
              <p className="mt-1 text-sm text-muted-foreground">out of 100</p>
            </div>
          </div>
        </div>

        {/* Area & category switchers */}
        <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted-foreground">
            Change analysis area
            <select
              value={location.slug}
              onChange={(e) => {
                window.location.href = `/insight/${e.target.value}/${key}`;
              }}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {LOCATIONS.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}, {l.state}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Jump to another category
            <select
              value={key}
              onChange={(e) => {
                window.location.href = `/insight/${location.slug}/${e.target.value}`;
              }}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {[{ key, score: intel.score }, ...otherCategories].map((c) => (
                <option key={c.key} value={c.key}>
                  {CATEGORY_LABELS[c.key as CategoryKey]} — {c.score}/100
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <Tabs defaultValue="summary" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="summary">Executive summary</TabsTrigger>
          <TabsTrigger value="score">Why this score?</TabsTrigger>
          <TabsTrigger value="trends">Trends &amp; comparison</TabsTrigger>
          {intel.facilities && <TabsTrigger value="places">Local facilities</TabsTrigger>}
          <TabsTrigger value="means">What this means</TabsTrigger>
          <TabsTrigger value="sources">Sources &amp; method</TabsTrigger>
        </TabsList>

        {/* SUMMARY */}
        <TabsContent value="summary" className="mt-6 space-y-6">
          <Section id="exec-summary" title="Executive summary">
            <p className="text-sm leading-relaxed text-foreground">{intel.executiveSummary}</p>
          </Section>

          <section aria-labelledby="key-indicators">
            <h2 id="key-indicators" className="font-display text-xl font-bold">
              Key indicators
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every figure carries its source and whether it is measured or estimated. Indicators
              without a basis in the dataset say so instead of showing a number.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {intel.kpis.map((k) => (
                <KpiCard key={k.label} kpi={k} />
              ))}
            </div>
          </section>

          <DiscrepancyNotice items={intel.discrepancies} />

          <Section id="detailed-analysis" title="Detailed analysis">
            <div className="space-y-3">
              {intel.analysis.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </Section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Section id="positives" title="Positive indicators">
              <ul className="space-y-2">
                {intel.positives.map((p) => (
                  <li key={p} className="flex gap-2 rounded-lg bg-score-high/10 p-3 text-xs leading-relaxed text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-score-high" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
            <Section id="risks" title="Risks &amp; gaps">
              <ul className="space-y-2">
                {intel.risks.map((p) => (
                  <li key={p} className="flex gap-2 rounded-lg bg-score-low/10 p-3 text-xs leading-relaxed text-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-score-low" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
            <Section id="opportunities" title="Opportunities">
              <ul className="space-y-2">
                {intel.opportunities.map((p) => (
                  <li key={p} className="flex gap-2 rounded-lg bg-score-mid/10 p-3 text-xs leading-relaxed text-foreground">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-score-mid" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] italic text-muted-foreground">
                Analytical inference from the indicators above — not an observed market fact.
              </p>
            </Section>
          </div>
        </TabsContent>

        {/* SCORE */}
        <TabsContent value="score" className="mt-6 space-y-6">
          <Section
            id="score-breakdown"
            title={`Why is this score ${intel.score}?`}
            description="The score is not a judgement call — it is arithmetic over five weighted indicators."
          >
            <IndicatorBreakdown
              indicators={intel.indicators}
              score={intel.score}
              computed={computed}
              categoryLabel={intel.label}
            />
          </Section>

          <Expandable title="Methodology">
            <ol className="list-decimal space-y-3 pl-5">
              {intel.methodology.map((m) => (
                <li key={m} className="text-sm leading-relaxed text-muted-foreground">
                  {m}
                </li>
              ))}
            </ol>
          </Expandable>
        </TabsContent>

        {/* TRENDS */}
        <TabsContent value="trends" className="mt-6 space-y-6">
          <Section id="trend" title={intel.trend.title} description={`Measured in ${intel.trend.unit}.`}>
            <TrendChart points={intel.trend.points} title={intel.trend.title} />
          </Section>

          <Section
            id="comparison"
            title="Compare with other areas"
            description="How this area sits against state and national baselines for the same indicators."
          >
            <ComparisonView rows={intel.comparison} areaLabel={location.name} />
          </Section>

          <Section
            id="peer-compare"
            title="Compare with another location"
            description="Same category, other areas in the demo dataset."
          >
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LOCATIONS.filter((l) => l.slug !== location.slug).map((l) => {
                const c = l.categories.find((x) => x.key === key);
                if (!c) return null;
                return (
                  <li key={l.slug}>
                    <Link
                      to="/insight/$slug/$category"
                      params={{ slug: l.slug, category: key }}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{l.name}</span>
                        <span className="block text-xs text-muted-foreground">{l.state}</span>
                      </span>
                      <ScorePill score={c.score} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        </TabsContent>

        {/* PLACES */}
        {intel.facilities && (
          <TabsContent value="places" className="mt-6 space-y-6">
            <LocationPermissionPanel
              reference={reference}
              status={geoStatus}
              onUseMyLocation={useMyLocation}
              onReset={() => {
                setUserCoords(null);
                setGeoStatus("idle");
              }}
            />

            <Section
              id="nearby"
              title="Recommended near you"
              description="Ranked by distance, emergency capability and listed services — explained on every card."
            >
              <NearbyRecommendations
                facilities={intel.facilities}
                reference={reference}
                categoryLabel={intel.label}
              />
            </Section>

            <FacilityDirectory
              heading={intel.facilityHeading}
              facilities={intel.facilities}
              reference={reference}
            />
          </TabsContent>
        )}

        {/* MEANS */}
        <TabsContent value="means" className="mt-6 space-y-6">
          <Section
            id="means-for-you"
            title="What this means for you"
            description="Practical conclusions drawn from the indicators on this page."
          >
            <ul className="grid gap-4 sm:grid-cols-2">
              {intel.meansFor.map((m) => (
                <li key={m.audience} className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                    {m.audience}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{m.text}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="other-cats" title="Other categories for this area">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherCategories.map((c) => (
                <li key={c.key}>
                  <Link
                    to="/insight/$slug/$category"
                    params={{ slug: location.slug, category: c.key }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {CATEGORY_LABELS[c.key]}
                    </span>
                    <ScorePill score={c.score} />
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </TabsContent>

        {/* SOURCES */}
        <TabsContent value="sources" className="mt-6 space-y-6">
          <Section
            id="sources"
            title="Data sources"
            description="Every important figure on this page traces back to one of these."
          >
            <SourceList sources={intel.sources} />
          </Section>

          <Expandable title="Methodology" defaultOpen>
            <ol className="list-decimal space-y-3 pl-5">
              {intel.methodology.map((m) => (
                <li key={m} className="text-sm leading-relaxed text-muted-foreground">
                  {m}
                </li>
              ))}
            </ol>
          </Expandable>

          <div className={cn("rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground")}>
            {MOCK_DISCLAIMER}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
