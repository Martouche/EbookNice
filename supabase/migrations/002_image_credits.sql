-- Crédits des photos auto-importées (attribution obligatoire pour CC BY / BY-SA).
-- Sans effet sur les tables du site : ne touche que public.places.
alter table public.places add column if not exists image_credits jsonb not null default '[]';
notify pgrst, 'reload schema';
