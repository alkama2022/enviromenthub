import { createFileRoute } from "@tanstack/react-router";
import {
  Landmark,
  AlertTriangle,
  Info,
  MapPin,
  Activity,
  Flag,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LOCATIONS, MOCK_DISCLAIMER, type TrendChange } from "@/lib/locations";
import { ChangeBadge, ScorePill } from "@/components/score-bar";
import { GovernmentMap } from "@/components/interactive-map";
import { AlertSubscribeButton } from "@/components/alert-subscribe-button";
import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "@/components/voice-input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/government")({
  head: () => ({
    meta: [
      { title: "Government Intelligence Dashboard | TerraLens" },
      {
        name: "description",
        content:
          "Regional environmental intelligence for planners: flagged areas, hazard monitoring, incident trends, infrastructure gaps and recommended actions.",
      },
      { property: "og:title", content: "Government Intelligence Dashboard | TerraLens" },
      {
        property: "og:description",
        content:
          "Regional environmental intelligence for planners: flagged areas, hazard monitoring, incident trends, infrastructure gaps and recommended actions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GovernmentPage,
});

const METRIC_FILTERS = [
  { value: "all", label: "All metrics" },
  { value: "incidents", label: "Public safety incidents" },
  { value: "flood", label: "Flood & erosion risk" },
  { value: "air", label: "Air quality" },
  { value: "waste", label: "Waste accumulation" },
  { value: "transport", label: "Transport & roads" },
  { value: "water", label: "Water availability" },
  { value: "economic", label: "Economic activity" },
] as const;

const PERIOD_FILTERS = [
  { value: "6", label: "Last 6 months" },
  { value: "3", label: "Last 3 months" },
] as const;

const INCIDENT_TYPES = [
  "All types",
  "Theft",
  "Burglary",
  "Traffic accidents",
  "Robbery",
  "Fire outbreaks",
] as const;

const LOC_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// Nigeria bounding box for the schematic fallback: lat 4–14, lng 2–15
function pinPosition(coords: [number, number]) {
  const [lat, lng] = coords;
  return {
    left: `${Math.min(96, Math.max(4, ((lng - 2) / 13) * 100))}%`,
    top: `${Math.min(92, Math.max(6, ((14 - lat) / 10) * 100))}%`,
  };
}

interface AlertItem {
  locationSlug: string;
  locationName: string;
  state: string;
  trend: TrendChange;
}

function GovernmentPage() {
  const { t } = useI18n();
  const [metric, setMetric] = useState<string>("all");
  const [period, setPeriod] = useState<string>("6");
  const [incidentType, setIncidentType] = useState<string>("All types");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    LOCATIONS[0]?.slug ?? "",
  );

  const alerts: AlertItem[] = useMemo(() => {
    const items = LOCATIONS.flatMap((loc) =>
      loc.trends
        .filter((t) => t.severity !== "info")
        .map((trend) => ({
          locationSlug: loc.slug,
          locationName: loc.name,
          state: loc.state,
          trend,
        })),
    );
    const filtered =
      metric === "all" ? items : items.filter((a) => a.trend.metric === metric);
    return filtered.sort((a, b) => {
      const rank = { critical: 0, warning: 1, info: 2 } as const;
      return rank[a.trend.severity] - rank[b.trend.severity];
    });
  }, [metric]);

  const months = period === "3" ? 3 : 6;
  const trendData = useMemo(() => {
    const periods = (LOCATIONS[0]?.monthlyIncidents ?? [])
      .slice(-months)
      .map((m) => m.period);
    return periods.map((p) => {
      const row: Record<string, string | number> = { period: p };
      LOCATIONS.forEach((loc) => {
        const point = loc.monthlyIncidents.find((m) => m.period === p);
        row[loc.name] = point?.count ?? 0;
      });
      return row;
    });
  }, [months]);

  const incidentRows = useMemo(
    () =>
      LOCATIONS.flatMap((loc) =>
        loc.incidents
          .filter((inc) => incidentType === "All types" || inc.type === incidentType)
          .map((inc) => ({ ...inc, locationName: loc.name, state: loc.state })),
      ),
    [incidentType],
  );

  const selectedLocation = LOCATIONS.find((l) => l.slug === selectedSlug) ?? LOCATIONS[0]!;
  const criticalCount = alerts.filter((a) => a.trend.severity === "critical").length;

  const severityOf = (slug: string) => {
    const loc = LOCATIONS.find((l) => l.slug === slug);
    if (!loc) return "ok";
    if (loc.trends.some((t) => t.severity === "critical")) return "critical";
    if (loc.trends.some((t) => t.severity === "warning")) return "warning";
    return "ok";
  };

  return (
    <div id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Landmark className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("government.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("government.subtitle")}
          </p>
        </div>
      </div>
      <div className="mt-3"><ReadAloud text={`${t("government.title")} ${t("government.subtitle")}`} /></div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: MapPin, label: "Monitored locations", value: String(LOCATIONS.length) },
          { icon: Flag, label: "Areas flagged for attention", value: String(alerts.length) },
          { icon: AlertTriangle, label: "Critical alerts", value: String(criticalCount) },
          {
            icon: Activity,
            label: "Incident reports (Aug, all areas)",
            value: LOCATIONS.reduce(
              (sum, l) => sum + (l.monthlyIncidents.find((m) => m.period === "Aug")?.count ?? 0),
              0,
            ).toLocaleString(),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <card.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-extrabold tabular-nums">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Metric
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {METRIC_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Time period
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {PERIOD_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Incident type
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Map */}
        <section
          aria-labelledby="map-heading"
          className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-3"
        >
          <h2 id="map-heading" className="font-display text-lg font-bold">
            National environmental intelligence map
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Interactive OpenStreetMap — pins coloured by the most severe active flag. Select a pin for details.
          </p>
          <GovernmentMap selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">Show schematic fallback</summary>
            <div
              className="relative mt-3 h-80 overflow-hidden rounded-lg border border-border"
              style={{
                backgroundColor: "var(--secondary)",
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
              role="img"
              aria-label="Schematic map of Nigeria with monitored location pins (fallback)"
            >
              {LOCATIONS.map((loc) => {
                const sev = severityOf(loc.slug);
                const pos = pinPosition(loc.coords);
                return (
                  <button
                    key={loc.slug}
                    type="button"
                    onClick={() => setSelectedSlug(loc.slug)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={pos}
                    aria-label={`${loc.name}, ${loc.state} — ${sev === "ok" ? "no active flags" : `${sev} flag`}`}
                  >
                    <span
                      className={cn(
                        "block h-4 w-4 rounded-full border-2 border-card shadow-md transition-transform group-hover:scale-125",
                        sev === "critical" && "bg-score-low",
                        sev === "warning" && "bg-score-mid",
                        sev === "ok" && "bg-score-high",
                        selectedSlug === loc.slug && "ring-4 ring-primary/30",
                      )}
                    />
                    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
                      {loc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </details>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-score-low" /> Critical flag
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-score-mid" /> Warning flag
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-score-high" /> No active flags
            </span>
          </div>

          {/* Selected location detail */}
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold">
                {selectedLocation.name}, {selectedLocation.state}
              </h3>
              <div className="flex items-center gap-2">
                <ScorePill score={selectedLocation.overallScore} />
                <AlertSubscribeButton slug={selectedLocation.slug} />
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {selectedLocation.recommendations.map((rec) => (
                <li key={rec.text} className="flex items-start gap-2 text-xs text-foreground">
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      rec.priority === "high" && "bg-score-low/15 text-score-low",
                      rec.priority === "medium" && "bg-score-mid/15 text-score-mid",
                      rec.priority === "low" && "bg-score-high/15 text-score-high",
                    )}
                  >
                    {rec.priority}
                  </span>
                  {rec.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Alerts */}
        <section
          aria-labelledby="alerts-heading"
          className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2"
        >
          <h2 id="alerts-heading" className="flex items-center gap-2 font-display text-lg font-bold">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
            Flagged areas
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Areas requiring attention, based on aggregated incident and
            environmental data — not individuals.
          </p>
          <ul className="mt-4 space-y-3">
            {alerts.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No flags match the selected metric filter.
              </li>
            )}
            {alerts.map((alert) => (
              <li
                key={`${alert.locationSlug}-${alert.trend.label}`}
                className={cn(
                  "rounded-lg border p-3.5",
                  alert.trend.severity === "critical"
                    ? "border-score-low/40 bg-score-low/10"
                    : "border-score-mid/40 bg-score-mid/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    {alert.trend.severity === "critical" ? (
                      <AlertTriangle className="h-4 w-4 text-score-low" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-score-mid" aria-hidden="true" />
                    )}
                    {alert.trend.label}
                  </span>
                  <ChangeBadge changePct={alert.trend.changePct} />
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {alert.locationName}, {alert.state}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {alert.trend.reason}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Trend chart */}
        <section
          aria-labelledby="trend-heading"
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 id="trend-heading" className="flex items-center gap-2 font-display text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            Incident trends by location
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Aggregated monthly incident reports, {period === "3" ? "last 3" : "last 6"} months.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={44} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {LOCATIONS.map((loc, i) => (
                  <Line
                    key={loc.slug}
                    type="monotone"
                    dataKey={loc.name}
                    stroke={LOC_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Incident table */}
        <section
          aria-labelledby="incidents-heading"
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="p-6 pb-0">
            <h2 id="incidents-heading" className="font-display text-lg font-bold">
              Incident breakdown
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {incidentType === "All types" ? "All incident types" : incidentType} across monitored
              locations, Q2 2026 vs Q1 2026.
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto p-6">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-3 font-semibold">Location</th>
                  <th className="pb-2 pr-3 font-semibold">Type</th>
                  <th className="pb-2 pr-3 text-right font-semibold">Count</th>
                  <th className="pb-2 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {incidentRows.map((row) => (
                  <tr
                    key={`${row.locationName}-${row.type}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2.5 pr-3 font-medium text-foreground">{row.locationName}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{row.type}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{row.count}</td>
                    <td className="py-2.5 text-right">
                      <ChangeBadge changePct={row.changePct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            This dashboard detects <strong className="text-foreground">patterns in places</strong> —
            hotspots, sudden increases, response gaps. It does not identify,
            predict or label individuals, and must not be used to target people
            by appearance, ethnicity, neighbourhood or social media activity.
          </span>
        </p>
      </div>

      <p className="mt-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
        {MOCK_DISCLAIMER}
      </p>
    </div>
  );
}
