import { test, expect } from '@playwright/test';
import { loginWithFirebaseSession, TEST_USERS } from './helpers/auth';

const hasRealAuthEnvironment = process.env.E2E_REAL_AUTH === 'true';

function uniqueListingTitle() {
  return `E2E Post Launch ${Date.now()}`;
}

async function loginOrSkipForAuthMismatch(page: Parameters<typeof loginWithFirebaseSession>[0], email: string, password: string) {
  try {
    await loginWithFirebaseSession(page, email, password);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isSessionNegotiationFailure =
      message.includes('Session creation failed with status 401') ||
      message.includes('Security session negotiation failed');

    test.skip(
      isSessionNegotiationFailure,
      'E2E_REAL_AUTH is enabled, but server session cookie negotiation failed (401). Ensure Firebase Web config and Admin service account target the same project.'
    );

    throw error;
  }
}

test.describe('Post-launch authenticated E2E flow', () => {
  test.skip(!hasRealAuthEnvironment, 'Set E2E_REAL_AUTH=true with aligned Firebase project credentials to run this flow.');

  test('seller creates listing + evidence, admin approves, buyer starts messaging', async ({ browser }) => {
    const title = uniqueListingTitle();
    let listingId = '';

    const sellerContext = await browser.newContext();
    const sellerPage = await sellerContext.newPage();

    await loginOrSkipForAuthMismatch(sellerPage, TEST_USERS.seller.email, TEST_USERS.seller.password);
    await sellerPage.goto('/listings/new');

    await sellerPage.getByLabel(/registry title/i).fill(title);
    await sellerPage.getByLabel(/neighborhood node/i).fill('Kitengela Junction');
    await sellerPage.getByLabel(/county signal/i).fill('Kajiado');
    await sellerPage.getByRole('button', { name: /continue/i }).click();

    await sellerPage.getByLabel(/area metric/i).fill('1.5');
    await sellerPage.getByLabel(/asking value/i).fill('2500000');
    await sellerPage.getByLabel(/physical dimensions/i).fill('50x100 ft');
    await sellerPage.getByLabel(/registry category/i).fill('Residential');
    await sellerPage.getByLabel(/listing narrative/i).fill('Well-positioned residential parcel with road access and clean title documentation for trust review.');
    await sellerPage.getByRole('button', { name: /continue/i }).click();

    await sellerPage.getByRole('button', { name: /continue/i }).click();

    const imageInput = sellerPage.locator('input[name="images"]');
    await imageInput.setInputFiles([
      {
        name: 'property.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x00]),
      },
    ]);

    const evidenceInput = sellerPage.locator('input[name="evidence"]');
    await evidenceInput.setInputFiles([
      {
        name: 'title-deed.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf-8'),
      },
    ]);

    await sellerPage.getByRole('button', { name: /transmit to vault/i }).click();
    await sellerPage.waitForURL(/\/listings\//, { timeout: 60_000 });

    const listingUrl = sellerPage.url();
    const listingMatch = listingUrl.match(/\/listings\/([^/?#]+)/);
    expect(listingMatch).not.toBeNull();
    listingId = listingMatch?.[1] || '';
    await sellerContext.close();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await loginOrSkipForAuthMismatch(adminPage, TEST_USERS.admin.email, TEST_USERS.admin.password);
    const approveResponse = await adminPage.request.post('/api/admin/bulk-update', {
      data: {
        listingIds: [listingId],
        status: 'approved',
        adminNote: 'Approved in post-launch E2E: evidence reviewed and acceptable.',
      },
    });
    expect(approveResponse.ok()).toBeTruthy();

    await adminContext.close();

    const buyerContext = await browser.newContext();
    const buyerPage = await buyerContext.newPage();

    await loginOrSkipForAuthMismatch(buyerPage, TEST_USERS.buyer.email, TEST_USERS.buyer.password);
    await buyerPage.goto(`/listings/${listingId}`);

    await buyerPage.getByRole('button', { name: /contact seller/i }).click();
    await buyerPage.waitForURL(/\/buyer\/messages\//, { timeout: 30_000 });

    await buyerPage.locator('input[placeholder*="message pulse"]').fill('Hello, I am interested in this approved listing. Is site visit possible this week?');
    await buyerPage.locator('form button[type="submit"]').click();
    await expect(buyerPage.getByText(/site visit possible this week/i)).toBeVisible({ timeout: 10_000 });

    await buyerContext.close();
  });
});
