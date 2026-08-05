"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui";
import PaymentForm from "@/features/finance/components/PaymentForm";

export default function NewPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowRight className="ml-2 h-4 w-4" />
          رجوع
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">تسجيل دفعة</h1>
          <p className="text-muted-foreground text-sm">
            تسجيل دفعة على فاتورة
          </p>
        </div>
      </div>

      <PaymentForm invoiceId={params.id} />
    </div>
  );
}
