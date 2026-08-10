import { create } from "zustand";
import { Language, getDirection } from "@/lib/i18n";

interface LanguageState {
  language: Language;
  direction: "rtl" | "ltr";
  setLanguage: (lang: Language) => void;
}

const STORAGE_KEY = "bunyan-lang";
const LANGUAGE_VALUES: Language[] = ["ar", "en"];

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "ar";
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && LANGUAGE_VALUES.includes(saved as Language) ? (saved as Language) : "ar";
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  direction: getDirection(getInitialLanguage()),

  setLanguage: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    set({ language: lang, direction: getDirection(lang) });
    if (typeof window !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = getDirection(lang);
    }
  },
}));