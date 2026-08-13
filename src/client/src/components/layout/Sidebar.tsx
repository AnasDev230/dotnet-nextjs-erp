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
  ShoppingBag,
  Truck,
  Link2,
  PackageCheck,
  Users,
  Settings,
  LogOut,
  ReceiptText,
  UserCog,
  Building2,
  Briefcase,
  BarChart3,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn, clearAuthCookie } from "@/lib/utils";
import UserNav from "./UserNav";

interface NavItem {
  labelKey: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}

interface SubNavItem {
  labelKey: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { labelKey: "nav.settings", href: "/settings", icon: Settings },
];

const salesItems: SubNavItem[] = [
  { labelKey: "nav.orders", href: "/sales/orders", icon: ShoppingCart },
  { labelKey: "nav.customers", href: "/sales/customers", icon: Users },
];

const inventoryItems: SubNavItem[] = [
  { labelKey: "nav.products", href: "/inventory/products", icon: Package },
  { labelKey: "nav.categories", href: "/inventory/categories", icon: Tags },
  { labelKey: "nav.warehouses", href: "/inventory/warehouses", icon: Warehouse },
  { labelKey: "nav.inventoryLevels", href: "/inventory/levels", icon: Layers },
  { labelKey: "nav.adjustments", href: "/inventory/adjustments", icon: ClipboardCheck },
];

const financeItems: SubNavItem[] = [
  { labelKey: "nav.invoices", href: "/finance/invoices", icon: ReceiptText },
];

const purchasingItems: SubNavItem[] = [
  { labelKey: "nav.purchaseOrders", href: "/purchasing/orders", icon: ShoppingBag },
  { labelKey: "nav.goodsReceipts", href: "/purchasing/receipts", icon: PackageCheck },
  { labelKey: "nav.suppliers", href: "/purchasing/suppliers", icon: Truck },
  {
    labelKey: "nav.productSuppliers",
    href: "/purchasing/product-suppliers",
    icon: Link2,
  },
];

const hrItems: SubNavItem[] = [
  { labelKey: "nav.departments", href: "/hr/departments", icon: Building2 },
  { labelKey: "nav.employees", href: "/hr/employees", icon: Briefcase },
];

const reportsItems: SubNavItem[] = [
  { labelKey: "nav.reportsSales", href: "/reports/sales", icon: TrendingUp },
  { labelKey: "nav.reportsPurchases", href: "/reports/purchases", icon: ShoppingCart },
  { labelKey: "nav.reportsInventory", href: "/reports/inventory", icon: Package },
  { labelKey: "nav.reportsEmployees", href: "/reports/employees", icon: Users },
  { labelKey: "nav.customerStatement", href: "/reports/customer-statement", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useTranslation();
  const isInventoryActive = pathname.startsWith("/inventory");
  const isSalesActive = pathname.startsWith("/sales");
  const isFinanceActive = pathname.startsWith("/finance");
  const isPurchasingActive = pathname.startsWith("/purchasing");
  const isHrActive = pathname.startsWith("/hr");
  const isReportsActive = pathname.startsWith("/reports");
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);
  const [salesOpen, setSalesOpen] = useState(isSalesActive);
  const [financeOpen, setFinanceOpen] = useState(isFinanceActive);
  const [purchasingOpen, setPurchasingOpen] = useState(isPurchasingActive);
  const [hrOpen, setHrOpen] = useState(isHrActive);
  const [reportsOpen, setReportsOpen] = useState(isReportsActive);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 start-0 z-30 flex w-64 flex-col border-e border-border bg-card max-lg:hidden">
      <div className="flex h-14 items-center justify-center border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">ب</span>
          </div>
          <span className="text-lg font-semibold">{t("common.brand")}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/settings" && pathname.startsWith("/settings"));
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex h-10 cursor-not-allowed items-center gap-2 rounded-md px-3 text-sm opacity-50"
                title={t("common.comingSoon")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{t(item.labelKey)}</span>
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
              <span>{t(item.labelKey)}</span>
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
            <span className="flex-1 text-start">{t("nav.inventory")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                inventoryOpen && "rotate-180"
              )}
            />
          </button>

          {inventoryOpen && (
            <div className="mt-1 space-y-1 ps-3">
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
                    <span>{t(item.labelKey)}</span>
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
            <span className="flex-1 text-start">{t("nav.sales")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                salesOpen && "rotate-180"
              )}
            />
          </button>

          {salesOpen && (
            <div className="mt-1 space-y-1 ps-3">
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
                    <span>{t(item.labelKey)}</span>
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
            <span className="flex-1 text-start">{t("nav.finance")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                financeOpen && "rotate-180"
              )}
            />
          </button>

          {financeOpen && (
            <div className="mt-1 space-y-1 ps-3">
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
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchasing group */}
        <div>
          <button
            type="button"
            onClick={() => setPurchasingOpen((prev) => !prev)}
            aria-expanded={purchasingOpen}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isPurchasingActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <ShoppingBag className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-start">{t("nav.purchasing")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                purchasingOpen && "rotate-180"
              )}
            />
          </button>

          {purchasingOpen && (
            <div className="mt-1 space-y-1 ps-3">
              {purchasingItems.map((item) => {
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
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* HR group */}
        <div>
          <button
            type="button"
            onClick={() => setHrOpen((prev) => !prev)}
            aria-expanded={hrOpen}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isHrActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <UserCog className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-start">{t("nav.hr")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                hrOpen && "rotate-180"
              )}
            />
          </button>

          {hrOpen && (
            <div className="mt-1 space-y-1 ps-3">
              {hrItems.map((item) => {
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
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {/* Reports group */}
        <div>
          <button
            type="button"
            onClick={() => setReportsOpen((prev) => !prev)}
            aria-expanded={reportsOpen}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isReportsActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <BarChart3 className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-start">{t("nav.reports")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                reportsOpen && "rotate-180"
              )}
            />
          </button>

          {reportsOpen && (
            <div className="mt-1 space-y-1 ps-3">
              {reportsItems.map((item) => {
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
                    <span>{t(item.labelKey)}</span>
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
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
