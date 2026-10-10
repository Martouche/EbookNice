import { ArrowRight, Cloud, CloudRain, Moon, Sun, SunMedium } from "lucide-react";
import Link from "@/components/link";
import { getI18n } from "@/lib/i18n/server";
import { getNiceWeather, type WeatherMood } from "@/lib/weather";

const ICONS = { rain: CloudRain, hot: Sun, sunny: SunMedium, cloudy: Cloud, night: Moon } satisfies Record<WeatherMood, unknown>;

/** Suggestion selon la météo du moment : pluie → spots abrités, soleil → plages, soir → tables locales… */
export async function WeatherBanner({ rainyTag, className }: { rainyTag: string | null; className?: string }) {
  const [weather, { t }] = await Promise.all([getNiceWeather(), getI18n()]);
  if (!weather) return null;

  const href = {
    rain: rainyTag ? `/explorer?tags=${encodeURIComponent(rainyTag)}` : "/explorer?category=activite",
    hot: "/explorer?category=plage",
    sunny: "/explorer?category=point-de-vue",
    cloudy: "/explorer?category=activite",
    night: "/explorer?category=restaurant",
  }[weather.mood];
  const Icon = ICONS[weather.mood];

  return (
    <aside aria-label={t.weather.label} className={className}>
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-3xl border border-line bg-card p-3 pr-5 transition-colors duration-100 hover:border-ocre/50"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ocre/15 text-ocre">
          <Icon className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground tabular-nums">Nice, {weather.temperature}°C</span>
          <span className="mt-0.5 block font-medium text-balance">{t.weather[weather.mood]}</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
      </Link>
      <p className="mt-1.5 text-right text-[10px] text-muted-foreground">{t.weather.credit}</p>
    </aside>
  );
}
