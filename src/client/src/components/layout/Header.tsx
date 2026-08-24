"use client";

import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./language-toggle";
import GlobalSearch from "./global-search";
import MobileSearchDialog from "./mobile-search-dialog";
import NotificationBell from "./notification-bell";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <GlobalSearch />
      <div className="ms-auto flex items-center gap-2">
        <MobileSearchDialog />
        <NotificationBell />
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  );
}
