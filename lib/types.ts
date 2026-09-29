export type UserRole = "USER" | "ADMIN";
export type BestTime = "SUNSET" | "MORNING" | "AFTERNOON" | "NIGHT" | "ANYTIME";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  order_index: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface ImageCredit {
  url: string;
  author: string;
  license: string;
  license_url: string | null;
  source_url: string;
  provider: "wikimedia" | "unsplash" | "pexels";
  source_id: string;
}

export interface Place {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  chapter_id: string | null;
  category_id: string | null;
  address: string | null;
  city: string;
  lat: number;
  lng: number;
  price_level: number;
  is_free: boolean;
  local_tip: string | null;
  audio_tip_url: string | null;
  images: string[];
  /** Attributions des photos auto-importées (licences CC BY / BY-SA, Unsplash, Pexels). */
  image_credits: ImageCredit[] | null;
  gpx_url: string | null;
  best_time_to_visit: BestTime;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

export interface PlaceWithRelations extends Place {
  category: Category | null;
  chapter: Pick<Chapter, "id" | "title" | "slug"> | null;
}

export interface CustomItinerary {
  id: string;
  user_id: string;
  title: string;
  place_ids: string[];
  is_public: boolean;
  created_at: string;
}
