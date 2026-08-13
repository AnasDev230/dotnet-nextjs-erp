"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface SettingsNavItemProps {
  href: string;
  icon: typeof User;
  labelKey: string;
}

export default function SettingsNavItem({
  href,
  icon: Icon,
  labelKey,
}: SettingsNavItemProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isActive =
    pathname === href || (href === "/settings/profile" && pathname === "/settings");

  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{t(labelKey)}</span>
    </Link>
  );
}