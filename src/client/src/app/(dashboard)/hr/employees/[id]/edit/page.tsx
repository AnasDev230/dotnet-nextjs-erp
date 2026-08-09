"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import EmployeeForm from "@/features/hr/components/EmployeeForm";
import { useEmployee } from "@/features/hr/hooks/useEmployee";

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
            <h1 className="text-2xl font-semibold">الموظف غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على الموظف المطلوب
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
            <h1 className="text-2xl font-semibold">تعديل الموظف</h1>
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
