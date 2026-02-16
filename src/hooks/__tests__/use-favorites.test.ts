import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/components/providers';
import { db } from '@/lib/firebase';
import * as firebaseModule from 'firebase/firestore';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Firebase Firestore
jest.mock('@/lib/firebase');
jest.mock('@/components/providers');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockDb = db as any;

describe('useFavorites', () => {
  let unsubscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();
  });

  it('should initialize with empty favorites when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as any);

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favoriteIds.size).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('should set loading to true initially', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    } as any);

    const { result } = renderHook(() => useFavorites());

    expect(result.current.loading).toBe(true);
  });

  it('should fetch favorites when user is logged in', async () => {
    const mockSnapshotData = {
      forEach: jest.fn((callback) => {
        callback({ id: 'listing-1' });
        callback({ id: 'listing-2' });
      }),
    };

    const mockOnSnapshot = jest.fn((ref, callback, errorCallback) => {
      callback(mockSnapshotData);
      return unsubscribeMock;
    });

    jest.spyOn(firebaseModule, 'onSnapshot').mockImplementation(mockOnSnapshot as any);

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    } as any);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.favoriteIds.size).toBe(2);
    expect(result.current.favoriteIds.has('listing-1')).toBe(true);
    expect(result.current.favoriteIds.has('listing-2')).toBe(true);
  });

  it('should unsubscribe from favorites on unmount', async () => {
    const mockSnapshotData = {
      forEach: jest.fn(),
    };

    const mockOnSnapshot = jest.fn((ref, callback) => {
      callback(mockSnapshotData);
      return unsubscribeMock;
    });

    jest.spyOn(firebaseModule, 'onSnapshot').mockImplementation(mockOnSnapshot as any);

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    } as any);

    const { unmount } = renderHook(() => useFavorites());

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should provide isFavorite function', async () => {
    const mockSnapshotData = {
      forEach: jest.fn((callback) => {
        callback({ id: 'listing-1' });
      }),
    };

    const mockOnSnapshot = jest.fn((ref, callback) => {
      callback(mockSnapshotData);
      return unsubscribeMock;
    });

    jest.spyOn(firebaseModule, 'onSnapshot').mockImplementation(mockOnSnapshot as any);

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    } as any);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorite('listing-1')).toBe(true);
    expect(result.current.isFavorite('listing-2')).toBe(false);
  });

  it('should detect favoriteIds changes', async () => {
    let snapshotCallback: any;

    const mockOnSnapshot = jest.fn((ref, callback) => {
      snapshotCallback = callback;
      callback({ forEach: jest.fn() });
      return unsubscribeMock;
    });

    jest.spyOn(firebaseModule, 'onSnapshot').mockImplementation(mockOnSnapshot as any);

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    } as any);

    const { result } = renderHook(() => useFavorites());

    // Simulate snapshot change
    snapshotCallback({
      forEach: jest.fn((callback) => {
        callback({ id: 'listing-new-1' });
        callback({ id: 'listing-new-2' });
      }),
    });

    await waitFor(() => {
      expect(result.current.favoriteIds.size).toBe(2);
      expect(result.current.favoriteIds.has('listing-new-1')).toBe(true);
    });
  });

  it('should handle Firestore permission errors', async () => {
    const mockError = new Error('Permission denied');

    const mockOnSnapshot = jest.fn((ref, callback, errorCallback) => {
      // Call error callback
      errorCallback?.(mockError);
      return unsubscribeMock;
    });

    jest.spyOn(firebaseModule, 'onSnapshot').mockImplementation(mockOnSnapshot as any);

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    } as any);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.favoriteIds.size).toBe(0);
  });

  it('should return favoriteIds as a Set', async () => {
    const mockSnapshotData = {
      forEach: jest.fn((callback) => {
        callback({ id: 'listing-1' });
      }),
    };

    const mockOnSnapshot = jest.fn((ref, callback) => {
      callback(mockSnapshotData);
      return unsubscribeMock;
    });

    jest.spyOn(firebaseModule, 'onSnapshot').mockImplementation(mockOnSnapshot as any);

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123' },
      loading: false,
    } as any);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.favoriteIds).toBeInstanceOf(Set);
  });
});
