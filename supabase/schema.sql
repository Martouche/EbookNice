-- ============================================================================
--  Nice & Côte d'Azur — Le Guide des Locaux
--  Schéma complet : à exécuter tel quel dans Supabase > SQL Editor.
--  Idempotent : peut être relancé sans casser l'existant.
--  Base partagée : fonctions et trigger préfixés `guide_` pour ne pas écraser
--  ceux du site (ex. public.is_admin). Les `drop policy` ne visent que les
--  tables du guide ; admin_emails / services / projects ne sont pas touchées.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('USER', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.best_time as enum ('SUNSET', 'MORNING', 'AFTERNOON', 'NIGHT', 'ANYTIME');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        public.user_role not null default 'USER',
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.chapters (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  description  text,
  cover_image  text,
  order_index  int not null default 0
);

create table if not exists public.categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  slug  text not null unique,
  icon  text not null default 'map-pin'   -- nom d'icône lucide (utensils, binoculars, waves, sparkles, mountain)
);

create table if not exists public.places (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  slug                text not null unique,
  description         text,
  chapter_id          uuid references public.chapters (id) on delete set null,
  category_id         uuid references public.categories (id) on delete set null,
  address             text,
  city                text not null default 'Nice',
  lat                 double precision not null check (lat between -90 and 90),
  lng                 double precision not null check (lng between -180 and 180),
  price_level         smallint not null default 0 check (price_level between 0 and 4),
  -- Toujours cohérent avec price_level (0 = Gratuit / FREE)
  is_free             boolean generated always as (price_level = 0) stored,
  local_tip           text,
  audio_tip_url       text,
  images              text[] not null default '{}',
  image_credits       jsonb not null default '[]',
  gpx_url             text,
  best_time_to_visit  public.best_time not null default 'ANYTIME',
  tags                text[] not null default '{}',
  is_featured         boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Bases créées avant l'ajout des crédits photo.
alter table public.places add column if not exists image_credits jsonb not null default '[]';

create index if not exists places_chapter_idx  on public.places (chapter_id);
create index if not exists places_category_idx on public.places (category_id);
create index if not exists places_free_idx     on public.places (is_free);
create index if not exists places_tags_idx     on public.places using gin (tags);

create table if not exists public.favorites (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  place_id    uuid not null references public.places (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, place_id)
);

create table if not exists public.custom_itineraries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  place_ids   uuid[] not null default '{}',
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists itineraries_user_idx on public.custom_itineraries (user_id);

-- ----------------------------------------------------------------------------
-- 3. Helpers & trigger d'inscription
-- ----------------------------------------------------------------------------

-- SECURITY DEFINER : évite la récursion RLS quand une policy interroge profiles.
create or replace function public.guide_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.guide_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists guide_on_auth_user_created on auth.users;
create trigger guide_on_auth_user_created
  after insert on auth.users
  for each row execute function public.guide_handle_new_user();

-- Rattrapage : profils pour les comptes créés avant ce script (ex. admin du site).
insert into public.profiles (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
from auth.users
where email is not null
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.chapters           enable row level security;
alter table public.categories         enable row level security;
alter table public.places             enable row level security;
alter table public.favorites          enable row level security;
alter table public.custom_itineraries enable row level security;

-- profiles : chacun lit son profil, l'admin lit tout.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.guide_is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.guide_is_admin()) with check (public.guide_is_admin());

-- Empêche l'auto-promotion : un utilisateur ne peut modifier que nom & avatar.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Contenu éditorial : lecture publique, écriture admin.
drop policy if exists "chapters_public_read" on public.chapters;
create policy "chapters_public_read" on public.chapters
  for select to anon, authenticated using (true);
drop policy if exists "chapters_admin_write" on public.chapters;
create policy "chapters_admin_write" on public.chapters
  for all to authenticated
  using (public.guide_is_admin()) with check (public.guide_is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.guide_is_admin()) with check (public.guide_is_admin());

drop policy if exists "places_public_read" on public.places;
create policy "places_public_read" on public.places
  for select to anon, authenticated using (true);
drop policy if exists "places_admin_write" on public.places;
create policy "places_admin_write" on public.places
  for all to authenticated
  using (public.guide_is_admin()) with check (public.guide_is_admin());

-- favorites : strictement privés.
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- custom_itineraries : propriétaire en écriture, public si is_public.
drop policy if exists "itineraries_read" on public.custom_itineraries;
create policy "itineraries_read" on public.custom_itineraries
  for select to anon, authenticated
  using (is_public or user_id = auth.uid());
drop policy if exists "itineraries_owner_write" on public.custom_itineraries;
create policy "itineraries_owner_write" on public.custom_itineraries
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5. Storage : buckets publics + policies
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('places-images', 'places-images', true, 10485760,
    array['image/jpeg','image/png','image/webp','image/avif','audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/ogg']),
  ('gpx-tracks', 'gpx-tracks', true, 5242880,
    array['application/gpx+xml','application/xml','text/xml','application/octet-stream'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "guide_assets_public_read" on storage.objects;
create policy "guide_assets_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('places-images', 'gpx-tracks'));

drop policy if exists "guide_assets_admin_insert" on storage.objects;
create policy "guide_assets_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('places-images', 'gpx-tracks') and public.guide_is_admin());

drop policy if exists "guide_assets_admin_update" on storage.objects;
create policy "guide_assets_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('places-images', 'gpx-tracks') and public.guide_is_admin());

drop policy if exists "guide_assets_admin_delete" on storage.objects;
create policy "guide_assets_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('places-images', 'gpx-tracks') and public.guide_is_admin());

-- ----------------------------------------------------------------------------
-- 6. Données de départ (catégories, chapitres, spots)
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, icon) values
  ('Restaurant',    'restaurant',    'utensils'),
  ('Point de vue',  'point-de-vue',  'binoculars'),
  ('Plage',         'plage',         'waves'),
  ('Activité',      'activite',      'sparkles'),
  ('Randonnée',     'randonnee',     'mountain')
on conflict (slug) do nothing;

insert into public.chapters (title, slug, description, order_index) values
  ('Le Vieux-Nice',        'vieux-nice',        'Ruelles ocre, marchés du matin et façades baroques : le cœur battant de la ville.', 1),
  ('La Grande Bleue',      'grande-bleue',      'Galets, criques et rochers : là où les Niçois se baignent vraiment.', 2),
  ('Collines & Sentiers',  'collines-sentiers', 'Forts oubliés, chemins muletiers et panoramas qui se méritent.', 3),
  ('La Riviera Secrète',   'riviera-secrete',   'De Villefranche à Cap-d''Ail, les caps et villages loin des foules.', 4),
  ('La Table des Locaux',  'table-des-locaux',  'Socca, pissaladière et tables où l''on parle encore nissart.', 5)
on conflict (slug) do nothing;

insert into public.places
  (title, slug, description, chapter_id, category_id, address, city, lat, lng,
   price_level, local_tip, best_time_to_visit, tags, is_featured)
select v.title, v.slug, v.description,
       (select id from public.chapters   where slug = v.chapter),
       (select id from public.categories where slug = v.category),
       v.address, v.city, v.lat, v.lng, v.price_level, v.local_tip,
       v.best_time::public.best_time, v.tags, v.is_featured
from (values
  ('Colline du Château', 'colline-du-chateau',
   'Le belvédère historique de Nice, entre la Baie des Anges et le port Lympia. Cascade, ruines et pins parasols.',
   'vieux-nice', 'point-de-vue', 'Montée Menica Rondelly', 'Nice', 43.6952, 7.2806, 0,
   'Montez par l''escalier Lesage côté port plutôt que par le Vieux-Nice : moins de monde, et la vue sur le port en récompense.',
   'MORNING', array['Vue mer','Famille','PMR'], true),
  ('Marché du Cours Saleya', 'cours-saleya',
   'Fleurs, primeurs et producteurs de l''arrière-pays sous les auvents rayés. Brocante le lundi.',
   'vieux-nice', 'activite', 'Cours Saleya', 'Nice', 43.6955, 7.2757, 0,
   'Arrivez avant 9 h et cherchez les petits producteurs au fond du marché, côté chapelle de la Miséricorde.',
   'MORNING', array['Famille','Jour de pluie'], false),
  ('Promenade du Paillon', 'promenade-du-paillon',
   'Coulée verte au cœur de la ville, miroir d''eau et jeux pour enfants.',
   'vieux-nice', 'activite', 'Promenade du Paillon', 'Nice', 43.6989, 7.2770, 0,
   'Le miroir d''eau se déclenche par cycles : attendez quelques minutes pour voir les brumes.',
   'AFTERNOON', array['Famille','PMR','Ombragé'], false),
  ('Coco Beach & sentier des rochers', 'coco-beach',
   'Plateformes rocheuses et eau turquoise à l''est du port : la baignade des Niçois.',
   'grande-bleue', 'plage', 'Boulevard Franck Pilatte', 'Nice', 43.6918, 7.2935, 0,
   'Prenez des chaussures d''eau et plongez tôt le matin, avant que le soleil ne tape sur les rochers.',
   'MORNING', array['Vue mer','Baignade'], true),
  ('Le Plongeoir', 'le-plongeoir',
   'Table posée sur un rocher au-dessus de la mer. Le spot apéro-sunset par excellence.',
   'grande-bleue', 'restaurant', '60 Boulevard Franck Pilatte', 'Nice', 43.6915, 7.2893, 4,
   'Réservez la table côté mer pour le coucher de soleil ; un verre au comptoir coûte moins cher et offre la même vue.',
   'SUNSET', array['Vue mer','Apéro sunset'], true),
  ('Fort du Mont Alban', 'fort-du-mont-alban',
   'Fort du XVIe siècle au sommet du Mont Boron, panorama à 360° de Nice à Cap Ferrat.',
   'collines-sentiers', 'randonnee', 'Chemin du Fort du Mont Alban', 'Nice', 43.7003, 7.3067, 0,
   'Montez à pied depuis le port par le sentier forestier : 45 minutes à l''ombre des pins d''Alep.',
   'SUNSET', array['Vue mer','Chiens admis','Apéro sunset'], true),
  ('Chemin de Nietzsche', 'chemin-de-nietzsche',
   'Ancien chemin muletier qui relie Èze-sur-Mer au village perché. Raide mais inoubliable.',
   'collines-sentiers', 'randonnee', 'Avenue de la Liberté', 'Èze', 43.7196, 7.3612, 0,
   'Faites-le dans le sens de la montée, tôt le matin, et redescendez en bus : vos genoux vous remercieront.',
   'MORNING', array['Vue mer'], false),
  ('Musée Matisse', 'musee-matisse',
   'La villa génoise rouge de Cimiez, au milieu des oliviers, abrite l''œuvre du peintre.',
   'collines-sentiers', 'activite', '164 Avenue des Arènes de Cimiez', 'Nice', 43.7196, 7.2760, 2,
   'Pique-niquez ensuite dans l''oliveraie des arènes, puis passez voir la tombe de Matisse au cimetière voisin.',
   'AFTERNOON', array['Jour de pluie','Famille','PMR'], false),
  ('Sentier du littoral de Cap Ferrat', 'sentier-cap-ferrat',
   'Tour de la pointe Saint-Hospice : criques, pins et eau cristalline.',
   'riviera-secrete', 'randonnee', 'Chemin de la Carrière', 'Saint-Jean-Cap-Ferrat', 43.6830, 7.3380, 0,
   'Emportez votre masque : les criques après la chapelle Saint-Hospice sont parfaites pour snorkeler.',
   'MORNING', array['Vue mer','Baignade','Famille'], false),
  ('Rade de Villefranche', 'rade-de-villefranche',
   'L''une des plus belles rades de Méditerranée, vue depuis la citadelle et la rue Obscure.',
   'riviera-secrete', 'point-de-vue', 'Quai Amiral Courbet', 'Villefranche-sur-Mer', 43.7043, 7.3115, 0,
   'Prenez le train depuis Nice-Ville : 7 minutes, et vous évitez le cauchemar du stationnement.',
   'SUNSET', array['Vue mer','Apéro sunset','Famille'], false),
  ('Plage de la Mala', 'plage-de-la-mala',
   'Crique de galets blancs au pied des falaises de Cap-d''Ail.',
   'riviera-secrete', 'plage', 'Avenue Raymond Gramaglia', 'Cap-d''Ail', 43.7239, 7.4042, 0,
   'Descendez par le sentier du littoral depuis la plage Marquet plutôt que par les escaliers bondés.',
   'AFTERNOON', array['Vue mer','Baignade'], false),
  ('Chez Pipo', 'chez-pipo',
   'Institution de la socca depuis 1923, cuite au feu de bois dans d''immenses plaques de cuivre.',
   'table-des-locaux', 'restaurant', '13 Rue Bavastro', 'Nice', 43.7003, 7.2853, 1,
   'Commandez la socca avec la pissaladière et un verre de Bellet : le trio niçois parfait.',
   'NIGHT', array['Jour de pluie','Famille'], true),
  ('Lou Pilha Leva', 'lou-pilha-leva',
   'Street food niçoise au cœur du Vieux-Nice : socca, pan bagnat, petits farcis.',
   'table-des-locaux', 'restaurant', '10 Rue du Collet', 'Nice', 43.6977, 7.2763, 1,
   'Commandez au comptoir et installez-vous sur les grandes tables en bois : on partage, c''est l''esprit.',
   'ANYTIME', array['Famille'], false)
) as v(title, slug, description, chapter, category, address, city, lat, lng,
       price_level, local_tip, best_time, tags, is_featured)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- 7. Promotion d'un administrateur (après votre première inscription)
-- ----------------------------------------------------------------------------
-- update public.profiles set role = 'ADMIN' where email = 'vous@exemple.com';
