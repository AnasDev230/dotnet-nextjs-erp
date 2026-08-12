import { Language } from "@/lib/i18n";

/**
 * Format currency based on language.
 * Arabic: "1,234.56 ر.س"
 * English: "SAR 1,234.56"
 */
export function formatCurrency(amount: number, language: Language): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (language === "ar") {
    return `${formatted} ر.س`;
  }
  return `SAR ${formatted}`;
}

/**
 * Format date based on language.
 * Arabic: "25 يوليو 2026"
 * English: "Jul 25, 2026"
 */
export function formatDate(date: string | Date, language: Language): string {
  const d = new Date(date);

  if (language === "ar") {
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format number with thousands separator.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}