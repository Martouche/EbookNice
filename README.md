# Nice & Côte d'Azur — Le Guide des Locaux

Ebook interactif + web-app : chapitres éditoriaux, carte MapLibre, filtres (dont **Gratuit / FREE**), fiches lieux,
générateur d'itinéraire express, carnet de favoris partageable et back-office admin.

**Stack** : Next.js 15 (App Router, React 19, Server Actions) · Supabase (`@supabase/ssr`, Auth, Storage, RLS) ·
Tailwind CSS v4 · framer-motion · MapLibre GL (fonds CARTO, sans clé).

## Mise en route

1. `npm install` (le `postinstall` copie le worker MapLibre dans `public/maplibre/`).
2. Copier `.env.example` en `.env.local` et renseigner les clés Supabase.
3. Dans Supabase → **SQL Editor**, exécuter [`supabase/schema.sql`](supabase/schema.sql)
   (tables, enums, RLS, buckets `places-images` / `gpx-tracks`, trigger `profiles`, données de départ).
4. Supabase → Authentication → URL Configuration : ajouter `http://localhost:3000/auth/callback`
   (et l'URL Vercel en production) aux **Redirect URLs**.
5. `npm run dev`, créez un compte sur `/connexion`, puis promouvez-le administrateur :

   ```sql
   update public.profiles set role = 'ADMIN' where email = 'vous@exemple.com';
   ```

## Routes

| Route | Rôle |
| --- | --- |
| `/` | Couverture, sommaire bento, itinéraire express, coups de cœur |
| `/explorer` | Filtres + bascule Liste / Carte synchronisée (état dans l'URL : `?vue=carte&gratuit=1…`) |
| `/chapitres/[slug]` | Chapitre de l'ebook |
| `/lieux/[slug]` | Fiche éditoriale : carrousel, Conseil du Local, audio, Waze / Google Maps, GPX |
| `/favoris` | Carnet personnel sur carte + partage, export GPX, impression PDF |
| `/carnet/[id]` | Itinéraire / carnet partagé (public ou propriétaire, via RLS) |
| `/compte` | Profil, itinéraires sauvegardés |
| `/admin` | Back-office (rôle `ADMIN`) : spots, chapitres, uploads Storage, placement sur carte |

## Déploiement Vercel

Importer le dépôt, définir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et
`NEXT_PUBLIC_SITE_URL` (URL de production), puis déployer.
