import { create } from "zustand";
import { Language, getDirection } from "@/lib/i18n";

interface LanguageState {
  language: Language;
  direction: "rtl" | "ltr";
  setLanguage: (lang: Language) => void;
  hydrate: () => void;
}

const STORAGE_KEY = "bunyan-lang";
const LANGUAGE_VALUES: Language[] = ["ar", "en"];
export const DEFAULT_LANGUAGE: Language = "ar";

export const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && LANGUAGE_VALUES.includes(saved as Language)
    ? (saved as Language)
    : DEFAULT_LANGUAGE;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: DEFAULT_LANGUAGE,
  direction: getDirection(DEFAULT_LANGUAGE),

  setLanguage: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    set({ language: lang, direction: getDirection(lang) });
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = getDirection(lang);
    }
  },

  hydrate: () => {
    const lang = getStoredLanguage();
    set({ language: lang, direction: getDirection(lang) });
  },
}));