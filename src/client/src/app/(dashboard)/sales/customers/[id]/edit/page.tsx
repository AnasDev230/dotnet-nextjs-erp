"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import CustomerForm from "@/features/sales/components/CustomerForm";
import { useCustomer } from "@/features/sales/hooks/useCustomer";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, isLoading, error } = useCustomer(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">العميل غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على العميل المطلوب
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
            <h1 className="text-2xl font-semibold">تعديل العميل</h1>
            <p className="text-muted-foreground text-sm">
              {customer.code} — {customer.name}
            </p>
          </div>
        </div>
      </div>

      <CustomerForm mode="edit" customer={customer} />
    </div>
  );
}
