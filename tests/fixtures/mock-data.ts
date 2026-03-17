import type { Listing, Conversation, Notification } from '../../src/lib/types';

export const mockListing: Listing = {
  id: 'listing-001',
  ownerId: 'seller-uid-001',
  title: 'Prime Land in Nairobi',
  description: 'Beautiful 0.5 acre plot in a prime Westlands location.',
  price: 5000000,
  location: 'Westlands, Nairobi',
  county: 'Nairobi',
  area: 0.5,
  size: '50x100 ft',
  landType: 'Residential',
  latitude: -1.2921,
  longitude: 36.8219,
  isApproximateLocation: false,
  status: 'approved',
  seller: {
    name: 'Test Seller',
    avatarUrl: '',
  },
  evidence: [],
  images: [{ url: 'https://example.com/image.jpg', hint: 'aerial view of land' }],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  aiRiskScore: 10,
  badge: 'EvidenceReviewed',
  views: 100,
  inquiryCount: 5,
};

export const mockPendingListing: Listing = {
  ...mockListing,
  id: 'listing-002',
  title: 'Agricultural Land in Nakuru',
  status: 'pending',
  badge: null,
  aiRiskScore: 25,
};

export const mockConversation: Conversation = {
  id: 'conv-001',
  listingId: 'listing-001',
  listingTitle: 'Prime Land in Nairobi',
  listingImage: 'https://example.com/image.jpg',
  participantIds: ['buyer-uid-001', 'seller-uid-001'],
  participants: {
    'buyer-uid-001': { displayName: 'Test Buyer', photoURL: '' },
    'seller-uid-001': { displayName: 'Test Seller', photoURL: '' },
  },
  lastMessage: {
    text: 'Hello, I am interested in this property',
    timestamp: new Date('2024-01-01'),
    senderId: 'buyer-uid-001',
  },
  updatedAt: new Date('2024-01-01'),
  status: 'new',
};

export const mockNotification: Notification = {
  id: 'notif-001',
  userId: 'buyer-uid-001',
  title: 'New Message from Seller',
  message: 'Test Seller sent you a message about Prime Land in Nairobi',
  type: 'inquiry',
  link: '/buyer/messages/conv-001',
  read: false,
  createdAt: new Date('2024-01-01'),
};

export const mockReadNotification: Notification = {
  ...mockNotification,
  id: 'notif-002',
  read: true,
};
