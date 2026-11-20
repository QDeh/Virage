import { expect, test } from "@playwright/test";

async function mockSupabase(page: import("@playwright/test").Page) {
  let savedProfile: Record<string, unknown> | null = null;
  await page.route("https://virage-test.supabase.co/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/auth/v1/token") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "test-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "test-refresh-token",
          user: {
            id: "00000000-0000-4000-8000-000000000001",
            aud: "authenticated",
            role: "authenticated",
            email: "personne@example.com",
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: {},
            created_at: "2026-01-01T00:00:00.000Z",
          },
        }),
      });
      return;
    }
    if (url.pathname === "/rest/v1/virage_profiles") {
      if (request.method() === "GET") {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(savedProfile),
        });
      } else {
        const body = request.postDataJSON() as Record<string, unknown>;
        savedProfile = { ...savedProfile, ...body };
        await route.fulfill({ status: 204, body: "" });
      }
      return;
    }
    if (url.pathname.startsWith("/storage/v1/object/")) {
      if (request.method() === "GET") {
        await route.fulfill({
          contentType: "application/pdf",
          body: Buffer.from("%PDF-1.4 saved CV"),
        });
      } else if (request.method() === "DELETE") {
        await route.fulfill({ contentType: "application/json", body: "[]" });
      } else {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({ Key: url.pathname }),
        });
      }
      return;
    }
    await route.fulfill({ status: 404, body: "Not mocked" });
  });
}

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Adresse courriel").fill("personne@example.com");
  await page.getByLabel("Mot de passe").fill("motdepasse-test");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("button", { name: "Déconnexion" }))
    .toBeVisible();
}

async function mockBackend(page: import("@playwright/test").Page) {
  await mockSupabase(page);
  const calls: string[] = [];
  await page.route("**/api/profile/analyze", async (route) => {
    calls.push("/api/profile/analyze");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        technicalSkills: ["Excel"],
        softSkills: ["Écoute"],
        transferableSkills: ["Relation client"],
        profileSummary: "Profil orienté relation client et résolution de problèmes.",
        region: "Nouvelle-Aquitaine",
        hobbies: ["Informatique", "Relation client"],
        preferences: {
          education: "Bac +2",
          remote: "Hybride",
          team: 65,
          office: 70,
          technical: 60,
          relational: 75,
          management: false,
          travel: false,
          autonomy: true,
        },
      }),
    });
  });
  await page.route("**/api/jobs/match", async (route) => {
    calls.push("/api/jobs/match");
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        jobs: [
          {
            name: "Technicien Support IT",
            score: 89,
            description: "Accompagnez les utilisateurs et résolvez leurs problèmes informatiques.",
            reason: "Votre expérience de la relation client est un atout.",
          },
          {
            name: "Formateur Numérique",
            score: 84,
            description: "Transmettez vos connaissances numériques.",
            reason: "Votre communication peut devenir une compétence de formation.",
          },
        ],
      }),
    });
  });
  await page.route("**/api/jobs/*/analysis", async (route) => {
    calls.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        compatibility: 89,
        existingSkills: ["Relation client", "Communication"],
        missingSkills: ["Réseaux", "Active Directory"],
        estimatedDuration: "6 mois",
        roadmap: [
          { month: 1, objectives: ["Bases réseaux", "TCP/IP"] },
          { month: 2, objectives: ["Windows", "Active Directory"] },
        ],
        trainings: [
          {
            title: "Technicien supérieur systèmes et réseaux",
            organization: "AFPA",
            duration: "8 mois",
            level: "Bac +2",
            url: "https://example.com/afpa",
          },
          {
            title: "Support informatique",
            organization: "OpenClassrooms",
            duration: "6 mois",
            level: "Débutant",
            url: "https://example.com/support",
          },
          {
            title: "Administrateur systèmes",
            organization: "CNAM",
            duration: "12 mois",
            level: "Intermédiaire",
          },
        ],
      }),
    });
  });
  return calls;
}

