import { vi } from 'vitest';

/** Firebase Emulator ports for local testing */
export const EMULATOR_CONFIG = {
  firestore: { host: 'localhost', port: 8080 },
  auth: { host: 'localhost', port: 9099 },
  ui: { host: 'localhost', port: 4000 },
};

/** Mock Firebase Auth object for unit tests */
export const mockFirebaseAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
};

/** Mock Firestore document snapshot for unit tests */
export function makeMockDocSnapshot(data: Record<string, unknown> | null) {
  return {
    exists: () => data !== null,
    data: () => data,
    id: data ? (data['uid'] as string) ?? 'mock-id' : '',
  };
}

/** Mock Firestore collection query snapshot for unit tests */
export function makeMockQuerySnapshot(docs: Record<string, unknown>[]) {
  return {
    docs: docs.map((data) => ({
      id: (data['id'] as string) ?? 'mock-id',
      data: () => data,
      exists: () => true,
    })),
    size: docs.length,
    empty: docs.length === 0,
  };
}
