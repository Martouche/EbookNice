"use client";

import { motion } from "motion/react";
import Link from "@/components/link";
import { cn } from "@/lib/utils";
import { useI18n, usePathWithoutLocale } from "@/lib/i18n/client";
import { NAV_ITEMS, isActive } from "./nav-items";
import { springs } from "@/lib/motion-tokens";

export function BottomNav() {
  const pathname = usePathWithoutLocale();
  const { t } = useI18n();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label={t.nav.main}
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background pb-safe md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors duration-100",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute top-2 h-8 w-14 rounded-full bg-muted"
                    transition={springs.snappy}
                  />
                )}
                <motion.span whileTap={{ scale: 0.85 }} className="relative grid h-8 place-items-center">
                  <Icon className={cn("size-5", active && "stroke-[2.25]")} />
                </motion.span>
                <span className="relative">{t.nav[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
