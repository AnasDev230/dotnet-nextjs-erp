"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("profile.description")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("profile.userInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{t("profile.fullName")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium" dir="ltr">{user.email}</p>
              <p className="text-xs text-muted-foreground">{t("common.email")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {role}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("profile.roles")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button disabled variant="outline" className="gap-2" title={t("common.comingSoon")}>
          <Lock className="h-4 w-4" />
          {t("profile.changePassword")}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">{t("profile.comingSoonDescription")}</p>
      </div>
    </div>
  );
}
