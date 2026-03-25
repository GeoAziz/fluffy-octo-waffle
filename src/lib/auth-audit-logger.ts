import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail?: string;
  userRole: UserProfile['role'];
  action: 'access_denied' | 'access_granted' | 'permission_check' | 'role_change' | 'resource_access';
  resource: string;
  resourceId?: string;
  requiredRole?: UserProfile['role'][];
  timestamp?: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    reasonDenied?: string;
    [key: string]: unknown;
  };
}

class AuthAuditLogger {
  private db = getFirestore();
  private collectionName = 'auditLogs';

  /**
   * Log an authorization check
   */
  async logAuthCheck(
    userId: string,
    action: AuditLogEntry['action'],
    resource: string,
    requiredRole?: UserProfile['role'][],
    metadata?: AuditLogEntry['metadata']
  ): Promise<string | null> {
    try {
      const entry: AuditLogEntry = {
        userId,
        userRole: 'BUYER', // Will be set by calling code
        action,
        resource,
        requiredRole,
        timestamp: new Date(),
        metadata,
      };

      const docRef = await addDoc(collection(this.db, this.collectionName), {
        ...entry,
        timestamp: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Failed to log auth check:', error);
      return null;
    }
  }

  /**
   * Log access denied event
   */
  async logAccessDenied(
    userId: string,
    userRole: UserProfile['role'],
    resource: string,
    requiredRoles: UserProfile['role'][],
    metadata?: AuditLogEntry['metadata']
  ): Promise<void> {
    await this.logAuthCheck(userId, 'access_denied', resource, requiredRoles, {
      ...metadata,
      reasonDenied: `User role '${userRole}' not in required roles: ${requiredRoles.join(', ')}`,
    });
  }

  /**
   * Log access granted event
   */
  async logAccessGranted(
    userId: string,
    userRole: UserProfile['role'],
    resource: string,
    metadata?: AuditLogEntry['metadata']
  ): Promise<void> {
    await this.logAuthCheck(userId, 'access_granted', resource, [userRole], metadata);
  }

  /**
   * Log resource access (after permission check passed)
   */
  async logResourceAccess(
    userId: string,
    userRole: UserProfile['role'],
    resourceType: string,
    resourceId: string,
    action: string,
    metadata?: AuditLogEntry['metadata']
  ): Promise<void> {
    try {
      await addDoc(collection(this.db, this.collectionName), {
        userId,
        userRole,
        action: 'resource_access',
        resource: `${resourceType}:${action}`,
        resourceId,
        timestamp: serverTimestamp(),
        metadata,
      });
    } catch (error) {
      console.error('Failed to log resource access:', error);
    }
  }

  /**
   * Log role change event
   */
  async logRoleChange(
    userId: string,
    oldRole: UserProfile['role'],
    newRole: UserProfile['role'],
    changedBy?: string,
    metadata?: AuditLogEntry['metadata']
  ): Promise<void> {
    try {
      await addDoc(collection(this.db, this.collectionName), {
        userId,
        userRole: newRole,
        action: 'role_change',
        resource: 'user_role',
        timestamp: serverTimestamp(),
        metadata: {
          ...metadata,
          oldRole,
          newRole,
          changedBy,
        },
      });
    } catch (error) {
      console.error('Failed to log role change:', error);
    }
  }

  /**
   * Retrieve audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      const q = query(
        collection(this.db, this.collectionName),
        where('userId', '==', userId),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .slice(0, limit)
        .map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Retrieve all access denied events
   */
  async getAccessDeniedLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    try {
      const q = query(
        collection(this.db, this.collectionName),
        where('action', '==', 'access_denied'),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .slice(0, limit)
        .map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
    } catch (error) {
      console.error('Failed to retrieve access denied logs:', error);
      return [];
    }
  }

  /**
   * Retrieve all resource access events for a specific resource
   */
  async getResourceAccessLogs(
    resourceType: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    try {
      const q = query(
        collection(this.db, this.collectionName),
        where('action', '==', 'resource_access'),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .filter(doc => doc.data().resource?.startsWith(resourceType))
        .slice(0, limit)
        .map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
    } catch (error) {
      console.error('Failed to retrieve resource access logs:', error);
      return [];
    }
  }
}

// Singleton instance
let loggerInstance: AuthAuditLogger | null = null;

export function getAuthAuditLogger(): AuthAuditLogger {
  if (!loggerInstance) {
    loggerInstance = new AuthAuditLogger();
  }
  return loggerInstance;
}

export { AuthAuditLogger };
