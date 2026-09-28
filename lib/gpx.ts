import type { PlaceWithRelations } from "./types";

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** Exporte une liste de lieux en waypoints GPX (lisible par Komoot, OsmAnd, Google Earth…). */
export function placesToGpx(title: string, places: PlaceWithRelations[], siteUrl: string) {
  const waypoints = places
    .map(
      (p) => `  <wpt lat="${p.lat}" lon="${p.lng}">
    <name>${escapeXml(p.title)}</name>
    <desc>${escapeXml([p.local_tip, p.address, p.city].filter(Boolean).join(" — "))}</desc>
    <link href="${escapeXml(`${siteUrl}/lieux/${p.slug}`)}"><text>Voir dans le guide</text></link>
    <type>${escapeXml(p.category?.name ?? "Lieu")}</type>
  </wpt>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Nice — Le Guide des Locaux" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escapeXml(title)}</name></metadata>
${waypoints}
</gpx>
`;
}
