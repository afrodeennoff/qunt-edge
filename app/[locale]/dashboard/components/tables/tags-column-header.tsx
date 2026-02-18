"use client";

import React, { useState, useMemo } from "react";
import { useData } from "@/context/data-provider";
import { useUserStore } from "@/store/user-store";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Filter, Search, X } from "lucide-react";

// Custom Tags Header Component
export function TagsColumnHeader() {
  const t = useI18n();
  const { tagFilter, setTagFilter } = useData();
  const tags = useUserStore((state) => state.tags);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = useMemo(() => {
    return (
      tags?.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ?? []
    );
  }, [tags, searchQuery]);

  const hasActiveFilter = tagFilter.tags.length > 0;

  const handleClearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTagFilter({ tags: [] });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "-ml-3 h-8 data-[state=open]:bg-accent",
            hasActiveFilter && "bg-accent",
          )}
        >
          <span>{t("trade-table.tags")}</span>
          {hasActiveFilter && (
            <Filter className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            {t("table.filter")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-80">
            <div className="grid gap-4 p-2">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">
                  {t("trade-table.tags")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("widgets.tags.searchPlaceholder")}
                </p>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 bg-muted/30 rounded-md px-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("widgets.tags.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
                />
              </div>

              {/* Tags list */}
              <div className="max-h-60 min-h-[100px]">
                <ScrollArea className="h-full">
                  <div className="space-y-1">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between rounded-md hover:bg-muted/50 transition-colors p-1.5"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Checkbox
                            checked={tagFilter.tags.includes(tag.name)}
                            onCheckedChange={(checked) => {
                              setTagFilter((prev) => ({
                                tags: checked
                                  ? [...prev.tags, tag.name]
                                  : prev.tags.filter((t) => t !== tag.name),
                              }));
                            }}
                            id={`tag-filter-${tag.id}`}
                            className="h-4 w-4"
                          />
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: tag.color || "#CBD5E1" }}
                          />
                          <label
                            htmlFor={`tag-filter-${tag.id}`}
                            className="font-medium cursor-pointer truncate flex-1 text-sm"
                          >
                            {tag.name}
                          </label>
                        </div>
                      </div>
                    ))}
                    {filteredTags.length === 0 && (
                      <div className="flex items-center justify-center text-muted-foreground h-[100px] text-sm">
                        {searchQuery
                          ? t("widgets.tags.noResults")
                          : t("widgets.tags.noTags")}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilter}
                  className="flex-1"
                  disabled={!hasActiveFilter}
                >
                  {t("table.clear")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  {t("table.apply")}
                </Button>
              </div>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {hasActiveFilter && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearFilter}>
              <X className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              {t("widgets.tags.clearFilter")} ({tagFilter.tags.length})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu >
  );
}
