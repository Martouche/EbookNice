import { BookOpen, Compass, Heart, UserRound } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Guide", icon: BookOpen },
  { href: "/explorer", label: "Explorer", icon: Compass },
  { href: "/favoris", label: "Carnet", icon: Heart },
  { href: "/compte", label: "Compte", icon: UserRound },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
