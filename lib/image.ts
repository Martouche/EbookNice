// Placeholder flou générique pour les photos distantes (Supabase Storage) : un dégradé chaud
// minuscule, étiré et flouté par next/image pendant le chargement.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 10"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3630"/><stop offset="1" stop-color="#1c1b18"/></linearGradient></defs><rect width="8" height="10" fill="url(#g)"/></svg>`;

export const BLUR_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
