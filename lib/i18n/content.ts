import type { Category, Chapter, PlaceWithRelations } from "@/lib/types";
import type { Locale } from "./config";
import { getDictionary } from "./dictionaries";

// Contenu de la base dans la langue du visiteur : champs *_en si renseignés, sinon français.

export function localizeCategory<T extends Category>(category: T, locale: Locale): T {
  return locale === "fr" ? category : { ...category, name: getDictionary(locale).categories[category.slug] ?? category.name };
}

export function localizeChapter<T extends Chapter>(chapter: T, locale: Locale): T {
  if (locale === "fr") return chapter;
  return { ...chapter, title: chapter.title_en || chapter.title, description: chapter.description_en || chapter.description };
}

export function localizePlace(place: PlaceWithRelations, locale: Locale): PlaceWithRelations {
  if (locale === "fr") return place;
  return {
    ...place,
    title: place.title_en || place.title,
    description: place.description_en || place.description,
    local_tip: place.local_tip_en || place.local_tip,
    category: place.category && localizeCategory(place.category, locale),
    chapter: place.chapter && { ...place.chapter, title: place.chapter.title_en || place.chapter.title },
  };
}
