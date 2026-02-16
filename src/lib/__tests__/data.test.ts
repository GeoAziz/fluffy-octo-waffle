import { getListingById, getListings, getAdminDashboardStats } from '@/lib/data';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin');

const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>;
const mockAdminStorage = adminStorage as jest.Mocked<typeof adminStorage>;

describe('data - Firestore queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListings', () => {
    it('should fetch approved listings by default', async () => {
      const mockListingData = {
        id: 'listing-1',
        title: 'Test Property',
        description: 'A test property',
        price: 3500000,
        area: 0.5,
        location: 'Ruiru, Kiambu',
        county: 'Kiambu',
        landType: 'Residential',
        status: 'approved',
        badge: 'Gold',
        ownerId: 'seller-1',
        images: [{ url: 'https://example.com/image.jpg', hint: 'Main image' }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const mockDoc = {
        id: 'listing-1',
        data: () => mockListingData,
      };

      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDoc],
        size: 1,
      };

      const mockGet = jest.fn().mockResolvedValue(mockQuerySnapshot);
      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: mockGet,
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      const result = await getListings({ limit: 12 });

      expect(mockAdminDb.collection).toHaveBeenCalledWith('listings');
      expect(mockCollection.get).toHaveBeenCalled();
      expect(result.listings).toHaveLength(1);
      expect(result.listings[0].title).toBe('Test Property');
    });

    it('should filter listings by county', async () => {
      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      await getListings({ county: 'Kiambu', limit: 12 });

      expect(mockCollection.where).toHaveBeenCalledWith('county', '==', 'Kiambu');
    });

    it('should filter listings by price range', async () => {
      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      await getListings({ minPrice: 1000000, maxPrice: 5000000, limit: 12 });

      expect(mockCollection.where).toHaveBeenCalledWith('price', '>=', 1000000);
      expect(mockCollection.where).toHaveBeenCalledWith('price', '<=', 5000000);
    });

    it('should filter listings by land type', async () => {
      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      await getListings({ landType: 'Residential', limit: 12 });

      expect(mockCollection.where).toHaveBeenCalledWith('landType', '==', 'Residential');
    });

    it('should filter listings by badge', async () => {
      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      await getListings({ badges: ['Gold', 'Silver'], limit: 12 });

      expect(mockCollection.where).toHaveBeenCalledWith('badge', 'in', ['Gold', 'Silver']);
    });

    it('should handle empty results', async () => {
      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      const result = await getListings({ limit: 12 });

      expect(result.listings).toHaveLength(0);
      expect(result.lastVisibleId).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('EAI_AGAIN');
      (networkError as any).code = 'EAI_AGAIN';

      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(networkError),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      const result = await getListings({ limit: 12 });

      expect(result.listings).toHaveLength(0);
      expect(result.lastVisibleId).toBeNull();
    });
  });

  describe('getListingById', () => {
    it('should fetch a single listing by ID', async () => {
      const mockListingData = {
        title: 'Test Property',
        description: 'A test property',
        price: 3500000,
        area: 0.5,
        location: 'Ruiru, Kiambu',
        county: 'Kiambu',
        landType: 'Residential',
        status: 'approved',
        badge: 'Gold',
        ownerId: 'seller-1',
        images: [{ url: 'https://example.com/image.jpg', hint: 'Main image' }],
        evidence: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const mockDoc = {
        exists: true,
        id: 'listing-1',
        data: () => mockListingData,
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      const result = await getListingById('listing-1');

      expect(mockAdminDb.collection).toHaveBeenCalledWith('listings');
      expect(mockCollection.doc).toHaveBeenCalledWith('listing-1');
      expect(result?.id).toBe('listing-1');
      expect(result?.title).toBe('Test Property');
    });

    it('should return null if listing does not exist', async () => {
      const mockDoc = {
        exists: false,
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
      };

      mockAdminDb.collection.mockReturnValue(mockCollection as any);

      const result = await getListingById('non-existent-listing');

      expect(result).toBeNull();
    });
  });

  describe('getAdminDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalListings: 100,
        approvedListings: 85,
        pendingListings: 10,
        rejectedListings: 5,
        totalBuyers: 250,
        totalSellers: 50,
        activeListings: 85,
      };

      const mockConversations = {
        size: 30,
      };

      const mockReports = {
        size: 2,
      };

      const mockCollection = {
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ size: 0 }),
      };

      mockAdminDb.collection
        .mockReturnValueOnce(mockCollection as any) // listings with status=approved
        .mockReturnValueOnce(mockCollection as any) // listings with status=pending
        .mockReturnValueOnce(mockCollection as any) // listings with status=rejected
        .mockReturnValueOnce({ get: jest.fn().mockResolvedValue({ size: 250 }) } as any) // users with role=BUYER
        .mockReturnValueOnce({ get: jest.fn().mockResolvedValue({ size: 50 }) } as any) // users with role=SELLER
        .mockReturnValueOnce({ get: jest.fn().mockResolvedValue(mockConversations) } as any) // conversations
        .mockReturnValueOnce({ get: jest.fn().mockResolvedValue(mockReports) } as any); // reports

      const result = await getAdminDashboardStats();

      expect(result).toHaveProperty('approvedListings');
      expect(result).toHaveProperty('pendingListings');
      expect(result).toHaveProperty('rejectedListings');
    });
  });
});
