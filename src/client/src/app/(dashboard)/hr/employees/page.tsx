"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import EmployeesTable from "@/features/hr/components/EmployeesTable";
import EmployeeFilters from "@/features/hr/components/EmployeeFilters";
import { useEmployees } from "@/features/hr/hooks/useEmployees";
import { EmployeeStatus } from "@/types/hr";

function EmployeesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const departmentId = searchParams.get("departmentId") ?? undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "0" || statusParam === "1" || statusParam === "2"
      ? (Number(statusParam) as EmployeeStatus)
      : undefined;

  const { data, isLoading } = useEmployees({
    page,
    pageSize,
    search,
    departmentId,
    status,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/hr/employees?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">الموظفون</h1>
          <p className="text-muted-foreground text-sm">إدارة موظفي الشركة</p>
        </div>
        <Button onClick={() => router.push("/hr/employees/new")}>
          <Plus className="ml-2 h-4 w-4" />
          موظف جديد
        </Button>
      </div>

      <EmployeeFilters />

      <EmployeesTable
        employees={data?.items ?? []}
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

export default function EmployeesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EmployeesContent />
    </Suspense>
  );
}
