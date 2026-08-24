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
 * Format date + time based on language.
 * Arabic: "25 يوليو 2026 — 10:30:25 ص"
 * English: "Jul 25, 2026 — 10:30:25 AM"
 */
export function formatDateTime(date: string | Date, language: Language): string {
  const d = new Date(date);
  const datePart = formatDate(d, language);
  const timePart = d.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${datePart} — ${timePart}`;
}

/**
 * Format number with thousands separator.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format relative time ("time ago") based on language.
 * Arabic: "منذ 5 دقائق"
 * English: "5m ago"
 */
export function getTimeAgo(date: string | Date, language: Language): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (language === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  }
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}