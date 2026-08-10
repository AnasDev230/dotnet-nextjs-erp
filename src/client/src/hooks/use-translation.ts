import { useLanguageStore } from "@/stores/language-store";
import { getTranslation } from "@/lib/i18n";

export function useTranslation() {
  const { language } = useLanguageStore();
  const t = (key: string): string => getTranslation(language, key);
  return { t, language };
}