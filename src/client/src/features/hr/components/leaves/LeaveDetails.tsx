"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Ban,
  CheckCircle,
  FileWarning,
  Loader2,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useLeave } from "../../hooks/useLeaves";
import { useApproveLeave } from "../../hooks/useApproveLeave";
import { useRejectLeave } from "../../hooks/useRejectLeave";
import { useCancelLeave } from "../../hooks/useCancelLeave";
import { useDeleteLeave } from "../../hooks/useDeleteLeave";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { LeaveStatus } from "@/types/leave";
import {
  rejectLeaveSchema,
  type RejectLeaveFormData,
} from "../../schemas/leave.schema";
import LeaveStatusBadge, { leaveTypeLabelKey } from "./LeaveStatusBadge";

export default function LeaveDetails({ leaveId }: { leaveId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();

  const { data: leave, isLoading, error: leaveError } = useLeave(leaveId);
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const cancelMutation = useCancelLeave();
  const deleteMutation = useDeleteLeave();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  const zodResolverTyped = zodResolver(rejectLeaveSchema) as Resolver<RejectLeaveFormData>;
  const rejectForm = useForm<RejectLeaveFormData>({
    resolver: zodResolverTyped,
    defaultValues: { decisionNote: "" },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (leaveError || !leave) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileWarning className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("leave.notFound")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("leave.notFoundDescription")}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/hr/leaves")}
        >
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const isPending = leave.status === LeaveStatus.Pending;
  const isApproved = leave.status === LeaveStatus.Approved;
  const isCancelled = leave.status === LeaveStatus.Cancelled;

  const handleApprove = () => {
    approveMutation.mutate(leaveId, {
      onSuccess: () => {
        setApproveOpen(false);
        setErrorMessage(null);
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message ||
            err?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  const handleReject = (data: RejectLeaveFormData) => {
    rejectMutation.mutate(
      { id: leaveId, data: { decisionNote: data.decisionNote } },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setErrorMessage(null);
          rejectForm.reset();
        },
        onError: (err: any) => {
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              t("common.unexpectedError")
          );
        },
      }
    );
  };

  const handleCancel = () => {
    setCancelError(null);
    cancelMutation.mutate(
      { id: leaveId, data: { decisionNote: cancelNote || undefined } },
      {
        onSuccess: () => {
          setCancelOpen(false);
          setCancelNote("");
        },
        onError: (err: any) => {
          setCancelError(
            err?.response?.data?.message ||
              err?.message ||
              t("common.unexpectedError")
          );
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(leaveId, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push("/hr/leaves");
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message ||
            err?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{leave.employeeName}</h1>
            <p className="text-muted-foreground text-sm font-mono">
              {leave.employeeNumber}
            </p>
          </div>
          <LeaveStatusBadge status={leave.status} />
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <Link href={`/hr/leaves/${leaveId}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </Button>
            </Link>
          )}
          {isPending && (
            <Button
              onClick={() => {
                setErrorMessage(null);
                setApproveOpen(true);
              }}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {t("leave.approve")}
            </Button>
          )}
          {isPending && (
            <Button
              variant="outline"
              onClick={() => {
                setErrorMessage(null);
                rejectForm.reset();
                setRejectOpen(true);
              }}
              className="gap-2 text-destructive"
            >
              <XCircle className="h-4 w-4" />
              {t("leave.reject")}
            </Button>
          )}
          {(isPending || isApproved) && (
            <Button
              variant="outline"
              onClick={() => {
                setCancelError(null);
                setCancelNote("");
                setCancelOpen(true);
              }}
              className="gap-2"
            >
              <Ban className="h-4 w-4" />
              {t("leave.cancel")}
            </Button>
          )}
          {isPending && (
            <Button
              variant="outline"
              onClick={() => {
                setErrorMessage(null);
                setDeleteOpen(true);
              }}
              className="gap-2 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold">{t("leave.details")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("leave.employee")}</p>
              <p className="mt-1 text-sm font-medium">{leave.employeeName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("leave.type")}</p>
              <p className="mt-1 text-sm">
                {t(leaveTypeLabelKey[leave.leaveType])}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("leave.daysRequested")}
              </p>
              <p className="mt-1 text-sm tabular-nums">
                {leave.daysRequested}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("leave.startDate")}</p>
              <p className="mt-1 text-sm tabular-nums">
                {formatDate(leave.startDate, language)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("leave.endDate")}</p>
              <p className="mt-1 text-sm tabular-nums">
                {formatDate(leave.endDate, language)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("leave.createdAt")}
              </p>
              <p className="mt-1 text-sm">
                {formatDateTime(leave.createdAt, language)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground">{t("leave.reason")}</p>
            <p className="mt-1 text-sm">{leave.reason}</p>
          </div>

          {leave.decisionNote && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                {t("leave.decisionNote")}
              </p>
              <p className="mt-1 text-sm">{leave.decisionNote}</p>
            </div>
          )}

          {leave.approvedByName && leave.approvedAt && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                {t("leave.approvedBy")}
              </p>
              <p className="mt-1 text-sm">
                {leave.approvedByName} — {formatDateTime(leave.approvedAt, language)}
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                {t("leave.cancelledHint")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={(open) => {
          if (!open) {
            setApproveOpen(false);
            setErrorMessage(null);
          }
        }}
        title={t("leave.confirm.approve.title")}
        description={t("leave.confirm.approve.description")}
        confirmLabel={t("leave.approve")}
        variant="info"
        isLoading={approveMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleApprove}
      />

      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          if (!open) setRejectOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("leave.confirm.reject.title")}</DialogTitle>
            <DialogDescription>
              {t("leave.confirm.reject.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decisionNote">{t("leave.decisionNote")}</Label>
              <Textarea
                id="decisionNote"
                {...rejectForm.register("decisionNote")}
                placeholder={t("leave.decisionNotePlaceholder")}
                rows={3}
              />
              {rejectForm.formState.errors.decisionNote && (
                <p className="text-sm text-destructive">
                  {rejectForm.formState.errors.decisionNote.message}
                </p>
              )}
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectOpen(false)}
                disabled={rejectMutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectMutation.isPending}
                className="gap-2"
              >
                {rejectMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t("leave.reject")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!open) setCancelOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("leave.confirm.cancel.title")}</DialogTitle>
            <DialogDescription>
              {t("leave.confirm.cancel.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelNote">{t("leave.decisionNote")}</Label>
              <Textarea
                id="cancelNote"
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder={t("leave.decisionNotePlaceholder")}
                rows={3}
                maxLength={500}
              />
              {cancelError && (
                <p className="text-sm text-destructive">{cancelError}</p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelOpen(false)}
                disabled={cancelMutation.isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="gap-2"
              >
                {cancelMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t("leave.cancel")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false);
            setErrorMessage(null);
          }
        }}
        title={t("leave.confirm.delete.title")}
        description={t("leave.confirm.delete.description")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </div>
  );
}
