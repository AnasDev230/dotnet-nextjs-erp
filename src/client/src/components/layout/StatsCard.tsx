import { Users, ShoppingCart, Package, AlertCircle, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const iconMap: Record<string, LucideIcon> = {
  Users,
  ShoppingCart,
  Package,
  AlertCircle,
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
