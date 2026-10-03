-- ============================================================================
-- 003 · Ordre d'affichage des lieux + import des adresses du carnet de Martin
-- Idempotent. Ne touche que public.places (aucune table du site vitrine).
-- Coordonnées vérifiées via OpenStreetMap (Nominatim).
-- ============================================================================

-- 1. Ordre éditorial, réglable par glisser-déposer dans /admin/ordre (plus petit = affiché en premier).
alter table public.places add column if not exists sort_order integer not null default 1000;
create index if not exists places_sort_idx on public.places (sort_order, title);

-- Ordre initial : coups de cœur d'abord, puis le reste par titre.
update public.places p
set sort_order = r.rn * 10
from (
  select id, row_number() over (partition by category_id order by is_featured desc, title) as rn
  from public.places
) r
where p.id = r.id and p.sort_order = 1000;

-- 2. Coco Beach est aussi un spot coucher de soleil.
update public.places
set tags = array_append(tags, 'Apéro sunset')
where slug = 'coco-beach' and not ('Apéro sunset' = any(tags));

-- 3. Nouvelles adresses (les restaurants sont à compléter dans /admin : prix, conseil du local).
insert into public.places
  (title, slug, description, chapter_id, category_id, address, city, lat, lng,
   price_level, local_tip, best_time_to_visit, tags, is_featured, sort_order)
select v.title, v.slug, v.description,
       (select id from public.chapters   where slug = v.chapter),
       (select id from public.categories where slug = v.category),
       v.address, v.city, v.lat, v.lng, v.price_level, v.local_tip,
       v.best_time::public.best_time, v.tags, false, v.sort_order
