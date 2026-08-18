"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Eye, History, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  useAuditFilterTables,
  useAuditFilterUsers,
  useAuditLogs,
} from "@/features/audit/hooks/useAuditLogs";
import { ActionBadge } from "@/features/audit/components/action-badge";
import { useTranslation } from "@/hooks/use-translation";
import { formatDateTime } from "@/lib/formatters";
import { AuditAction } from "@/types/audit";

const selectClassName =
  "flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";

function AuditTableHeader({ t }: { t: (key: string) => string }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableHead>{t("audit.timestamp")}</TableHead>
      <TableHead>{t("audit.user")}</TableHead>
      <TableHead>{t("audit.action")}</TableHead>
      <TableHead>{t("audit.table")}</TableHead>
      <TableHead>{t("audit.recordId")}</TableHead>
      <TableHead>{t("audit.ipAddress")}</TableHead>
      <TableHead className="text-end">{t("audit.details")}</TableHead>
    </TableRow>
  );
}

function AuditLogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;

  const action = searchParams.get("action") ?? "";
  const tableName = searchParams.get("tableName") ?? "";
  const userName = searchParams.get("userName") ?? "";
  const fromDate = searchParams.get("fromDate") ?? "";
  const toDate = searchParams.get("toDate") ?? "";

  const { data, isLoading } = useAuditLogs({
    page,
    pageSize,
    action: action ? (action as AuditAction) : undefined,
    tableName: tableName || undefined,
    userName: userName || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const { data: tables = [] } = useAuditFilterTables();
  const { data: users = [] } = useAuditFilterUsers();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("audit.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("audit.description")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <select
          className={selectClassName}
          value={action}
          onChange={(e) =>
            updateParams({ action: e.target.value || undefined })
          }
        >
          <option value="">{t("audit.filters.allActions")}</option>
          <option value={AuditAction.Create}>{t("audit.action.create")}</option>
          <option value={AuditAction.Update}>{t("audit.action.update")}</option>
          <option value={AuditAction.Delete}>{t("audit.action.delete")}</option>
        </select>

        <select
          className={selectClassName}
          value={tableName}
          onChange={(e) =>
            updateParams({ tableName: e.target.value || undefined })
          }
        >
          <option value="">{t("audit.filters.allTables")}</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>

        <select
          className={selectClassName}
          value={userName}
          onChange={(e) =>
            updateParams({ userName: e.target.value || undefined })
          }
        >
          <option value="">{t("audit.filters.allUsers")}</option>
          {users.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label={t("audit.filters.fromDate")}
            className="h-10 w-40"
            value={fromDate}
            onChange={(e) =>
              updateParams({ fromDate: e.target.value || undefined })
            }
          />
          <span className="text-sm text-muted-foreground">—</span>
          <Input
            type="date"
            aria-label={t("audit.filters.toDate")}
            className="h-10 w-40"
            value={toDate}
            onChange={(e) =>
              updateParams({ toDate: e.target.value || undefined })
            }
          />
        </div>

        {searchParams.toString() && (
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => router.push(pathname)}
          >
            {t("audit.filters.reset")}
          </Button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <AuditTableHeader t={t} />
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (data?.items.length ?? 0) === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
          <div className="rounded-full bg-muted p-4 mb-4">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {t("audit.emptyTitle")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("audit.emptyDescription")}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <AuditTableHeader t={t} />
              </TableHeader>
              <TableBody>
                {data?.items.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(log.timestamp, language)}
                    </TableCell>
                    <TableCell>{log.userName ?? "—"}</TableCell>
                    <TableCell>
                      <ActionBadge action={log.action} />
                    </TableCell>
                    <TableCell>{log.tableName}</TableCell>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                      {log.recordId ? `${log.recordId.slice(0, 8)}…` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {log.ipAddress ?? "—"}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/audit-logs/${log.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={t("common.view")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {t("common.showing")} {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, data?.totalCount ?? 0)}{" "}
                {t("common.of")} {data?.totalCount ?? 0}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  {t("common.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data?.totalPages ?? 0)}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuditLogContent />
    </Suspense>
  );
}