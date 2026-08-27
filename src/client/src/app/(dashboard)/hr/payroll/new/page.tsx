"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import PayrollRunForm from "@/features/hr/components/payroll/PayrollRunForm";
import { useTranslation } from "@/hooks/use-translation";

export default function CreatePayrollRunPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("payroll.new")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("payroll.createPageDescription")}
            </p>
          </div>
        </div>
      </div>

      <PayrollRunForm />
    </div>
  );
}
