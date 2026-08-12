"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import EmployeeForm from "@/features/hr/components/EmployeeForm";
import { useEmployee } from "@/features/hr/hooks/useEmployee";
import { useTranslation } from "@/hooks/use-translation";

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: employee, isLoading, error } = useEmployee(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("hr.employees.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("hr.employees.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("hr.employees.editTitle")}</h1>
            <p className="text-muted-foreground text-sm">
              {employee.employeeNumber} — {employee.fullName}
            </p>
          </div>
        </div>
      </div>

      <EmployeeForm mode="edit" employee={employee} />
    </div>
  );
}
