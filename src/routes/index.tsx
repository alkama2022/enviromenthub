import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Search,
  ShieldCheck,
  ArrowRight,
  Hospital,
  Bus,
  Store,
  Home as HomeIcon,
  CloudSun,
  Siren,
  MessageCircle,
  ScanSearch,
  Mic,
  Waves,
  Wind,
  Volume2,
  GraduationCap,
  Hotel,
  Compass,
  ShieldAlert,
  Navigation,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { LOCATIONS, MOCK_DISCLAIMER } from "@/lib/locations";
import { fuzzySearchLocations, nextIndex } from "@/lib/search";
import { useRecentSearches } from "@/lib/recent-searches";
import { ScorePill } from "@/components/score-bar";
import { FavoriteButton } from "@/components/favorite-button";
import { useI18n } from "@/lib/i18n";
import { VoiceInput, ReadAloud } from "@/components/voice-input";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Environment Hub — Understand Your Environment. Make Better Decisions." },
      {
        name: "description",
        content:
          "Search any place or ask a question. Environment Hub helps you understand healthcare, environment, transport, services, safety, businesses and opportunities.",
      },
      { property: "og:title", content: "Environment Hub — Understand Your Environment" },
      { property: "og:description", content: "Search any place, understand what matters, make better decisions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ACTION_CARDS = [
  { key: "findPlaceToLive", icon: HomeIcon, color: "bg-emerald-500", to: "/discover", query: "Is this place good for my family to live?" },
  { key: "findHealthcare", icon: Hospital, color: "bg-rose-500", to: "/healthcare", query: "" },
  { key: "findBusiness", icon: Store, color: "bg-amber-500", to: "/business", query: "" },
  { key: "planRoute", icon: Bus, color: "bg-blue-500", to: "/discover", query: "How do I get there by bus?" },
  { key: "understandConditions", icon: ShieldAlert, color: "bg-indigo-500", to: "/discover", query: "What environmental risks exist in this area?" },
  { key: "checkEnvironment", icon: CloudSun, color: "bg-sky-500", to: "/discover", query: "Check weather and air quality for this area" },
  { key: "findSchools", icon: GraduationCap, color: "bg-violet-500", to: "/discover", query: "Find schools near this location" },
  { key: "findAccommodation", icon: Hotel, color: "bg-teal-500", to: "/discover", query: "Find accommodation near me" },
  { key: "exploreLocation", icon: Compass, color: "bg-orange-500", to: "#search", query: "" },
  { key: "findRisks", icon: Siren, color: "bg-red-600", to: "/discover", query: "Find risks and hazards in this area" },
] as const;

const ROTATING_EXAMPLES = [
  "Find hospitals near me",
  "Is Wuse 2 good for a family?",
  "Where should I open a pharmacy?",
  "Compare two locations",
  "Find places to visit",
];

