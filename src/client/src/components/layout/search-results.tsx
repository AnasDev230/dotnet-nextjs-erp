"use client";

import {
  Building,
  Building2,
  FileText,
  Inbox,
  Loader2,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { SearchResultItem, SearchResultResponse } from "@/types/search";

type SearchCategoryKey =
  | "employees"
  | "customers"
  | "suppliers"
  | "products"
  | "salesOrders"
  | "purchaseOrders"
  | "invoices"
  | "departments"
  | "warehouses";

const categoryConfig: Record<
  SearchCategoryKey,
  { icon: LucideIcon; labelKey: string }
> = {
  employees: { icon: Users, labelKey: "search.category.employees" },
  customers: { icon: Building2, labelKey: "search.category.customers" },
  suppliers: { icon: Truck, labelKey: "search.category.suppliers" },
  products: { icon: Package, labelKey: "search.category.products" },
  salesOrders: { icon: ShoppingCart, labelKey: "search.category.salesOrders" },
  purchaseOrders: { icon: FileText, labelKey: "search.category.purchaseOrders" },
  invoices: { icon: Receipt, labelKey: "search.category.invoices" },
  departments: { icon: Building, labelKey: "search.category.departments" },
  warehouses: { icon: Warehouse, labelKey: "search.category.warehouses" },
};

interface SearchResultsProps {
  query: string;
  data: SearchResultResponse | undefined;
  isLoading: boolean;
  onNavigate: (item: SearchResultItem) => void;
}

export function SearchResults({
  query,
  data,
  isLoading,
  onNavigate,
}: SearchResultsProps) {
  const { t } = useTranslation();

  const categoriesWithResults = (data
    ? (Object.keys(categoryConfig) as SearchCategoryKey[]).filter(
        (key) => data[key].length > 0
      )
    : []) as SearchCategoryKey[];

  const showHint = query.length < 2;
  const showEmpty =
    !isLoading &&
    !!data &&
    query.trim().length >= 2 &&
    categoriesWithResults.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showHint) {
    return (
      <p className="px-3 py-3 text-sm text-muted-foreground">
        {t("search.minChars")}
      </p>
    );
  }

  if (showEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-semibold">{t("search.noResults")}</h3>
      </div>
    );
  }

  if (!data || categoriesWithResults.length === 0) return null;

  return (
    <div className="max-h-80 overflow-y-auto">
      {categoriesWithResults.map((key) => {
        const config = categoryConfig[key];
        const Icon = config.icon;
        const items = data[key];
        return (
          <div key={key}>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Icon className="h-4 w-4" />
              {t(config.labelKey)}
            </div>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => onNavigate(item)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-start transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}