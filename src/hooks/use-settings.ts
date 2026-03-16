'use client';

import { useState, useEffect, useRef } from 'react';
import type { PlatformSettings } from '@/lib/types';

// Global cache shared across all hook instances
let settingsCache: PlatformSettings | null = null;
let settingsCacheTime: number = 0;
let fetchPromise: Promise<PlatformSettings | null> | null = null;
let lastError: Error | null = null;
const subscribers = new Set<(data: PlatformSettings | null) => void>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * useSettings - Global settings hook with request deduplication
 * 
 * Implements singleton pattern to prevent duplicate API calls:
 * - First component that mounts initiates the fetch
 * - Concurrent calls (before response) share the same promise
 * - All components share the cached result
 * - Cache auto-invalidates after 5 minutes
 * - No re-fetches on unmount/remount if cache is valid
 * 
 * This eliminates the issue of multiple BuyerFooter renders
 * triggering multiple GET /api/admin/settings calls.
 */
export function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(settingsCache);
  const [isLoading, setIsLoading] = useState(!settingsCache && !lastError && !fetchPromise);
  const [error, setError] = useState<Error | null>(lastError);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // If we have valid cache, use it immediately (no network call)
    if (settingsCache && Date.now() - settingsCacheTime < CACHE_TTL_MS) {
      setSettings(settingsCache);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If we have a recent error, use it immediately
    if (lastError && Date.now() - settingsCacheTime < CACHE_TTL_MS) {
      setError(lastError);
      setIsLoading(false);
      return;
    }

    // Define callback to handle fetch completion
    const handleResults = (data: PlatformSettings | null, err: Error | null) => {
      if (!isMountedRef.current) return;
      setSettings(data);
      setError(err);
      setIsLoading(false);
    };

    // If we're already fetching, wait for it
    if (fetchPromise) {
      setIsLoading(true);
      fetchPromise
        .then(data => handleResults(data, null))
        .catch(err => handleResults(null, err));
      return;
    }

    // Initiate new fetch
    setIsLoading(true);
    fetchSettings()
      .then(data => handleResults(data, null))
      .catch(err => handleResults(null, err));

    return () => {
      isMountedRef.current = false;
    };
  }, []); // Empty deps - only runs on mount

  return { settings, isLoading, error };
}

/**
 * Fetch settings with automatic deduplication
 * Multiple calls before response completes share the same promise
 */
async function fetchSettings(): Promise<PlatformSettings | null> {
  // If already fetching, return existing promise (request deduplication)
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store', // Don't use browser cache, we handle it
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }

      const { data } = await response.json();

      // Update global cache
      settingsCache = data;
      settingsCacheTime = Date.now();
      lastError = null;

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      lastError = error;
      settingsCache = null;
      throw error;
    } finally {
      // ⚠️ CRITICAL: Clear promise after resolution so future calls can fetch fresh data
      // This prevents stale cache when served from server-side renders
      // but still deduplicates mid-flight requests
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Invalidate cache manually (call after settings are updated by admin)
 */
export function invalidateSettingsCache() {
  settingsCache = null;
  settingsCacheTime = 0;
}
