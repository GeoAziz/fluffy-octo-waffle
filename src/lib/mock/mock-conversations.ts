/**
 * Mock Conversations and Messages Generator
 * Realistic buyer-seller messaging patterns
 */
import { faker } from '@faker-js/faker';
import type { Conversation, Message } from '../types';

/**
 * Generate timestamp X days ago with optional hours offset
 */
const daysAgo = (days: number, hoursOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hoursOffset);
  return date;
};

/**
 * Conversation templates with realistic Kenyan context
 */
const CONVERSATION_TEMPLATES = [
  {
    intent: 'serious_inquiry',
    buyerMessages: [
      'Hello, I am interested in this property. Is it still available?',
      'Can you tell me more about the location and access roads?',
      'What documents are available for this property?',
      'Is the price negotiable? My budget is slightly lower.',
      'When can I schedule a site visit?'
    ],
    sellerResponses: [
      'Yes, the property is still available. Thank you for your interest!',
      'The property is located in a prime area with good tarmac road access. All amenities are nearby.',
      'We have the original title deed, recent survey map, and rate clearance certificates ready for viewing.',
      'The price is slightly negotiable for serious buyers. Let me know your budget and we can discuss.',
      'Site visits can be arranged any day. Would this weekend work for you?'
    ],
    status: 'responded' as const
  },
  {
    intent: 'price_negotiation',
    buyerMessages: [
      'Hi, I like this property but the price is above my budget.',
      'Can you consider KSH {price}?',
      'Are there any payment plans available?',
      'What is your best offer for cash payment?'
    ],
    sellerResponses: [
      'Thank you for your interest. What is your budget range?',
      'That\'s a bit low, but let me consult with the owner and get back to you.',
      'Yes, we can discuss flexible payment terms for genuine buyers.',
      'For immediate cash payment, we can offer a discount. Let\'s discuss details.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'document_verification',
    buyerMessages: [
      'Hello, I want to verify the documents before proceeding.',
      'Can you send me copies of the title deed and survey map?',
      'Has the property been verified by the platform?',
      'What about land rates? Are they up to date?',
      'I want to do a land search. Can you provide the parcel number?'
    ],
    sellerResponses: [
      'Of course! All documents are available and verified.',
      'I can share certified copies after we sign a viewing agreement.',
      'Yes, this property has been verified and received a trust badge from Kenya Land Trust.',
      'All land rates are fully paid. We have the clearance certificate.',
      'The parcel number is on the title deed. Once you commit to viewing, I\'ll provide all details.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'site_visit',
    buyerMessages: [
      'I would like to visit the property this weekend.',
      'What time works best for you?',
      'Should I bring my surveyor along?',
      'How do I get there from Nairobi?'
    ],
    sellerResponses: [
      'This weekend works perfectly! Saturday or Sunday?',
      'I\'m available between 10 AM and 4 PM. What time suits you?',
      'Yes, absolutely. Bringing your surveyor is a good idea.',
      'I\'ll send you the exact Google Maps location and directions. It\'s about an hour from Nairobi.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'quick_question',
    buyerMessages: [
      'Is water available on the property?',
      'What is the surrounding neighborhood like?',
      'Are there any ongoing developments nearby?',
      'Is the land fenced?'
    ],
    sellerResponses: [
      'Yes, there is borehole water available. Piped water connection is also possible.',
      'It\'s a quiet, developing area with good security. Many families have built homes nearby.',
      'Yes, there\'s a new shopping center being built 2 km away. Property values are rising.',
      'Partially fenced. The boundary beacons are all in place.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'first_time_buyer',
    buyerMessages: [
      'Hi, I\'m a first-time land buyer. Can you guide me on the process?',
      'What steps are involved in purchasing land in Kenya?',
      'Do I need a lawyer?',
      'How long does the transfer process take?',
      'Are there any hidden costs I should know about?'
    ],
    sellerResponses: [
      'Welcome! Happy to guide you. It\'s simpler than you think.',
      'The main steps are: site visit, document verification, agreement, payment, and transfer. I\'ll help with each step.',
      'Yes, I recommend using a lawyer for the transfer process. I can recommend reliable ones.',
      'Transfer typically takes 2-3 months at the lands office, but we can start the process immediately after payment.',
      'Main costs are: property price, land transfer fee (4%), stamp duty (2%), lawyer fees, and land search fee.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'investor_inquiry',
    buyerMessages: [
      'Hello, I\'m buying for investment. What is the ROI potential?',
      'Are there similar properties sold recently in the area?',
      'What is the capital appreciation rate?',
      'Can I subdivide this land?',
      'Is there demand for rental properties here?'
    ],
    sellerResponses: [
      'This area has seen 15-20% annual appreciation over the last 3 years. Great investment potential!',
      'Yes, several plots nearby sold recently at similar prices. The area is in high demand.',
      'Capital appreciation is strong - the road upgrade and new developments are driving values up.',
      'Yes, subdivision is possible. The minimum plot size allowed is 1/8 acre in this zone.',
      'High demand! Many people are building rental apartments here due to proximity to town.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'diaspora_buyer',
    buyerMessages: [
      'Hi, I\'m based abroad. Can you handle everything remotely?',
      'Do you accept international wire transfers?',
      'Can I do the site visit via video call?',
      'Who can I trust to represent me locally?',
      'What guarantees do I have against fraud?'
    ],
    sellerResponses: [
      'Yes, we work with many diaspora clients. Everything can be done remotely.',
      'Yes, we accept international transfers. I\'ll provide our verified bank details.',
      'Absolutely! I can do a live video tour of the property via WhatsApp or Zoom.',
      'You can hire a local advocate. I can recommend trusted ones who have worked with diaspora clients.',
      'This property is verified by Kenya Land Trust platform with a trust badge. All documents are authentic.'
    ],
    status: 'responded' as const
  },
  {
    intent: 'just_browsing',
    buyerMessages: [
      'Hi, just inquiring about the property.',
      'Looks interesting. Let me think about it.',
      'Thank you for the information.'
    ],
    sellerResponses: [
      'Thank you for your interest! Feel free to ask any questions.',
      'Take your time. Let me know if you need any additional information.',
      'You\'re welcome! Contact me anytime if you have more questions.'
    ],
    status: 'new' as const
  }
];

/**
 * Generate a realistic conversation with message history
 */
export const generateConversation = (
  conversationId: string,
  buyerId: string,
  buyerName: string,
  buyerPhoto: string,
  sellerId: string,
  sellerName: string,
  sellerPhoto: string,
  listingId: string,
  listingTitle: string,
  listingImage: string,
  createdDaysAgo: number
): { conversation: Conversation; messages: Message[] } => {
  // Pick a random conversation template
  const template = CONVERSATION_TEMPLATES[Math.floor(Math.random() * CONVERSATION_TEMPLATES.length)];
  
  // Generate messages
  const messages: Message[] = [];
  const messageCount = Math.min(
    Math.floor(Math.random() * template.buyerMessages.length) + 1,
    template.buyerMessages.length,
    template.sellerResponses.length
  );

  let currentDaysAgo = createdDaysAgo;
  let hoursOffset = 0;

  for (let i = 0; i < messageCount; i++) {
    // Buyer message
    const buyerMessage: Message = {
      id: `${conversationId}-msg-${i * 2}`,
      senderId: buyerId,
      text: template.buyerMessages[i],
      timestamp: daysAgo(currentDaysAgo, hoursOffset)
    };
    messages.push(buyerMessage);
    hoursOffset += faker.number.int({ min: 1, max: 8 });

    // Seller response (if available)
    if (i < template.sellerResponses.length) {
      const sellerMessage: Message = {
        id: `${conversationId}-msg-${i * 2 + 1}`,
        senderId: sellerId,
        text: template.sellerResponses[i],
        timestamp: daysAgo(currentDaysAgo, hoursOffset)
      };
      messages.push(sellerMessage);
      hoursOffset += faker.number.int({ min: 2, max: 24 });

      // Move to previous day if hours exceed 24
      if (hoursOffset > 24) {
        currentDaysAgo = Math.max(0, currentDaysAgo - 1);
        hoursOffset = hoursOffset % 24;
      }
    }
  }

  // Get last message
  const lastMessage = messages[messages.length - 1];

  // Create conversation
  const conversation: Conversation = {
    id: conversationId,
    listingId: listingId,
    listingTitle: listingTitle,
    listingImage: listingImage,
    participantIds: [buyerId, sellerId],
    participants: {
      [buyerId]: {
        displayName: buyerName,
        photoURL: buyerPhoto
      },
      [sellerId]: {
        displayName: sellerName,
        photoURL: sellerPhoto
      }
    },
    lastMessage: {
      text: lastMessage.text,
      timestamp: lastMessage.timestamp,
      senderId: lastMessage.senderId
    },
    updatedAt: lastMessage.timestamp,
    status: template.status
  };

  return { conversation, messages };
};

/**
 * Generate multiple conversations for a buyer
 */
export const generateBuyerConversations = (
  buyerId: string,
  buyerName: string,
  buyerPhoto: string,
  sellers: Array<{ id: string; name: string; photo: string }>,
  listings: Array<{ id: string; title: string; image: string; ownerId: string }>,
  count: number
): Array<{ conversation: Conversation; messages: Message[] }> => {
  const conversations: Array<{ conversation: Conversation; messages: Message[] }> = [];

  // Filter listings to only those owned by provided sellers
  const availableListings = listings.filter(listing =>
    sellers.some(seller => seller.id === listing.ownerId)
  );

  if (availableListings.length === 0) return [];

  for (let i = 0; i < Math.min(count, availableListings.length); i++) {
    const listing = availableListings[i];
    const seller = sellers.find(s => s.id === listing.ownerId);
    
    if (!seller) continue;

    const conversationId = `conv-${buyerId}-${listing.id}`;
    const createdDaysAgo = faker.number.int({ min: 1, max: 30 });

    const conv = generateConversation(
      conversationId,
      buyerId,
      buyerName,
      buyerPhoto,
      seller.id,
      seller.name,
      seller.photo,
      listing.id,
      listing.title,
      listing.image,
      createdDaysAgo
    );

    conversations.push(conv);
  }

  return conversations;
};

/**
 * Generate conversations for a seller's listings
 */
export const generateSellerConversations = (
  sellerId: string,
  sellerName: string,
  sellerPhoto: string,
  buyers: Array<{ id: string; name: string; photo: string }>,
  sellerListings: Array<{ id: string; title: string; image: string }>,
  conversationsPerListing: number = 2
): Array<{ conversation: Conversation; messages: Message[] }> => {
  const conversations: Array<{ conversation: Conversation; messages: Message[] }> = [];

  for (const listing of sellerListings) {
    const convCount = Math.min(conversationsPerListing, buyers.length);
    
    for (let i = 0; i < convCount; i++) {
      const buyer = buyers[i];
      const conversationId = `conv-${buyer.id}-${listing.id}`;
      const createdDaysAgo = faker.number.int({ min: 1, max: 30 });

      const conv = generateConversation(
        conversationId,
        buyer.id,
        buyer.name,
        buyer.photo,
        sellerId,
        sellerName,
        sellerPhoto,
        listing.id,
        listing.title,
        listing.image,
        createdDaysAgo
      );

      conversations.push(conv);
    }
  }

  return conversations;
};
