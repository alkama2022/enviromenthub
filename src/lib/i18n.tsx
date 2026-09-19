import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";

// Import all translation namespaces
import enCommon from "@/locales/en/common.json";
import enHome from "@/locales/en/home.json";
import enSearch from "@/locales/en/search.json";
import enLocation from "@/locales/en/location.json";
import enHealthcare from "@/locales/en/healthcare.json";
import enEnvironment from "@/locales/en/environment.json";
import enAbout from "@/locales/en/about.json";
import enGovernment from "@/locales/en/government.json";
import enCompare from "@/locales/en/compare.json";
import enSaved from "@/locales/en/saved.json";
import enAuth from "@/locales/en/auth.json";

import haCommon from "@/locales/ha/common.json";
import haHome from "@/locales/ha/home.json";
import haSearch from "@/locales/ha/search.json";
import haLocation from "@/locales/ha/location.json";
import haHealthcare from "@/locales/ha/healthcare.json";
import haEnvironment from "@/locales/ha/environment.json";
import haAbout from "@/locales/ha/about.json";
import haGovernment from "@/locales/ha/government.json";
import haCompare from "@/locales/ha/compare.json";
import haSaved from "@/locales/ha/saved.json";
import haAuth from "@/locales/ha/auth.json";

import yoCommon from "@/locales/yo/common.json";
import yoHome from "@/locales/yo/home.json";
import yoSearch from "@/locales/yo/search.json";
import yoLocation from "@/locales/yo/location.json";
import yoHealthcare from "@/locales/yo/healthcare.json";
import yoEnvironment from "@/locales/yo/environment.json";
import yoAbout from "@/locales/yo/about.json";
import yoGovernment from "@/locales/yo/government.json";
import yoCompare from "@/locales/yo/compare.json";
import yoSaved from "@/locales/yo/saved.json";
import yoAuth from "@/locales/yo/auth.json";

import igCommon from "@/locales/ig/common.json";
import igHome from "@/locales/ig/home.json";
import igSearch from "@/locales/ig/search.json";
import igLocation from "@/locales/ig/location.json";
import igHealthcare from "@/locales/ig/healthcare.json";
import igEnvironment from "@/locales/ig/environment.json";
import igAbout from "@/locales/ig/about.json";
import igGovernment from "@/locales/ig/government.json";
import igCompare from "@/locales/ig/compare.json";
import igSaved from "@/locales/ig/saved.json";
import igAuth from "@/locales/ig/auth.json";

import pcmCommon from "@/locales/pcm/common.json";
import pcmHome from "@/locales/pcm/home.json";
import pcmSearch from "@/locales/pcm/search.json";
import pcmLocation from "@/locales/pcm/location.json";
import pcmHealthcare from "@/locales/pcm/healthcare.json";
import pcmEnvironment from "@/locales/pcm/environment.json";
import pcmAbout from "@/locales/pcm/about.json";
import pcmGovernment from "@/locales/pcm/government.json";
import pcmCompare from "@/locales/pcm/compare.json";
import pcmSaved from "@/locales/pcm/saved.json";
import pcmAuth from "@/locales/pcm/auth.json";

import arCommon from "@/locales/ar/common.json";
import arHome from "@/locales/ar/home.json";
import arSearch from "@/locales/ar/search.json";
import arLocation from "@/locales/ar/location.json";
import arHealthcare from "@/locales/ar/healthcare.json";
import arEnvironment from "@/locales/ar/environment.json";
import arAbout from "@/locales/ar/about.json";
import arGovernment from "@/locales/ar/government.json";
import arCompare from "@/locales/ar/compare.json";
import arSaved from "@/locales/ar/saved.json";
import arAuth from "@/locales/ar/auth.json";

// --- Language config ---
export type Lang = "en" | "ha" | "yo" | "ig" | "pcm" | "ar";
export type Dir = "ltr" | "rtl";

export interface LangMeta {
  value: Lang;
  label: string;
  nativeLabel: string;
  dir: Dir;
  flag: string;
}

