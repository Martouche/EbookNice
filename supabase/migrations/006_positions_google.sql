-- ============================================================================
-- 006 · Positions GPS des activités et restaurants alignées sur leur fiche Google Maps
-- (relevé du 18 novembre 2026, coordonnées du repère de chaque fiche établissement).
-- Idempotent. Ne touche que public.places.
-- ============================================================================

update public.places p
set lat = v.lat, lng = v.lng, address = coalesce(v.address, p.address)
from (values
  -- Activités
  ('cap-sail-antibes',          43.5675696, 7.0823664, 'Port Camille Rayon, avenue des Frères Roustan'),
  ('promenade-du-paillon',      43.6974406, 7.2714633, null),
  ('4x4-city-tours',            43.6971873, 7.2872005, '31 boulevard Stalingrad'),
  ('nissa-croisieres',          43.6981602, 7.2844269, null),
  ('musee-matisse',             43.7196014, 7.2752029, null),
  ('boat-evasion-cannes',       43.5355664, 6.9529020, null),
  ('cours-saleya',              43.6955865, 7.2749940, null),
  ('mandelieu-watersports',     43.5185791, 6.9411828, null),
  -- Restaurants
  ('le-plongeoir',              43.6919027, 7.2909090, null),
  ('lou-pilha-leva',            43.6980992, 7.2767474, null),
  ('chez-pipo',                 43.6999184, 7.2854633, null),
  ('farago-on-the-roof',        43.6939280, 7.2531910, null),
  ('chez-michel-castagniers',   43.7906771, 7.2309233, null),
  ('club-nautique-nice',        43.6923188, 7.2901074, null),
  ('made-in-sud',               43.6947928, 7.2866783, null),
  ('auberge-aire-saint-michel', 43.7436394, 7.2632494, null),
  ('lou-pantail',               43.7141102, 7.2623495, null),
  ('le-galet',                  43.6946519, 7.2659973, null)
) as v(slug, lat, lng, address)
where p.slug = v.slug;
