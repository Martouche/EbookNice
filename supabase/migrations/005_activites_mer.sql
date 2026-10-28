-- ============================================================================
-- 005 · Nouvelles activités : sorties en mer, 4x4 et sports nautiques
-- Idempotent (ignore un slug déjà présent). Ne touche que public.places.
-- Photos à ajouter à la main dans /admin, puis npm run optimize:photos -- --apply.
-- Coordonnées : OpenStreetMap (Nominatim), points de rendez-vous des prestataires.
-- ============================================================================

insert into public.places
  (title, slug, description, chapter_id, category_id, address, city, lat, lng,
   price_level, local_tip, title_en, description_en, local_tip_en,
   best_time_to_visit, tags, is_featured, sort_order)
select v.title, v.slug, v.description,
       (select id from public.chapters   where slug = v.chapter),
       (select id from public.categories where slug = 'activite'),
       v.address, v.city, v.lat, v.lng, v.price_level, v.local_tip,
       v.title_en, v.description_en, v.local_tip_en,
       v.best_time::public.best_time, v.tags, false, v.sort_order
from (values
  ('Nissa Croisières', 'nissa-croisieres',
   'Sorties en mer en semi-rigide de 12 m depuis le port de Nice, en petit groupe : rade de Villefranche, Cap Ferrat, plage de la Mala, Monaco ou îles de Lérins.',
   'grande-bleue', 'Quai Napoléon Ier, Port Lympia', 'Nice', 43.69720, 7.28430, 3,
   'Réservez la sortie au lever ou au coucher du soleil : la lumière sur la Baie des Anges vaut le réveil.',
   'Nissa Croisières',
   'Boat trips on a 12 m RIB from the port of Nice in small groups: Villefranche bay, Cap Ferrat, Mala beach, Monaco or the Lérins Islands.',
   'Book the sunrise or sunset trip: the light over the Baie des Anges is worth the early start.',
   'SUNSET', array['Vue mer', 'Apéro sunset', 'Excursion'], 40),

  ('4x4 City Tours', '4x4-city-tours',
   'Excursions en Land Rover Defender vintage au départ de Nice, en petit groupe ou en privé : villages perchés, vignobles et panoramas de l''arrière-pays.',
   'riviera-secrete', '1 quai des Deux-Emmanuel', 'Nice', 43.69340, 7.28730, 3,
   'Choisissez la sortie de fin de journée pour finir sur les hauteurs au coucher du soleil.',
   '4x4 City Tours',
   'Vintage Land Rover Defender tours from Nice, in small groups or private: hilltop villages, vineyards and views over the hinterland.',
   'Pick the late-afternoon tour to end up on the heights at sunset.',
   'AFTERNOON', array['Excursion', 'Vue mer', 'Famille'], 50),

  ('Cap Sail Aventures', 'cap-sail-antibes',
   'Sorties en voilier de 9 places vers le Cap d''Antibes ou les îles de Lérins, avec baignade, paddle et apéritif aux produits locaux.',
   'grande-bleue', 'Port de Golfe-Juan, face au Rio''s Banana Café', 'Golfe-Juan', 43.56500, 7.07450, 3,
   'Arrivez 20 minutes avant le départ : le parking du port est payant et vite plein en été.',
   'Cap Sail Aventures',
   'Sailing trips on a 9-seat yacht to Cap d''Antibes or the Lérins Islands, with a swim, paddleboarding and an aperitif of local produce.',
   'Arrive 20 minutes before departure: harbour parking is paid and fills up fast in summer.',
   'SUNSET', array['Vue mer', 'Baignade', 'Apéro sunset'], 60),

  ('Mandelieu Watersports', 'mandelieu-watersports',
   'Base nautique sur la plage de La Rague : ski nautique, wakeboard, bouées tractées, parachute ascensionnel et jet-ski, débutants bienvenus.',
   'grande-bleue', 'Plage de La Rague', 'Mandelieu-la-Napoule', 43.51881, 6.94062, 2,
   'Le matin, la mer est souvent plus lisse : idéal pour un premier essai de ski nautique.',
   'Mandelieu Watersports',
   'Watersports base on La Rague beach: water skiing, wakeboarding, towed rings, parasailing and jet skis, beginners welcome.',
   'The sea is often calmer in the morning: ideal for a first go at water skiing.',
   'MORNING', array['Baignade', 'Famille'], 70),

  ('Boat Evasion', 'boat-evasion-cannes',
   'Location de bateaux sans permis au port du Béal pour explorer la baie de Cannes, les îles de Lérins et Théoule en autonomie. Aussi bouées tractées et parachute ascensionnel.',
   'grande-bleue', '110 boulevard du Midi Louise Moreau, port du Béal', 'Cannes', 43.53612, 6.95294, 3,
   'Partez tôt vers les îles de Lérins pour jeter l''ancre dans le chenal avant l''arrivée des bateaux à la journée.',
   'Boat Evasion',
   'License-free boat rental at Port du Béal to explore the bay of Cannes, the Lérins Islands and Théoule on your own. Also towed rings and parasailing.',
   'Head out early to the Lérins Islands to drop anchor in the channel before the day boats arrive.',
   'MORNING', array['Vue mer', 'Baignade', 'Excursion'], 80)
) as v(title, slug, description, chapter, address, city, lat, lng, price_level, local_tip,
       title_en, description_en, local_tip_en, best_time, tags, sort_order)
where not exists (select 1 from public.places p where p.slug = v.slug);
