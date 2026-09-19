import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  MapPin,
  Navigation,
  Clock,
  Star,
  Phone,
  Globe,
  Accessibility,
  ShieldAlert,
  Info,
  Loader2,
  HelpCircle,
  Filter,
} from "lucide-react";

import { LOCATIONS, MOCK_DISCLAIMER } from "@/lib/locations";
import {
  PLACES_DISCLAIMER,
  PLACE_CATEGORY_LABELS,
  placesForLocation,
  priceLabel,
  type Place,
} from "@/lib/places";
import {
  EMERGENCY_NOTICE,
  INTENT_LABELS,
  interpretQueryLocally,
  rankPlaces,
  type Recommendation,
  type StructuredQuery,
} from "@/lib/discovery";
import { interpretQuery } from "@/lib/discovery.functions";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Ask TerraLens — Find the right place near you" },
      {
        name: "description",
        content:
          "Ask in plain language where to go — treatment, a holiday outing, a family restaurant, a quiet park — and get ranked places with a clear explanation of why each one fits.",
      },
      { property: "og:title", content: "Ask TerraLens — Find the right place near you" },
      {
        property: "og:description",
        content:
          "Conversational place discovery: describe what you need and get ranked, explained recommendations from the Environment Hub place directory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverPage,
});

const EXAMPLES = [
  "Where can I get treatment for malaria?",
  "Where should I go for my public holiday?",
  "Where can I take my children for entertainment?",
  "Where can I find a peaceful place to relax?",
  "Where can I find a pharmacy nearby?",
  "Where can I go to learn about the history of this area?",
  "Where can I find a good restaurant for a family gathering?",
];

