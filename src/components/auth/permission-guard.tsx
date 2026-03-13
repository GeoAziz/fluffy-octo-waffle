'use client';

import { useAuth } from '@/components/providers';
import type { UserProfile } from '@/lib/types';
import type { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  allowedRoles: UserProfile['role'][];
  fallback?: ReactNode;
  requireVerified?: boolean;
}

/**
 * PermissionGuard - Centralized authorization controller for role-based visibility.
 * Implements the "Single Source of Truth" architectural pattern for UI permissions.
 */
export function PermissionGuard({
  children,
  allowedRoles,
  fallback = null,
  requireVerified = false,
}: PermissionGuardProps) {
  const { userProfile, loading } = useAuth();

  if (loading) return null;

  if (!userProfile) return fallback;

  const hasRole = allowedRoles.includes(userProfile.role);
  const meetsVerification = !requireVerified || userProfile.verified;

  if (hasRole && meetsVerification) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
