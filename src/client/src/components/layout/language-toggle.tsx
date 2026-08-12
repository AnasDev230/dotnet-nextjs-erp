"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/language-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/i18n";

const languageOptions: { value: Language; labelKey: string }[] = [
  { value: "ar", labelKey: "language.arabic" },
  { value: "en", labelKey: "language.english" },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("language.switch")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-9 w-9"
      >
        <Languages className="h-4 w-4" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-card p-1 shadow-lg"
        >
          {languageOptions.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              role="menuitem"
              onClick={() => {
                setLanguage(value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                language === value && "bg-accent font-medium"
              )}
            >
              <span className="flex-1 text-start">{t(labelKey)}</span>
              {language === value && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}