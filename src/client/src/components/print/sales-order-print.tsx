"use client";

import type { SalesOrderResponse } from "@/features/sales/types/sales-order.types";
import { useCompanyPrintInfo } from "@/hooks/use-company-print-info";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface SalesOrderPrintProps {
  order: SalesOrderResponse;
}

export function SalesOrderPrint({ order }: SalesOrderPrintProps) {
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
          <h2 className="text-xl font-bold">{t("print.salesOrder.title")}</h2>
          <p className="text-sm font-mono mt-1">{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500">{t("print.invoice.customer")}</p>
          <p className="font-medium">{order.customerName}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("print.invoice.date")}</p>
          <p className="font-medium">{formatDate(order.orderDate, language)}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("purchasing.receipts.warehouse")}</p>
          <p className="font-medium">{order.warehouseName || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("print.invoice.status")}</p>
          <p className="font-medium">{order.status}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-start">#</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.product")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.quantity")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.unitPrice")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.discount")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.total")}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">{i + 1}</td>
              <td className="border border-gray-300 p-2">
                {item.productName}
                <span className="block text-xs text-gray-500 font-mono">{item.productSku}</span>
              </td>
              <td className="border border-gray-300 p-2 tabular-nums">{item.quantity}</td>
              <td className="border border-gray-300 p-2 tabular-nums">{formatCurrency(item.unitPrice, language)}</td>
              <td className="border border-gray-300 p-2 tabular-nums">{item.discountPct}%</td>
              <td className="border border-gray-300 p-2 tabular-nums">{formatCurrency(item.lineTotal, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t("print.subtotal")}</span>
            <span className="tabular-nums">{formatCurrency(order.subtotal, language)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("print.discount")}</span>
            <span className="tabular-nums text-red-600">-{formatCurrency(order.discountAmount, language)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("print.tax")}</span>
            <span className="tabular-nums">+{formatCurrency(order.taxAmount, language)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>{t("print.netAmount")}</span>
            <span className="tabular-nums">{formatCurrency(order.netAmount, language)}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 text-xs text-gray-600">
        <p className="mt-1 font-medium">{t("print.thankYou")}</p>
      </div>
    </div>
  );
}
