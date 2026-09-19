import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { GitCompareArrows, Plus, X, MapPin, Share2, Download, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  LOCATIONS,
  MOCK_DISCLAIMER,
  type CategoryKey,
} from "@/lib/locations";
import { ScorePill } from "@/components/score-bar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>) => ({
    slugs: typeof (search as Record<string, unknown>)["slugs"] === "string" ? (search as Record<string, unknown>)["slugs"] as string : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Compare Locations | TerraLens" },
      {
        name: "description",
        content:
          "Compare up to three Nigerian locations side by side: environment scores, safety, healthcare, business potential, cost of living and more.",
      },
      { property: "og:title", content: "Compare Locations | TerraLens" },
      {
        property: "og:description",
        content:
          "Compare up to three Nigerian locations side by side: environment scores, safety, healthcare, business potential, cost of living and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

const SHORT_LABELS: Record<CategoryKey, string> = {
  publicSafety: "Safety",
  healthcare: "Health",
  weather: "Weather",
  business: "Business",
  infrastructure: "Infra",
  environment: "Environ",
  transportation: "Transit",
  education: "Education",
  economic: "Economy",
  tourism: "Tourism",
};

const LOC_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function ComparePage() {
  const { slugs } = Route.useSearch();
  const navigate = useNavigate({ from: "/compare" });
  const initial = slugs ? slugs.split(",").filter(Boolean).slice(0, 3) : ["wuse-2-abuja", "ikeja-lagos"];
  const [selected, setSelected] = useState<string[]>(initial);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const qs = selected.join(",");
    navigate({ search: { slugs: qs || undefined }, replace: true });
  }, [selected, navigate]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/compare?slugs=${selected.join(",")}` : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };
  const exportCsv = () => {
    const header = ["Category", ...selected.map((s) => LOCATIONS.find((l) => l.slug === s)?.name ?? s)].join(",");
    const rows = CATEGORY_ORDER.map((k) => [CATEGORY_LABELS[k], ...selected.map((s) => String(LOCATIONS.find((l) => l.slug === s)?.categories.find((c) => c.key === k)?.score ?? ""))].join(",")).join("\n");
    const csv = `${header}\n${rows}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terralens-compare-${selected.join("-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const locations = useMemo(
    () =>
      selected
        .map((s) => LOCATIONS.find((l) => l.slug === s))
        .filter((l): l is (typeof LOCATIONS)[number] => Boolean(l)),
    [selected],
  );

  const available = LOCATIONS.filter((l) => !selected.includes(l.slug));

  const addLocation = (slug: string) => {
    if (selected.length < 3) setSelected((prev) => [...prev, slug]);
  };

  const removeLocation = (slug: string) => {
    setSelected((prev) => prev.filter((s) => s !== slug));
  };

  const radarData = CATEGORY_ORDER.map((key) => {
    const row: Record<string, string | number> = { category: SHORT_LABELS[key] };
    locations.forEach((loc) => {
      row[loc.name] = loc.categories.find((c) => c.key === key)?.score ?? 0;
    });
    return row;
  });

  const bestOverall = Math.max(...locations.map((l) => l.overallScore), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <GitCompareArrows className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Compare locations
          </h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side environmental intelligence for up to three locations.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
          {copied ? <Link2 className="h-3.5 w-3.5 text-score-high" /> : <Share2 className="h-3.5 w-3.5" />} {copied ? "Copied!" : "Copy share link"}
        </button>
        <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
          <Download className="h-3.5 w-3.5" /> Print / PDF
        </button>
      </div>

      {/* Selector */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {locations.map((loc, i) => (
          <span
            key={loc.slug}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-4 pr-2 text-sm font-medium shadow-sm"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: LOC_COLORS[i] }}
              aria-hidden="true"
            />
            {loc.name}, {loc.state}
            <button
              type="button"
              onClick={() => removeLocation(loc.slug)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={`Remove ${loc.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {selected.length < 3 && available.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {available.map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => addLocation(loc.slug)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {loc.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {locations.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Select at least one location to start comparing.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Overall cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc, i) => (
              <Link
                key={loc.slug}
                to="/location/$slug"
                params={{ slug: loc.slug }}
                className={cn(
                  "rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
                  loc.overallScore === bestOverall && locations.length > 1
                    ? "border-primary"
                    : "border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: LOC_COLORS[i] }}
                    aria-hidden="true"
                  />
                  {loc.overallScore === bestOverall && locations.length > 1 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Highest overall
                    </span>
                  )}
                </div>
                <h2 className="mt-3 flex items-center gap-1.5 font-display text-lg font-bold">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                  {loc.name}
                </h2>
                <p className="text-xs text-muted-foreground">{loc.state}</p>
                <div className="mt-3">
                  <ScorePill score={loc.overallScore} />
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{loc.tagline}</p>
              </Link>
            ))}
          </div>

          {/* Radar */}
          <section
            aria-labelledby="radar-heading"
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 id="radar-heading" className="font-display text-lg font-bold">
              Category profile
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              All ten category scores, overlaid.
            </p>
            <div className="mt-4 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                  />
                  {locations.map((loc, i) => (
                    <Radar
                      key={loc.slug}
                      name={loc.name}
                      dataKey={loc.name}
                      stroke={LOC_COLORS[i]}
                      fill={LOC_COLORS[i]}
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Category table */}
          <section
            aria-labelledby="table-heading"
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="p-6 pb-0">
              <h2 id="table-heading" className="font-display text-lg font-bold">
                Score by category
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Best score in each row is highlighted.
              </p>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-semibold">Category</th>
                    {locations.map((loc, i) => (
                      <th key={loc.slug} className="pb-2 pr-4 text-right font-semibold last:pr-0">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: LOC_COLORS[i] }}
                            aria-hidden="true"
                          />
                          {loc.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORY_ORDER.map((key) => {
                    const scores = locations.map(
                      (loc) => loc.categories.find((c) => c.key === key)?.score ?? 0,
                    );
                    const best = Math.max(...scores);
                    return (
                      <tr key={key} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-foreground">
                          {CATEGORY_LABELS[key]}
                        </td>
                        {scores.map((score, i) => (
                          <td
                            key={locations[i]?.slug ?? i}
                            className={cn(
                              "py-2.5 pr-4 text-right tabular-nums last:pr-0",
                              score === best && locations.length > 1
                                ? "font-bold text-score-high"
                                : "text-muted-foreground",
                            )}
                          >
                            {score}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick facts table */}
          <section
            aria-labelledby="facts-heading"
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="p-6 pb-0">
              <h2 id="facts-heading" className="font-display text-lg font-bold">
                Key facts
              </h2>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-semibold">Fact</th>
                    {locations.map((loc) => (
                      <th key={loc.slug} className="pb-2 pr-4 text-right font-semibold last:pr-0">
                        {loc.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(locations[0]?.quickFacts ?? []).map((fact, rowIdx) => (
                    <tr key={fact.label} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{fact.label}</td>
                      {locations.map((loc) => (
                        <td
                          key={loc.slug}
                          className="py-2.5 pr-4 text-right text-muted-foreground last:pr-0"
                        >
                          {loc.quickFacts[rowIdx]?.value ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <p className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
        {MOCK_DISCLAIMER}
      </p>
    </div>
  );
}