function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState(LOCATIONS[0]!.slug);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "asking" | "granted" | "denied" | "unsupported">("idle");
  const [result, setResult] = useState<StructuredQuery | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [maxKm, setMaxKm] = useState(0);

  const area = LOCATIONS.find((l) => l.slug === slug)!;
  const runInterpret = useServerFn(interpretQuery);

  const mutation = useMutation({
    mutationFn: (q: string) => runInterpret({ data: { query: q } }),
    onSuccess: (sq) => setResult(sq),
    onError: (_e, q) => setResult({ ...interpretQueryLocally(q), engine: "rules" }),
  });

  const origin = userCoords ?? area.coords;
  const originLabel = userCoords ? "your location" : area.name;

  const recommendations: Recommendation[] = useMemo(() => {
    if (!result || result.needsClarification) return [];
    return rankPlaces(placesForLocation(slug), result, { origin, originLabel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, slug, userCoords]);

  const filtered = recommendations.filter((r) => {
    if (openOnly && r.openNow !== true) return false;
    if (maxKm > 0 && r.distanceKm !== null && r.distanceKm > maxKm) return false;
    return true;
  });

  const submit = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setQuery(text);
    mutation.mutate(text);
  };

  const askLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setGeoState("granted");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Conversational place assistant
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ask Environment Hub where you should go
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Describe what you need in your own words. The assistant works out what you are
          looking for, searches the place directory for this area, ranks the options and
          explains why each one is suggested.
        </p>
      </header>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              aria-label="Ask where you should go"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
            Ask
          </button>
        </div>

        {/* Area + location */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Analysis area
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground"
            >
              {LOCATIONS.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}, {l.state}
                </option>
              ))}
            </select>
          </label>

          {geoState !== "granted" ? (
            <button
              type="button"
              onClick={askLocation}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-medium text-foreground hover:bg-accent"
            >
              <Navigation className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Use my location for distances
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 font-medium text-primary">
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              Distances measured from your location
            </span>
          )}
          {geoState === "denied" && (
            <span className="text-muted-foreground">
              Location access was declined — distances are measured from the centre of the selected area instead.
            </span>
          )}
          {geoState === "unsupported" && (
            <span className="text-muted-foreground">
              This device cannot share a location — distances use the selected area centre.
            </span>
          )}
        </div>
      </form>

      {/* Examples */}
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => submit(ex)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Loading */}
      {mutation.isPending && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="mb-2 h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          Understanding your question and searching the place directory…
        </div>
      )}

      {/* Interpretation + results */}
      {result && !mutation.isPending && (
        <div className="mt-8 space-y-6">
          <InterpretationCard sq={result} areaLabel={`${area.name}, ${area.state}, ${area.country}`} />

          {result.needsClarification ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                One quick question
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{result.clarifyQuestion}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(result.clarifyOptions.length ? result.clarifyOptions : ["Relaxation", "Entertainment", "Food"]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => submit(`${query} — ${opt}`)}
                    className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {result.urgency === "emergency" && (
                <p className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  {EMERGENCY_NOTICE}
                </p>
              )}

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                  Refine
                </span>
                <label className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
                  <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
                  Open now
                </label>
                <label className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
                  Within
                  <select
                    value={maxKm}
                    onChange={(e) => setMaxKm(Number(e.target.value))}
                    className="bg-transparent font-medium"
                  >
                    <option value={0}>any distance</option>
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                  </select>
                </label>
                <span className="text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "place" : "places"} matched
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  No place in this demo directory matches that request for {area.name}. Try a
                  different area, widen the filters, or rephrase your question.
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((rec, i) => (
                    <ResultCard key={rec.place.id} rec={rec} rank={i + 1} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="mt-10 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        {PLACES_DISCLAIMER} {MOCK_DISCLAIMER}{" "}
        <Link to="/about" className="font-semibold text-primary hover:underline">
          Read the methodology
        </Link>
        .
      </p>
    </div>
  );
}

function InterpretationCard({ sq, areaLabel }: { sq: StructuredQuery; areaLabel: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-base font-bold">
        <Info className="h-4 w-4 text-primary" aria-hidden="true" />
        How your question was understood
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{sq.interpretation}</p>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Intent" value={INTENT_LABELS[sq.intent]} />
        <Field label="Need" value={sq.service ?? "Not specified"} />
        <Field
          label="Place types searched"
          value={sq.placeTypes.map((t) => PLACE_CATEGORY_LABELS[t]).join(", ") || "All"}
        />
        <Field label="Analysis area" value={areaLabel} />
        <Field label="Occasion" value={sq.occasion ?? "Not specified"} />
        <Field label="Who it is for" value={sq.audience ?? "Not specified"} />
        <Field label="Ranked by" value={sq.sort.join(" → ")} />
        <Field
          label="Understanding by"
          value={sq.engine === "ai" ? "AI language understanding" : "Offline keyword interpreter"}
        />
      </dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <dt className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

function ResultCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const p: Place = rec.place;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${p.coords[0]},${p.coords[1]}`;

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
            <h3 className="font-display text-lg font-bold">{p.name}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {PLACE_CATEGORY_LABELS[p.category]} · {p.subtype} · {p.ownership}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rec.badges.map((b) => (
            <span
              key={b}
              className={
                b === "Best match"
                  ? "rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                  : "rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              }
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <Detail icon={MapPin} text={p.address} />
        <Detail
          icon={Navigation}
          text={
            rec.distanceKm === null
              ? "Distance unavailable"
              : `${rec.distanceKm.toFixed(1)} km away · about ${rec.travelMin} min by road (estimate)`
          }
        />
        <Detail
          icon={Clock}
          text={`${p.hours.summary}${rec.openNow === true ? " · likely open now" : rec.openNow === false ? " · likely closed now" : ""}`}
        />
        <Detail
          icon={Star}
          text={
            p.rating
              ? `${p.rating.value.toFixed(1)} / 5 from ${p.rating.count} reviews (${p.rating.source})`
              : "Rating unavailable for this place"
          }
        />
        <Detail icon={Phone} text={p.phone ?? "Phone number unavailable in this dataset"} />
        <Detail icon={Globe} text={p.website ?? "Website unavailable in this dataset"} />
        <Detail
          icon={Accessibility}
          text={p.accessibility.length ? p.accessibility.join(", ") : "Accessibility information unavailable"}
        />
        <Detail icon={Info} text={priceLabel(p.priceLevel)} />
      </div>

      <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-primary">Why this place?</h4>
        <p className="mt-1.5 text-sm text-foreground">{rec.why}</p>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {rec.breakdown.map((b) => (
            <li key={b.label} className="flex justify-between gap-3">
              <span>{b.label}</span>
              <span className="font-semibold text-foreground">+{b.points}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t border-border pt-1 font-semibold text-foreground">
            <span>Match score</span>
            <span>{Math.round(rec.score)}</span>
          </li>
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Get directions
        </a>
        <span className="text-[11px] text-muted-foreground">
          Services: {p.services.join(" · ")}
        </span>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Source: {p.source.name} · {p.source.date} · {p.verified}
      </p>
    </article>
  );
}

function Detail({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <p className="flex items-start gap-2 text-muted-foreground">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
