"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import UsersTable from "@/features/settings/components/UsersTable";
import { useUsers } from "@/features/settings/hooks/useUsers";
import { useProfile } from "@/features/settings/hooks/useProfile";
import { useTranslation } from "@/hooks/use-translation";

function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;

  const { data, isLoading } = useUsers({ page, pageSize });
  const { data: profile } = useProfile();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/settings/users?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("settings.users.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("settings.users.description")}
          </p>
        </div>
        <Button onClick={() => router.push("/settings/users/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("settings.users.new")}
        </Button>
      </div>

      <UsersTable
        users={data?.items ?? []}
        isLoading={isLoading}
        currentUserId={profile?.id}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function SettingsUsersListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}