"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Button, Select } from "@/components/ui";
import { useEmployeesForDropdown } from "../../hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import { AttendanceStatus } from "@/types/attendance";

export default function AttendanceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [employeeId, setEmployeeId] = useState(
    searchParams.get("employeeId") ?? "all"
  );
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const { data: allEmployees } = useEmployeesForDropdown();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (employeeId === (searchParams.get("employeeId") ?? "all")) return;
    updateParams({ employeeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  useEffect(() => {
    if (date === (searchParams.get("date") ?? "")) return;
    updateParams({ date: date || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    if (status === (searchParams.get("status") ?? "all")) return;
    updateParams({ status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const employeeOptions = [
    { value: "all", label: t("common.allEmployees") },
    ...(allEmployees ?? []).map((e) => ({
      value: e.id,
      label: `${e.fullName} (${e.employeeNumber})`,
    })),
  ];

  const statusOptions = [
    { value: "all", label: t("common.allStatuses") },
    { value: AttendanceStatus.Present, label: t("attendance.status.present") },
    { value: AttendanceStatus.Late, label: t("attendance.status.late") },
    { value: AttendanceStatus.Absent, label: t("attendance.status.absent") },
    { value: AttendanceStatus.Leave, label: t("attendance.status.leave") },
    { value: AttendanceStatus.HalfDay, label: t("attendance.status.halfDay") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        className="h-10 w-56"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        options={employeeOptions}
      />

      <Input
        type="date"
        className="h-10 w-44"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label={t("attendance.date")}
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
            setEmployeeId("all");
            setDate("");
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
