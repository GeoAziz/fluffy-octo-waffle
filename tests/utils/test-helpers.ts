import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

export * from '@testing-library/react';

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:9002';

/**
 * Custom render that can be extended with context providers as needed.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}

/**
 * Creates a mock NextRequest-like object for middleware tests.
 */
export function createMockRequest(
  pathname: string,
  cookies: Record<string, string> = {}
) {
  const url = new URL(pathname, BASE_URL);
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        return value !== undefined ? { value } : undefined;
      },
    },
  } as any;
}

/**
 * Waits for a condition to become true within a timeout.
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Condition not met within timeout');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
