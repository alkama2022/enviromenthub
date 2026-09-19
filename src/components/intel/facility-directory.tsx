import { useMemo, useState } from "react";
import {
  Building2,
  Crosshair,
  ExternalLink,
  MapPin,
  Navigation,
  Search,
  Siren,
} from "lucide-react";
import type { Facility } from "@/lib/category-intel";
import { haversineKm, travelMinutes } from "@/lib/category-intel";
import { SourceBadge } from "@/components/source-badge";
import { cn } from "@/lib/utils";

export type Ownership = "all" | "Public" | "Private";
export type SortKey = "distance" | "relevance" | "type" | "name";

export interface ReferencePoint {
  coords: [number, number];
  label: string;
  precise: boolean;
}

function directionsUrl(f: Facility) {
  return `https://www.google.com/maps/dir/?api=1&destination=${f.coords[0]},${f.coords[1]}&destination_place_id=`;
}

function FacilityCard({
  facility,
  distanceKm,
  reason,
}: {
  facility: Facility;
  distanceKm: number;
  reason?: string;
}) {
  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-base font-bold text-foreground">{facility.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {facility.type} · {facility.ownership} · {facility.specialty}
          </p>
        </div>
        {facility.emergency && (
          <span className="inline-flex items-center gap-1 rounded-full bg-score-low/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-score-low">
            <Siren className="h-3 w-3" aria-hidden="true" />
            Emergency
          </span>
        )}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {facility.address}
      </p>

      <div className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Distance (straight line)</span>
          <span className="font-semibold tabular-nums text-foreground">{distanceKm.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Est. travel time</span>
          <span className="font-semibold tabular-nums text-foreground">
            ≈ {travelMinutes(distanceKm)} min
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Phone</span>
          <span className="italic text-muted-foreground">Not verified</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Opening status</span>
          <span className="italic text-muted-foreground">Cannot be verified</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {facility.services.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      {reason && (
        <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-xs leading-relaxed text-foreground">
          <strong className="font-semibold">Why this is relevant:</strong> {reason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <SourceBadge source={facility.source} />
        <a
          href={directionsUrl(facility)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Get directions
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Last verified: {facility.verified} · Sample demo record — details are illustrative and unverified.
      </p>
    </li>
  );
}

export function FacilityDirectory({
  heading,
  facilities,
  reference,
}: {
  heading: string;
  facilities: Facility[];
  reference: ReferencePoint;
}) {
  const [query, setQuery] = useState("");
  const [ownership, setOwnership] = useState<Ownership>("all");
  const [type, setType] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [maxKm, setMaxKm] = useState(25);
  const [sort, setSort] = useState<SortKey>("distance");

  const types = useMemo(
    () => Array.from(new Set(facilities.map((f) => f.type))).sort(),
    [facilities],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return facilities
      .map((f) => ({ f, km: haversineKm(reference.coords, f.coords) }))
      .filter(({ f, km }) => {
        if (km > maxKm) return false;
        if (ownership !== "all" && f.ownership !== ownership) return false;
        if (type !== "all" && f.type !== type) return false;
        if (emergencyOnly && !f.emergency) return false;
        if (!q) return true;
        return (
          f.name.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.specialty.toLowerCase().includes(q) ||
          f.services.some((s) => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sort === "distance") return a.km - b.km;
        if (sort === "name") return a.f.name.localeCompare(b.f.name);
        if (sort === "type") return a.f.type.localeCompare(b.f.type);
        // relevance: emergency capability, then service breadth, then distance
        const score = (x: typeof a) =>
          (x.f.emergency ? 40 : 0) + x.f.services.length * 4 - x.km * 2;
        return score(b) - score(a);
      });
  }, [facilities, query, ownership, type, emergencyOnly, maxKm, sort, reference]);

  return (
    <section aria-labelledby="facility-directory" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="facility-directory" className="font-display text-xl font-bold">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Distances measured from <strong className="text-foreground">{reference.label}</strong>.
            All entries are sample demo records.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {rows.length} of {facilities.length} shown
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, specialty or service…"
            aria-label="Search facilities"
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-muted-foreground">
            Ownership
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value as Ownership)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              <option value="all">All</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              <option value="distance">Closest</option>
              <option value="relevance">Best match</option>
              <option value="type">Facility type</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Max distance: {maxKm} km
            <input
              type="range"
              min={1}
              max={40}
              value={maxKm}
              onChange={(e) => setMaxKm(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </label>
        </div>

        <label className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(e) => setEmergencyOnly(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Emergency-capable only
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">No facilities match these filters</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Widen the distance range or clear a filter to see more results.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {rows.map(({ f, km }) => (
            <FacilityCard key={f.id} facility={f} distanceKm={km} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function NearbyRecommendations({
  facilities,
  reference,
  categoryLabel,
}: {
  facilities: Facility[];
  reference: ReferencePoint;
  categoryLabel: string;
}) {
  const top = useMemo(() => {
    return facilities
      .map((f) => ({ f, km: haversineKm(reference.coords, f.coords) }))
      .sort(
        (a, b) =>
          (b.f.emergency ? 40 : 0) +
          b.f.services.length * 4 -
          b.km * 2 -
          ((a.f.emergency ? 40 : 0) + a.f.services.length * 4 - a.km * 2),
      )
      .slice(0, 3);
  }, [facilities, reference]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
        Ranking uses distance from {reference.label}, emergency capability and breadth of
        listed services — in that order. It is <strong className="text-foreground">not</strong> a
        judgement of quality, and no facility here is described as "best".
        {!reference.precise && " Share your location above for distances measured from where you are."}
      </div>
      <ul className="grid gap-4 lg:grid-cols-2">
        {top.map(({ f, km }, i) => (
          <FacilityCard
            key={f.id}
            facility={f}
            distanceKm={km}
            reason={`Ranked #${i + 1} for ${categoryLabel.toLowerCase()} near you: ${km.toFixed(1)} km away${f.emergency ? ", with emergency capability listed" : ""} and ${f.services.length} listed services.`}
          />
        ))}
      </ul>
    </div>
  );
}

export function LocationPermissionPanel({
  reference,
  onUseMyLocation,
  onReset,
  status,
}: {
  reference: ReferencePoint;
  onUseMyLocation: () => void;
  onReset: () => void;
  status: "idle" | "loading" | "granted" | "denied" | "unsupported";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Reference point for nearby results</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Currently using: <strong className="text-foreground">{reference.label}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={status === "loading"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
              status === "loading" && "opacity-60",
            )}
          >
            <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
            {status === "loading" ? "Locating…" : "Use my location"}
          </button>
          {status === "granted" && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              Use area centre
            </button>
          )}
        </div>
      </div>
      {status === "denied" && (
        <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Enable location access or keep using the analysis area centre — results still work,
          distances are just measured from the area centre instead.
        </p>
      )}
      {status === "unsupported" && (
        <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          This browser does not expose location. Distances are measured from the analysis area centre.
        </p>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Your coordinates stay in this browser tab for the duration of your visit. They are never
        sent to a server or stored.
      </p>
    </div>
  );
}
