
export type ListingStatus = 'pending' | 'approved' | 'rejected';

export type BadgeValue = 'TrustedSignal' | 'EvidenceReviewed' | 'EvidenceSubmitted' | 'Suspicious' | 'None';

export type BadgeSuggestion = {
  badge: BadgeValue;
  reason: string;
};

export type ImageAnalysis = {
  isSuspicious: boolean;
  reason: string;
};

export type EvidenceType = 'title_deed' | 'survey_map' | 'id_document' | 'rate_clearance' | 'other';

export type Evidence = {
  id: string;
  listingId: string;
  ownerId: string;
  type: EvidenceType;
  name: string;
  storagePath: string; // Path to the document in Firebase Storage
  uploadedAt: any; // Firestore timestamp
  summary?: string;
  content: string; // Plain text content for AI summarization
  verified: boolean;
  checksum?: string; // SHA-256 or similar for integrity proof
  url?: string; // Secure, temporary URL to view the file
};

export type ListingImage = {
  url: string;
  hint: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  url: string;
  createdAt: any; // Firestore timestamp
  filters: {
    query?: string;
    county?: string;
    landType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    badges?: BadgeValue[];
  };
};

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  location: string; // General location string for display
  county: string;
  area: number; // e.g., in Acres
  size: string; // e.g., "50x100 ft"
  landType: string; // e.g., "Agricultural", "Residential"
  latitude: number;
  longitude: number;
  isApproximateLocation: boolean;
  status: ListingStatus;
  seller: {
    name: string;
    avatarUrl: string;
  };
  evidence: Evidence[];
  images: ListingImage[];
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  adminReviewedAt?: any; // Firestore timestamp, optional
  rejectionReason?: string; // Reason provided by admin for rejection
  adminNotes?: string; // Internal notes for admins
  imageAnalysis?: ImageAnalysis;
  badgeSuggestion?: BadgeSuggestion;
  aiRiskScore: number; // Calculated composite score 0-100
  badge: BadgeValue | null;
  views: number;
  inquiryCount: number;
  // Kept for backward compatibility during data transformation in `toListing`
  image?: string; 
  imageHint?: string;
};

export type UserPreferences = {
  counties: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  landTypes: string[];
  notifications: {
    email: boolean;
    inApp: boolean;
  };
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
  bio: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  createdAt: any; // Firestore timestamp
  verified: boolean;
  preferences?: UserPreferences;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'inquiry' | 'badge_update' | 'flag' | 'system';
  link?: string;
  read: boolean;
  createdAt: any;
};

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  participantIds: string[];
  participants: {
    [key: string]: {
      displayName: string;
      photoURL: string;
    };
  };
  lastMessage: {
    text: string;
    timestamp: any; // or Date
    senderId: string;
  } | null;
  updatedAt: any; // or Date
  status?: 'new' | 'responded' | 'closed';
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: any; // or Date
};

export type PlatformSettings = {
  id?: string; // Firestore doc ID, always 'settings'
  platformName: string;
  contactEmail: string;
  supportEmail: string;
  supportPhone?: string;
  siteDescription: string;
  maxUploadSizeMB: number;
  moderationThresholdDays: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  enableUserSignups: boolean;
  enableListingCreation: boolean;
  socialFacebook?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  trustStats?: {
    totalListings: number;
    totalBuyers: number;
    fraudCasesResolved: number;
  };
  updatedAt?: any; // Firestore timestamp
  updatedBy?: string; // User UID who last updated
};

export type AuditLog = {
  id?: string;
  adminId: string;
  action: string;
  entityType: string; // 'settings', 'listing', 'user', etc.
  entityId?: string;
  changes: Record<string, any>;
  timestamp?: any; // Firestore timestamp
  reason?: string; // Explicit reason pulse
};
