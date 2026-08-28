"use client";

import type { SupplierInvoiceResponse } from "@/features/purchasing/types/supplier-invoice.types";
import { useCompanyPrintInfo } from "@/hooks/use-company-print-info";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface SupplierInvoicePrintProps {
  invoice: SupplierInvoiceResponse;
}

export function SupplierInvoicePrint({ invoice }: SupplierInvoicePrintProps) {
  const { t, language } = useTranslation();
  const { companyName, taxNumber, addressLine } = useCompanyPrintInfo(language);

  return (
    <div id="print-area" className="p-8 text-black bg-white">
      <div className="flex items-start justify-between mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">{companyName}</h1>
          <p className="text-sm text-gray-600">{addressLine}</p>
          <p className="text-sm text-gray-600">الرقم الضريبي: {taxNumber}</p>
        </div>
        <div className="text-end">
          <h2 className="text-xl font-bold">{t("print.supplierInvoice.title")}</h2>
          <p className="text-sm font-mono mt-1">{invoice.invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500">{t("print.po.supplier")}</p>
          <p className="font-medium">{invoice.supplierName}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("purchasing.receipts.purchaseOrder")}</p>
          <p className="font-medium font-mono">{invoice.purchaseOrderNumber}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("print.invoice.date")}</p>
          <p className="font-medium">{formatDate(invoice.issueDate, language)}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("print.invoice.dueDate")}</p>
          <p className="font-medium">{formatDate(invoice.dueDate, language)}</p>
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t("print.subtotal")}</span>
            <span className="tabular-nums">{formatCurrency(invoice.subtotal, language)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("print.tax")}</span>
            <span className="tabular-nums">+{formatCurrency(invoice.taxAmount, language)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>{t("print.netAmount")}</span>
            <span className="tabular-nums">{formatCurrency(invoice.netAmount, language)}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600">
            <span>{t("finance.invoices.paid")}</span>
            <span className="tabular-nums">{formatCurrency(invoice.paidAmount, language)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mb-4 text-xs text-gray-600">
          <p className="font-semibold">{t("common.notes")}:</p>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="border-t pt-4 text-xs text-gray-600">
        <p className="mt-1 font-medium">{t("print.thankYou")}</p>
      </div>
    </div>
  );
}
