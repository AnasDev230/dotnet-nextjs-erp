"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import DepartmentsTable from "@/features/hr/components/DepartmentsTable";
import DepartmentFilters from "@/features/hr/components/DepartmentFilters";
import { useDepartments } from "@/features/hr/hooks/useDepartments";
import { useTranslation } from "@/hooks/use-translation";

function DepartmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const isActive =
    searchParams.get("isActive") === "true"
      ? true
      : searchParams.get("isActive") === "false"
        ? false
        : undefined;

  const { data, isLoading } = useDepartments({ page, pageSize, search, isActive });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/hr/departments?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("hr.departments.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("hr.departments.listPageDescription")}</p>
        </div>
        <Button onClick={() => router.push("/hr/departments/new")}>
          <Plus className="ml-2 h-4 w-4" />
          {t("hr.departments.new")}
        </Button>
      </div>

      <DepartmentFilters />

      <DepartmentsTable
        departments={data?.items ?? []}
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

export default function DepartmentsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DepartmentsContent />
    </Suspense>
  );
}
