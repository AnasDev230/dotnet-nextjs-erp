"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import UserForm from "@/features/settings/components/UserForm";
import { useUser } from "@/features/settings/hooks/useUsers";
import { useProfile } from "@/features/settings/hooks/useProfile";
import { useTranslation } from "@/hooks/use-translation";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const { data: user, isLoading, isError } = useUser(params.id);
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("settings.users.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("settings.users.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSelf = profile?.id === user.id;
  const lockRole = isSelf && user.role === "SuperAdmin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("settings.users.editTitle")}</h1>
            <p className="text-muted-foreground text-sm">
              {user.fullName || user.userName}
            </p>
          </div>
        </div>
      </div>

      <UserForm mode="edit" user={user} lockRole={lockRole} />
    </div>
  );
}