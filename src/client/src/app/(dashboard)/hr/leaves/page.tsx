"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import LeavesTable from "@/features/hr/components/leaves/LeavesTable";
import LeaveFilters from "@/features/hr/components/leaves/LeaveFilters";
import { useLeaves } from "@/features/hr/hooks/useLeaves";
import { useTranslation } from "@/hooks/use-translation";
import { LeaveStatus, LeaveType } from "@/types/leave";

const leaveStatusValues = Object.values(LeaveStatus) as string[];
const leaveTypeValues = Object.values(LeaveType) as string[];

function LeavesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const statusParam = searchParams.get("status");
  const status = leaveStatusValues.includes(statusParam ?? "")
    ? (statusParam as LeaveStatus)
    : undefined;

  const leaveTypeParam = searchParams.get("leaveType");
  const leaveType = leaveTypeValues.includes(leaveTypeParam ?? "")
    ? (leaveTypeParam as LeaveType)
    : undefined;

  const { data, isLoading } = useLeaves({
    page,
    pageSize,
    employeeId,
    status,
    leaveType,
    dateFrom,
    dateTo,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/hr/leaves?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("leave.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("leave.description")}
          </p>
        </div>
        <Link href="/hr/leaves/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("leave.new")}
          </Button>
        </Link>
      </div>

      <LeaveFilters />

      <LeavesTable
        requests={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function LeavesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LeavesContent />
    </Suspense>
  );
}