const LANGS: LangMeta[] = [
  { value: "en", label: "English", nativeLabel: "English", dir: "ltr", flag: "🇬🇧" },
  { value: "ha", label: "Hausa", nativeLabel: "Hausa", dir: "ltr", flag: "🇳🇬" },
  { value: "yo", label: "Yorùbá", nativeLabel: "Yorùbá", dir: "ltr", flag: "🇳🇬" },
  { value: "ig", label: "Igbo", nativeLabel: "Igbo", dir: "ltr", flag: "🇳🇬" },
  { value: "pcm", label: "Pidgin", nativeLabel: "Pidgin", dir: "ltr", flag: "🇳🇬" },
  // Prepared for RTL - add full translations under src/locales/ar/ to activate
  { value: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl", flag: "🇸🇦" },
];

const KEY = "hub:lang";
const EASY_KEY = "hub:easy";

// Merge namespaces per language into one nested dict
function mergeNamespaces(...namespaces: Record<string, unknown>[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const ns of namespaces) {
    const key = (ns as any).__ns as string | undefined;
    // namespaces are already keyed by file name, we keep them nested under that key
    // Instead we receive already-structured objects: {common, home, ...}
    Object.assign(out, ns);
  }
  return out;
}

type Dict = Record<string, unknown>;
const DICTS: Record<Lang, Dict> = {
  en: { common: enCommon, home: enHome, search: enSearch, location: enLocation, healthcare: enHealthcare, environment: enEnvironment, about: enAbout, government: enGovernment, compare: enCompare, saved: enSaved, auth: enAuth },
  ha: { common: haCommon, home: haHome, search: haSearch, location: haLocation, healthcare: haHealthcare, environment: haEnvironment, about: haAbout, government: haGovernment, compare: haCompare, saved: haSaved, auth: haAuth },
  yo: { common: yoCommon, home: yoHome, search: yoSearch, location: yoLocation, healthcare: yoHealthcare, environment: yoEnvironment, about: yoAbout, government: yoGovernment, compare: yoCompare, saved: yoSaved, auth: yoAuth },
  ig: { common: igCommon, home: igHome, search: igSearch, location: igLocation, healthcare: igHealthcare, environment: igEnvironment, about: igAbout, government: igGovernment, compare: igCompare, saved: igSaved, auth: igAuth },
  pcm: { common: pcmCommon, home: pcmHome, search: pcmSearch, location: pcmLocation, healthcare: pcmHealthcare, environment: pcmEnvironment, about: pcmAbout, government: pcmGovernment, compare: pcmCompare, saved: pcmSaved, auth: pcmAuth },
  ar: { common: arCommon, home: arHome, search: arSearch, location: arLocation, healthcare: arHealthcare, environment: arEnvironment, about: arAbout, government: arGovernment, compare: arCompare, saved: arSaved, auth: arAuth },
};

// Legacy flat keys for backward compat (old code used t("search"))
const LEGACY: Record<Lang, Record<string, string>> = {
  en: { search: "Search", ask: "Ask", compare: "Compare", government: "Government", methodology: "How it works", admin: "Admin", saved: "Saved", signin: "Sign in", signout: "Sign out" },
  ha: { search: "Bincike", ask: "Tambaya", compare: "Kwatanta", government: "Gwamnati", methodology: "Yadda yake aiki", admin: "Gudanarwa", saved: "Ajiye", signin: "Shiga", signout: "Fita" },
  yo: { search: "Wa", ask: "Beere", compare: "Fiwe", government: "Ijọba", methodology: "Bi o ṣe n ṣiṣẹ", admin: "Isakoso", saved: "Fipamọ", signin: "Wọle", signout: "Jade" },
  ig: { search: "Chọọ", ask: "Jụọ", compare: "Tụnyere", government: "Gọọmenti", methodology: "Otu o si arụ ọrụ", admin: "Nlekọta", saved: "Echekwara", signin: "Banye", signout: "Pụọ" },
  pcm: { search: "Find", ask: "Ask", compare: "Compare", government: "Government", methodology: "How we dey do am", admin: "Admin", saved: "Saved", signin: "Enter", signout: "Comot" },
  ar: { search: "بحث", ask: "اسأل", compare: "قارن", government: "الحكومة", methodology: "كيف يعمل", admin: "الإدارة", saved: "محفوظ", signin: "دخول", signout: "خروج" },
};

function getNested(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

interface Ctx {
  lang: Lang;
  dir: Dir;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLang: (l: Lang) => void;
  langs: LangMeta[];
  easyMode: boolean;
  setEasyMode: (v: boolean) => void;
  toggleEasyMode: () => void;
}

const I18nCtx = createContext<Ctx>({
  lang: "en",
  dir: "ltr",
  t: (k) => k,
  setLang: () => {},
  langs: LANGS,
  easyMode: false,
  setEasyMode: () => {},
  toggleEasyMode: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const raw = localStorage.getItem(KEY) as Lang | null;
    return raw && DICTS[raw] ? raw : "en";
  });
  const [easyMode, setEasyModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(EASY_KEY) === "true";
  });

  const applyLang = useCallback((l: Lang) => {
    const meta = LANGS.find((x) => x.value === l) ?? LANGS[0]!;
    try {
      document.documentElement.lang = l === "pcm" ? "en" : l;
      document.documentElement.dir = meta.dir;
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    if (!DICTS[l]) return;
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
    applyLang(l);
  };

  const setEasyMode = (v: boolean) => {
    setEasyModeState(v);
    try {
      localStorage.setItem(EASY_KEY, String(v));
      if (v) document.documentElement.classList.add("easy-mode");
      else document.documentElement.classList.remove("easy-mode");
    } catch {}
  };
  const toggleEasyMode = () => setEasyMode(!easyMode);

  useEffect(() => {
    applyLang(lang);
  }, [lang, applyLang]);

  useEffect(() => {
    try {
      if (easyMode) document.documentElement.classList.add("easy-mode");
      else document.documentElement.classList.remove("easy-mode");
    } catch {}
  }, [easyMode]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      // legacy flat lookup first (e.g., t("search"))
      if (!key.includes(".") && LEGACY[lang]?.[key]) {
        return interpolate(LEGACY[lang][key]!, vars);
      }
      if (!key.includes(".") && LEGACY.en[key]) {
        // fallback to en legacy
      }
      // namespaced lookup: "home.title" -> dict.home.title
      const val = getNested(DICTS[lang] ?? DICTS.en, key) ?? getNested(DICTS.en, key) ?? LEGACY[lang]?.[key] ?? LEGACY.en[key];
      if (typeof val === "string") return interpolate(val, vars);
      if (Array.isArray(val)) return interpolate((val as string[]).join("\n"), vars);
      return key;
    },
    [lang],
  );

  const dir = LANGS.find((l) => l.value === lang)?.dir ?? "ltr";

  return <I18nCtx.Provider value={{ lang, dir, t, setLang, langs: LANGS, easyMode, setEasyMode, toggleEasyMode }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}

// Convenience hook for voice language code mapping
export function useVoiceLang(): string {
  const { lang } = useI18n();
  const map: Record<Lang, string> = {
    en: "en-NG",
    ha: "ha-NG",
    yo: "yo-NG",
    ig: "ig-NG",
    pcm: "en-NG",
    ar: "ar-SA",
  };
  return map[lang] ?? "en-NG";
}