from (values
  -- Points de vue
  ('Parc du Vinaigrier', 'parc-du-vinaigrier',
   'Colline boisée à l''est de Nice, entre restanques et oliviers, avec vue sur la Baie des Anges et la rade de Villefranche.',
   'collines-sentiers', 'point-de-vue', 'Boulevard du Mont Alban', 'Nice', 43.71624, 7.30217, 0,
   null, 'SUNSET', array['Vue mer', 'Ombragé', 'Apéro sunset'], 200),
  ('Jardin du monastère & arènes de Cimiez', 'jardin-monastere-cimiez',
   'Roseraie et pergolas du monastère franciscain, belvédère sur la vallée du Paillon et la colline du Château, à deux pas des arènes romaines.',
   'collines-sentiers', 'point-de-vue', 'Place Jean-Paul II', 'Nice', 43.71893, 7.27854, 0,
   'Enchaînez avec l''oliveraie des arènes et le musée Matisse voisin : tout se fait à pied.', 'AFTERNOON', array['Famille', 'Ombragé'], 210),

  -- Randonnées dans et autour de Nice
  ('Sentier du littoral du Cap de Nice', 'sentier-littoral-cap-de-nice',
   'Le chemin de bord de mer qui longe les rochers du Cap de Nice, du port vers Villefranche, entre criques et villas.',
   'collines-sentiers', 'randonnee', 'Boulevard Maurice Maeterlinck', 'Nice', 43.68557, 7.29542, 0,
   'Partez tôt du port Lympia et prévoyez le maillot : les criques invitent à la baignade.', 'MORNING', array['Vue mer', 'Baignade'], 200),
  ('Mont Chauve d''Aspremont', 'mont-chauve-aspremont',
   'Sommet à 854 m couronné d''un ancien fort militaire : panorama à 360° du Mercantour à la mer.',
   'collines-sentiers', 'randonnee', 'Route du Mont Chauve', 'Aspremont', 43.77100, 7.25447, 0,
   'Départ possible depuis le village perché d''Aspremont : faites la boucle et terminez par une pause sur la place du village.', 'SUNSET', array['Vue mer', 'Apéro sunset'], 210),
  ('Baou de Saint-Jeannet', 'baou-de-saint-jeannet',
   'Falaise calcaire emblématique au-dessus du village de Saint-Jeannet, avec vue sur toute la côte, d''Antibes à l''Italie.',
   'collines-sentiers', 'randonnee', 'Saint-Jeannet', 'Saint-Jeannet', 43.75074, 7.13769, 0,
   'La montée est raide et exposée au soleil : partez le matin avec de l''eau.', 'MORNING', array['Vue mer'], 220),

  -- Excursions Mercantour (en voiture)
  ('Vallée des Merveilles', 'vallee-des-merveilles',
   'Haute vallée du Mercantour célèbre pour ses milliers de gravures rupestres de l''âge du bronze, entre lacs et sommets.',
   'collines-sentiers', 'randonnee', 'Vallée des Merveilles', 'Tende', 44.06245, 7.44415, 0,
   'Une sortie à la journée : environ 2 h de route depuis Nice et une longue marche, à réserver pour l''été.', 'MORNING', array['Excursion'], 300),
  ('Lac de Trécolpas', 'lac-de-trecolpas',
   'Lac d''altitude du Mercantour, accessible depuis le Boréon, au cœur d''un cirque de montagnes.',
   'collines-sentiers', 'randonnee', 'Le Boréon', 'Saint-Martin-Vésubie', 44.11575, 7.34036, 0,
   'Garez-vous au Boréon tôt le matin : le parking est vite complet en été.', 'MORNING', array['Excursion', 'Famille'], 310),

  -- Plages hors Nice
  ('Plage de Passable', 'plage-de-passable',
   'Plage de Saint-Jean-Cap-Ferrat face à la rade de Villefranche, eau calme et vue sur le village.',
   'riviera-secrete', 'plage', 'Chemin de Passable', 'Saint-Jean-Cap-Ferrat', 43.69369, 7.32551, 0,
   null, 'AFTERNOON', array['Vue mer', 'Baignade', 'Famille'], 200),
  ('Plage de la Paloma', 'plage-de-la-paloma',
   'Petite crique abritée de Saint-Jean-Cap-Ferrat, au bord du sentier de la pointe Saint-Hospice.',
   'riviera-secrete', 'plage', 'Avenue Jean Mermoz', 'Saint-Jean-Cap-Ferrat', 43.68617, 7.34188, 0,
   null, 'MORNING', array['Vue mer', 'Baignade'], 210),
  ('Plage de la Petite Afrique', 'plage-petite-afrique',
   'Plage de Beaulieu-sur-Mer adossée aux falaises, réputée pour son microclimat et ses eaux calmes.',
   'riviera-secrete', 'plage', 'Boulevard Alsace-Lorraine', 'Beaulieu-sur-Mer', 43.71204, 7.33772, 0,
   null, 'AFTERNOON', array['Baignade', 'Famille'], 220),
  ('Baie des Milliardaires', 'baie-des-milliardaires',
   'Crique du Cap d''Antibes au bout du sentier du Tire-Poil, entre rochers et eau transparente.',
   'riviera-secrete', 'plage', 'Cap d''Antibes', 'Antibes', 43.54645, 7.12955, 0,
   null, 'MORNING', array['Vue mer', 'Baignade', 'Excursion'], 300),
  ('Îles de Lérins', 'iles-de-lerins',
   'Au large de Cannes, l''île Sainte-Marguerite et ses pinèdes, criques et sentiers : une parenthèse hors du temps.',
   'riviera-secrete', 'plage', 'Île Sainte-Marguerite', 'Cannes', 43.51945, 7.04932, 2,
   'Prenez la navette depuis le port de Cannes le matin et emportez pique-nique et masque.', 'MORNING', array['Baignade', 'Famille', 'Excursion'], 310),
  ('Plage de l''Aiguille', 'plage-de-l-aiguille',
   'Plage de Théoule-sur-Mer au pied des roches rouges de l''Esterel.',
   'riviera-secrete', 'plage', 'Corniche d''Or', 'Théoule-sur-Mer', 43.50598, 6.95073, 0,
   null, 'AFTERNOON', array['Baignade', 'Excursion'], 320),

  -- Restaurants
  ('Farago on the Roof', 'farago-on-the-roof',
   'Rooftop sur la Promenade des Anglais, face à la Baie des Anges.',
   'table-des-locaux', 'restaurant', '59 Promenade des Anglais', 'Nice', 43.69403, 7.25304, 3,
   null, 'SUNSET', array['Vue mer', 'Apéro sunset'], 200),
  ('Club Nautique de Nice', 'club-nautique-nice',
   'Table du Club Nautique, au bord de l''eau à la sortie du port.',
   'table-des-locaux', 'restaurant', '50 Boulevard Franck Pilatte', 'Nice', 43.69222, 7.28999, 2,
   null, 'ANYTIME', array['Vue mer'], 210),
  ('Le Galet', 'le-galet',
   'Restaurant de plage sur la Promenade des Anglais, les pieds sur les galets.',
   'table-des-locaux', 'restaurant', '3 Promenade des Anglais', 'Nice', 43.69464, 7.26603, 2,
   null, 'ANYTIME', array['Vue mer'], 220),
  ('Lou Pantaïl', 'lou-pantail',
   'Adresse de quartier à Saint-Lambert, dans les hauteurs de Nice.',
   'table-des-locaux', 'restaurant', '107 Avenue Saint-Lambert', 'Nice', 43.71412, 7.26242, 2,
   null, 'ANYTIME', array[]::text[], 230),
  ('Made in Sud', 'made-in-sud',
   'Pizzas près du port de Nice.',
   'table-des-locaux', 'restaurant', '53 Boulevard Stalingrad', 'Nice', 43.69472, 7.28668, 1,
   null, 'NIGHT', array['Famille'], 240),
  ('Auberge de l''Aire Saint-Michel', 'auberge-aire-saint-michel',
   'Auberge dans les collines du nord de Nice, au calme, sous les arbres.',
   'table-des-locaux', 'restaurant', '2 Chemin de Châteaurenard', 'Nice', 43.74363, 7.26316, 2,
   null, 'AFTERNOON', array['Ombragé', 'Famille'], 250),
  ('Chez Michel', 'chez-michel-castagniers',
   'Table familiale sur la place du village de Castagniers, dans l''arrière-pays niçois.',
   'table-des-locaux', 'restaurant', 'Place Saint-Michel', 'Castagniers', 43.79056, 7.23105, 2,
   null, 'AFTERNOON', array['Famille'], 260)
) as v(title, slug, description, chapter, category, address, city, lat, lng,
       price_level, local_tip, best_time, tags, sort_order)
on conflict (slug) do nothing;

notify pgrst, 'reload schema';
