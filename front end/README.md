# Pivot AI — frontend

Frontend React / TypeScript / Vite. Les sources, tests et configurations de ce projet sont regroupés dans ce dossier.

## Démarrer

Prérequis : Node.js 20+.

```powershell
cd "front end"
npm install
npm run dev
```

### Comptes et données enregistrées (Supabase)

Les profils, réponses d’analyse, parcours et CV sont enregistrés par compte Supabase pour être retrouvés sur plusieurs appareils. Le CV est stocké dans un bucket privé et peut être supprimé depuis l’étape du profil. Les règles de sécurité limitent chaque utilisateur à ses propres données.

1. Créez un projet Supabase et exécutez `../collection/supabase-setup.sql` dans le SQL Editor.
2. Dans les réglages d’authentification Supabase, configurez l’URL du site et les URL de redirection utilisées par votre application (par exemple `http://localhost:5173` en développement).
3. Copiez `.env.example` vers `.env.local`, puis renseignez `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (clé publique/publishable) et `VITE_API_BASE_URL`. N’utilisez jamais une clé `service_role` dans le frontend.
4. Redémarrez Vite après avoir modifié `.env.local`.

La suppression d’un CV ne supprime pas le profil et les résultats enregistrés. Pour supprimer un compte depuis Supabase Auth, supprimez d’abord le CV depuis l’application : les fichiers du bucket Storage ne sont pas supprimés automatiquement avec le compte.

Le serveur Vite tourne sur `http://localhost:5173`. Il relaie `/api` au backend `http://localhost:8080`. Remplacez cette cible avec `PIVOT_API_PROXY_TARGET` si le backend écoute ailleurs.

En production, définissez `VITE_API_BASE_URL` au moment de la compilation si l’API n’est pas servie sur la même origine.

## Vérification

```powershell
npm run build
npx playwright install chromium
npm test
```

Les tests navigateur simulent les réponses des endpoints, mais vérifient que le wizard transmet bien ses requêtes au backend. Pour un parcours réel, démarrez également le backend et configurez ses webhooks n8n (voir `../back end/README.md`).

## Échanges API

- L’envoi facultatif du CV en PDF/DOCX (10 Mo maximum) et des préférences en multipart déclenche l’analyse du profil. Sans CV, l’analyse utilise les informations de profil saisies.
- Les compétences obtenues alimentent la recherche des métiers compatibles.
- Le choix d’un métier déclenche l’analyse de compatibilité, le parcours et les formations.
- Les roadmaps sont conservées dans le profil Supabase, par métier, puis réutilisées lors d’une nouvelle sélection du même métier.

Le profil, les réponses de l’application et le CV sont conservés dans le compte Supabase et synchronisés entre appareils. Le CV est facultatif et peut être supprimé depuis l’étape du profil. « Recommencer » efface le parcours et le CV enregistré.
