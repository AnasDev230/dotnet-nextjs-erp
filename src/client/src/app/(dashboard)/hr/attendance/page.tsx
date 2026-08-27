"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui";
import AttendanceTable from "@/features/hr/components/attendance/AttendanceTable";
import AttendanceFilters from "@/features/hr/components/attendance/AttendanceFilters";
import { useAttendance } from "@/features/hr/hooks/useAttendance";
import { useTranslation } from "@/hooks/use-translation";
import { AttendanceStatus } from "@/types/attendance";

function AttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === AttendanceStatus.Present ||
    statusParam === AttendanceStatus.Late ||
    statusParam === AttendanceStatus.Absent ||
    statusParam === AttendanceStatus.Leave ||
    statusParam === AttendanceStatus.HalfDay
      ? (statusParam as AttendanceStatus)
      : undefined;

  const { data, isLoading } = useAttendance({
    page,
    pageSize,
    employeeId,
    date,
    status,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/hr/attendance?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("attendance.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("attendance.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hr/attendance/bulk">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              {t("attendance.bulk")}
            </Button>
          </Link>
          <Link href="/hr/attendance/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("attendance.new")}
            </Button>
          </Link>
        </div>
      </div>

      <AttendanceFilters />

      <AttendanceTable
        records={data?.items ?? []}
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

export default function AttendanceListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AttendanceContent />
    </Suspense>
  );
}
