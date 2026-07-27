import { StatsCard } from "@/components/layout/StatsCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">لوحة المعلومات</h1>
        <p className="text-sm text-muted-foreground">نظرة عامة على النظام</p>
      </div>

      <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
        <p className="font-medium text-primary">
          مرحباً بك في نظام بنيان ERP
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="العملاء" value="0" icon="Users" />
        <StatsCard title="أوامر البيع" value="0" icon="ShoppingCart" />
        <StatsCard title="المنتجات" value="0" icon="Package" />
        <StatsCard title="التنبيهات" value="0" icon="AlertCircle" />
      </div>
    </div>
  );
}
