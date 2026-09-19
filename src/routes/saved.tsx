import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, MapPin, Trash2, GitCompareArrows, Home as HomeIcon, Briefcase, CloudSun, Hospital, Bus, AlertTriangle } from "lucide-react";
import { LOCATIONS, MOCK_DISCLAIMER } from "@/lib/locations";
import { useFavorites } from "@/lib/favorites";
import { ScorePill } from "@/components/score-bar";
import { FavoriteButton } from "@/components/favorite-button";
import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "@/components/voice-input";
import { LiveEnvironment } from "@/components/live-environment";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "My Environment — Saved Locations | Environment Hub" },
      {
        name: "description",
        content: "My Environment — your saved locations with weather, healthcare and alerts. Your personal hub for places you care about.",
      },
      { property: "og:title", content: "My Environment — Environment Hub" },
      { property: "og:description", content: "Your saved locations, home and work updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { t } = useI18n();
  const { favorites, clearFavorites } = useFavorites();
  const savedLocations = LOCATIONS.filter((l) => favorites.includes(l.slug));

  return (
    <div id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground"><strong>My Environment</strong> — Your personal hub. Save locations (Home/Work) to see weather, nearby healthcare, alerts and transport at a glance. Privacy: only you see your saved places.</div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("saved.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {savedLocations.length === 0
                ? t("saved.subtitleEmpty")
                : savedLocations.length === 1
                  ? t("saved.subtitleCount", { count: 1 })
                  : t("saved.subtitleCount_plural", { count: savedLocations.length })}
            </p>
          </div>
        </div>
        {savedLocations.length > 0 && (
          <div className="flex items-center gap-2">
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
              {t("saved.compare")}
            </Link>
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t("saved.clearAll")}
            </button>
          </div>
        )}
      </div>

      {savedLocations.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">{t("saved.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {t("saved.emptyDesc")}
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("saved.explore")}
          </Link>
        </div>
      ) : (
        <>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedLocations.map((loc) => (
            <div
              key={loc.slug}
              className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                <div className="flex items-center gap-1.5">
                  <ScorePill score={loc.overallScore} />
                  <FavoriteButton slug={loc.slug} size="icon" />
                </div>
              </div>
              <Link to="/location/$slug" params={{ slug: loc.slug }} className="block">
                <h2 className="mt-3 font-display text-lg font-bold group-hover:text-primary">{loc.name}</h2>
                <p className="text-xs font-medium text-muted-foreground">{loc.state}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{loc.tagline}</p>
              </Link>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  to="/location/$slug"
                  params={{ slug: loc.slug }}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {t("saved.viewProfile")}
                </Link>
                <Link
                  to="/insight/$slug/$category"
                  params={{ slug: loc.slug, category: "publicSafety" }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t("saved.intelligence")}
                </Link>
              </div>
            </div>
          ))}
        </div>
        {savedLocations.length>0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="flex items-center gap-2 font-bold"><HomeIcon className="h-4 w-4 text-primary" /> Home — {savedLocations[0]!.name}</h3>
              <div className="mt-3"><LiveEnvironment coords={savedLocations[0]!.coords} fallbackAqi={savedLocations[0]!.environmentData.find(f=>f.label.includes("Air quality"))?.value ?? "—"} /></div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Hospital className="h-3.5 w-3.5 text-primary" /> Nearby healthcare: {savedLocations[0]!.quickFacts.find(f=>f.label.includes("Hospitals"))?.value}</li>
                <li className="flex items-center gap-1.5"><Bus className="h-3.5 w-3.5 text-primary" /> Transport: {savedLocations[0]!.categories.find(c=>c.key==="transportation")?.explanation.slice(0,80)}</li>
                <li className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-primary" /> Flag: {savedLocations[0]!.trends.find(t=>t.severity!=="info")?.label ?? "No active flags"} — {savedLocations[0]!.trends.find(t=>t.severity!=="info")?.reason.slice(0,90)}</li>
              </ul>
            </div>
            {savedLocations[1] ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 font-bold"><Briefcase className="h-4 w-4 text-primary" /> Work — {savedLocations[1]!.name}</h3>
                <div className="mt-3"><LiveEnvironment coords={savedLocations[1]!.coords} fallbackAqi={savedLocations[1]!.environmentData.find(f=>f.label.includes("Air quality"))?.value ?? "—"} /></div>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5"><CloudSun className="h-3.5 w-3.5 text-primary" /> Environment: {savedLocations[1]!.environmentData.find(f=>f.label.includes("Weather"))?.value}</li>
                  <li className="flex items-center gap-1.5"><Hospital className="h-3.5 w-3.5 text-primary" /> Healthcare: {savedLocations[1]!.quickFacts.find(f=>f.label.includes("Hospitals"))?.value}</li>
                  <li className="flex items-center gap-1.5"><Bus className="h-3.5 w-3.5 text-primary" /> {savedLocations[1]!.categories.find(c=>c.key==="transportation")?.explanation.slice(0,80)}</li>
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-5 text-center">
                <Briefcase className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Add a Work location</p>
                <p className="mt-1 text-xs text-muted-foreground">Save a second place to track Home and Work side by side.</p>
                <Link to="/" className="mt-3 inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Browse places</Link>
              </div>
            )}
          </div>
        )}
        </>
      )}

      <p className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
        {MOCK_DISCLAIMER}
      </p>
    </div>
  );
}
