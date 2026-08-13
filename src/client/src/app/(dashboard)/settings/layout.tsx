"use client";

import { Building2, User, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-translation";
import SettingsNavItem from "@/features/settings/components/SettingsNavItem";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.roles.includes("SuperAdmin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.description")}</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-52 shrink-0 space-y-1">
          <SettingsNavItem
            href="/settings/profile"
            icon={User}
            labelKey="settings.nav.profile"
          />
          {isSuperAdmin && (
            <SettingsNavItem
              href="/settings/users"
              icon={Users}
              labelKey="settings.nav.users"
            />
          )}
          {isSuperAdmin && (
            <SettingsNavItem
              href="/settings/company"
              icon={Building2}
              labelKey="settings.nav.company"
            />
          )}
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}