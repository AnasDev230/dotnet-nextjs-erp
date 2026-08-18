"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, History } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSkeleton } from "@/components/shared/detail-skeleton";
import { useAuditLog } from "../hooks/useAuditLogs";
import { ActionBadge } from "./action-badge";
import { formatDateTime } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function formatJson(jsonString: string | null | undefined): string {
  if (!jsonString) return "";
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch {
    return jsonString;
  }
}

function JsonBlock({ label, json }: { label: string; json?: string }) {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {json ? (
          <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs text-start">
            {formatJson(json)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">{t("audit.detail.noData")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AuditLogDetails({ logId }: { logId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { data: log, isLoading, error } = useAuditLog(logId);

  if (isLoading) return <DetailSkeleton />;

  if (error || !log) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("audit.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("audit.notFoundDescription")}
            </p>
          </div>
        </div>
        {axiosError?.response?.data?.message && (
          <Alert variant="destructive">
            <p>{axiosError.response.data.message}</p>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("audit.detail.title")}</h1>
          <p className="text-muted-foreground text-sm">
            <span className="font-mono">{log.recordId?.slice(0, 8) ?? "—"}</span>{" "}
            — {log.tableName}
          </p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              {t("audit.title")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField
              label={t("audit.timestamp")}
              value={formatDateTime(log.timestamp, language)}
            />
            <DetailField label={t("audit.user")} value={log.userName ?? "—"} />
            <DetailField
              label={t("audit.action")}
              value={<ActionBadge action={log.action} />}
            />
            <DetailField label={t("audit.table")} value={log.tableName} />
            <DetailField
              label={t("audit.recordId")}
              value={
                <span className="font-mono text-xs">{log.recordId ?? "—"}</span>
              }
            />
            <DetailField
              label={t("audit.ipAddress")}
              value={<span className="tabular-nums">{log.ipAddress ?? "—"}</span>}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JsonBlock
          label={t("audit.detail.oldValues")}
          json={log.oldValues}
        />
        <JsonBlock label={t("audit.detail.newValues")} json={log.newValues} />
      </div>
    </div>
  );
}