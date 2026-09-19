import { Link } from "@tanstack/react-router";
import { Radar, Menu, X, Heart, LogIn, LogOut, Languages, Sun, Moon, Type } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useFavorites();
  const { user, signOut } = useAuth();
  const { lang, setLang, langs, t, easyMode, toggleEasyMode } = useI18n();

  const NAV_ITEMS = [
    { to: "/", label: t("common.nav.home") },
    { to: "/discover", label: t("common.nav.discover") },
    { to: "/compare", label: t("common.nav.compare") },
    { to: "/government", label: t("common.nav.government") },
    { to: "/about", label: t("common.nav.about") },
  ] as const;

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        {t("common.accessibility.skipToContent")}
      </a>
      <header className="sticky top-0 z-50 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)} aria-label={t("common.brand.name")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Radar className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Terra<span className="text-sidebar-primary">Lens</span>
            </span>
            <span className="hidden rounded-full border border-sidebar-border bg-sidebar-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/70 sm:inline-flex">Hub</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/saved"
              className="relative ml-1 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              {t("common.nav.saved")}
              {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-xs font-bold text-sidebar-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" title={user.email ?? ""}>
                <LogOut className="h-4 w-4" /> {t("common.auth.signOut")}
              </button>
            ) : (
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
                <LogIn className="h-4 w-4" /> {t("common.auth.signIn")}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1">
            {/* Prominent language selector */}
            <label className="hidden items-center gap-1.5 rounded-full border border-sidebar-border bg-sidebar-accent px-3 py-1.5 text-xs font-semibold sm:inline-flex">
              <Languages className="h-3.5 w-3.5 text-sidebar-primary" aria-hidden="true" />
              <span className="hidden lg:inline">{t("common.language.label")}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as never)}
                aria-label={t("common.language.select")}
                className="bg-transparent text-xs font-semibold outline-none"
              >
                {langs
                  .filter((l) => l.value !== "ar" || lang === "ar")
                  .map((l) => (
                    <option key={l.value} value={l.value} className="text-foreground">
                      {l.flag} {l.nativeLabel}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              onClick={toggleEasyMode}
              aria-pressed={easyMode}
              aria-label={t("common.easyMode.label")}
              title={easyMode ? t("common.easyMode.on") : t("common.easyMode.off")}
              className={cn(
                "hidden h-9 w-9 items-center justify-center rounded-full border text-xs font-bold sm:inline-flex",
                easyMode ? "border-primary bg-primary text-primary-foreground" : "border-sidebar-border bg-sidebar-accent text-sidebar-foreground/70 hover:bg-sidebar-accent/80",
              )}
            >
              <Type className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-sidebar-accent lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("common.accessibility.closeMenu") : t("common.accessibility.openMenu")}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-sidebar-border md:hidden">
            <nav className="px-4 pb-4 pt-2" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-sidebar-foreground/70"
                  activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/saved"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-sidebar-foreground/70"
                activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  {t("common.nav.saved")}
                </span>
                {count > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-xs font-bold text-sidebar-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
              {user ? (
                <button onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center gap-1.5 rounded-md px-3 py-3 text-sm font-medium text-sidebar-foreground/70">
                  <LogOut className="h-4 w-4" /> {t("common.auth.signOut")} ({user.email})
                </button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center gap-1.5 rounded-md px-3 py-3 text-sm font-medium text-sidebar-foreground/70" activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}>
                  <LogIn className="h-4 w-4" /> {t("common.auth.signIn")}
                </Link>
              )}
            </nav>
            <div className="border-t border-sidebar-border px-4 py-3">
              <label className="flex items-center justify-between gap-2 text-sm font-medium">
                <span className="inline-flex items-center gap-2">
                  <Languages className="h-4 w-4 text-sidebar-primary" aria-hidden="true" />
                  {t("common.language.label")}
                </span>
                <select value={lang} onChange={(e) => setLang(e.target.value as never)} className="rounded-md border border-border bg-card px-2 py-1.5 text-sm">
                  {langs.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.flag} {l.nativeLabel} — {l.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={toggleEasyMode}
                aria-pressed={easyMode}
                className={cn(
                  "mt-3 flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium",
                  easyMode ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  {t("common.easyMode.label")}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", easyMode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                  {easyMode ? t("common.easyMode.on") : t("common.easyMode.off")}
                </span>
              </button>
              <p className="mt-2 text-xs text-sidebar-foreground/50">{t("common.easyMode.description")}</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
