# Virage — backend

API Spring Boot 3 / Java 21 qui valide les entrées, transmet les demandes aux workflows n8n et renvoie leurs résultats au frontend. Aucune logique IA ni persistance de CV n’est embarquée dans le backend.

## Démarrer

Prérequis : JDK 21 et Maven 3.9+.

```powershell
cd "back end"
$env:N8N_PROFILE_ANALYSIS_URL = "https://n8n.hackeuse.fr/webhook-test/virage/profile-analysis"
$env:N8N_JOB_MATCHING_URL = "https://n8n.example/webhook/job-matching"
$env:N8N_ROADMAP_URL = "https://n8n.example/webhook/roadmap"
mvn spring-boot:run
```

Les URLs disposent de valeurs par défaut, configurables aussi dans `src/main/resources/application.yml`. L’URL du profil est actuellement le webhook de test n8n : il ne répond que lorsque le workflow est en mode « Listen for test event ». Pour un usage permanent, active le workflow et remplace `/webhook-test/` par son URL de production `/webhook/`. Le délai des webhooks est de 60 secondes par défaut (`N8N_TIMEOUT_SECONDS`).
Par défaut, CORS autorise les origines Vite `localhost:5173` et `127.0.0.1:5173`; la liste peut être remplacée avec `VIRAGE_CORS_ALLOWED_ORIGINS` (origines séparées par des virgules).

```powershell
mvn test
```

Swagger UI : `http://localhost:8080/swagger-ui.html` — OpenAPI : `http://localhost:8080/v3/api-docs`.

## API

- `GET /api/health`
- `POST /api/profile/analyze` — multipart : `cv` (PDF ou DOCX, facultatif, 10 Mo maximum), `currentJob`, `region`, `hobbies[]` (répétable) et les propriétés facultatives `preferences.education`, `preferences.remote`, `preferences.team`, `preferences.office`, `preferences.technical`, `preferences.relational`, `preferences.management`, `preferences.travel` et `preferences.autonomy`.
- `POST /api/jobs/match` — JSON `ProfileAnalysisResponse`.
- `POST /api/jobs/{jobId}/analysis` — JSON `ProfileAnalysisResponse`; `jobId` est le métier sélectionné.

Les erreurs ont le format `{ "timestamp", "status", "error", "message", "path" }`. Si un CV est fourni, il est encodé en Base64 uniquement pour son transfert au webhook n8n et n’est pas écrit sur disque. Le workflow de profil reçoit `cvFileName`, `cvContentType` et `cvBase64` (nulls si aucun CV n’est fourni), ainsi que `currentJob`, `region`, `hobbies` et `preferences`. Sans CV, l’analyse se fonde sur les autres informations du profil. Sa réponse contient les compétences, le résumé, ainsi que `region`, `hobbies` et `preferences` repris des données du formulaire. Le workflow de reconversion reçoit `{ "profile": ..., "selectedJob": "..." }`. Les trois webhooks doivent répondre avec les objets JSON définis par leurs DTOs.

Les réponses `application/json` renvoyées par n8n sont désérialisées directement. Une erreur ou une absence de réponse du workflow est convertie en erreur HTTP 502 ; les expirations sont signalées en 504.
