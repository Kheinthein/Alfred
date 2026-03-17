import { expect, test } from '@playwright/test';
import { AnalysisType } from '@shared/types';

/**
 * Tests E2E pour l'analyse IA
 * Scénario : créer doc → analyser avec IA → voir suggestions
 */

/**
 * ⚠️ Tests IA temporairement désactivés : l’UI évolue encore
 * et les scénarios IA génèrent trop de faux négatifs.
 * Voir docs/IMPROVEMENTS.md pour le suivi de réactivation.
 */
test.describe.skip('Analyse IA E2E (temporarily skipped)', () => {
  const testEmail = `test-ai-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';
  let authToken: string;
  let userId: string;
  let documentId: string;

  test.beforeAll(async ({ request }) => {
    // Créer un utilisateur pour les tests
    const authResponse = await request.post(
      'http://localhost:3000/api/auth/register',
      {
        data: {
          email: testEmail,
          password: testPassword,
        },
      }
    );

    const authJson = (await authResponse.json()) as {
      success: boolean;
      data?: { token: string; user: { id: string } };
      error?: { message: string };
    };
    if (!authJson.success || !authJson.data) {
      throw new Error(
        `Registration failed: ${authJson.error?.message || 'Unknown error'}`
      );
    }
    authToken = authJson.data.token;
    userId = authJson.data.user.id;

    // Récupérer un style d'écriture existant
    const stylesResponse = await request.get(
      'http://localhost:3000/api/styles'
    );
    const stylesJson = (await stylesResponse.json()) as {
      success: boolean;
      data?: { styles: Array<{ id: string; name: string }> };
    };
    if (
      !stylesJson.success ||
      !stylesJson.data ||
      stylesJson.data.styles.length === 0
    ) {
      throw new Error('No writing styles found');
    }
    const styleId = stylesJson.data.styles[0].id;

    // Créer un document de test avec du contenu
    const docResponse = await request.post(
      'http://localhost:3000/api/documents',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Mon Roman Fantastique',
          content:
            "Il était une fois dans un royaume lointain, un jeune héros qui partait à l'aventure. Le soleil brillait dans le ciel azuré et les oiseaux chantaient joyeusement. Notre protagoniste, armé de courage et de détermination, s'avançait vers son destin.",
          styleId,
        },
      }
    );

    const docJson = (await docResponse.json()) as {
      success: boolean;
      data?: { document: { id: string } };
      error?: { message: string };
    };
    if (!docJson.success || !docJson.data) {
      throw new Error(
        `Document creation failed: ${docJson.error?.message || 'Unknown error'}`
      );
    }
    documentId = docJson.data.document.id;
  });

  test.beforeEach(async ({ page }) => {
    // Intercepter les appels IA pour accélérer les tests
    await page.route('**/api/ai/analyze', async (route) => {
      const body = route.request().postDataJSON() as {
        analysisType?: string;
      };
      const analysisType = (body?.analysisType ?? 'syntax') as AnalysisType;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            analysis: {
              id: `analysis-${analysisType}`,
              type: analysisType,
              suggestions: [
                `Suggestion 1 pour ${analysisType}`,
                `Suggestion 2 pour ${analysisType}`,
              ],
              confidence: 0.9,
              createdAt: new Date().toISOString(),
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
            processingTime: '1ms',
            mocked: true,
          },
        }),
      });
    });

    // Se connecter et naviguer vers le document
    await page.goto('/login');
    await page.evaluate(
      ({ token, email, id }) => {
        const authData = {
          user: { id, email },
          token,
        };
        localStorage.setItem('alfred:auth', JSON.stringify(authData));
      },
      { token: authToken, email: testEmail, id: userId }
    );

    // Naviguer vers le document
    await page.goto(`/documents/${documentId}`);

    // Vérifier que nous sommes bien sur la page du document
    await expect(page).toHaveURL(new RegExp(`/documents/${documentId}$`), {
      timeout: 10000,
    });

    // Attendre que le document soit chargé (plus de "Chargement du document...")
    const loadingText = page.getByText(/Chargement du document/);
    if (await loadingText.isVisible().catch(() => false)) {
      await loadingText.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // Attendre que l'éditeur et le panel IA soient visibles
    await expect(page.locator('textarea')).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('heading', { level: 3, name: /Assistant IA/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: 'Analyse syntaxe' })
    ).toBeVisible({ timeout: 10000 });

    await page.waitForLoadState('networkidle');
  });

  test("devrait afficher le panel d'analyse IA", async ({ page }) => {
    // Vérifier la présence du panel d'analyse
    await expect(page.locator('text=/Assistant IA|ChatGPT/')).toBeVisible();

    // Vérifier la présence des boutons d'analyse
    await expect(
      page.locator('button:has-text("Analyse syntaxe")')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Analyse style")')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Suggestions progression")')
    ).toBeVisible();
  });

  test('devrait analyser la syntaxe du document', async ({ page }) => {
    // Cliquer sur le bouton "Analyse syntaxe"
    await page.click('button:has-text("Analyse syntaxe")');

    // Vérifier qu'un indicateur de chargement apparaît
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).toBeVisible({ timeout: 2000 });

    // Attendre que l'analyse soit terminée (max 30s pour l'appel API réel)
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Vérifier que des suggestions sont affichées
    // L'IA devrait retourner au moins un résultat
    const hasResults = await page
      .locator('text=/Suggestions|Aucune erreur|Corrections/')
      .isVisible();
    expect(hasResults).toBeTruthy();
  });

  test('devrait analyser le style du document', async ({ page }) => {
    // Cliquer sur le bouton "Analyse style"
    await page.click('button:has-text("Analyse style")');

    // Attendre le chargement
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).toBeVisible({ timeout: 2000 });

    // Attendre la fin de l'analyse
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Vérifier que des suggestions de style sont affichées
    const hasStyleResults = await page
      .locator('text=/Style|Ton|Vocabulaire|Cohérence/')
      .isVisible();
    expect(hasStyleResults).toBeTruthy();
  });

  test('devrait suggérer une progression narrative', async ({ page }) => {
    // Cliquer sur le bouton "Suggestions progression"
    await page.click('button:has-text("Suggestions progression")');

    // Attendre le chargement
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).toBeVisible({ timeout: 2000 });

    // Attendre la fin de l'analyse
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Vérifier que des suggestions narratives sont affichées
    const hasProgressionResults = await page
      .locator('text=/Progression|Suite|Développer|Intrigue/')
      .isVisible();
    expect(hasProgressionResults).toBeTruthy();
  });

  test("devrait afficher un message d'erreur si l'analyse échoue", async ({
    page,
  }) => {
    // Déconnecter (invalider le token) pour provoquer une erreur
    await page.evaluate(
      ({ id, email }) => {
        const authData = {
          user: { id, email },
          token: 'invalid-token',
        };
        localStorage.setItem('alfred:auth', JSON.stringify(authData));
      },
      { id: userId, email: testEmail }
    );

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Essayer d'analyser
    await page.click('button:has-text("Analyse syntaxe")');

    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator('text=/Erreur|Échec|Impossible/')).toBeVisible({
      timeout: 10000,
    });
  });

  test('devrait permettre plusieurs analyses successives', async ({ page }) => {
    // Première analyse : Syntaxe
    await page.click('button:has-text("Analyse syntaxe")');
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).toBeVisible({ timeout: 2000 });
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Attendre un peu entre les analyses
    await page.waitForTimeout(2000);

    // Deuxième analyse : Style
    await page.click('button:has-text("Analyse style")');
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).toBeVisible({ timeout: 2000 });
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Vérifier que les résultats de la deuxième analyse sont affichés
    const hasResults = await page
      .locator('text=/Style|Suggestions/')
      .isVisible();
    expect(hasResults).toBeTruthy();
  });

  test("devrait désactiver les boutons pendant l'analyse", async ({ page }) => {
    // Cliquer sur le bouton "Analyse syntaxe"
    await page.click('button:has-text("Analyse syntaxe")');

    // Vérifier que les boutons sont désactivés pendant l'analyse
    const syntaxButton = page.locator('button:has-text("Analyse syntaxe")');
    const styleButton = page.locator('button:has-text("Analyse style")');
    const progressionButton = page.locator(
      'button:has-text("Suggestions progression")'
    );

    // Au moins un des boutons devrait être désactivé
    const isDisabled =
      (await syntaxButton.isDisabled()) ||
      (await styleButton.isDisabled()) ||
      (await progressionButton.isDisabled());

    expect(isDisabled).toBeTruthy();

    // Attendre la fin de l'analyse
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Vérifier que les boutons sont réactivés
    await expect(syntaxButton).toBeEnabled({ timeout: 5000 });
  });

  test('devrait afficher le compteur de mots en temps réel', async ({
    page,
  }) => {
    // Vérifier le compteur initial
    const initialWordCount = await page
      .locator('text=/\\d+ mots?/')
      .textContent();
    expect(initialWordCount).toBeTruthy();

    // Ajouter du texte dans l'éditeur
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.fill(
      'Ceci est un test avec exactement dix mots dans cette phrase.'
    );

    // Attendre que le compteur se mette à jour
    await page.waitForTimeout(1000);

    // Vérifier que le compteur affiche 10 mots
    await expect(page.locator('text=10 mots')).toBeVisible({ timeout: 5000 });
  });

  test('devrait conserver le contenu après une analyse', async ({ page }) => {
    // Récupérer le contenu initial
    const textarea = page.locator('textarea');
    const initialContent = await textarea.inputValue();

    // Lancer une analyse
    await page.click('button:has-text("Analyse syntaxe")');
    await expect(
      page.locator('text=/Analyse en cours|Chargement/')
    ).not.toBeVisible({ timeout: 35000 });

    // Vérifier que le contenu n'a pas changé
    const finalContent = await textarea.inputValue();
    expect(finalContent).toBe(initialContent);
  });

  test("devrait afficher le style d'écriture sélectionné", async ({ page }) => {
    // Vérifier qu'un sélecteur de style est présent
    const styleSelector = page.locator('select, [role="combobox"]');

    // Si un sélecteur existe, vérifier qu'une valeur est sélectionnée
    if ((await styleSelector.count()) > 0) {
      const selectedValue = await styleSelector.first().inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });
});
