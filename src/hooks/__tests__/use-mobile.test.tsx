import { useIsMobile } from '@/hooks/use-mobile';
import { renderHook } from '@testing-library/react';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('useIsMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when viewport is wider than breakpoint', () => {
    // Set viewport width to 1024px (wider than 768px breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true when viewport is narrower than breakpoint', () => {
    // Set viewport width to 500px (narrower than 768px breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false at exactly breakpoint boundary', () => {
    // Set viewport width to 768px (exactly at breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    mockMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true just below breakpoint', () => {
    // Set viewport width to 767px (just below breakpoint)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });
    mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should listen to media query changes', () => {
    const addEventListenerSpy = jest.fn();
    const removeEventListenerSpy = jest.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '(max-width: 767px)',
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
      })),
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { unmount } = renderHook(() => useIsMobile());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle mobile breakpoint constant correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });
    mockMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });
});