test("parcours complet, sauvegarde, PDF et nouveau projet", async ({
  page,
}) => {
  const apiCalls = await mockBackend(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await signIn(page);
  await expect(
    page.getByRole("heading", { name: /Votre reconversion commence ici/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Commencer mon analyse" }).click();
  await page
    .getByLabel("Métier actuel ou dernier métier exercé")
    .fill("Conseiller Assurance");
  await page.getByLabel("Région recherchée").selectOption("Nouvelle-Aquitaine");
  await page.getByLabel("Niveau d’études").selectOption("Bac +2");
  await page
    .locator("#cv")
    .setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 demo"),
    });
  await expect(page.getByText("cv.pdf", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: "Informatique", exact: true }).click();
  await page
    .getByRole("button", { name: "Relation client", exact: true })
    .click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  const savedAfterPreferenceChange = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/virage_profiles") &&
      response.request().method() === "POST" &&
      response.request().postData()?.includes('"management":true'),
  );
  await page.getByRole("switch", { name: "Management d’équipe" }).click();
  await expect(
    page.getByRole("switch", { name: "Management d’équipe" }),
  ).toBeChecked();
  await savedAfterPreferenceChange;
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Management d’équipe" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Étape précédente" }).click();
  await page.getByRole("button", { name: "Étape précédente" }).click();
  await expect(page.getByText("Enregistré dans votre espace privé")).toBeVisible();
  await page.locator("#cv").setInputFiles({
    name: "cv.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 demo"),
  });
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.getByRole("button", { name: "Découvrir mes métiers" }).click();
  await expect(
    page.getByRole("heading", { name: "Les métiers qui vous correspondent" }),
  ).toBeVisible({ timeout: 20000 });
  await page
    .getByRole("button", { name: "Voir le parcours", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre parcours prend forme" }),
  ).toBeVisible();
  await expect(
    page.getByRole("progressbar", {
      name: "Progression de la génération du parcours",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Analyse du métier et de ses besoins"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Analyse de compatibilité" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Résultats/ }).click();
  const savedRoadmapCache = page.waitForResponse(
    (response) =>
      response.url().includes("/rest/v1/virage_profiles") &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Voir le parcours", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Analyse de compatibilité" }),
  ).toBeVisible();
  await savedRoadmapCache;
  await expect(page.getByText("Progression sauvegardée")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Analyse de compatibilité" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Résultats/ }).click();
  await page
    .getByRole("button", { name: "Voir le parcours", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Analyse de compatibilité" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Construire ma feuille de route" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre feuille de route" }),
  ).toBeVisible();
  await expect(page.getByText("MOIS 1")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Bases réseaux" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Trouver une formation" }).click();
  const courseLinks = page.locator(".course-card-link");
  await expect(courseLinks).toHaveCount(3);
  await expect(courseLinks.first()).toHaveAttribute(
    "href",
    "https://example.com/afpa",
  );
  await expect(courseLinks.first()).toHaveAttribute("target", "_blank");
  await expect(courseLinks.nth(2)).toHaveAttribute(
    "href",
    "https://www.cnam.fr/",
  );
  await expect(page.locator(".course-card-link .btn")).toHaveCount(0);
  await expect(courseLinks.first()).toHaveCSS("display", "flex");
  const providerPagePromise = page.waitForEvent("popup");
  await courseLinks.first().click();
  const providerPage = await providerPagePromise;
  await expect(providerPage).toHaveURL("https://example.com/afpa");
  await providerPage.close();
  expect(apiCalls).toEqual([
    "/api/profile/analyze",
    "/api/jobs/match",
    "/api/jobs/Technicien%20Support%20IT/analysis",
  ]);
  await page
    .getByRole("button", { name: "Voir mon projet professionnel" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Votre projet professionnel" }),
  ).toBeVisible();
  await expect(
    page.getByText("Conseiller Assurance", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Télécharger mon rapport PDF" })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "Virage-mon-projet-professionnel.pdf",
  );
  await page.getByRole("button", { name: "Recommencer une analyse" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Recommencer", exact: true })
    .click();
  await expect(
    page.getByLabel("Métier actuel ou dernier métier exercé"),
  ).toHaveValue("");
  expect(errors).toEqual([]);
});
test("validation du profil et sélection multiple réversible", async ({
  page,
}) => {
  await mockSupabase(page);
  await signIn(page);
  await page.getByRole("button", { name: "Commencer mon analyse" }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Parlons de votre parcours" }),
  ).toBeVisible();
  await page
    .locator("#cv")
    .setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("invalid"),
    });
  await expect(page.getByRole("alert")).toHaveText(
    "Choisissez un fichier PDF ou DOCX.",
  );
  await page.locator("#cv").setInputFiles({
    name: "cv.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 demo"),
  });
  await page
    .getByLabel("Métier actuel ou dernier métier exercé")
    .fill("Conseiller");
  await page.getByLabel("Région recherchée").selectOption("Bretagne");
  await page.getByLabel("Niveau d’études").selectOption("Baccalauréat");
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continuer", exact: true }),
  ).toBeDisabled();
  const interest = page.getByRole("button", {
    name: "Informatique",
    exact: true,
  });
  await interest.click();
  await expect(interest).toHaveAttribute("aria-pressed", "true");
  await interest.click();
  await expect(interest).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Étape précédente" }).click();
  await expect(
    page.getByLabel("Métier actuel ou dernier métier exercé"),
  ).toHaveValue("Conseiller");
});

test("le CV est facultatif pour continuer le parcours", async ({ page }) => {
  await mockSupabase(page);
  await signIn(page);
  await page.getByRole("button", { name: "Commencer mon analyse" }).click();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page
    .getByLabel("Métier actuel ou dernier métier exercé")
    .fill("Conseiller");
  await page.getByLabel("Région recherchée").selectOption("Bretagne");
  await page.getByLabel("Niveau d’études").selectOption("Baccalauréat");

  await expect(
    page.getByRole("button", { name: "Continuer", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Parlez-nous de ce qui vous motive",
    }),
  ).toBeVisible();
});
