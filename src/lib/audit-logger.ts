/**
 * Audit Logging System - Tracks all authorization checks and sensitive actions
 * Used for compliance, security monitoring, and analytics
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AuditAction =
  | 'AUTH_CHECK_SUCCESS'
  | 'AUTH_CHECK_FAILED'
  | 'PERMISSION_DENIED'
  | 'ROLE_SWITCH'
  | 'MODERATION_ESCALATION'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'BADGE_ASSIGNED'
  | 'SETTINGS_UPDATED'
  | 'USER_CREATED'
  | 'EVIDENCE_UPLOADED'
  | 'CONVERSATION_STARTED'
  | 'ADMIN_ACTION'
  | 'SELLER_ACTION'
  | 'BUYER_ACTION';

export type AuditLevel = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  action: AuditAction;
  level: AuditLevel;
  userId: string;
  userRole: string;
  resource?: string; // e.g., listing ID, user ID
  resourceType?: 'listing' | 'user' | 'settings' | 'evidence' | 'conversation';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: unknown; // Firestore server timestamp
  success: boolean;
}

const asResourceType = (value?: string): AuditLogEntry['resourceType'] | undefined => {
  if (!value) return undefined;
  if (value === 'listing' || value === 'user' || value === 'settings' || value === 'evidence' || value === 'conversation') {
    return value;
  }
  return undefined;
};

/**
 * Log an authorization or action event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    // Silent fail to not interrupt application flow
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Log a successful authorization check
 */
export async function logAuthSuccess(
  userId: string,
  userRole: string,
  resourceType: string,
  resourceId?: string
) {
  await logAuditEvent({
    action: 'AUTH_CHECK_SUCCESS',
    level: 'info',
    userId,
    userRole,
    resourceType: asResourceType(resourceType),
    resource: resourceId,
    success: true,
  });
}

/**
 * Log a failed authorization check
 */
export async function logAuthFailure(
  userId: string | null,
  userRole: string | null,
  reason: string,
  resourceType?: string,
  resourceId?: string
) {
  await logAuditEvent({
    action: 'AUTH_CHECK_FAILED',
    level: 'warning',
    userId: userId || 'ANONYMOUS',
    userRole: userRole || 'UNAUTHENTICATED',
    resourceType: asResourceType(resourceType),
    resource: resourceId,
    details: { reason },
    success: false,
  });
}

/**
 * Log permission denied event
 */
export async function logPermissionDenied(
  userId: string,
  userRole: string,
  requiredRole: string[],
  resourceType?: string,
  resourceId?: string
) {
  await logAuditEvent({
    action: 'PERMISSION_DENIED',
    level: 'critical',
    userId,
    userRole,
    resourceType: asResourceType(resourceType),
    resource: resourceId,
    details: { requiredRole },
    success: false,
  });
}

/**
 * Log role switch
 */
export async function logRoleSwitch(
  userId: string,
  fromRole: string,
  toRole: string
) {
  await logAuditEvent({
    action: 'ROLE_SWITCH',
    level: 'info',
    userId,
    userRole: toRole,
    details: { fromRole, toRole },
    success: true,
  });
}

/**
 * Log listing status change
 */
export async function logListingStatusChange(
  adminId: string,
  listingId: string,
  fromStatus: string,
  toStatus: string,
  reason?: string
) {
  await logAuditEvent({
    action: toStatus === 'approved' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
    level: 'critical',
    userId: adminId,
    userRole: 'ADMIN',
    resourceType: 'listing',
    resource: listingId,
    details: { fromStatus, toStatus, reason },
    success: true,
  });
}

/**
 * Log badge assignment
 */
export async function logBadgeAssignment(
  adminId: string,
  listingId: string,
  badge: string,
  reason?: string
) {
  await logAuditEvent({
    action: 'BADGE_ASSIGNED',
    level: 'critical',
    userId: adminId,
    userRole: 'ADMIN',
    resourceType: 'listing',
    resource: listingId,
    details: { badge, reason },
    success: true,
  });
}

/**
 * Log settings change
 */
export async function logSettingsUpdate(
  adminId: string,
  changes: Record<string, unknown>
) {
  await logAuditEvent({
    action: 'SETTINGS_UPDATED',
    level: 'critical',
    userId: adminId,
    userRole: 'ADMIN',
    resourceType: 'settings',
    details: changes,
    success: true,
  });
}

/**
 * Log user creation
 */
export async function logUserCreation(
  userId: string,
  role: string
) {
  await logAuditEvent({
    action: 'USER_CREATED',
    level: 'info',
    userId,
    userRole: role,
    resourceType: 'user',
    resource: userId,
    success: true,
  });
}

/**
 * Log evidence upload
 */
export async function logEvidenceUpload(
  userId: string,
  userRole: string,
  listingId: string,
  evidenceType: string
) {
  await logAuditEvent({
    action: 'EVIDENCE_UPLOADED',
    level: 'info',
    userId,
    userRole,
    resourceType: 'evidence',
    resource: listingId,
    details: { evidenceType },
    success: true,
  });
}

/**
 * Log conversation start
 */
export async function logConversationStart(
  userId: string,
  userRole: string,
  otherUserId: string,
  listingId: string
) {
  await logAuditEvent({
    action: 'CONVERSATION_STARTED',
    level: 'info',
    userId,
    userRole,
    resourceType: 'conversation',
    resource: listingId,
    details: { otherUserId },
    success: true,
  });
}

/**
 * Query audit logs with filtering
 */
export async function getAuditLogs(
  _userId?: string,
  _action?: AuditAction,
  _resourceType?: string,
  _limit: number = 100
) {
  try {
    void _userId;
    void _action;
    void _resourceType;
    void _limit;
    // In a real app, you'd use Firestore queries with where clauses
    // This is a placeholder for the implementation
    const query = collection(db, 'auditLogs');
    return query;
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    return null;
  }
}

/**
 * Analytics: Get authorization failure rate
 */
export async function getAuthFailureRate(
  _hoursBack: number = 24
): Promise<number | null> {
  try {
    void _hoursBack;
    // Query for auth failures in the last N hours
    // This would require Firestore queries - placeholder
    return null;
  } catch (error) {
    console.error('Failed to get auth failure rate:', error);
    return null;
  }
}

/**
 * Analytics: Get most accessed resources
 */
export async function getMostAccessedResources(
  _hoursBack: number = 24,
  _limit: number = 10
) {
  try {
    void _hoursBack;
    void _limit;
    // Query for most accessed resources
    // This would require Firestore aggregation queries - placeholder
    return [];
  } catch (error) {
    console.error('Failed to get most accessed resources:', error);
    return [];
  }
}
