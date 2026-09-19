import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompareRow, Discrepancy, Indicator, TrendPoint } from "@/lib/category-intel";
import { ScoreBar } from "@/components/score-bar";
import { cn } from "@/lib/utils";

const CHART_TOOLTIP = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: 12,
} as const;

export function TrendChart({
  points,
  title,
}: {
  points: TrendPoint[];
  title: string;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} aria-label={title}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={36} />
          <Tooltip contentStyle={CHART_TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="value" name="This area" stroke="var(--chart-1)" strokeWidth={2.5} dot />
          <Line
            type="monotone"
            dataKey="benchmark"
            name="National baseline"
            stroke="var(--chart-3)"
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IndicatorBreakdown({
  indicators,
  score,
  computed,
  categoryLabel,
}: {
  indicators: Indicator[];
  score: number;
  computed: number;
  categoryLabel: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {categoryLabel} scores <strong className="text-foreground">{score}/100</strong>. That number
        is the weighted average of the five indicators below (weighted total{" "}
        {computed.toFixed(1)}, rounded to {Math.round(computed)}).
      </p>
      <div className="mt-5 space-y-5">
        {indicators.map((ind) => (
          <div key={ind.label}>
            <ScoreBar
              score={ind.score}
              label={`${ind.label} · weight ${(ind.weight * 100).toFixed(0)}%`}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {ind.note} Contributes {(ind.score * ind.weight).toFixed(1)} points to the total.
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={indicators.map((i) => ({ name: i.label, score: i.score }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={0} height={50} angle={-12} textAnchor="end" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={36} />
            <Tooltip contentStyle={CHART_TOOLTIP} />
            <Bar dataKey="score" name="Indicator score" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const BENCHMARKS = [
  { id: "state", label: "State / regional average" },
  { id: "national", label: "National average" },
] as const;

export function ComparisonView({
  rows,
  areaLabel,
}: {
  rows: CompareRow[];
  areaLabel: string;
}) {
  const [benchmark, setBenchmark] = useState<"state" | "national" | "both">("both");

  const chartData = rows.map((r) => ({
    name: r.indicator,
    area: Number(r.area) || 0,
    state: Number(r.stateAvg) || 0,
    national: Number(r.nationalAvg) || 0,
  }));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setBenchmark("both")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-medium",
            benchmark === "both" ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-accent",
          )}
        >
          Both benchmarks
        </button>
        {BENCHMARKS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBenchmark(b.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium",
              benchmark === b.id ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-accent",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-3 font-semibold">Indicator</th>
              <th className="pb-2 pr-3 text-right font-semibold">{areaLabel}</th>
              {benchmark !== "national" && <th className="pb-2 pr-3 text-right font-semibold">State avg.</th>}
              {benchmark !== "state" && <th className="pb-2 text-right font-semibold">National avg.</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.indicator} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 font-medium text-foreground">{r.indicator}</td>
                <td className="py-2.5 pr-3 text-right font-semibold tabular-nums text-foreground">{r.area}</td>
                {benchmark !== "national" && (
                  <td className="py-2.5 pr-3 text-right tabular-nums text-muted-foreground">{r.stateAvg}</td>
                )}
                {benchmark !== "state" && (
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{r.nationalAvg}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={0} height={50} angle={-12} textAnchor="end" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={36} />
            <Tooltip contentStyle={CHART_TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="area" name={areaLabel} fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            {benchmark !== "national" && (
              <Bar dataKey="state" name="State avg." fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            )}
            {benchmark !== "state" && (
              <Bar dataKey="national" name="National avg." fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Benchmarks are computed across the demo dataset and are illustrative baselines, not
        official statistics.
      </p>
    </div>
  );
}

export function DiscrepancyNotice({ items }: { items: Discrepancy[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-score-mid/40 bg-score-mid/10 p-5">
      <p className="text-sm font-bold text-foreground">Sources disagree on this indicator</p>
      <ul className="mt-3 space-y-3">
        {items.map((d) => (
          <li key={d.indicator} className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">{d.indicator}:</strong> {d.sourceA} reports{" "}
            <strong className="text-foreground">{d.valueA}</strong>, while {d.sourceB} reports{" "}
            <strong className="text-foreground">{d.valueB}</strong>. Both are shown rather than
            silently choosing one.
          </li>
        ))}
      </ul>
    </div>
  );
}
