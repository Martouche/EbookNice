"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-glass pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:h-16 md:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none tracking-tight">
            Nice<span className="text-ocre">.</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Le guide des locaux
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors duration-100",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="top-nav-pill"
                    className="absolute inset-0 rounded-full bg-muted"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium transition-colors duration-100 hover:bg-muted"
            >
              <ShieldCheck className="size-3.5 text-ocre" />
              Admin
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
