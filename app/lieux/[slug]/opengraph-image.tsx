import { ImageResponse } from "next/og";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, priceLabel } from "@/lib/constants";
import { getPlaceBySlug } from "@/lib/data";

export const alt = "Spot du Guide des Locaux — Nice & Côte d'Azur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Charge Instrument Serif depuis Google Fonts, limitée aux glyphes utiles. */
async function loadDisplayFont(text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Instrument+Serif&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const place = await getPlaceBySlug((await params).slug);
  const title = place?.title ?? "Le Guide des Locaux";
  const photo = place?.images[0];
  const color = CATEGORY_COLORS[place?.category?.slug ?? ""] ?? DEFAULT_CATEGORY_COLOR;
  const meta = place
    ? [place.category?.name, place.city, place.is_free ? "Gratuit · FREE" : priceLabel(place.price_level)].filter(Boolean).join("  ·  ")
    : "Nice & Côte d'Azur";
  const font = await loadDisplayFont(`${title}Nice.Le guide des locaux`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: photo ? "#0b0b0a" : `linear-gradient(150deg, ${color} 0%, #14120f 115%)`,
          color: "white",
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.3) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: "Display", fontSize: 44 }}>
              Nice<span style={{ color: "#e3a13b" }}>.</span>
            </span>
            <span style={{ fontSize: 18, letterSpacing: 4, textTransform: "uppercase", opacity: 0.75 }}>Le guide des locaux</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontSize: 24, opacity: 0.85 }}>{meta}</span>
            <span style={{ fontFamily: "Display", fontSize: title.length > 28 ? 84 : 110, lineHeight: 0.95 }}>{title}</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Display", data: font, style: "normal", weight: 400 }] : undefined },
  );
}
