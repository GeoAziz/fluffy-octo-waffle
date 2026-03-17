# Buyer UX Firebase Integration Guide

## Quick Reference

This guide explains how to connect Firebase data to the new buyer UX pages.

---

## Page Integration Tasks

### 1. `/buyer/inbox/page.tsx` - Unified Inbox

**What needs data:**
- `unreadMessages` - count
- `unreadAlerts` - count  
- `nextAction` - object with `{ title, href, action }`
- Conversation list (for Messages tab)
- Alert feed (for Alerts tab)

**Firebase Queries:**

```typescript
// Get unread message count
const getUnreadMessageCount = async (userId: string) => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    where('lastMessage.senderId', '!=', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Get unread alerts count
const getUnreadAlertCount = async (userId: string) => {
  const q = query(
    collection(db, `users/${userId}/notifications`),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Get conversations list
const getConversations = async (userId: string) => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessage.createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    unread: doc.data().lastMessage?.senderId !== userId
  }));
};
```

**Component Integration:**

```typescript
// In useEffect in /buyer/inbox/page.tsx
useEffect(() => {
  const unsubscribeMessages = onSnapshot(
    query(collection(db, 'conversations'), where('participantIds', 'array-contains', user.uid)),
    (snapshot) => {
      const count = snapshot.docs.filter(
        doc => doc.data().lastMessage?.senderId !== user.uid
      ).length;
      setUnreadMessages(count);
    }
  );

  const unsubscribeAlerts = onSnapshot(
    query(collection(db, `users/${user.uid}/notifications`), where('read', '==', false)),
    (snapshot) => setUnreadAlerts(snapshot.size)
  );

  return () => {
    unsubscribeMessages();
    unsubscribeAlerts();
  };
}, [user.uid]);
```

---

### 2. `/buyer/compare/page.tsx` - Side-by-Side Comparison

**What needs data:**
- Selected listing IDs (from URL query or local storage)
- Listing details for each ID
- Price history (to show deltas)
- Trust badges
- Images

**Firebase Queries:**

```typescript
// Get multiple listings by IDs
const getListingsByIds = async (ids: string[]) => {
  const listings = await Promise.all(
    ids.map(id => 
      getDoc(doc(db, 'listings', id))
        .then(docSnap => ({ id, ...docSnap.data() }))
    )
  );
  return listings;
};

// Get price history for a listing
const getPriceHistory = async (listingId: string) => {
  const q = query(
    collection(db, `listings/${listingId}/priceHistory`),
    orderBy('timestamp', 'desc'),
    limit(5)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};
```

**Component Integration:**

```typescript
// In useEffect in /buyer/compare/page.tsx
useEffect(() => {
  if (selectedListings.length === 0) return;
  
  setLoading(true);
  const listingIds = Array.from(selectedListings);
  
  Promise.all([
    getListingsByIds(listingIds),
    ...listingIds.map(id => getPriceHistory(id))
  ]).then(([listings, ...histories]) => {
    setCompareListings(listings);
    setPriceHistories(histories);
    setLoading(false);
  });
}, [selectedListings]);
```

---

### 3. `/buyer/saved-searches/page.tsx` - Saved Searches Dashboard

**What needs data:**
- Saved searches list
- New/unread count per search
- Filter metadata
- URL for each search

**Firebase Queries:**

```typescript
// Get all saved searches for user
const getSavedSearches = async (userId: string) => {
  const q = query(
    collection(db, `users/${userId}/savedSearches`),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get new listings count for a saved search
const getNewListingsForSearch = async (userId: string, searchId: string) => {
  const search = await getDoc(doc(db, `users/${userId}/savedSearches/${searchId}`));
  const filters = search.data()?.filters;
  
  // Build query based on filters
  let q = query(collection(db, 'listings'), where('status', '==', 'approved'));
  
  if (filters?.county) {
    q = query(q, where('county', '==', filters.county));
  }
  // ... add other filter conditions
  
  // Only count listings not in user's favorites
  const snapshot = await getDocs(q);
  const favorites = await getFavoriteIds(userId);
  
  return snapshot.docs.filter(doc => !favorites.has(doc.id)).length;
};
```

**Component Integration:**

```typescript
// In useEffect in /buyer/saved-searches/page.tsx
useEffect(() => {
  getSavedSearches(user.uid).then(searches => {
    Promise.all(
      searches.map(search => 
        getNewListingsForSearch(user.uid, search.id)
          .then(count => ({ ...search, newCount: count }))
      )
    ).then(searchesWithCounts => {
      setSearches(searchesWithCounts);
      setLoading(false);
    });
  });
}, [user.uid]);
```

---

### 4. `/buyer/history/page.tsx` - Recently Viewed

**What needs data:**
- Browsing history (listing IDs + timestamps)
- Listing details for each
- Price at time of view vs. current
- Trust badges

**Firebase Queries:**

```typescript
// Get browsing history
const getBrowsingHistory = async (userId: string) => {
  const q = query(
    collection(db, `users/${userId}/browsingHistory`),
    orderBy('viewedAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get listing details with price delta
const getHistoryItemWithDelta = async (historyItem: any) => {
  const listing = await getDoc(doc(db, 'listings', historyItem.listingId));
  const currentPrice = listing.data()?.price;
  const priceAtView = historyItem.priceAtView;
  const priceDelta = currentPrice - priceAtView;
  
  return {
    ...listing.data(),
    id: listing.id,
    priceDelta,
    priceChange: priceDelta > 0 ? 'up' : priceDelta < 0 ? 'down' : 'stable',
    viewedAt: historyItem.viewedAt
  };
};
```

