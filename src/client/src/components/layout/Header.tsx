"use client";

import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./language-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="ms-auto flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  );
}
