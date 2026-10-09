"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Loader2, LocateFixed, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Chip } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import type { ExplorerFilters, ExplorerView } from "@/lib/filters";
import { useI18n } from "@/lib/i18n/client";
import { tagLabel } from "@/lib/i18n/dictionaries";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

const Divider = () => <span aria-hidden className="my-auto h-5 w-px shrink-0 bg-line" />;

export function FilterBar({
  filters,
  setFilters,
  view,
  setView,
  categories,
  tags,
  resultCount,
  nearMe,
  className,
}: {
  filters: ExplorerFilters;
  setFilters: Dispatch<SetStateAction<ExplorerFilters>>;
  view: ExplorerView;
  setView: (view: ExplorerView) => void;
  categories: Category[];
  tags: string[];
  resultCount: number;
  /** Tri « Autour de moi » (géolocalisation du navigateur). */
  nearMe: { active: boolean; locating: boolean; toggle: () => void };
  className?: string;
}) {
  const { t } = useI18n();
  const [showMore, setShowMore] = useState(filters.prices.some((p) => p > 0) || filters.tags.length > 0);
  const isFree = filters.prices.includes(0);
  const activeCount = filters.categories.length + filters.prices.length + filters.tags.length;

  return (
    <div className={cn("z-30 border-b border-line bg-glass backdrop-blur-2xl", className)}>
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder={t.explorer.searchPlaceholder}
              aria-label={t.explorer.searchLabel}
              className="h-10 w-full rounded-full border border-line bg-card pr-4 pl-10 text-[16px] placeholder:text-muted-foreground focus-visible:border-ocre/60 focus-visible:outline-none md:text-sm"
            />
          </label>
          <Segmented
            id="explorer-view"
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: <><LayoutGrid /><span className="hidden sm:inline">{t.explorer.list}</span></> },
              { value: "map", label: <><MapIcon /><span className="hidden sm:inline">{t.explorer.map}</span></> },
            ]}
          />
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto pr-12 pl-4 [mask-image:linear-gradient(to_right,black_88%,transparent)] md:mx-0 md:px-0 md:[mask-image:none]">
          <Chip active={nearMe.active} onClick={nearMe.toggle} aria-busy={nearMe.locating}>
            {nearMe.locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
            {nearMe.locating ? t.explorer.locating : t.explorer.nearMe}
          </Chip>
          <Chip
            active={isFree}
            onClick={() => setFilters((f) => ({ ...f, prices: toggleIn(f.prices, 0) }))}
            className={cn(
              isFree ? "border-emerald-500 bg-emerald-500 text-white" : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
            )}
          >
            {t.common.freeBadge}
          </Chip>
          <Divider />
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={filters.categories.includes(c.slug)}
              onClick={() => setFilters((f) => ({ ...f, categories: toggleIn(f.categories, c.slug) }))}
            >
              <CategoryIcon icon={c.icon} />
              {c.name}
            </Chip>
          ))}
          <Divider />
          <Chip active={showMore} onClick={() => setShowMore((s) => !s)}>
            <SlidersHorizontal />
            {t.explorer.filters}
          </Chip>
          {activeCount > 0 && (
            <Chip onClick={() => setFilters((f) => ({ q: f.q, categories: [], prices: [], tags: [] }))}>
              <X />
              {t.explorer.clear(activeCount)}
            </Chip>
          )}
        </div>

        <AnimatePresence initial={false}>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 34 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-1">
                <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto pr-12 pl-4 [mask-image:linear-gradient(to_right,black_88%,transparent)] md:mx-0 md:px-0 md:[mask-image:none]">
                  <span className="w-12 shrink-0 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t.explorer.priceRow}</span>
                  {t.price.slice(1).map((label, i) => (
                    <Chip
                      key={label}
                      active={filters.prices.includes(i + 1)}
                      onClick={() => setFilters((f) => ({ ...f, prices: toggleIn(f.prices, i + 1) }))}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
                {tags.length > 0 && (
                  <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto pr-12 pl-4 [mask-image:linear-gradient(to_right,black_88%,transparent)] md:mx-0 md:px-0 md:[mask-image:none]">
                    <span className="w-12 shrink-0 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{t.explorer.tagsRow}</span>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        active={filters.tags.includes(tag)}
                        onClick={() => setFilters((f) => ({ ...f, tags: toggleIn(f.tags, tag) }))}
                      >
                        {tagLabel(t, tag)}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="sr-only" role="status">
          {t.common.results(resultCount)}
        </p>
      </div>
    </div>
  );
}
