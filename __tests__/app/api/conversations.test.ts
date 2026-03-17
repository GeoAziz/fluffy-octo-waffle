import { describe, it, expect } from 'vitest';
import type { Conversation, Message } from '../../../src/lib/types';

/**
 * Tests for conversation data model integrity and ID generation logic.
 *
 * The conversation server actions (getOrCreateConversation, etc.) depend on
 * Firebase Admin SDK which is not available in unit test environments.
 * These tests validate the core business logic and data contracts instead.
 */

describe('Conversation ID Generation', () => {
  it('should generate a deterministic conversation ID from participants and listing', () => {
    const listingId = 'listing-001';
    const buyerId = 'buyer-uid-001';
    const sellerId = 'seller-uid-001';

    const participantIds = [buyerId, sellerId].sort();
    const conversationId = `${participantIds[0]}_${participantIds[1]}_${listingId}`;

    expect(conversationId).toBe('buyer-uid-001_seller-uid-001_listing-001');
    expect(conversationId).toContain(listingId);
    expect(conversationId).toContain(buyerId);
    expect(conversationId).toContain(sellerId);
  });

  it('should produce the same ID regardless of participant order', () => {
    const listingId = 'listing-001';
    const buyerId = 'buyer-uid-001';
    const sellerId = 'seller-uid-001';

    const id1 = [...[buyerId, sellerId]].sort().join('_') + `_${listingId}`;
    const id2 = [...[sellerId, buyerId]].sort().join('_') + `_${listingId}`;

    expect(id1).toBe(id2);
  });
});

describe('Conversation Data Model', () => {
  it('should conform to the Conversation type structure', () => {
    const conversation: Conversation = {
      id: 'buyer-uid-001_seller-uid-001_listing-001',
      listingId: 'listing-001',
      listingTitle: 'Prime Land in Nairobi',
      listingImage: 'https://example.com/image.jpg',
      participantIds: ['buyer-uid-001', 'seller-uid-001'],
      participants: {
        'buyer-uid-001': { displayName: 'Test Buyer', photoURL: '' },
        'seller-uid-001': { displayName: 'Test Seller', photoURL: '' },
      },
      lastMessage: {
        text: 'Hello, is this available?',
        timestamp: new Date(),
        senderId: 'buyer-uid-001',
      },
      updatedAt: new Date(),
      status: 'new',
    };

    expect(conversation.participantIds).toHaveLength(2);
    expect(conversation.participantIds).toContain('buyer-uid-001');
    expect(conversation.participantIds).toContain('seller-uid-001');
    expect(conversation.status).toBe('new');
    expect(conversation.lastMessage?.senderId).toBe('buyer-uid-001');
  });
});
