import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour le flow d'authentification
 * Scénario : inscription → login → accès dashboard
 */

test.describe('Authentification E2E', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  test.beforeEach(async ({ page }) => {
    // Nettoyer les cookies/localStorage avant chaque test
    await page.context().clearCookies();
    await page.goto('/');
  });

  test("devrait permettre l'inscription d'un nouvel utilisateur", async ({
    page,
  }) => {
    // Naviguer vers la page d'inscription
    await page.goto('/register');

    // Vérifier que la page de register est chargée
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Créer un compte');

    // Remplir le formulaire d'inscription
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Attendre que le bouton ne soit plus en chargement
    await page
      .waitForSelector('button[type="submit"]:not([disabled])', {
        timeout: 5000,
      })
      .catch(() => {});

    // Vérifier la redirection vers le dashboard après inscription
    await expect(page).toHaveURL('/documents', { timeout: 10000 });

    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');

    // Vérifier que l'email de l'utilisateur est affiché dans le header
    await expect(page.locator(`text=${testEmail}`)).toBeVisible({
      timeout: 5000,
    });
  });

  test("devrait permettre la connexion d'un utilisateur existant", async ({
    page,
  }) => {
    // D'abord, créer un utilisateur via l'API
    await page.request.post('http://localhost:3000/api/auth/register', {
      data: {
        email: testEmail,
        password: testPassword,
      },
    });

    // Naviguer vers la page de login
    await page.goto('/login');

    // Vérifier que la page de login est chargée
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Se connecter');

    // Remplir le formulaire de connexion
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Attendre que le bouton ne soit plus en chargement
    await page
      .waitForSelector('button[type="submit"]:not([disabled])', {
        timeout: 5000,
      })
      .catch(() => {});

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/documents', { timeout: 10000 });

    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');

    // Vérifier que l'utilisateur est connecté (email dans le header)
    await expect(page.locator(`text=${testEmail}`)).toBeVisible({
      timeout: 5000,
    });
  });

  test('devrait rejeter les identifiants invalides', async ({ page }) => {
    // Naviguer vers la page de login
    await page.goto('/login');

    // Essayer de se connecter avec des identifiants invalides
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Vérifier qu'un message d'erreur est affiché
    // On cible le texte réel plutôt qu'une classe CSS (plus robuste aux changements de style)
    await expect(page.getByText('401', { exact: false })).toBeVisible({
      timeout: 5000,
    });

    // Vérifier qu'on reste sur la page de login
    await expect(page).toHaveURL('/login');
  });

  test("devrait valider le format de l'email", async ({ page }) => {
    await page.goto('/register');

    // Essayer avec un email invalide
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', testPassword);

    // Le navigateur devrait empêcher la soumission (validation HTML5)
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    expect(validationMessage).toBeTruthy();
  });

  test('devrait protéger les routes privées', async ({ page }) => {
    // Essayer d'accéder au dashboard sans être connecté
    await page.goto('/documents');

    // Devrait être redirigé vers login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });

  test('devrait permettre la déconnexion', async ({ page }) => {
    // Créer et connecter un utilisateur avec un email unique
    const uniqueEmail = `test-logout-${Date.now()}@example.com`;
    const response = await page.request.post(
      'http://localhost:3000/api/auth/register',
      {
        data: {
          email: uniqueEmail,
          password: testPassword,
        },
      }
    );

    const json = (await response.json()) as {
      success: boolean;
      data?: { token: string; user: { id: string } };
      error?: { message: string };
    };
    if (!json.success || !json.data) {
      throw new Error(
        `Registration failed: ${json.error?.message || 'Unknown error'}`
      );
    }
    const token = json.data.token;
    const userId = json.data.user.id;

    // Définir le token dans le localStorage avec la structure attendue
    await page.goto('/documents');
    await page.evaluate(
      ({ token, email, id }) => {
        const authData = {
          user: { id, email },
          token,
        };
        localStorage.setItem('alfred:auth', JSON.stringify(authData));
      },
      { token, email: uniqueEmail, id: userId }
    );

    // Recharger pour appliquer le token
    await page.reload();
    await expect(page).toHaveURL('/documents', { timeout: 10000 });

    // Cliquer sur le bouton de déconnexion
    await page.click('button:has-text("Déconnexion")');

    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    // Vérifier que le token est supprimé
    const authAfterLogout = await page.evaluate(() =>
      localStorage.getItem('alfred:auth')
    );
    expect(authAfterLogout).toBeNull();
  });
});
