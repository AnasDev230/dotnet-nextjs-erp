"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import DepartmentForm from "@/features/hr/components/DepartmentForm";
import { useDepartment } from "@/features/hr/hooks/useDepartment";

export default function EditDepartmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: department, isLoading, error } = useDepartment(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">القسم غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على القسم المطلوب
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
            <h1 className="text-2xl font-semibold">تعديل القسم</h1>
            <p className="text-muted-foreground text-sm">
              {department.code} — {department.name}
            </p>
          </div>
        </div>
      </div>

      <DepartmentForm mode="edit" department={department} />
    </div>
  );
}
