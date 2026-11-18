# Virage

Assistant de reconversion professionnelle en français, réalisé avec React, TypeScript, Vite, Tailwind CSS et des composants de style shadcn/ui (Radix Slot, CVA). Icônes Lucide et export PDF avec jsPDF.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir l’URL affichée par Vite, généralement http://localhost:5173.

## Backend Pivot AI

Le backend Spring Boot / Java 21 se trouve dans `back end`. Il relaie les requêtes vers trois webhooks n8n configurés par variables d’environnement ; consulter [`back end/README.md`](back%20end/README.md) pour le démarrage, les URLs de webhook et le contrat des endpoints. Le frontend de démonstration décrit ci-dessous reste local et ses écrans utilisent encore des données simulées ; il n’appelle pas automatiquement ce backend.

```bash
npm run build
npm run preview
```

## Parcours de démonstration

1. Depuis l’accueil, cliquer sur « Commencer mon analyse ».
2. Saisir par exemple « Conseiller Assurance », choisir une région et un niveau d’études. Le CV est facultatif.
3. Sélectionner des centres d’intérêt, régler les préférences et lancer l’analyse animée.
4. Explorer les cinq métiers et sélectionner une piste pour consulter ses compétences et son parcours.
5. Explorer les formations, ouvrir le récapitulatif et télécharger le rapport PDF.

La navigation permet de revenir aux étapes déjà ouvertes. Le contexte React centralise les réponses et le navigateur les conserve dans `localStorage` sous la clé `virage-profile`. « Recommencer une analyse » réinitialise ces données après confirmation.

## Données et limites

Le frontend de démonstration fonctionne sans compte et sans appel à une IA. Les métiers, scores, salaires, compétences, durées et formations sont des données de démonstration définies dans `src/data.ts`. Les scores sont fixes : ils ne sont pas calculés à partir des réponses. Le parcours et les compétences à développer changent selon le métier choisi.

Le dépôt du CV vérifie son extension (PDF/DOCX) et sa taille (10 Mo maximum). Aucun contenu n’est lu, envoyé ou conservé : seul le nom du fichier est sauvegardé. Le catalogue de formations illustre le domaine informatique ; pour les autres métiers, un message invite à vérifier sa pertinence. Les liens externes ouvrent les sites des organismes. Les statistiques de l’accueil sont fictives et explicitement signalées.

Le rapport PDF reprend le profil, les réponses, le métier cible, les forces, les axes de progression, le plan d’action et les liens de formation. Il est généré dans le navigateur et téléchargé comme un véritable fichier PDF.

## Vérification

```bash
npx playwright install chromium
npx playwright test
```

Les tests couvrent le parcours complet sur desktop et mobile, la conservation après rechargement, la validation des champs et du CV, la sélection multiple, le téléchargement du PDF et la réinitialisation.

## Structure

- `src/App.tsx` : accueil, assistant, résultats et tableau de bord.
- `src/components/ui.tsx` : composants réutilisables Button, Card, Badge et Progress.
- `src/store.tsx` : état global et sauvegarde locale.
- `src/data.ts` : catalogue et parcours simulés.
- `src/styles.css` : identité visuelle, responsive, animations et réduction des mouvements.
- `tests/journey.spec.ts` : tests de bout en bout.

## État des dépendances

L’audit npm au moment de la livraison signale quatre alertes élevées dans la chaîne de développement Vite (`picomatch`, `fdir`, `tinyglobby`, `vite`). `npm audit fix` ne propose pas de correction effective avec les versions disponibles dans le registre utilisé. La dépendance PDF de production a été mise à jour en version 4.2.1.
