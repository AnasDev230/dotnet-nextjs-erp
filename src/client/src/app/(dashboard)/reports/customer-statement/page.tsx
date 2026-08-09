"use client";

import { Suspense, useState } from "react";
import { FileText, CreditCard, Landmark, User } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import ReportSummaryCard from "@/features/reports/components/ReportSummaryCard";
import CustomerStatementTable from "@/features/reports/components/CustomerStatementTable";
import ExportCsvButton from "@/features/reports/components/ExportCsvButton";
import { useCustomerStatement } from "@/features/reports/hooks/useReports";
import { downloadCustomerStatementCsv } from "@/features/reports/api/reports";
import { useCustomersForDropdown } from "@/features/sales/hooks/useCustomersForDropdown";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-80";

function CustomerStatementContent() {
  const [customerId, setCustomerId] = useState("");
  const { data: customers } = useCustomersForDropdown();

  const { data, isLoading, isError, refetch } = useCustomerStatement(
    customerId || null
  );

  const customerOptions = (customers ?? []).map((customer) => ({
    value: customer.id,
    label: `${customer.code} — ${customer.name}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">كشف حساب عميل</h1>
          <p className="text-muted-foreground text-sm">
            عرض الفواتير والمدفوعات والرصيد المعلق لعميل محدد
          </p>
        </div>
        <ExportCsvButton
          onClick={() => downloadCustomerStatementCsv(customerId)}
          disabled={!customerId}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          اختر العميل
        </label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className={selectClass}
        >
          <option value="">— اختر عميلاً —</option>
          {customerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {!customerId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <div className="mb-3 rounded-full bg-muted p-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">لم يتم اختيار عميل</h3>
          <p className="text-sm text-muted-foreground">
            اختر عميلاً من القائمة أعلاه لعرض كشف الحساب
          </p>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            فشل تحميل كشف الحساب.
            <Button variant="outline" size="sm" className="mr-2" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium">{data?.customerName}</p>
              {data?.customerCode && (
                <p className="text-xs text-muted-foreground">
                  {data.customerCode}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(data?.totalBilled ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المدفوعات</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(data?.totalPaid ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الرصيد المعلق</p>
                <p className="text-sm font-semibold text-amber-600">
                  {formatCurrency(data?.outstandingBalance ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ReportSummaryCard
              title="إجمالي الفواتير"
              value={formatCurrency(data?.totalBilled ?? 0)}
              icon={FileText}
              iconClassName="text-primary"
              isLoading={isLoading}
            />
            <ReportSummaryCard
              title="إجمالي المدفوعات"
              value={formatCurrency(data?.totalPaid ?? 0)}
              icon={CreditCard}
              iconClassName="text-emerald-600"
              isLoading={isLoading}
            />
            <ReportSummaryCard
              title="الرصيد المعلق"
              value={formatCurrency(data?.outstandingBalance ?? 0)}
              icon={Landmark}
              iconClassName="text-amber-600"
              isLoading={isLoading}
            />
          </div>

          <CustomerStatementTable
            transactions={data?.transactions}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}

export default function CustomerStatementPage() {
  return (
    <Suspense fallback={null}>
      <CustomerStatementContent />
    </Suspense>
  );
}