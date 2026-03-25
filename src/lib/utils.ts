import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

type FirestoreToDateLike = {
  toDate: () => Date;
};

type FirestoreSecondsLike = {
  _seconds: number;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts unknown timestamp values (Firestore Timestamp or Date) to Date.
 * Used to handle type mismatches when Firestore returns unknown timestamp types.
 */
export function toDateSafe(timestamp: unknown): Date | null {
  if (!timestamp) return null;
  
  // If it's already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof (timestamp as FirestoreToDateLike).toDate === 'function'
  ) {
    try {
      return (timestamp as FirestoreToDateLike).toDate();
    } catch (e) {
      console.error('Failed to convert Firestore timestamp:', e);
      return null;
    }
  }

  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    '_seconds' in timestamp &&
    typeof (timestamp as FirestoreSecondsLike)._seconds === 'number'
  ) {
    return new Date((timestamp as FirestoreSecondsLike)._seconds * 1000);
  }
  
  // If it's a number (milliseconds since epoch)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If it's a string ISO date
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * Validates a redirect path to prevent open redirect vulnerabilities.
 * Ensures the path is internal and respects the user's role access levels.
 */
export function validateRedirect(path: string | null, role: string): string | null {
  if (!path) return null;
  
  // Basic sanity check: must be a string starting with / but not //
  // This prevents absolute URLs like "https://malicious.com"
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
    return null;
  }

  // Admin isolation: Only admins can redirect to /admin paths
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return null;
  }

  // Seller isolation: Only sellers/admins can redirect to /dashboard paths
  if (path.startsWith('/dashboard') && role !== 'SELLER' && role !== 'ADMIN') {
    return null;
  }

  // Buyer isolation: Only buyers can redirect to /buyer paths
  if (path.startsWith('/buyer') && role !== 'BUYER') {
    return null;
  }

  return path;
}
