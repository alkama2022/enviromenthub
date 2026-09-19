import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Hospital, MapPin, Phone, Navigation, Clock, Star, Accessibility, Siren, Search } from "lucide-react";
import { LOCATIONS } from "@/lib/locations";
import { placesForLocation } from "@/lib/places";
import { useI18n } from "@/lib/i18n";
import { ReadAloud, VoiceInput } from "@/components/voice-input";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { interpretQuery } from "@/lib/discovery.functions";
import { rankPlaces } from "@/lib/discovery";

export const Route = createFileRoute("/healthcare")({
  head: () => ({
    meta: [
      { title: "Find Healthcare — Environment Hub" },
      { name: "description", content: "Find hospitals, clinics and pharmacies near you with distance, hours and directions — in plain language." },
    ],
  }),
  component: HealthcarePage,
});

function HealthcarePage() {
  const { t, easyMode } = useI18n();
  const [slug, setSlug] = useState(LOCATIONS[0]!.slug);
  const [query, setQuery] = useState("");
  const area = LOCATIONS.find((l) => l.slug === slug)!;
  const runInterpret = useServerFn(interpretQuery);
  const [filteredCategory, setFilteredCategory] = useState<"all" | "healthcare" | "pharmacy" | "emergency">("all");

  const allPlaces = placesForLocation(slug).filter((p) => ["healthcare", "pharmacy", "emergency"].includes(p.category));
  const places = useMemo(() => {
    if (filteredCategory === "all") return allPlaces;
    return allPlaces.filter((p) => p.category === filteredCategory);
  }, [allPlaces, filteredCategory]);

  return (
    <div id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          <Hospital className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {t("healthcare.title")}
        </p>
        <h1 className={`mt-3 font-display font-extrabold tracking-tight ${easyMode ? "text-2xl" : "text-3xl sm:text-4xl"}`}>{t("healthcare.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("healthcare.subtitle")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ReadAloud text={`${t("healthcare.title")} ${t("healthcare.subtitle")}`} />
          <Link to="/discover" search={{ q: "Find nearest emergency help" } as any} className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground">
            <Siren className="h-3.5 w-3.5" aria-hidden="true" /> {t("healthcare.emergency")} · {t("healthcare.emergencyCall")}
          </Link>
        </div>
      </header>

      {/* Area selector */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Area
            <select value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-foreground">
              {LOCATIONS.map((l) => (
                <option key={l.slug} value={l.slug}>{l.name}, {l.state}</option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {(["all", "healthcare", "pharmacy", "emergency"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilteredCategory(cat)}
                aria-pressed={filteredCategory === cat}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${filteredCategory === cat ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-accent"}`}
              >
                {cat === "all" ? "All" : t(`healthcare.filters.${cat}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <VoiceInput onTranscript={(text) => setQuery(text)} />
          <span className="text-xs text-muted-foreground">Say “hospital near me”</span>
        </div>
      </div>

      {/* Cards - not table */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {places.map((p) => {
          const isEmergency = p.emergency;
          return (
            <article key={p.id} className={`rounded-2xl border bg-card p-5 shadow-sm ${isEmergency ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold leading-tight">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.subtype} · {p.ownership}</p>
                </div>
                {isEmergency && <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">24h</span>}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{p.address}</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{p.hours.summary} {isEmergency ? "· Open now" : ""}</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{p.phone ?? t("healthcare.card.unknown")}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.coords[0]},${p.coords[1]}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" />{t("healthcare.card.directions")}
                </a>
                {p.phone && <a href={`tel:${p.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{t("healthcare.card.call")}</a>}
                <ReadAloud text={`${p.name} ${p.address} ${p.hours.summary}`} />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">Source: {p.source.name} · {p.source.date} · {p.verified}</p>
            </article>
          );
        })}
      </div>

      {places.length === 0 && <p className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{t("common.empty.noResults")}</p>}

      <p className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">{t("healthcare.disclaimer")}</p>
    </div>
  );
}
