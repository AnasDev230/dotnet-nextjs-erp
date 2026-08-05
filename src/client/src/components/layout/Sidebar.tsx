"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  Layers,
  ClipboardCheck,
  ChevronDown,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ReceiptText,
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

interface SubNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { label: "لوحة المعلومات", href: "/", icon: LayoutDashboard },
  { label: "الإعدادات", href: "/settings", icon: Settings, disabled: true },
];

const salesItems: SubNavItem[] = [
  { label: "أوامر البيع", href: "/sales/orders", icon: ShoppingCart },
  { label: "العملاء", href: "/sales/customers", icon: Users },
];

const inventoryItems: SubNavItem[] = [
  { label: "المنتجات", href: "/inventory/products", icon: Package },
  { label: "التصنيفات", href: "/inventory/categories", icon: Tags },
  { label: "المستودعات", href: "/inventory/warehouses", icon: Warehouse },
  { label: "مستويات المخزون", href: "/inventory/levels", icon: Layers },
  { label: "التسويات", href: "/inventory/adjustments", icon: ClipboardCheck },
];

const financeItems: SubNavItem[] = [
  { label: "الفواتير", href: "/finance/invoices", icon: ReceiptText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const isInventoryActive = pathname.startsWith("/inventory");
  const isSalesActive = pathname.startsWith("/sales");
  const isFinanceActive = pathname.startsWith("/finance");
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);
  const [salesOpen, setSalesOpen] = useState(isSalesActive);
  const [financeOpen, setFinanceOpen] = useState(isFinanceActive);

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

        {/* Inventory group */}
        <div>
          <button
            type="button"
            onClick={() => setInventoryOpen((prev) => !prev)}
            aria-expanded={inventoryOpen}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isInventoryActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <Layers className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-right">المخزون</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                inventoryOpen && "rotate-180"
              )}
            />
          </button>

          {inventoryOpen && (
            <div className="mt-1 space-y-1 pr-3">
              {inventoryItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sales group */}
        <div>
          <button
            type="button"
            onClick={() => setSalesOpen((prev) => !prev)}
            aria-expanded={salesOpen}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSalesActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-right">المبيعات</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                salesOpen && "rotate-180"
              )}
            />
          </button>

          {salesOpen && (
            <div className="mt-1 space-y-1 pr-3">
              {salesItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Finance group */}
        <div>
          <button
            type="button"
            onClick={() => setFinanceOpen((prev) => !prev)}
            aria-expanded={financeOpen}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isFinanceActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <ReceiptText className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-right">المالية</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                financeOpen && "rotate-180"
              )}
            />
          </button>

          {financeOpen && (
            <div className="mt-1 space-y-1 pr-3">
              {financeItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
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
