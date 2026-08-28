"use client";

import { useCompanyPrintInfo } from "@/hooks/use-company-print-info";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatNumber, formatWorkHours } from "@/lib/formatters";

interface PaySlipPrintProps {
  detail: any;
  run: any;
}

export function PaySlipPrint({ detail, run }: PaySlipPrintProps) {
  const { t, language } = useTranslation();
  const { companyName, taxNumber, addressLine } = useCompanyPrintInfo(language);

  const monthYear = run ? `${t(`month.${run.month}`)} ${run.year}` : "";

  return (
    <div id="print-area" className="p-8 text-black bg-white">
      {/* Header: Company + Title */}
      <div className="flex items-start justify-between mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">{companyName}</h1>
          <p className="text-sm text-gray-600">{addressLine}</p>
          <p className="text-sm text-gray-600">الرقم الضريبي: {taxNumber}</p>
        </div>
        <div className="text-end">
          <h2 className="text-xl font-bold">{t("print.payslip.title")}</h2>
          <p className="text-sm font-mono mt-1">{monthYear}</p>
        </div>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500">{t("print.payslip.employee")}</p>
          <p className="font-medium">{detail.employeeName}</p>
        </div>
        <div>
          <p className="text-gray-500">{t("print.payslip.month")}</p>
          <p className="font-medium">{monthYear}</p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="mb-6">
        <h3 className="font-bold text-sm mb-2">{t("print.payslip.earnings")}</h3>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.baseSalary")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums">{formatCurrency(detail.baseSalary, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.transportAllowance")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums">{formatCurrency(detail.transportAllowance, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.housingAllowance")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums">{formatCurrency(detail.housingAllowance, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.overtimePay")} ({formatWorkHours(detail.overtimeHours)})</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums">{formatCurrency(detail.overtimePay, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.otherAllowances")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums">{formatCurrency(detail.otherAllowances, language)}</td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <td className="border border-gray-300 p-2">{t("payroll.totalEarnings")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums text-emerald-600">{formatCurrency(detail.totalEarnings, language)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deductions Table */}
      <div className="mb-6">
        <h3 className="font-bold text-sm mb-2">{t("print.payslip.deductions")}</h3>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.lateDeduction")} ({formatNumber(detail.lateDays)} {t("common.days")})</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums text-red-600">-{formatCurrency(detail.lateDeduction, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.absentDeduction")} ({formatNumber(detail.absentDays)} {t("common.days")})</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums text-red-600">-{formatCurrency(detail.absentDeduction, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.insuranceDeduction")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums text-red-600">-{formatCurrency(detail.insuranceDeduction, language)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">{t("payroll.otherDeductions")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums text-red-600">-{formatCurrency(detail.otherDeductions, language)}</td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <td className="border border-gray-300 p-2">{t("payroll.totalDeductions")}</td>
              <td className="border border-gray-300 p-2 text-end tabular-nums text-red-600">-{formatCurrency(detail.totalDeductions, language)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      Let's verify net pay and signatures...
      {/* Net Pay */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2 text-sm bg-gray-50 p-4 border rounded">
          <div className="flex justify-between font-bold text-lg">
            <span>{t("print.payslip.netPay")}</span>
            <span className="tabular-nums text-emerald-600">{formatCurrency(detail.netPay, language)}</span>
          </div>
        </div>
      </div>

      {/* Signature line & Footer */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t text-sm">
        <div>
          <p className="text-gray-500 mb-6">{t("print.payslip.signature")} (Employer):</p>
          <p className="border-b border-dashed border-gray-400 pb-1">___________________________</p>
        </div>
        <div>
          <p className="text-gray-500 mb-6">{t("print.payslip.signature")} (Employee):</p>
          <p className="border-b border-dashed border-gray-400 pb-1">___________________________</p>
        </div>
      </div>
    </div>
  );
}
