"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Label, Select } from "@/components/ui";
import { useCustomersForDropdown } from "../hooks/useCustomersForDropdown";
import { QuotationStatus } from "../types/quotation.types";

interface QuotationFiltersProps {
  status?: string;
  customerId?: string;
  onStatusChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
}

const statusOptions = [
  { value: "", labelKey: "notifications.filter.all" },
  { value: String(QuotationStatus.Draft), labelKey: "quotation.status.draft" },
  { value: String(QuotationStatus.Sent), labelKey: "quotation.status.sent" },
  {
    value: String(QuotationStatus.Accepted),
    labelKey: "quotation.status.accepted",
  },
  {
    value: String(QuotationStatus.Rejected),
    labelKey: "quotation.status.rejected",
  },
  {
    value: String(QuotationStatus.Expired),
    labelKey: "quotation.status.expired",
  },
  {
    value: String(QuotationStatus.Converted),
    labelKey: "quotation.status.converted",
  },
];

export default function QuotationFilters({
  status,
  customerId,
  onStatusChange,
  onCustomerChange,
}: QuotationFiltersProps) {
  const { t } = useTranslation();
  const { data: customers } = useCustomersForDropdown();

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2 w-48">
        <Label htmlFor="status-filter">{t("common.status")}</Label>
        <Select
          id="status-filter"
          value={status ?? ""}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          className="h-10"
        />
      </div>

      <div className="space-y-2 w-56">
        <Label htmlFor="customer-filter">{t("quotation.customer")}</Label>
        <Select
          id="customer-filter"
          value={customerId ?? ""}
          onChange={(e) => onCustomerChange(e.target.value)}
          options={[
            { value: "", label: t("notifications.filter.all") },
            ...(customers ?? []).map((customer) => ({
              value: customer.id,
              label: customer.name,
            })),
          ]}
          className="h-10"
        />
      </div>
    </div>
  );
}
