"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Spots" },
  { href: "/admin/chapitres", label: "Chapitres" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <div className="flex items-center gap-4">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Back-office</p>
        <nav className="flex gap-1">
          {LINKS.map(({ href, label }) => {
            const active = href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/lieux") : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-100",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-pill"
                    className="absolute inset-0 rounded-full bg-muted"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <Button asChild size="sm" variant="accent">
        <Link href="/admin/lieux/nouveau">
          <Plus />
          Nouveau spot
        </Link>
      </Button>
    </div>
  );
}
