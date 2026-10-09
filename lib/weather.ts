import "server-only";
import { NICE_CENTER } from "./constants";
import { SITE_URL } from "./site";

export type WeatherMood = "rain" | "hot" | "sunny" | "cloudy" | "night";

/**
 * Météo actuelle à Nice (MET Norway, gratuit, sans clé, usage commercial autorisé avec attribution).
 * Mise en cache 30 min ; `null` si le service ne répond pas (le bandeau est alors simplement masqué).
 */
export async function getNiceWeather(): Promise<{ temperature: number; mood: WeatherMood } | null> {
  try {
    const res = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${NICE_CENTER.lat.toFixed(2)}&lon=${NICE_CENTER.lng.toFixed(2)}`,
      {
        // MET Norway exige un User-Agent identifiant le site.
        headers: { "User-Agent": `NiceGuideDesLocaux/1.0 (${SITE_URL})` },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const now = json?.properties?.timeseries?.[0]?.data;
    const temperature = now?.instant?.details?.air_temperature;
    const symbol: string = now?.next_1_hours?.summary?.symbol_code ?? now?.next_6_hours?.summary?.symbol_code ?? "";
    if (typeof temperature !== "number" || !symbol) return null;

    const mood: WeatherMood = /rain|sleet|snow|thunder/.test(symbol)
      ? "rain"
      : symbol.endsWith("_night")
        ? "night"
        : /cloudy|fog/.test(symbol) && !symbol.startsWith("partly")
          ? "cloudy"
          : temperature >= 22
            ? "hot"
            : "sunny";
    return { temperature: Math.round(temperature), mood };
  } catch {
    return null;
  }
}
