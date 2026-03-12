# Mock Data System

Comprehensive mock data generation system for Kenya Land Trust platform with realistic Kenyan context.

## Features

✅ **Realistic Kenyan Data**
- Authentic Kenyan names (Kikuyu, Luo, Kalenjin, Coastal, etc.)
- All 47 counties with real locations
- Kenyan phone numbers (+254 format)
- Local business names and land terminology

✅ **Time-Based Scenarios**
- Listings created at different times (0-90 days ago)
- Approval/rejection timestamps
- Message conversation history
- User activity patterns

✅ **AI Flow Integration**
- Badge suggestions with reasons
- Image analysis results
- Evidence quality ratings
- Risk score calculations

✅ **Complete User Journeys**
- 10 buyer personas (first-time, diaspora, investor, etc.)
- 15 seller personas (agencies, private owners)
- 1 admin user
- Realistic behavior patterns

✅ **Full Data Relationships**
- Listings → Evidence → AI Analysis
- Buyers → Favorites → Saved Searches
- Conversations → Messages
- Admin → Audit Logs

## Quick Start

```bash
# Install dependencies
npm install

# Seed database with mock data
npm run seed:all

# Clear existing data and reseed
npm run seed:all -- --clear

# Custom number of listings per seller
npm run seed:all -- --listings=10

# Clear and seed with custom settings
npm run seed:all -- --clear --listings=5
```

## Default Credentials

After seeding, use these credentials to log in:

**Admin:**
- Email: `admin@kenyalandtrust.co.ke`
- Password: `Password123!`

**Sample Buyer:**
- Email: `kamau.tech@gmail.com`
- Password: `Password123!`

**Sample Seller:**
- Email: `info@amaniproperties.co.ke`
- Password: `Password123!`

## Data Generated

| Entity | Count | Description |
|--------|-------|-------------|
| Users | 26 | 10 buyers, 15 sellers, 1 admin |
| Listings | 60+ | 4 per seller (configurable) |
| Evidence | 150+ | 2-5 documents per listing based on quality |
| Conversations | 30+ | Buyer-seller messaging threads |
| Messages | 150+ | Realistic conversation history |
| Favorites | 80+ | Buyer saved listings |
| Saved Searches | 100+ | Buyer search filters |
| Audit Logs | 200+ | Admin activity history |

## File Structure

```
src/lib/mock/
├── index.ts                    # Central exports
├── kenya-data.ts              # Kenyan names, counties, phone numbers
├── mock-user-journeys.ts      # User personas and behaviors
├── mock-listings.ts           # Listings with time-based scenarios
├── mock-evidence.ts           # Evidence documents generator
├── mock-conversations.ts      # Buyer-seller messaging
├── mock-admin-activity.ts     # Audit logs, favorites, searches
├── seed-all.ts               # Main seeding orchestrator
└── README.md                  # This file
```

## Listing Scenarios

The system includes 10 predefined scenarios:

1. **Excellent Evidence (TrustedSignal)** - 45 days old, 234 views
2. **Good Evidence (EvidenceReviewed)** - 30 days old, 187 views
3. **Recently Pending** - 2 days old, awaiting review
4. **Fair Evidence (EvidenceSubmitted)** - 60 days old, popular
5. **Suspicious (Flagged)** - 15 days old, high risk score
6. **Rejected** - 20 days old, fraudulent documents
7. **No Evidence Yet** - 5 days old, pending
8. **Very Popular (TrustedSignal)** - 90 days old, 1247 views
9. **Moderate Quality** - 12 days old, approved
10. **Brand New** - 0 days old, just created

## Conversation Templates

8 realistic conversation patterns:

- Serious inquiry (site visits, documents)
- Price negotiation (budget discussions)
- Document verification (land search)
- Site visit scheduling
- Quick questions (water, fence, etc.)
- First-time buyer guidance
- Investor analysis (ROI)
- Diaspora buyer (remote purchase)

## Counties Included

