"use client";

import type { GoodsReceiptResponse } from "@/features/purchasing/types/goods-receipt.types";
import { useCompanyPrintInfo } from "@/hooks/use-company-print-info";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/formatters";

interface GoodsReceiptPrintProps {
  receipt: GoodsReceiptResponse;
}

export function GoodsReceiptPrint({ receipt }: GoodsReceiptPrintProps) {
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
          <h2 className="text-xl font-bold">{t("print.goodsReceipt.title")}</h2>
          <p className="text-sm font-mono mt-1">{receipt.grnNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500">{t("print.po.supplier")}</p>
          <p className="font-medium">{receipt.supplierName}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("purchasing.receipts.purchaseOrder")}</p>
          <p className="font-medium font-mono">{receipt.poNumber}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("print.invoice.date")}</p>
          <p className="font-medium">{formatDate(receipt.receiptDate, language)}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("purchasing.receipts.warehouse")}</p>
          <p className="font-medium">{receipt.warehouseName}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-start">#</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.product")}</th>
            <th className="border border-gray-300 p-2 text-start">{t("print.quantity")}</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, i) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">{i + 1}</td>
              <td className="border border-gray-300 p-2">
                {item.productName}
                <span className="block text-xs text-gray-500 font-mono">{item.productSku}</span>
              </td>
              <td className="border border-gray-300 p-2 tabular-nums">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {receipt.notes && (
        <div className="mb-4 text-xs text-gray-600">
          <p className="font-semibold">{t("common.notes")}:</p>
          <p>{receipt.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t text-sm">
        <div>
          <p className="text-gray-500 mb-6">{t("print.payslip.signature")} (Warehouse Keeper):</p>
          <p className="border-b border-dashed border-gray-400 pb-1">___________________________</p>
        </div>
        <div>
          <p className="text-gray-500 mb-6">{t("print.payslip.signature")} (Receiver):</p>
          <p className="border-b border-dashed border-gray-400 pb-1">___________________________</p>
        </div>
      </div>
    </div>
  );
}
