'use client';

import { useAuth } from '@/components/providers';
import type { UserProfile } from '@/lib/types';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  allowedRoles: UserProfile['role'][];
  fallback?: ReactNode;
  requireVerified?: boolean;
  resourceName?: string;
}

/**
 * PermissionGuard - Centralized authorization controller for role-based visibility.
 * Implements the "Single Source of Truth" architectural pattern for UI permissions.
 * 
 * Features:
 * - Role-based access control
 * - Verification requirement checks
 * - Audit logging of permission checks
 * - Fallback UI for denied access
 */
export function PermissionGuard({
  children,
  allowedRoles,
  fallback = null,
  requireVerified = false,
  resourceName = 'component',
}: PermissionGuardProps) {
  const { userProfile, loading } = useAuth();

  // Log permission checks to audit trail
  useEffect(() => {
    if (!loading && userProfile) {
      const hasRole = allowedRoles.includes(userProfile.role);
      const meetsVerification = !requireVerified || userProfile.verified;
      const accessGranted = hasRole && meetsVerification;

      // Attempt to log the permission check
      // This is done asynchronously to avoid blocking render
      if (!accessGranted) {
        try {
          // Import dynamically to avoid circular dependencies
          import('@/lib/auth-audit-logger').then(({ getAuthAuditLogger }) => {
            const logger = getAuthAuditLogger();
            logger.logAccessDenied(
              userProfile.uid || '',
              userProfile.role,
              resourceName,
              allowedRoles,
              {
                requireVerified,
                verificationStatus: userProfile.verified,
              }
            ).catch(err => console.error('Audit log failed:', err));
          });
        } catch (error) {
          console.error('Failed to import audit logger:', error);
        }
      }
    }
  }, [loading, userProfile, allowedRoles, requireVerified, resourceName]);

  if (loading) return null;

  if (!userProfile) return fallback;

  const hasRole = allowedRoles.includes(userProfile.role);
  const meetsVerification = !requireVerified || userProfile.verified;

  if (hasRole && meetsVerification) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
