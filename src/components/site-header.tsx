import { Link } from "@tanstack/react-router";
import { Radar, Menu, X, Heart, LogIn, LogOut, Languages } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

const NAV_ITEMS = [
  { to: "/", label: "Search" },
  { to: "/discover", label: "Ask assistant" },
  { to: "/compare", label: "Compare" },
  { to: "/government", label: "Government" },
  { to: "/about", label: "Methodology" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useFavorites();
  const { user, signOut } = useAuth();
  const { lang, setLang, langs } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Radar className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Terra<span className="text-sidebar-primary">Lens</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
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
            Saved
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-xs font-bold text-sidebar-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" title={user.email ?? ""}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <label className="ml-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70">
            <Languages className="h-3.5 w-3.5" />
            <select value={lang} onChange={(e) => setLang(e.target.value as never)} className="bg-transparent text-xs font-medium outline-none">
              {langs.map((l) => (
                <option key={l.value} value={l.value} className="text-foreground">
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-sidebar-accent md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-sidebar-border px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70",
              )}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/saved"
            onClick={() => setOpen(false)}
            className={cn("flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70")}
            activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-4 w-4" aria-hidden="true" />
              Saved
            </span>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-xs font-bold text-sidebar-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70">
              <LogOut className="h-4 w-4" /> Sign out ({user.email})
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70")} activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }}>
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
