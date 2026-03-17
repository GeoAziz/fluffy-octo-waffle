import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  auth: { name: 'mock-auth' },
  db: { name: 'mock-db' },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'mock-doc-ref'),
  getDoc: vi.fn(),
}));

import { useAuth } from '@/hooks/use-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

describe('useAuth hook', () => {
  let capturedCallback: ((user: any) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;

    vi.mocked(onAuthStateChanged).mockImplementation((_auth: any, callback: any) => {
      capturedCallback = callback;
      return vi.fn(); // unsubscribe function
    });
  });

  it('should start with loading state and no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.userProfile).toBeNull();
  });

  it('should set isLoading to false and user to null after logout', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      capturedCallback!(null);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.userProfile).toBeNull();
  });

  it('should fetch and set userProfile when user logs in', async () => {
    const mockUser = { uid: 'user-123', email: 'test@example.com' };
    const mockProfile = { uid: 'user-123', role: 'BUYER', displayName: 'Test User' };

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => mockProfile,
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      capturedCallback!(mockUser);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.userProfile).toEqual(mockProfile);
  });

  it('should handle Firestore errors gracefully when fetching profile', async () => {
    const mockUser = { uid: 'user-123', email: 'test@example.com' };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(getDoc).mockRejectedValue(new Error('Firestore permission denied'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      capturedCallback!(mockUser);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userProfile).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
