# Pivot AI — frontend

Frontend React / TypeScript / Vite. Les sources, tests et configurations de ce projet sont regroupés dans ce dossier.

## Démarrer

Prérequis : Node.js 20+.

```powershell
cd "front end"
npm install
npm run dev
```

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

- L’envoi du CV en PDF/DOCX (10 Mo maximum) et des préférences en multipart déclenche l’analyse du profil.
- Les compétences obtenues alimentent la recherche des métiers compatibles.
- Le choix d’un métier déclenche l’analyse de compatibilité, le parcours et les formations.

Le navigateur conserve les réponses et les réponses du backend dans `localStorage`, mais pas le fichier CV. Après rechargement, il faut sélectionner le CV de nouveau avant une nouvelle analyse de profil.
