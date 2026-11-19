# Pivot AI

L’application de reconversion professionnelle est organisée en deux projets indépendants :

- [`front end/`](front%20end/README.md) — React, TypeScript et Vite.
- [`back end/`](back%20end/README.md) — Spring Boot 3 / Java 21, API gateway vers n8n.

Le frontend appelle `POST /api/profile/analyze`, puis `POST /api/jobs/match` et `POST /api/jobs/{jobId}/analysis`. En développement, Vite transmet `/api` à `http://localhost:8080`. Démarrez le backend et configurez ses trois URLs n8n selon les instructions de son README.
