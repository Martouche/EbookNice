import type { ReactNode } from "react";

// Illustrations éditoriales des catégories (viewBox 400×300, ancrées en bas).
// Deux encres seulement : le blanc et la teinte foncée de la catégorie (`var(--ink)`),
// posées sur le fond uni de la tuile — elles s'accordent donc à chaque couleur.
// Sujet centré sans rognage ; mer, collines et sol débordent du viewBox (x de -400 à 800) pour
// rejoindre les bords de la tuile, qui les coupe (overflow-hidden).

const W = "white";
const INK = "var(--ink)";

function Plage() {
  return (
    <>
      <circle cx="300" cy="100" r="36" fill={W} fillOpacity="0.9" />
      <path d="M232 92 l10 -6 l10 6 M258 78 l8 -5 l8 5" stroke={W} strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
      <path d="M-400 162 Q-350 150 -300 162 T-200 162 T-100 162 T0 162 T100 162 T200 162 T300 162 T400 162 T500 162 T600 162 T700 162 T800 162 V300 H-400Z" fill={W} fillOpacity="0.22" />
      <path d="M-400 190 Q-350 178 -300 190 T-200 190 T-100 190 T0 190 T100 190 T200 190 T300 190 T400 190 T500 190 T600 190 T700 190 T800 190 V300 H-400Z" fill={W} fillOpacity="0.3" />
      <path d="M-400 218 Q-350 206 -300 218 T-200 218 T-100 218 T0 218 T100 218 T200 218 T300 218 T400 218 T500 218 T600 218 T700 218 T800 218 V300 H-400Z" fill={INK} fillOpacity="0.25" />
      <path d="M-400 262 Q-160 238 0 250 Q200 222 400 250 Q600 236 800 262 V300 H-400Z" fill={W} fillOpacity="0.88" />
      {[
        [40, 270, 9], [72, 282, 6], [110, 268, 7], [150, 286, 10], [205, 272, 6], [248, 284, 8], [290, 268, 7], [335, 280, 9], [372, 266, 6],
      ].map(([cx, cy, r]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.6} fill={INK} fillOpacity="0.22" />
      ))}
      {/* Parasol */}
      <line x1="118" y1="176" x2="126" y2="262" stroke={INK} strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
      <path d="M62 188 Q116 126 172 176 Z" fill={W} />
      <path d="M100 150 Q108 172 104 184 L84 186 Q88 164 100 150Z M136 146 Q140 168 150 180 L130 182 Q128 162 136 146Z" fill={INK} fillOpacity="0.55" />
      {/* Serviette */}
      <rect x="196" y="244" width="70" height="20" rx="3" fill={INK} fillOpacity="0.55" transform="rotate(-6 231 254)" />
      <path d="M204 246 v18 M216 245 v18 M228 244 v18 M240 243 v18 M252 242 v18" stroke={W} strokeOpacity="0.6" strokeWidth="3" transform="rotate(-6 231 254)" />
    </>
  );
}

function PointDeVue() {
  return (
    <>
      <circle cx="112" cy="122" r="42" fill={W} fillOpacity="0.9" />
      <path d="M-400 196 C-200 180 -80 196 0 188 C60 150 120 168 180 172 C240 176 300 136 400 156 C520 176 640 166 800 176 V210 H-400Z" fill={INK} fillOpacity="0.22" />
      <rect x="-400" y="196" width="1200" height="104" fill={W} fillOpacity="0.32" />
      <path d="M0 232 Q120 206 250 214" stroke={W} strokeOpacity="0.9" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Promontoire + tour (Colline du Château) */}
      <path d="M216 300 C230 222 272 170 326 164 C366 160 392 186 420 206 C520 250 640 240 800 250 V300Z" fill={W} fillOpacity="0.6" />
      <path d="M252 300 C262 250 290 216 330 206 C360 200 388 214 420 236 C520 272 640 262 800 270 V300Z" fill={INK} fillOpacity="0.3" />
      <rect x="316" y="118" width="22" height="50" fill={W} />
      <path d="M312 120 H342 L327 100Z" fill={INK} fillOpacity="0.6" />
      <rect x="323" y="134" width="8" height="12" rx="4" fill={INK} fillOpacity="0.5" />
      <line x1="327" y1="100" x2="327" y2="80" stroke={INK} strokeOpacity="0.7" strokeWidth="3" />
      <path d="M327 80 L346 86 L327 92Z" fill={W} />
      {/* Garde-corps du belvédère */}
      <line x1="-400" y1="258" x2="800" y2="258" stroke={INK} strokeOpacity="0.75" strokeWidth="5" />
      <line x1="-400" y1="276" x2="800" y2="276" stroke={INK} strokeOpacity="0.5" strokeWidth="3" />
      {Array.from({ length: 24 }, (_, i) => -380 + i * 50).map((x) => (
        <line key={x} x1={x} y1="256" x2={x} y2="300" stroke={INK} strokeOpacity="0.75" strokeWidth="5" />
      ))}
    </>
  );
}