**Component Integration:**

```typescript
// In useEffect in /buyer/history/page.tsx
useEffect(() => {
  getBrowsingHistory(user.uid).then(historyItems => {
    if (historyItems.length === 0) {
      setHistory([]);
      setLoading(false);
      return;
    }
    
    Promise.all(
      historyItems.map(item => getHistoryItemWithDelta(item))
    ).then(historyWithDetails => {
      setHistory(historyWithDetails);
      setLoading(false);
    });
  });
}, [user.uid]);
```

---

## Supporting Server Actions

Add these to `src/app/actions.ts`:

```typescript
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

// Delete a saved search
export async function deleteSavedSearch(searchId: string) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Not authenticated');
  
  await adminDb.collection('users').doc(authUser.uid).collection('savedSearches').doc(searchId).delete();
}

// Clear browsing history
export async function clearBrowsingHistory() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Not authenticated');
  
  const historyRef = adminDb.collection('users').doc(authUser.uid).collection('browsingHistory');
  const snapshot = await historyRef.get();
  
  const batch = adminDb.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

// Add to browsing history (called from listing detail)
export async function recordListingView(listingId: string) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) return; // Allow for guest views
  
  const listing = await adminDb.collection('listings').doc(listingId).get();
  const priceAtView = listing.data()?.price;
  
  await adminDb.collection('users').doc(authUser.uid).collection('brosingHistory').add({
    listingId,
    priceAtView,
    viewedAt: new Date(),
  });
}

// Add listing to compare (store in session/local state, not DB)
export async function getCompareListings(ids: string[]) {
  if (ids.length === 0) return [];
  
  const listings = await Promise.all(
    ids.map(id => 
      adminDb.collection('listings').doc(id).get()
        .then(doc => ({ id, ...doc.data() }))
    )
  );
  
  return listings;
}
```

---

## Collection Schema Reference

### `/users/{userId}/browsingHistory/{itemId}`
```typescript
{
  listingId: string;        // Listing that was viewed
  priceAtView: number;      // Price at time of view
  viewedAt: Timestamp;      // When it was viewed
}
```

### `/users/{userId}/savedSearches/{searchId}`
```typescript
{
  name: string;             // e.g., "Residential near Nairobi"
  url: string;              // e.g., "/explore?county=Nairobi&landType=Residential"
  filters: {
    query?: string;
    county?: string;
    landType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    badges?: string[];
  };
  createdAt: Timestamp;
  lastViewedAt?: Timestamp; // When filters were last browsed
}
```

### `/conversations/{conversationId}`
```typescript
{
  participantIds: string[]; // [buyerId, sellerId]
  buyerId: string;
  sellerId: string;
  listingId: string;        // Which listing the conversation is about
  status: 'new' | 'active' | 'closed';
  createdAt: Timestamp;
  lastMessage: {
    senderId: string;
    content: string;
    createdAt: Timestamp;
  };
}
```

### `/conversations/{conversationId}/messages/{messageId}`
```typescript
{
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Timestamp;
}
```

---

## Real-Time Listeners Pattern

For live updates, use `onSnapshot` instead of `getDocs`:

```typescript
useEffect(() => {
  if (!user?.uid) return;
  
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', user.uid),
    orderBy('lastMessage.createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setConversations(conversations);
  });
  
  return () => unsubscribe();
}, [user?.uid]);
```

---

## Performance Considerations

### Pagination
For large lists (conversations, history), implement pagination:

```typescript
const [lastDoc, setLastDoc] = useState(null);

const loadMoreConversations = async () => {
  let q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', user.uid),
    orderBy('lastMessage.createdAt', 'desc'),
    limit(10)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  setConversations(prev => [...prev, ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))]);
  setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
};
```

### Caching
Use React Query or SWR for client-side caching:

```typescript
import { useQuery } from '@tanstack/react-query';

export function useConversations(userId: string) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId),
    enabled: !!userId,
  });
}
```

---

## Testing

### Unit Tests
```typescript
describe('Inbox Page', () => {
  it('should display unread message count', async () => {
    const { getByText } = render(<InboxPage />);
    await waitFor(() => {
      expect(getByText(/5 unread/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests
```typescript
test('buyer can view inbox and select a conversation', async ({page}) => {
  await page.goto('/buyer/inbox');
  await page.click('text=Messages');
  await page.click('a:has-text("From Uzalendo Properties")');
  await expect(page).toHaveURL(/\/buyer\/messages\/\w+/);
});
```

---

## Debugging

### Firebase Emulator
To test locally without hitting production:

```bash
firebase emulators:start
```

Then in your code:
```typescript
import { connectEmulator } from '@firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectEmulator(db, 'localhost', 8080);
}
```

### Console Logging
Add to `/buyer/inbox/page.tsx`:

```typescript
useEffect(() => {
  console.log('[Inbox] Unread messages:', unreadMessages);
  console.log('[Inbox] Unread alerts:', unreadAlerts);
  console.log('[Inbox] Next action:', nextAction);
}, [unreadMessages, unreadAlerts, nextAction]);
```

---

## Timeline

**Estimated effort per page:**
- Inbox: 2-3 hours (most complex due to tabs + real-time)
- Compare: 1-2 hours (straightforward data display)
- Saved Searches: 1-2 hours (CRUD operations)
- History: 1-2 hours (simple data display)

**Total: 5-9 hours for full Firebase integration**

---

**Last Updated**: March 16, 2026
**Current Status**: Pages created, awaiting Firebase integration
