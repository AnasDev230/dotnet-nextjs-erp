"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import LeaveForm from "@/features/hr/components/leaves/LeaveForm";
import { useLeave } from "@/features/hr/hooks/useLeaves";
import { useTranslation } from "@/hooks/use-translation";
import { LeaveStatus } from "@/types/leave";

export default function EditLeavePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: leave, isLoading, error } = useLeave(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !leave) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("leave.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("leave.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (leave.status !== LeaveStatus.Pending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("leave.notEditableTitle")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("leave.notEditableDescription")}
            </p>
          </div>
        </div>
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
          <h1 className="text-2xl font-semibold">{t("leave.editTitle")}</h1>
          <p className="text-muted-foreground text-sm">
            {leave.employeeNumber} — {leave.employeeName}
          </p>
        </div>
      </div>

      <LeaveForm mode="edit" leave={leave} />
    </div>
  );
}