function TablesLocales() {
  const slices = [0, 45, 90, 135];
  return (
    <>
      {/* Plaque de socca vue de dessus */}
      <rect x="-150" y="-9" width="130" height="18" rx="9" fill={INK} fillOpacity="0.55" transform="translate(176 186) rotate(-35)" />
      <circle cx="176" cy="186" r="104" fill={INK} fillOpacity="0.45" />
      <circle cx="176" cy="186" r="90" fill={W} fillOpacity="0.92" />
      {slices.map((deg) => (
        <line key={deg} x1="176" y1="96" x2="176" y2="276" stroke={INK} strokeOpacity="0.28" strokeWidth="3" transform={`rotate(${deg} 176 186)`} />
      ))}
      {[
        [140, 150, 7], [200, 140, 5], [222, 196, 8], [150, 222, 6], [186, 238, 4], [118, 190, 5], [210, 166, 3], [168, 176, 4],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={INK} fillOpacity="0.3" />
      ))}
      {/* Verre de vin */}
      <path d="M322 96 H370 Q372 150 346 156 Q320 150 322 96Z" fill={W} fillOpacity="0.9" />
      <path d="M324 124 H368 Q364 150 346 154 Q328 150 324 124Z" fill={INK} fillOpacity="0.6" />
      <line x1="346" y1="156" x2="346" y2="206" stroke={W} strokeWidth="4" />
      <ellipse cx="346" cy="208" rx="20" ry="5" fill={W} />
      {/* Couverts */}
      <path d="M40 92 v44 M52 92 v44 M64 92 v44 M40 136 Q52 150 64 136 M52 146 v64" stroke={W} strokeWidth="4" strokeLinecap="round" fill="none" strokeOpacity="0.9" />
    </>
  );
}

function Randonnee() {
  return (
    <>
      <circle cx="330" cy="96" r="28" fill={W} fillOpacity="0.9" />
      <path d="M20 250 L150 80 L280 250Z" fill={W} fillOpacity="0.3" />
      <path d="M150 80 L178 116 L162 110 L150 124 L138 108 L122 116Z" fill={W} fillOpacity="0.8" />
      <path d="M150 262 L282 104 L410 262Z" fill={W} fillOpacity="0.55" />
      <path d="M282 104 L310 138 L296 132 L282 146 L268 132 L254 140Z" fill={W} />
      {/* Sentier en lacets */}
      <path d="M210 300 Q260 272 236 250 T270 212 T262 176 T284 140" stroke={W} strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" fill="none" />
      <path d="M-400 256 Q-160 236 0 246 Q200 218 400 250 Q600 238 800 256 V300 H-400Z" fill={INK} fillOpacity="0.4" />
      {/* Pins */}
      {[
        [42, 246, 1], [78, 252, 0.8], [338, 250, 1.1], [372, 256, 0.85],
      ].map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-3" y="-4" width="6" height="16" fill={INK} fillOpacity="0.8" />
          <path d="M0 -62 L20 -30 H10 L26 -4 H-26 L-10 -30 H-20Z" fill={INK} fillOpacity="0.75" />
        </g>
      ))}
    </>
  );
}

function Balades() {
  const buildings = [
    { x: 20, w: 80, h: 150, tone: 0.9 },
    { x: 100, w: 70, h: 190, tone: 0.72 },
    { x: 230, w: 76, h: 170, tone: 0.9 },
    { x: 306, w: 80, h: 140, tone: 0.72 },
  ];
  return (
    <>
      {buildings.map(({ x, w, h, tone }) => (
        <g key={x}>
          <rect x={x} y={270 - h} width={w} height={h} fill={W} fillOpacity={tone} />
          <path d={`M${x - 6} ${270 - h} H${x + w + 6} L${x + w - 4} ${258 - h} H${x + 4}Z`} fill={INK} fillOpacity="0.5" />
          {Array.from({ length: Math.floor((h - 40) / 34) }, (_, row) =>
            [0, 1].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={x + 14 + col * (w / 2)}
                y={270 - h + 18 + row * 34}
                width={w / 2 - 24}
                height="20"
                rx="2"
                fill={INK}
                fillOpacity="0.4"
              />
            )),
          )}
        </g>
      ))}
      {/* Clocher à dôme (Vieux-Nice) */}
      <rect x="178" y="118" width="44" height="152" fill={W} fillOpacity="0.85" />
      <path d="M172 122 Q200 70 228 122Z" fill={INK} fillOpacity="0.55" />
      <line x1="200" y1="84" x2="200" y2="66" stroke={INK} strokeOpacity="0.7" strokeWidth="3" />
      <rect x="192" y="138" width="16" height="26" rx="8" fill={INK} fillOpacity="0.45" />
      <circle cx="200" cy="190" r="10" fill={INK} fillOpacity="0.4" />
      {/* Auvent rayé du marché */}
      <path d="M12 232 H388 V252 H12Z" fill={W} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${12 + i * 32} 232 h16 v20 q-8 10 -16 0Z`} fill={INK} fillOpacity="0.55" />
      ))}
      <rect x="-400" y="270" width="1200" height="30" fill={INK} fillOpacity="0.35" />
    </>
  );
}

const ILLUSTRATIONS: Record<string, () => ReactNode> = {
  plage: Plage,
  "point-de-vue": PointDeVue,
  restaurant: TablesLocales,
  randonnee: Randonnee,
  activite: Balades,
};

export function CategoryIllustration({ slug, className }: { slug: string; className?: string }) {
  const Illustration = ILLUSTRATIONS[slug] ?? Balades;
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax meet" overflow="visible" aria-hidden className={className}>
      <Illustration />
    </svg>
  );
}
