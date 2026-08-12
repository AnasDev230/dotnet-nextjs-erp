"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button, Select } from "@/components/ui";
import { useDepartmentsForDropdown } from "../hooks/useDepartmentsForDropdown";
import { useTranslation } from "@/hooks/use-translation";

export default function EmployeeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [departmentId, setDepartmentId] = useState(
    searchParams.get("departmentId") ?? "all"
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const { data: allDepartments } = useDepartmentsForDropdown();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => {
      updateParams({ search: search || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams, updateParams]);

  useEffect(() => {
    if (departmentId === (searchParams.get("departmentId") ?? "all")) return;
    updateParams({ departmentId });
  }, [departmentId, updateParams, searchParams]);

  useEffect(() => {
    if (status === (searchParams.get("status") ?? "all")) return;
    updateParams({ status });
  }, [status, updateParams, searchParams]);

  const departmentOptions = [
    { value: "all", label: t("hr.employees.allDepartments") },
    ...(allDepartments ?? []).map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ];

  const statusOptions = [
    { value: "all", label: t("common.allStatuses") },
    { value: "0", label: t("hr.employees.active") },
    { value: "1", label: t("hr.employees.onLeave") },
    { value: "2", label: t("hr.employees.terminated") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("hr.employees.searchPlaceholder")}
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select
        className="h-10 w-44"
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        options={departmentOptions}
      />

      <Select
        className="h-10 w-40"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={statusOptions}
      />

      {searchParams.toString() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            setDepartmentId("all");
            setStatus("all");
            router.push(pathname);
          }}
        >
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}
