"use client";

import { useCompanySettings } from "@/features/settings/hooks/useCompanySettings";

export function useCompanyPrintInfo(language: string) {
  const { data: company } = useCompanySettings();

  const companyName =
    language === "ar"
      ? company?.companyName || "—"
      : company?.companyNameEn || company?.companyName || "—";

  const taxNumber = company?.taxNumber || "—";

  const addressLine = company?.address
    ? `${company.address}${company.city ? `, ${company.city}` : ""}`
    : company?.city || "—";

  return {
    companyName,
    taxNumber,
    addressLine,
    company,
  };
}
