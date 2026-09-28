import { Binoculars, MapPin, Mountain, Sparkles, UtensilsCrossed, Waves, type LucideProps } from "lucide-react";

const ICONS = {
  utensils: UtensilsCrossed,
  binoculars: Binoculars,
  waves: Waves,
  sparkles: Sparkles,
  mountain: Mountain,
} as const;

export function CategoryIcon({ icon, ...props }: { icon?: string | null } & LucideProps) {
  const Icon = (icon && ICONS[icon as keyof typeof ICONS]) || MapPin;
  return <Icon {...props} />;
}
