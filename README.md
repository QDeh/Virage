# Virage

Virage accompagne les personnes dans leur reconversion professionnelle : analyse du profil, recommandations de métiers, feuille de route et formations.

## Architecture

- `front end/` — application React, TypeScript et Vite.
- `back end/` — API Spring Boot 3 / Java 21, passerelle vers les workflows n8n.
- `collection/supabase-setup.sql` — schéma Supabase et règles d’accès pour les profils et les CV.

Le frontend appelle `POST /api/profile/analyze`, puis `POST /api/jobs/match` et `POST /api/jobs/{jobId}/analysis`. En développement, Vite relaie `/api` au backend sur `http://localhost:8080`.

## Prérequis

- Node.js 20+
- JDK 21
- Maven 3.9+
- Un projet Supabase pour l’authentification, les profils et les CV
- Trois workflows n8n pour l’analyse de profil, la recherche de métiers et la génération des parcours

## Configuration Supabase

1. Créez un projet Supabase et exécutez `collection/supabase-setup.sql` dans le SQL Editor.
2. Configurez l’URL du site et les URL de redirection dans les réglages d’authentification Supabase (par exemple `http://localhost:5173`).
3. Dans `front end/`, copiez `.env.example` vers `.env.local` et renseignez `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (clé publique/publishable) et `VITE_API_BASE_URL`. N’utilisez jamais une clé `service_role` dans le frontend.

Les profils, analyses, roadmaps et CV sont enregistrés par compte Supabase. Les CV sont stockés dans un bucket privé et peuvent être supprimés depuis l’application.

## Démarrer en développement

Dans un premier terminal, configurez le backend et démarrez-le :

```powershell
cd "back end"
$env:N8N_PROFILE_ANALYSIS_URL = "https://n8n.example/webhook/profile-analysis"
$env:N8N_JOB_MATCHING_URL = "https://n8n.example/webhook/job-matching"
$env:N8N_ROADMAP_URL = "https://n8n.example/webhook/roadmap"
mvn spring-boot:run
```

Les trois URL doivent pointer vers des workflows n8n actifs qui renvoient les objets JSON attendus par l’API. L’URL de profil configurée par défaut est un webhook de test, qui ne répond que lorsque le workflow est en mode « Listen for test event ». Pour un usage permanent, activez le workflow et utilisez son URL `/webhook/`. Le délai d’attente par défaut est de 60 secondes (`N8N_TIMEOUT_SECONDS`).

Dans un second terminal, démarrez le frontend :

```powershell
cd "front end"
npm install
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`, le backend sur `http://localhost:8080`. Vite relaie `/api` au backend. Pour modifier cette cible, définissez `VIRAGE_API_PROXY_TARGET`. En production, définissez `VITE_API_BASE_URL` au moment de la compilation si l’API n’est pas servie sur la même origine.

Par défaut, le backend autorise les origines Vite `localhost:5173` et `127.0.0.1:5173`. Remplacez-les avec `VIRAGE_CORS_ALLOWED_ORIGINS` (origines séparées par des virgules).

## API

- `GET /api/health` — état du backend.
- `POST /api/profile/analyze` — données de profil en multipart : `cv` (PDF ou DOCX, facultatif, 10 Mo maximum), `currentJob`, `region`, `hobbies[]` (répétable) et préférences `preferences.*`.
- `POST /api/jobs/match` — recherche des métiers compatibles à partir du profil analysé.
- `POST /api/jobs/{jobId}/analysis` — analyse du métier sélectionné et génération de sa feuille de route et de formations.

Swagger UI : `http://localhost:8080/swagger-ui.html`. Documentation OpenAPI : `http://localhost:8080/v3/api-docs`.

Le CV, s’il est fourni, est encodé en Base64 uniquement pour son transfert au webhook n8n et n’est pas écrit sur disque par le backend. Les roadmaps sont conservées dans le profil Supabase et réutilisées lors d’une nouvelle sélection du même métier.

## Vérification

Backend :

```powershell
cd "back end"
mvn test
```

Frontend :

```powershell
cd "front end"
npm run build
npx playwright install chromium
npm test
```

Les tests navigateur simulent les services Supabase et les endpoints backend.
