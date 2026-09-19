import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "ha" | "yo" | "ig" | "pcm";
const KEY = "terralens:lang";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: { search: "Search", ask: "Ask assistant", compare: "Compare", government: "Government", methodology: "Methodology", admin: "Admin", saved: "Saved", signin: "Sign in", signout: "Sign out" },
  ha: { search: "Bincike", ask: "Tambayi mataimaki", compare: "Kwatanta", government: "Gwamnati", methodology: "Hanya", admin: "Gudanarwa", saved: "Ajiye", signin: "Shiga", signout: "Fita" },
  yo: { search: "Wa", ask: "Beere lọwọ alarannṣe", compare: "Fiwe", government: "Ijọba", methodology: "Ilana", admin: "Isakoso", saved: "Fipamọ", signin: "Wọle", signout: "Jade" },
  ig: { search: "Chọọ", ask: "Jụọ onye enyemaka", compare: "Tụnyere", government: "Gọọmenti", methodology: "Usoro", admin: "Nlekọta", saved: "Echekwara", signin: "Banye", signout: "Pụọ" },
  pcm: { search: "Find", ask: "Ask helper", compare: "Compare", government: "Government", methodology: "How we dey do am", admin: "Admin", saved: "Saved", signin: "Enter", signout: "Comot" },
};

interface Ctx { lang: Lang; t: (k: string) => string; setLang: (l: Lang) => void; langs: { value: Lang; label: string }[] }
const langs: Ctx["langs"] = [
  { value: "en", label: "English" },
  { value: "ha", label: "Hausa" },
  { value: "yo", label: "Yorùbá" },
  { value: "ig", label: "Igbo" },
  { value: "pcm", label: "Pidgin" },
];
const I18nCtx = createContext<Ctx>({ lang: "en", t: (k) => STRINGS.en[k] ?? k, setLang: () => {}, langs });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const raw = localStorage.getItem(KEY) as Lang | null;
    return raw && STRINGS[raw] ? raw : "en";
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    try { document.documentElement.lang = l === "pcm" ? "en" : l; } catch { /* ignore */ }
  };
  useEffect(() => { try { document.documentElement.lang = lang === "pcm" ? "en" : lang; } catch { /* ignore */ } }, [lang]);
  const t = (k: string) => STRINGS[lang]?.[k] ?? STRINGS.en[k] ?? k;
  return <I18nCtx.Provider value={{ lang, t, setLang, langs }}>{children}</I18nCtx.Provider>;
}
export function useI18n() { return useContext(I18nCtx); }
