import { ar } from "./translations/ar";
import { en } from "./translations/en";

export type Language = "ar" | "en";

const translations: Record<Language, Record<string, string>> = { ar, en };

export function getTranslation(language: Language, key: string): string {
  return translations[language]?.[key] ?? key;
}

export function getDirection(language: Language): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr";
}