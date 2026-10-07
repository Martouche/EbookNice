import { BookOpen, Compass, Heart, UserRound } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", key: "guide" as const, icon: BookOpen },
  { href: "/explorer", key: "explorer" as const, icon: Compass },
  { href: "/favoris", key: "carnet" as const, icon: Heart },
  { href: "/compte", key: "account" as const, icon: UserRound },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
