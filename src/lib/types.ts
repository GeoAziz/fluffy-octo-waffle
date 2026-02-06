export type ListingStatus = 'pending' | 'approved' | 'rejected';

export type Evidence = {
  id: string;
  listingId: string;
  ownerId: string;
  type: 'title_deed' | 'survey_map' | 'other';
  name: string;
  storageUrl: string; // In a real app, this would be a secure URL to the document in Firebase Storage
  uploadedAt: any; // Firestore timestamp
  summary?: string;
  content: string; // Plain text content for AI summarization, or filename if content not available
};

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  location: string; // General location string for display
  status: ListingStatus;
  seller: {
    name: string;
    avatarUrl: string;
  };
  evidence: Evidence[];
  image: string; // Main image for the listing
  imageHint: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  adminReviewedAt?: any; // Firestore timestamp, optional
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'SELLER' | 'ADMIN';
  createdAt: any; // Firestore timestamp
};
