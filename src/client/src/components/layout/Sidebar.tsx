"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  Layers,
  ClipboardCheck,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { cn, clearAuthCookie } from "@/lib/utils";
import UserNav from "./UserNav";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "لوحة المعلومات", href: "/", icon: LayoutDashboard },
  { label: "المنتجات", href: "/inventory/products", icon: Package },
  { label: "التصنيفات", href: "/inventory/categories", icon: Tags },
  { label: "المستودعات", href: "/inventory/warehouses", icon: Warehouse },
  { label: "المخزون", href: "/inventory/levels", icon: Layers },
  { label: "التسويات", href: "/inventory/adjustments", icon: ClipboardCheck },
  { label: "المبيعات", href: "/sales", icon: ShoppingCart, disabled: true },
  { label: "الإعدادات", href: "/settings", icon: Settings, disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-64 flex-col border-l border-border bg-card max-lg:hidden">
      <div className="flex h-14 items-center justify-center border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">ب</span>
          </div>
          <span className="text-lg font-semibold">بنيان ERP</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex h-10 cursor-not-allowed items-center gap-2 rounded-md px-3 text-sm opacity-50"
                title="قريباً"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <UserNav />
      </div>

      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
