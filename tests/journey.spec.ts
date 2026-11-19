import { expect, test } from "@playwright/test";
test("parcours complet, sauvegarde, PDF et nouveau projet", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
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
  await page.getByRole("switch", { name: "Management d’équipe" }).click();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Management d’équipe" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Découvrir mes métiers" }).click();
  await expect(
    page.getByRole("heading", { name: "Les métiers qui vous correspondent" }),
  ).toBeVisible({ timeout: 20000 });
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
  await page.getByRole("button", { name: "Trouver une formation" }).click();
  await expect(page.getByRole("link", { name: "Consulter" })).toHaveCount(3);
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
  await page.goto("/");
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
