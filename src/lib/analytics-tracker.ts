import { getFirestore, collection, addDoc, serverTimestamp, query, getDocs, where } from 'firebase/firestore';

export type AnalyticsEventType =
  | 'auth_check'
  | 'access_granted'
  | 'access_denied'
  | 'listing_created'
  | 'listing_approved'
  | 'listing_rejected'
  | 'evidence_uploaded'
  | 'badge_assigned'
  | 'message_sent'
  | 'purchase_inquiry'
  | 'role_action';

export interface AnalyticsEvent {
  id?: string;
  eventType: AnalyticsEventType;
  userId: string;
  userRole: 'BUYER' | 'SELLER' | 'ADMIN';
  resourceType?: string;
  resourceId?: string;
  action?: string;
  success: boolean;
  duration?: number; // milliseconds
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

class AnalyticsTracker {
  private db = getFirestore();
  private collectionName = 'analytics';

  /**
   * Track an analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(this.db, this.collectionName), {
        ...event,
        timestamp: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      return null;
    }
  }

  /**
   * Track authorization check
   */
  async trackAuthCheck(
    userId: string,
    userRole: 'BUYER' | 'SELLER' | 'ADMIN',
    resource: string,
    granted: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'auth_check',
      userId,
      userRole,
      resourceType: resource,
      action: granted ? 'granted' : 'denied',
      success: granted,
      metadata,
    });
  }

  /**
   * Track listing creation
   */
  async trackListingCreated(
    userId: string,
    listingId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'listing_created',
      userId,
      userRole: 'SELLER',
      resourceType: 'listing',
      resourceId: listingId,
      action: 'create',
      success: true,
      metadata,
    });
  }

  /**
   * Track listing status change
   */
  async trackListingStatusChange(
    adminId: string,
    listingId: string,
    oldStatus: string,
    newStatus: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const eventType =
      newStatus === 'approved'
        ? 'listing_approved'
        : newStatus === 'rejected'
          ? 'listing_rejected'
          : 'role_action';

    await this.trackEvent({
      eventType,
      userId: adminId,
      userRole: 'ADMIN',
      resourceType: 'listing',
      resourceId: listingId,
      action: `${oldStatus} -> ${newStatus}`,
      success: newStatus !== 'rejected',
      metadata,
    });
  }

  /**
   * Track evidence upload
   */
  async trackEvidenceUpload(
    userId: string,
    listingId: string,
    evidenceType: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'evidence_uploaded',
      userId,
      userRole: 'SELLER',
      resourceType: 'evidence',
      resourceId: listingId,
      action: `upload_${evidenceType}`,
      success,
      metadata: error ? { error } : undefined,
    });
  }

  /**
   * Track badge assignment
   */
  async trackBadgeAssignment(
    adminId: string,
    listingId: string,
    badge: string,
    reason?: string
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'badge_assigned',
      userId: adminId,
      userRole: 'ADMIN',
      resourceType: 'badge',
      resourceId: listingId,
      action: `assign_${badge}`,
      success: true,
      metadata: { reason },
    });
  }

  /**
   * Track role action with timing
   */
  async trackRoleAction(
    userId: string,
    userRole: 'BUYER' | 'SELLER' | 'ADMIN',
    action: string,
    success: boolean,
    durationMs?: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent({
      eventType: 'role_action',
      userId,
      userRole,
      action,
      success,
      duration: durationMs,
      metadata,
    });
  }

  /**
   * Get analytics summary for a user
   */
  async getUserAnalytics(userId: string): Promise<{
    totalActions: number;
    successRate: number;
    byEventType: Record<AnalyticsEventType, number>;
  }> {
    try {
      const q = query(
        collection(this.db, this.collectionName),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => doc.data() as AnalyticsEvent);

      const byEventType = {} as Record<AnalyticsEventType, number>;
      let successCount = 0;

      events.forEach(event => {
        byEventType[event.eventType] = (byEventType[event.eventType] || 0) + 1;
        if (event.success) successCount++;
      });

      return {
        totalActions: events.length,
        successRate: events.length > 0 ? (successCount / events.length) * 100 : 0,
        byEventType,
      };
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return {
        totalActions: 0,
        successRate: 0,
        byEventType: {} as Record<AnalyticsEventType, number>,
      };
    }
  }

  /**
   * Get role performance metrics
   */
  async getRoleMetrics(userRole: 'BUYER' | 'SELLER' | 'ADMIN'): Promise<{
    totalUsers: number;
    totalActions: number;
    averageSuccess: number;
  }> {
    try {
      const q = query(
        collection(this.db, this.collectionName),
        where('userRole', '==', userRole)
      );

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => doc.data() as AnalyticsEvent);

      const uniqueUsers = new Set(events.map(e => e.userId)).size;
      const successCount = events.filter(e => e.success).length;

      return {
        totalUsers: uniqueUsers,
        totalActions: events.length,
        averageSuccess: events.length > 0 ? (successCount / events.length) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to get role metrics:', error);
      return {
        totalUsers: 0,
        totalActions: 0,
        averageSuccess: 0,
      };
    }
  }
}

// Singleton instance
let trackerInstance: AnalyticsTracker | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!trackerInstance) {
    trackerInstance = new AnalyticsTracker();
  }
  return trackerInstance;
}

export { AnalyticsTracker };
