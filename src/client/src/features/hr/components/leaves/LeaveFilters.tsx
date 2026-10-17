"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Button, Select } from "@/components/ui";
import { useEmployeesForDropdown } from "../../hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import { LeaveStatus, LeaveType } from "@/types/leave";

export default function LeaveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [employeeId, setEmployeeId] = useState(
    searchParams.get("employeeId") ?? "all"
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [leaveType, setLeaveType] = useState(
    searchParams.get("leaveType") ?? "all"
  );
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("dateFrom") ?? ""
  );
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");

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
    if (status === (searchParams.get("status") ?? "all")) return;
    updateParams({ status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (leaveType === (searchParams.get("leaveType") ?? "all")) return;
    updateParams({ leaveType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveType]);

  useEffect(() => {
    if (dateFrom === (searchParams.get("dateFrom") ?? "")) return;
    updateParams({ dateFrom: dateFrom || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom]);

  useEffect(() => {
    if (dateTo === (searchParams.get("dateTo") ?? "")) return;
    updateParams({ dateTo: dateTo || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTo]);

  const employeeOptions = [
    { value: "all", label: t("common.allEmployees") },
    ...(allEmployees ?? []).map((e) => ({
      value: e.id,
      label: `${e.fullName} (${e.employeeNumber})`,
    })),
  ];

  const statusOptions = [
    { value: "all", label: t("common.allStatuses") },
    { value: LeaveStatus.Pending, label: t("leave.status.pending") },
    { value: LeaveStatus.Approved, label: t("leave.status.approved") },
    { value: LeaveStatus.Rejected, label: t("leave.status.rejected") },
    { value: LeaveStatus.Cancelled, label: t("leave.status.cancelled") },
  ];

  const typeOptions = [
    { value: "all", label: t("common.allTypes") },
    { value: LeaveType.Annual, label: t("leave.type.annual") },
    { value: LeaveType.Sick, label: t("leave.type.sick") },
    { value: LeaveType.Unpaid, label: t("leave.type.unpaid") },
    { value: LeaveType.Maternity, label: t("leave.type.maternity") },
    { value: LeaveType.Emergency, label: t("leave.type.emergency") },
    { value: LeaveType.Other, label: t("leave.type.other") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        className="h-10 w-56"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        options={employeeOptions}
      />

      <Select
        className="h-10 w-40"
        value={leaveType}
        onChange={(e) => setLeaveType(e.target.value)}
        options={typeOptions}
      />

      <Select
        className="h-10 w-40"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={statusOptions}
      />

      <Input
        type="date"
        className="h-10 w-44"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        aria-label={t("leave.dateFrom")}
      />

      <Input
        type="date"
        className="h-10 w-44"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        aria-label={t("leave.dateTo")}
      />

      {searchParams.toString() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEmployeeId("all");
            setStatus("all");
            setLeaveType("all");
            setDateFrom("");
            setDateTo("");
            router.push(pathname);
          }}
        >
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}
