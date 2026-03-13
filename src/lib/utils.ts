import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
