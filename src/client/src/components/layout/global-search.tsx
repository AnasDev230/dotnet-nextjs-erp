"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";
import { useGlobalSearch } from "@/features/search/hooks/useGlobalSearch";
import { getSearchResultUrl } from "@/features/search/utils/search-utils";
import { SearchResults } from "./search-results";
import type { SearchResultItem } from "@/types/search";

export default function GlobalSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useGlobalSearch(query, open);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNavigate(item: SearchResultItem) {
    router.push(getSearchResultUrl(item.type, item.id));
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative hidden w-full max-w-md lg:block">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={t("search.placeholder")}
        className="h-9 rounded-lg pe-20 ps-9 transition-colors"
        role="combobox"
        aria-expanded={open}
        aria-controls="global-search-results"
        aria-haspopup="listbox"
      />
      <kbd className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
        Ctrl K
      </kbd>

      {open && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          <SearchResults
            query={query}
            data={data}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        </div>
      )}
    </div>
  );
}