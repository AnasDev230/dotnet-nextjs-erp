"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { useGlobalSearch } from "@/features/search/hooks/useGlobalSearch";
import { getSearchResultUrl } from "@/features/search/utils/search-utils";
import { SearchResults } from "./search-results";
import type { SearchResultItem } from "@/types/search";

export default function MobileSearchDialog() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useGlobalSearch(query, open);

  function handleNavigate(item: SearchResultItem) {
    router.push(getSearchResultUrl(item.type, item.id));
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden"
        aria-label={t("search.placeholder")}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-start">
              {t("search.placeholder")}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              autoFocus
              className="h-10 rounded-lg ps-9 pe-4"
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-popover shadow-sm">
            <SearchResults
              query={query}
              data={data}
              isLoading={isLoading}
              onNavigate={handleNavigate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}