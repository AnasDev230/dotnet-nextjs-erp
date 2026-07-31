"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import CustomersTable from "@/features/sales/components/CustomersTable";
import CustomerFilters from "@/features/sales/components/CustomerFilters";
import { useCustomers } from "@/features/sales/hooks/useCustomers";

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const { data, isLoading } = useCustomers({ page, pageSize, search, type, status });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/sales/customers?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">العملاء</h1>
          <p className="text-muted-foreground text-sm">إدارة العملاء وبياناتهم</p>
        </div>
        <Button onClick={() => router.push("/sales/customers/new")}>
          <Plus className="ml-2 h-4 w-4" />
          عميل جديد
        </Button>
      </div>

      <CustomerFilters />

      <CustomersTable
        customers={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function CustomersListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