All 47 Kenyan counties with real locations:
- Nairobi (18 locations)
- Mombasa (11 locations)
- Kisumu (8 locations)
- Nakuru (9 locations)
- Kajiado, Kiambu, Machakos, and 40 more...

## Evidence Quality Levels

| Quality | Title Deed | Survey Map | ID Doc | Rate Clearance | Other |
|---------|-----------|------------|--------|----------------|-------|
| Excellent | ✅ | ✅ | ✅ | ✅ | ✅ |
| Good | ✅ | ✅ | ✅ | ❌ | ❌ |
| Fair | ✅ | ✅ | ❌ | ❌ | ❌ |
| Poor | ✅ (low quality) | ❌ | ❌ | ❌ | ❌ |
| None | ❌ | ❌ | ❌ | ❌ | ❌ |

## Time-Based Data

All entities are created with realistic timestamps:

- **Listings**: Created 0-90 days ago
- **Approvals**: 2-3 days after listing creation
- **Evidence**: Uploaded 1-2 days after listing
- **Messages**: Hourly intervals in conversations
- **Favorites**: Added 5-60 days ago
- **Saved Searches**: Created 5-60 days ago

## Database Collections Populated

- ✅ `/users/{userId}` - User profiles
- ✅ `/users/{userId}/favorites/{listingId}` - Favorited listings
- ✅ `/users/{userId}/savedSearches/{searchId}` - Saved search filters
- ✅ `/listings/{listingId}` - Property listings
- ✅ `/evidence/{evidenceId}` - Evidence documents
- ✅ `/conversations/{conversationId}` - Message threads
- ✅ `/conversations/{conversationId}/messages/{messageId}` - Messages
- ✅ `/auditLogs/{logId}` - Admin activity logs

## Development

### Add New User Persona

Edit `mock-user-journeys.ts`:

```typescript
{
  profile: {
    uid: 'buyer-new-persona',
    email: 'newpersona@example.com',
    displayName: generateKenyanName('male'),
    // ... other fields
  },
  behavior: {
    lastLoginDays: 1,
    activityLevel: 'high',
    preferredCounties: ['Nairobi'],
    budgetRange: { min: 1000000, max: 3000000 }
  }
}
```

### Add New Listing Scenario

Edit `mock-listings.ts`:

```typescript
{
  createdDaysAgo: 10,
  status: 'approved',
  approvedDaysAgo: 8,
  badge: 'EvidenceReviewed',
  hasEvidence: true,
  evidenceQuality: 'good',
  aiRiskScore: 12,
  imageAnalysis: { /* ... */ },
  views: 150,
  inquiryCount: 10
}
```

### Add New Conversation Template

Edit `mock-conversations.ts`:

```typescript
{
  intent: 'custom_scenario',
  buyerMessages: [
    'Custom buyer message 1',
    'Custom buyer message 2'
  ],
  sellerResponses: [
    'Custom seller response 1',
    'Custom seller response 2'
  ],
  status: 'responded'
}
```

## Troubleshooting

### "Firebase Admin initialization failed"
- Ensure `serviceAccountKey.json` exists in project root
- Check Firebase project permissions

### "User already exists" warnings
- Normal behavior - script updates existing users
- Use `--clear` flag to start fresh

### "Connection timeout"
- Check internet connection
- Verify Firebase project is active
- Check firestore.rules allow admin writes

### "Out of memory"
- Reduce `--listings` count
- Seed in smaller batches

## Performance

Typical seeding times:
- Users only: ~10 seconds
- Users + 60 listings: ~30 seconds
- Full seed (300+ listings): ~2 minutes

## Next Steps

After seeding:

1. Start dev server: `npm run dev`
2. Log in as admin: `admin@kenyalandtrust.co.ke`
3. Review listings: http://localhost:9002/admin/listings
4. Test buyer flow: Sign up or use `kamau.tech@gmail.com`
5. Test seller flow: Use `info@amaniproperties.co.ke`

## License

Internal use for Kenya Land Trust platform development.
