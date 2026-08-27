"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Select,
  Button,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { useBulkAttendance } from "../../hooks/useAttendance";
import { useEmployeesForDropdown } from "../../hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import {
  AttendanceStatus,
  type BulkAttendanceRequest,
  type BulkAttendanceItemRequest,
} from "@/types/attendance";
import { EmployeeStatus } from "@/types/hr";

const statusOptions = [
  { value: AttendanceStatus.Present, labelKey: "attendance.status.present" },
  { value: AttendanceStatus.Late, labelKey: "attendance.status.late" },
  { value: AttendanceStatus.Absent, labelKey: "attendance.status.absent" },
  { value: AttendanceStatus.Leave, labelKey: "attendance.status.leave" },
  { value: AttendanceStatus.HalfDay, labelKey: "attendance.status.halfDay" },
] as const;

interface BulkRowState {
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
}

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function toTimeSpan(value: string): string | null {
  return value ? `${value}:00` : null;
}

export default function BulkAttendanceForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const bulkMutation = useBulkAttendance();
  const error = bulkMutation.error;
  const { data: allEmployees, isLoading: employeesLoading } =
    useEmployeesForDropdown();

  const [date, setDate] = useState(todayString());
  const [rows, setRows] = useState<Record<string, BulkRowState>>({});

  const activeEmployees = (allEmployees ?? []).filter(
    (e) => e.status === EmployeeStatus.Active
  );

  useEffect(() => {
    if (!allEmployees) return;
    setRows((prev) => {
      const next: Record<string, BulkRowState> = {};
      activeEmployees.forEach((e) => {
        next[e.id] =
          prev[e.id] ??
          { status: AttendanceStatus.Present, checkIn: "", checkOut: "" };
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEmployees]);

  const updateRow = (employeeId: string, updates: Partial<BulkRowState>) => {
    setRows((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], ...updates },
    }));
  };

  const onSubmit = async () => {
    const items: BulkAttendanceItemRequest[] = activeEmployees.map(
      (employee) => {
        const row = rows[employee.id];
        return {
          employeeId: employee.id,
          status: row?.status ?? AttendanceStatus.Present,
          checkIn: toTimeSpan(row?.checkIn ?? ""),
          checkOut: toTimeSpan(row?.checkOut ?? ""),
          notes: null,
        };
      }
    );

    const request: BulkAttendanceRequest = { date, items };

    try {
      await bulkMutation.mutateAsync(request);
      router.push("/hr/attendance");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("attendance.bulk")}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>
              {t("common.error")}:{" "}
              {(error as any)?.response?.data?.message || error.message}
            </p>
          </Alert>
        )}

        <div className="space-y-2 mb-6">
          <Label htmlFor="bulk-date">{t("attendance.date")} *</Label>
          <Input
            id="bulk-date"
            type="date"
            className="h-10 max-w-48"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("attendance.employee")}</TableHead>
                <TableHead className="w-36">{t("common.status")}</TableHead>
                <TableHead className="w-32">{t("attendance.checkIn")}</TableHead>
                <TableHead className="w-32">{t("attendance.checkOut")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : activeEmployees.map((employee) => {
                    const row = rows[employee.id];
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {employee.fullName}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {employee.employeeNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            className="h-9"
                            value={row?.status ?? AttendanceStatus.Present}
                            onChange={(e) =>
                              updateRow(employee.id, {
                                status: e.target.value as AttendanceStatus,
                              })
                            }
                            options={statusOptions.map((option) => ({
                              value: option.value,
                              label: t(option.labelKey),
                            }))}
                            aria-label={t("common.status")}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            className="h-9"
                            value={row?.checkIn ?? ""}
                            onChange={(e) =>
                              updateRow(employee.id, { checkIn: e.target.value })
                            }
                            aria-label={t("attendance.checkIn")}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="time"
                            className="h-9"
                            value={row?.checkOut ?? ""}
                            onChange={(e) =>
                              updateRow(employee.id, { checkOut: e.target.value })
                            }
                            aria-label={t("attendance.checkOut")}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">
          <Button
            onClick={onSubmit}
            disabled={bulkMutation.isPending || activeEmployees.length === 0}
            className="gap-2"
          >
            {bulkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {t("attendance.bulk")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/hr/attendance")}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