function Index() {
  const navigate = useNavigate();
  const { t, easyMode } = useI18n();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const { recent, push, clear } = useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => fuzzySearchLocations(query).slice(0, 6), [query]);
  const showRecent = focused && query.trim().length === 0 && recent.length > 0;
  const showSuggestions = focused && query.trim().length > 0;

  useEffect(() => {
    const id = setInterval(() => setRotatingIdx((i) => (i + 1) % ROTATING_EXAMPLES.length), 2600);
    return () => clearInterval(id);
  }, []);

  const go = (slug: string, label?: string) => {
    if (label) push(label);
    else if (query.trim()) push(query.trim());
    track("search", { q: label ?? query.trim(), slug });
    navigate({ to: "/location/$slug", params: { slug } });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      go(suggestions[activeIndex]!.slug, `${suggestions[activeIndex]!.name}, ${suggestions[activeIndex]!.state}`);
      return;
    }
    const first = suggestions[0];
    if (first && query.trim().length >= 2 && first.name.toLowerCase().includes(query.trim().toLowerCase().slice(0, 3))) {
      go(first.slug, `${first.name}, ${first.state}`);
    } else if (query.trim()) {
      push(query.trim());
      track("discover_query", { q: query.trim().slice(0, 80) });
      navigate({ to: "/discover", search: { q: query.trim() } as any });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => nextIndex(prev, suggestions.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => nextIndex(prev, suggestions.length, -1));
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleVoice = (text: string) => {
    setQuery(text);
    track("voice_used", { q: text.slice(0, 80) });
    const found = fuzzySearchLocations(text, 1)[0];
    if (found && text.length < 20) go(found.slug, text);
    else {
      push(text);
      track("discover_query", { q: text.slice(0, 80) });
      navigate({ to: "/discover", search: { q: text } as any });
    }
  };

  const handleAskHub = () => {
    const q = query.trim() || ROTATING_EXAMPLES[rotatingIdx]!;
    push(q);
    track("discover_query", { q: q.slice(0, 80) });
    navigate({ to: "/discover", search: { q } as any });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported on this device");
      return;
    }
    toast.message("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      () => {
        const q = query.trim() || "Find hospitals near me";
        push(q);
        navigate({ to: "/discover", search: { q } as any });
        toast.success("Using your location for nearby results");
      },
      () => {
        toast.error("Could not get location. Showing results for selected area.");
        const q = query.trim() || "Find hospitals near me";
        navigate({ to: "/discover", search: { q } as any });
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const scrollToSearch = () => searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div id="main-content">
      {/* Hero - Premium, trustworthy, SEARCH → UNDERSTAND → DECIDE → ACT */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, oklch(0.7 0.15 168 / 0.28), transparent 44%), radial-gradient(circle at 85% 28%, oklch(0.68 0.12 195 / 0.18), transparent 40%), radial-gradient(circle at 50% 90%, oklch(0.75 0.1 85 / 0.12), transparent 50%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/60 px-3.5 py-1.5 text-xs font-medium text-sidebar-foreground/80 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-sidebar-primary" aria-hidden="true" />
              {t("home.eyebrow")}
            </p>
            <h1
              className={`font-display font-extrabold leading-[0.95] tracking-tight ${easyMode ? "text-3xl sm:text-4xl" : "text-[32px] sm:text-5xl lg:text-[56px]"}`}
            >
              {t("home.title")}
            </h1>
            <p className={`mx-auto mt-4 max-w-2xl leading-relaxed text-sidebar-foreground/70 ${easyMode ? "text-base" : "text-base sm:text-[17px]"}`}>
              {t("home.subtitle")}
            </p>

            {/* Main search - SPEC: Search a location or ask a question... */}
            <div ref={searchSectionRef} id="search" className="mx-auto mt-8 max-w-2xl">
              <form onSubmit={onSubmit} className="relative">
                <div className="flex overflow-hidden rounded-2xl border border-sidebar-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.12)] focus-within:ring-2 focus-within:ring-primary/20">
                  <div className="flex items-center pl-4 text-muted-foreground">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 180)}
                    onKeyDown={onKeyDown}
                    placeholder={t("home.searchPlaceholder")}
                    className="w-full bg-transparent px-3 py-4 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70"
                    aria-label={t("home.searchLabel")}
                    aria-autocomplete="list"
                    aria-expanded={focused}
                    aria-controls="search-suggestions"
                    role="combobox"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="m-1.5 inline-flex min-h-11 min-w-[84px] items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("home.cta.scan")}
                  >
                    {t("home.cta.scan")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {showRecent && (
                  <ul
                    id="search-suggestions"
                    className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl"
                  >
                    <li className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground">
                      <span>{t("home.recent")}</span>
                      <button type="button" onMouseDown={() => clear()} className="text-primary hover:underline">
                        {t("common.action.clear")}
                      </button>
                    </li>
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onMouseDown={() => {
                            setQuery(r);
                            const found = fuzzySearchLocations(r, 1)[0];
                            if (found) go(found.slug, r);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent"
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {showSuggestions && (
                  <ul
                    id="search-suggestions"
                    className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl"
                    role="listbox"
                  >
                    {suggestions.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">{t("common.empty.noResults")}</li>}
                    {suggestions.map((loc, idx) => (
                      <li key={loc.slug} role="option" aria-selected={idx === activeIndex}>
                        <button
                          type="button"
                          onMouseDown={() => go(loc.slug, `${loc.name}, ${loc.state}`)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${idx === activeIndex ? "bg-accent" : "hover:bg-accent"}`}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                            {loc.name}, {loc.state}
                          </span>
                          <ScorePill score={loc.overallScore} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </form>

              {/* Rotating examples */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-sidebar-foreground/60">{t("home.searchHint")}</span>
                <button
                  type="button"
                  onClick={() => setQuery(ROTATING_EXAMPLES[rotatingIdx]!)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-3 py-1 text-xs font-medium text-sidebar-foreground/80 backdrop-blur transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  aria-live="polite"
                >
                  <Sparkles className="h-3 w-3 text-sidebar-primary" aria-hidden="true" />
                  <span key={rotatingIdx} className="animate-in fade-in duration-300">
                    “{ROTATING_EXAMPLES[rotatingIdx]}”
                  </span>
                </button>
              </div>

              {/* Buttons: Search, Use My Location, Ask Environment Hub */}
              <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent px-4 py-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/80 sm:w-auto"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  {t("home.cta.useMyLocation")}
                </button>
                <button
                  type="button"
                  onClick={handleAskHub}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {t("home.cta.askHub")}
                </button>
              </div>

              {/* Voice - large, accessible */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <VoiceInput onTranscript={handleVoice} size="large" />
                <p className="text-xs text-sidebar-foreground/60">{t("home.voiceHint")}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <ReadAloud text={`${t("home.title")} ${t("home.subtitle")}`} />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT DO YOU WANT TO DO? - 10 cards per spec */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" aria-labelledby="actions-heading">
        <div className="mb-6 text-center sm:text-left">
          <h2 id="actions-heading" className={`font-display font-bold tracking-tight ${easyMode ? "text-xl" : "text-2xl sm:text-[28px]"}`}>
            {t("home.actionsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose what matters to you — we’ll guide you to the right place.</p>
        </div>
        <div className={`grid gap-3 sm:gap-4 ${easyMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-5"}`}>
          {ACTION_CARDS.map((card) => (
            <Link
              key={card.key}
              to={card.to as any}
              search={card.query ? ({ q: card.query } as any) : undefined}
              onClick={(e) => {
                if (card.to === "#search") {
                  e.preventDefault();
                  scrollToSearch();
                  inputRef.current?.focus();
                }
              }}
              className="group relative flex min-h-[124px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[138px] sm:p-5"
              aria-label={`${t(`home.actions.${card.key}.title`)} — ${t(`home.actions.${card.key}.desc`)}`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${card.color}`}>
                <card.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="mt-3">
                <h3 className={`font-display font-bold leading-tight text-foreground ${easyMode ? "text-[15px]" : "text-[13px] sm:text-sm"}`}>
                  {t(`home.actions.${card.key}.title`)}
                </h3>
                <p className={`mt-1 leading-snug text-muted-foreground ${easyMode ? "text-xs" : "text-[11px] sm:text-xs"}`}>
                  {t(`home.actions.${card.key}.desc`)}
                </p>
              </div>
              <ArrowRight
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>

        {!easyMode && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1">
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.action.readAloud")} available
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1">
              <Mic className="h-3.5 w-3.5" aria-hidden="true" /> Voice in your language
            </span>
          </div>
        )}
      </section>

      {/* Help Me Decide §7 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="help-decide">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="help-decide" className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
                <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" /> Help Me Decide
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">Not sure where to go? Tell us what you want to do — we’ll show <strong>potential locations to investigate</strong> with evidence, not hype.</p>
            </div>
            <Link to="/help" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              Start <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-2 text-xs sm:grid-cols-3">
            <span className="rounded-lg bg-card px-3 py-2 text-muted-foreground"><strong className="text-foreground">Live</strong> — find a place to live</span>
            <span className="rounded-lg bg-card px-3 py-2 text-muted-foreground"><strong className="text-foreground">Business</strong> — where to open a shop</span>
            <span className="rounded-lg bg-card px-3 py-2 text-muted-foreground"><strong className="text-foreground">Healthcare</strong> — nearest hospital or pharmacy</span>
          </div>
        </div>
      </section>

      {/* Example locations - cards not table */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6" aria-labelledby="examples-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="examples-heading" className={`font-display font-bold tracking-tight ${easyMode ? "text-xl" : "text-xl sm:text-2xl"}`}>
              {t("home.examplesTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("home.examplesSubtitle")}</p>
          </div>
          <ReadAloud text={`${t("home.examplesTitle")} ${t("home.examplesSubtitle")}`} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.slug}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1.5">
                  <ScorePill score={loc.overallScore} />
                  <FavoriteButton slug={loc.slug} size="icon" />
                </div>
              </div>
              <Link to="/location/$slug" params={{ slug: loc.slug }} className="mt-3 block focus:outline-none">
                <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary">{loc.name}</h3>
                <p className="text-xs font-medium text-muted-foreground">{loc.state}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{loc.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {t("common.action.viewDetails")} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Plain-language explainer */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ScanSearch className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("home.featuresTitle")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-secondary/50 p-4">
                <Waves className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold">{t("home.features.simpleWords")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("home.features.simpleWordsDesc")}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <Wind className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold">{t("home.features.yourLanguage")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("home.features.yourLanguageDesc")}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold">{t("home.features.verifiedSources")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("home.features.verifiedSourcesDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
          {MOCK_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
