"use client";

import { useCompanyPrintInfo } from "@/hooks/use-company-print-info";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface CustomerStatementPrintProps {
  data: any;
}

export function CustomerStatementPrint({ data }: CustomerStatementPrintProps) {
  const { t, language } = useTranslation();
  const { companyName, taxNumber, addressLine } = useCompanyPrintInfo(language);

  if (!data) return null;

  return (
    <div id="print-area" className="p-8 text-black bg-white">
      <div className="flex items-start justify-between mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">{companyName}</h1>
          <p className="text-sm text-gray-600">{addressLine}</p>
          <p className="text-sm text-gray-600">الرقم الضريبي: {taxNumber}</p>
        </div>
        <div className="text-end">
          <h2 className="text-xl font-bold">{t("print.customerStatement.title")}</h2>
          <p className="text-sm font-mono mt-1">{data.customerName}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-sm p-4 bg-gray-50 rounded border">
        <div>
          <p className="text-gray-500">{t("reports.totalBilledLabel")}</p>
          <p className="font-medium tabular-nums">{formatCurrency(data.totalBilled ?? 0, language)}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("reports.totalPaidLabel")}</p>
          <p className="font-medium tabular-nums">{formatCurrency(data.totalPaid ?? 0, language)}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("reports.outstandingBalanceLabel")}</p>
          <p className="font-medium tabular-nums text-amber-600">{formatCurrency(data.outstandingBalance ?? 0, language)}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-start">{t("common.date")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("common.type")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("common.reference")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("reports.debit")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("reports.credit")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("reports.runningBalance")}</th>
          </tr>
        </thead>
        <tbody>
          {data.transactions?.map((tx: any, i: number) => (
            <tr key={i}>
              <td className="border border-gray-300 p-2">{formatDate(tx.date, language)}</td>
              <td className="border border-gray-300 p-2">{tx.type}</td>
              <td className="border border-gray-300 p-2 font-mono">{tx.reference || "—"}</td>
              <td className="border border-gray-300 p-2 tabular-nums">
                {tx.debit > 0 ? formatCurrency(tx.debit, language) : "—"}
              </td>
              <td className="border border-gray-300 p-2 tabular-nums">
                {tx.credit > 0 ? formatCurrency(tx.credit, language) : "—"}
              </td>
              <td className="border border-gray-300 p-2 tabular-nums font-medium">
                {formatCurrency(tx.runningBalance, language)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t pt-4 text-xs text-gray-600">
        <p className="mt-1 font-medium">{t("print.thankYou")}</p>
      </div>
    </div>
  );
}
