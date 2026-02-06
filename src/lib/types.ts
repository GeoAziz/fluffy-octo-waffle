export type BadgeStatus =
  | 'TrustedSignal'
  | 'EvidenceReviewed'
  | 'EvidenceSubmitted'
  | 'Suspicious'
  | 'None';

export type Evidence = {
  id: string;
  name: string;
  url: string; // In a real app, this would be a secure URL to the document
  summary?: string;
  content: string; // Plain text content for AI summarization
};

export type Listing = {
  id: string;
  title: string;
  location: string;
  price: number;
  description: string;
  image: string;
  imageHint: string;
  badge: BadgeStatus;
  sellerId: string;
  seller: {
    name: string;
    avatarUrl: string;
  };
  evidence: Evidence[];
  createdAt: any; // Firestore timestamp
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'SELLER' | 'ADMIN';
};
