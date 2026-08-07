# Missions

Mini application pour suivre mes déplacements professionnels **prévisionnels** — avant même la réservation des vols ou hôtels — et partager une vue en lecture seule avec ma famille.

Une seule question à laquelle l'app répond : **« Quand suis-je susceptible d'être en déplacement professionnel ? »**

## Fonctionnement

- Un champ de saisie en langage naturel (« Ajouter ou modifier une mission… ») envoie le texte à un provider IA (Claude ou OpenAI, au choix) qui le convertit en **proposition structurée**.
- La proposition est affichée pour confirmation (avec possibilité de modifier manuellement) — **rien n'est jamais écrit en base avant confirmation explicite**.
- Un calendrier mensuel affiche les missions, colorées par statut (⚪ Possible, 🟡 Probable, 🟢 Confirmé, ❌ Annulé).
- Une liste « Prochaines missions » sous le calendrier, cliquable pour modifier manuellement.
- Un lien `/share/[token]` strictement en lecture seule, sans compte, à partager avec un proche.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Supabase** (Postgres + Auth par lien magique + Row Level Security)
- **react-day-picker** pour le calendrier (léger, mobile-first)
- **Tailwind CSS**
- Abstraction IA (`src/lib/ai/provider.ts`) permutable entre **Claude (Anthropic)** et **OpenAI** via une variable d'environnement, sans toucher au reste du code.

## Sécurité

- Les clés API IA (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`) ne sont lues **que côté serveur** (route handlers Next.js) — jamais exposées au navigateur.
- L'IA ne fait **que proposer** une structure de données (`action: create | update | clarify | unrecognized`) ; elle n'a aucun accès à la base de données. Seule une confirmation explicite de l'utilisateur déclenche un `POST`/`PATCH`.
- La base de données est protégée par **Row Level Security** : chaque propriétaire ne peut lire/écrire que ses propres missions (`auth.uid() = owner_id`). Aucune policy n'existe pour le rôle `anon` sur la table `missions` — l'accès direct est donc refusé par défaut.
- La page publique `/share/[token]` ne lit jamais la table directement : elle appelle une fonction Postgres `get_shared_missions(token)` en `SECURITY DEFINER`, qui ne renvoie que les colonnes nécessaires à l'affichage (pas de note, pas d'ID propriétaire, pas de mission annulée).
- Les tokens de partage sont générés côté serveur avec `crypto.randomBytes(32)` (256 bits d'entropie), jamais côté client.
- Régénérer le lien de partage écrase le token existant : l'ancien lien cesse de fonctionner immédiatement.
- Le middleware (`src/middleware.ts`) protège `/admin` et toutes les routes `/api/*` liées aux missions ; `/share/[token]` est explicitement exclu de l'authentification.

## Structure du projet

```
src/
  app/
    admin/            page principale (protégée)
    login/             connexion par lien magique
    share/[token]/     page publique en lecture seule
    api/
      parse/           POST — interprète une phrase via l'IA (ne modifie rien)
      missions/        GET/POST — liste / création de missions
      missions/[id]/   PATCH — modification d'une mission
      share/           GET/POST — lien de partage courant / régénération
  components/          UI (saisie, calendrier, liste, formulaire, etc.)
  lib/
    ai/                abstraction provider IA (schema, prompt, anthropic, openai)
    supabase/          clients Supabase (browser / server)
    types.ts            types partagés + typage Database
    missions.ts          helpers de formatage de dates, génération de token
supabase/
  migrations/0001_init.sql   schéma complet + RLS + fonction publique
```

## Lancer le projet en local

### 1. Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) (gratuit)
- Une clé API Anthropic **ou** OpenAI

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécuter le contenu de `supabase/migrations/0001_init.sql` (ou via la CLI Supabase : `supabase db push`).
3. Dans **Authentication → Providers**, l'authentification par email (lien magique) est activée par défaut — rien à faire.
4. Récupérer l'URL du projet et la clé `anon` dans **Project Settings → API**.

### 4. Variables d'environnement

Copier `.env.example` en `.env.local` et remplir :

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) Supabase |
| `AI_PROVIDER` | `anthropic` ou `openai` |
| `ANTHROPIC_API_KEY` | requis si `AI_PROVIDER=anthropic` |
| `OPENAI_API_KEY` | requis si `AI_PROVIDER=openai` |
| `AI_MODEL` | optionnel, surcharge le modèle par défaut |

### 5. Créer le compte propriétaire

Aucun formulaire d'inscription n'est prévu (l'app n'a qu'un seul utilisateur). Créer le compte directement dans Supabase :

- **Authentication → Users → Add user** avec ton email, ou
- Se connecter une première fois sur `/login` avec ton email : Supabase créera le compte automatiquement à la première connexion par lien magique (si l'inscription libre est activée dans les paramètres Auth du projet).

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — redirection automatique vers `/login`, puis `/admin` une fois connecté.

## Déploiement

Recommandé : **Vercel** (créateur de Next.js, zéro configuration pour l'App Router).

1. Importer le repo sur [vercel.com](https://vercel.com/new).
2. Renseigner les mêmes variables d'environnement que `.env.local` dans les réglages du projet Vercel.
3. Déployer.

Le middleware, les routes API et les pages dynamiques (`/admin`, `/share/[token]`) fonctionnent nativement sur Vercel (runtime Node.js serverless). Un export statique (GitHub Pages, etc.) n'est **pas compatible** avec ce projet — l'app a besoin d'un serveur pour les routes API et le middleware d'authentification.

## Limitations connues (MVP)

- `@supabase/supabase-js` et `@supabase/ssr` sont volontairement épinglés à des versions un peu antérieures (`2.45.4` / `0.5.2`) : les versions plus récentes déclenchent un bug d'inférence TypeScript avec ce typage de schéma strict (les requêtes typées retournent `never`). À réévaluer lors d'une prochaine mise à jour de ces librairies.
- `npm audit` signale quelques vulnérabilités dans les dépendances internes de Next.js 14 (postcss, eslint tooling) — corrigées uniquement par un passage à Next 15/16, hors périmètre de ce MVP.
- Si l'IA ne renvoie pas un JSON valide respectant le schéma attendu, l'utilisateur reçoit une erreur et peut simplement reformuler sa phrase (pas de retry automatique en v1).
