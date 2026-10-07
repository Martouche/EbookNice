-- ============================================================================
-- 004 · Version anglaise du contenu (titre, description, conseil du local)
-- Idempotent. Ne touche que places et chapters. Vide = repli sur le français.
-- ============================================================================

alter table public.places   add column if not exists title_en       text;
alter table public.places   add column if not exists description_en text;
alter table public.places   add column if not exists local_tip_en   text;
alter table public.chapters add column if not exists title_en       text;
alter table public.chapters add column if not exists description_en text;

update public.places p
set title_en = v.title_en, description_en = v.description_en, local_tip_en = v.local_tip_en
from (values
  ('auberge-aire-saint-michel', 'Auberge de l''Aire Saint-Michel',
   'A quiet country inn in the hills north of Nice, in the shade of the trees.', null),
  ('baie-des-milliardaires', 'Billionaires'' Bay',
   'A cove on Cap d''Antibes at the end of the Tire-Poil path, between rocks and crystal-clear water.', null),
  ('baou-de-saint-jeannet', 'Baou de Saint-Jeannet',
   'The iconic limestone cliff above the village of Saint-Jeannet, overlooking the whole coast from Antibes to Italy.',
   'The climb is steep and sun-exposed: set off in the morning and bring water.'),
  ('chemin-de-nietzsche', 'Nietzsche''s Path',
   'An old mule track linking Èze-sur-Mer to the hilltop village. Steep but unforgettable.',
   'Walk it uphill, early in the morning, and take the bus back down: your knees will thank you.'),
  ('chez-michel-castagniers', 'Chez Michel',
   'A family-run restaurant on the village square of Castagniers, in the hills behind Nice.', null),
  ('chez-pipo', 'Chez Pipo',
   'A socca institution since 1923, baked over a wood fire in huge copper pans.',
   'Order the socca with pissaladière and a glass of Bellet wine: the perfect Niçois trio.'),
  ('club-nautique-nice', 'Club Nautique de Nice',
   'The sailing club''s restaurant, right by the water at the harbour entrance.', null),
  ('coco-beach', 'Coco Beach & the rocky path',
   'Rock platforms and turquoise water east of the harbour: where locals go for a swim.',
   'Bring water shoes and dive in early, before the sun heats up the rocks.'),
  ('colline-du-chateau', 'Castle Hill',
   'Nice''s historic lookout between the Baie des Anges and Lympia harbour. Waterfall, ruins and umbrella pines.',
   'Climb the Lesage stairs from the harbour rather than from the Old Town: fewer people, and a view of the port as a reward.'),
  ('cours-saleya', 'Cours Saleya Market',
   'Flowers, fresh produce and growers from the hinterland under striped awnings. Antiques market on Mondays.',
   'Arrive before 9am and look for the small producers at the far end of the market, by the Miséricorde chapel.'),
  ('farago-on-the-roof', 'Farago on the Roof',
   'A rooftop on the Promenade des Anglais, facing the Baie des Anges.', null),
  ('fort-du-mont-alban', 'Mont Alban Fort',
   'A 16th-century fort on top of Mont Boron, with a 360° view from Nice to Cap Ferrat.',
   'Walk up from the harbour along the forest trail: 45 minutes in the shade of Aleppo pines.'),
  ('iles-de-lerins', 'Lérins Islands',
   'Off Cannes, Sainte-Marguerite island with its pine forests, coves and trails: a timeless escape.',
   'Take the morning ferry from Cannes harbour and bring a picnic and a snorkel mask.'),
  ('jardin-monastere-cimiez', 'Cimiez Monastery Garden & Arena',
   'The Franciscan monastery''s rose garden and pergolas, a lookout over the Paillon valley and Castle Hill, next to the Roman arena.',
   'Continue to the arena''s olive grove and the nearby Matisse Museum: everything is within walking distance.'),
  ('lac-de-trecolpas', 'Lake Trécolpas',
   'A high-altitude lake in the Mercantour, reached from Le Boréon, set in a cirque of mountains.',
   'Park at Le Boréon early in the morning: the car park fills up fast in summer.'),
  ('le-galet', 'Le Galet',
   'A beach restaurant on the Promenade des Anglais, with your feet on the pebbles.', null),
  ('le-plongeoir', 'Le Plongeoir',
   'A table perched on a rock above the sea. The ultimate sunset-drinks spot.',
   'Book a seaside table for sunset; a drink at the bar costs less and has the same view.'),
  ('lou-pantail', 'Lou Pantaïl',
   'A neighbourhood spot in Saint-Lambert, in the hills of Nice.', null),
  ('lou-pilha-leva', 'Lou Pilha Leva',
   'Niçois street food in the heart of the Old Town: socca, pan bagnat, stuffed vegetables.',
   'Order at the counter and sit at the big wooden tables: sharing is the spirit here.'),
  ('made-in-sud', 'Made in Sud',
   'Pizzas near Nice harbour.', null),
  ('mont-chauve-aspremont', 'Mont Chauve d''Aspremont',
   'An 854 m summit crowned by an old military fort: a 360° view from the Mercantour to the sea.',
   'You can start from the hilltop village of Aspremont: do the loop and finish with a break on the village square.'),
  ('musee-matisse', 'Matisse Museum',
   'The red Genoese villa of Cimiez, among olive trees, houses the painter''s work.',
   'Have a picnic afterwards in the arena''s olive grove, then visit Matisse''s grave in the nearby cemetery.'),
  ('parc-du-vinaigrier', 'Vinaigrier Park',
   'A wooded hill east of Nice, between terraces and olive trees, overlooking the Baie des Anges and Villefranche bay.', null),
  ('plage-de-l-aiguille', 'Aiguille Beach',
   'A beach in Théoule-sur-Mer at the foot of the red rocks of the Esterel.', null),
  ('plage-de-la-mala', 'La Mala Beach',
   'A cove of white pebbles at the foot of the Cap-d''Ail cliffs.',
   'Walk down along the coastal path from Marquet beach rather than taking the crowded stairs.'),
  ('plage-de-la-paloma', 'Paloma Beach',
   'A small sheltered cove in Saint-Jean-Cap-Ferrat, along the Pointe Saint-Hospice path.', null),
  ('plage-de-passable', 'Passable Beach',
   'A Saint-Jean-Cap-Ferrat beach facing Villefranche bay, with calm water and a view of the village.', null),
  ('plage-petite-afrique', 'Petite Afrique Beach',
   'A beach in Beaulieu-sur-Mer backed by cliffs, known for its microclimate and calm water.', null),
  ('promenade-du-paillon', 'Promenade du Paillon',
   'A green corridor in the heart of the city, with a water mirror and playgrounds.',
   'The water mirror runs in cycles: wait a few minutes to see the mist.'),
  ('rade-de-villefranche', 'Villefranche Bay',
   'One of the most beautiful bays in the Mediterranean, seen from the citadel and the rue Obscure.',
   'Take the train from Nice-Ville: 7 minutes, and you avoid the parking nightmare.'),
  ('sentier-cap-ferrat', 'Cap Ferrat Coastal Path',
   'A walk around the Pointe Saint-Hospice: coves, pines and crystal-clear water.',
   'Bring your mask: the coves past the Saint-Hospice chapel are perfect for snorkelling.'),
  ('sentier-littoral-cap-de-nice', 'Cap de Nice Coastal Path',
   'The seaside path along the rocks of Cap de Nice, from the harbour towards Villefranche, between coves and villas.',
   'Set off early from Lympia harbour and pack a swimsuit: the coves are tempting.'),
  ('vallee-des-merveilles', 'Valley of Wonders',
   'A high valley in the Mercantour famous for its thousands of Bronze Age rock carvings, among lakes and peaks.',
   'A full-day trip: about 2 hours'' drive from Nice and a long walk, best saved for summer.')
) as v(slug, title_en, description_en, local_tip_en)
where p.slug = v.slug;

update public.chapters c
set title_en = v.title_en, description_en = v.description_en
from (values
  ('vieux-nice', 'Old Nice', 'Ochre alleys, morning markets and baroque façades: the beating heart of the city.'),
  ('grande-bleue', 'The Big Blue', 'Pebbles, coves and rocks: where the people of Nice really swim.'),
  ('collines-sentiers', 'Hills & Trails', 'Forgotten forts, mule tracks and views you have to earn.'),
  ('riviera-secrete', 'The Secret Riviera', 'From Villefranche to Cap-d''Ail, capes and villages away from the crowds.'),
  ('table-des-locaux', 'The Locals'' Table', 'Socca, pissaladière and tables where people still speak Nissart.')
) as v(slug, title_en, description_en)
where c.slug = v.slug;

notify pgrst, 'reload schema';
