"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button, Select } from "@/components/ui";
import { useDepartmentsForDropdown } from "../hooks/useDepartmentsForDropdown";
import { EmployeeStatus } from "@/types/hr";

const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "0", label: "نشط" },
  { value: "1", label: "في إجازة" },
  { value: "2", label: "مفصول" },
];

export default function EmployeeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [departmentId, setDepartmentId] = useState(
    searchParams.get("departmentId") ?? "all"
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const { data: allDepartments } = useDepartmentsForDropdown();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search: search || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateParams]);

  useEffect(() => {
    updateParams({ departmentId });
  }, [departmentId, updateParams]);

  useEffect(() => {
    updateParams({ status });
  }, [status, updateParams]);

  const departmentOptions = [
    { value: "all", label: "كل الأقسام" },
    ...(allDepartments ?? []).map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو الرقم الوظيفي..."
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
          مسح الفلترة
        </Button>
      )}
    </div>
  );
}
