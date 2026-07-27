"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import InventoryLevelForm from "@/features/inventory/components/InventoryLevelForm";

export default function CreateInventoryLevelPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">إضافة مخزون أولي</h1>
            <p className="text-muted-foreground text-sm">أدخل الكمية الافتتاحية للمنتج في المستودع</p>
          </div>
        </div>
      </div>

      <InventoryLevelForm />
    </div>
  );
}
