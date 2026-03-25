import type { Page } from '@playwright/test';

export const TEST_USERS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@kenyalandtrust.co.ke',
    password: process.env.E2E_ADMIN_PASSWORD || 'Password123!',
  },
  seller: {
    email: process.env.E2E_SELLER_EMAIL || 'sales@metroestates.co.ke',
    password: process.env.E2E_SELLER_PASSWORD || 'Password123!',
  },
  buyer: {
    email: process.env.E2E_BUYER_EMAIL || 'kamau.tech@gmail.com',
    password: process.env.E2E_BUYER_PASSWORD || 'Password123!',
  },
};

async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  const emailInput = page.getByLabel(/network email|email/i).first();
  const passwordInput = page.getByLabel(/access token|password/i).first();

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page
    .getByRole('button', { name: /transmit identity|sign in|log in|continue/i })
    .first()
    .click();

  await page.waitForFunction(() => !window.location.pathname.startsWith('/login'), undefined, {
    timeout: 30_000,
  });
}

export async function loginWithFirebaseSession(page: Page, email: string, password: string) {
  try {
    await loginViaUi(page, email, password);
    return;
  } catch {
    const signInResponse = await page.request.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDETO0ohxe5Hmu5XBoWwZrnGbLNQ5fYdTk',
      {
        data: {
          email,
          password,
          returnSecureToken: true,
        },
      }
    );

    if (!signInResponse.ok()) {
      throw new Error(`Firebase sign-in failed with status ${signInResponse.status()}`);
    }

    const signInData = await signInResponse.json();
    const idToken = signInData?.idToken;

    if (!idToken) {
      throw new Error('Missing idToken in Firebase sign-in response.');
    }

    const sessionResponse = await page.request.post('/api/auth/session', {
      data: { idToken },
    });

    if (!sessionResponse.ok()) {
      throw new Error(`Session creation failed with status ${sessionResponse.status()}`);
    }
  }
}
