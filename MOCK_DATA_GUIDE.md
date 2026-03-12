# Mock Data System - Quick Start Guide

## Overview

Comprehensive mock data generation system with realistic Kenyan data, time-based scenarios, and AI flow results.

## Installation Complete! ✅

The following files have been created:

```
src/lib/mock/
├── index.ts                    # Central exports
├── kenya-data.ts              # Kenyan names, counties, phones
├── mock-user-journeys.ts      # 26 user personas (buyers, sellers, admin)
├── mock-listings.ts           # Listings with 10 time-based scenarios
├── mock-evidence.ts           # Evidence documents (5 quality levels)
├── mock-conversations.ts      # 8 conversation templates
├── mock-admin-activity.ts     # Audit logs, favorites, saved searches
├── seed-all.ts               # Main seeding orchestrator
└── README.md                  # Full documentation
```

## Usage

### Seed the Database

```bash
# Basic seeding (60+ listings)
npm run seed:all

# Clear existing data and reseed
npm run seed:all -- --clear

# Custom number of listings per seller
npm run seed:all -- --listings=10

# Full reset with custom settings
npm run seed:all -- --clear --listings=5
```

### Login Credentials

**Admin:**
- Email: `admin@kenyalandtrust.co.ke`
- Password: `Password123!`

**Sample Buyer:**
- Email: `kamau.tech@gmail.com`
- Password: `Password123!`

**Sample Seller:**
- Email: `info@amaniproperties.co.ke`
- Password: `Password123!`

All users use the same password: `Password123!`

## What Gets Generated

| Data Type | Count | Details |
|-----------|-------|---------|
| **Users** | 26 | 10 buyers, 15 sellers, 1 admin |
| **Listings** | 60+ | 4 per seller (configurable) |
| **Evidence Docs** | 150+ | Title deeds, surveys, IDs, clearances |
| **Conversations** | 30+ | Realistic buyer-seller messaging |
| **Messages** | 150+ | Multi-turn conversation history |
| **Favorites** | 80+ | Buyer saved listings |
| **Saved Searches** | 100+ | Search filters by county, price, type |
| **Audit Logs** | 200+ | Admin approval/rejection history |

## Key Features

### ✅ Realistic Kenyan Data
- Authentic names (Kikuyu, Luo, Kalenjin, etc.)
- All 47 counties with real locations
- Kenyan phone numbers (+254 format)
- Local business names

### ✅ Time-Based Scenarios
- Listings created 0-90 days ago
- Approval/rejection timestamps
- Conversation history with realistic timing
- User activity patterns

### ✅ AI Flow Results Included
- Badge suggestions with detailed reasons
- Image analysis (suspicious detection)
- Evidence quality ratings
- Risk scores (0-100)

### ✅ Complete User Journeys
- First-time buyers
- Diaspora investors
- Agricultural investors
- Real estate agencies
- Private sellers
- Admin with audit trails

## Listing Scenarios

10 predefined scenarios for realistic data:

1. **TrustedSignal** - Excellent evidence, 45 days old, 234 views
2. **EvidenceReviewed** - Good evidence, 30 days old, 187 views
3. **Pending Review** - 2 days old, awaiting admin
4. **EvidenceSubmitted** - Fair quality, 60 days old
5. **Suspicious** - Flagged by AI, high risk score
6. **Rejected** - Fraudulent documents detected
7. **No Evidence** - Fresh listing, 5 days old
8. **Very Popular** - 90 days old, 1247 views
9. **Moderate Quality** - 12 days old, approved
10. **Brand New** - Created today

## Conversation Templates

8 realistic patterns:

- 💬 Serious inquiry (site visits, documents)
- 💰 Price negotiation
- 📄 Document verification
- 🗓️ Site visit scheduling
- ❓ Quick questions
- 🆕 First-time buyer guidance
- 📈 Investor analysis
- ✈️ Diaspora remote purchase

## Evidence Quality Levels

| Quality | Documents Included | Verified |
|---------|-------------------|----------|
| **Excellent** | Title deed, survey, ID, rates, other | ✅ |
| **Good** | Title deed, survey, ID | ✅ |
| **Fair** | Title deed, survey (low quality) | ⚠️ |
| **Poor** | Title deed (poor scan) | ❌ |
| **None** | No documents yet | ❌ |

## Next Steps

1. **Run the seeding script:**
   ```bash
   npm run seed:all -- --clear
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Test different roles:**
   - Admin: http://localhost:9002/admin/listings
   - Buyer: http://localhost:9002/explore
   - Seller: http://localhost:9002/dashboard

4. **Verify the data:**
   - Check listings with different badges
   - View conversations between buyers and sellers
   - Review admin audit logs
   - Test favorites and saved searches

## Troubleshooting

**"Firebase Admin initialization failed"**
- Ensure `serviceAccountKey.json` exists in project root
- Check file permissions

**"User already exists"**
- Normal behavior - script updates existing users
- Use `--clear` flag for fresh start

**Seeding takes too long**
- Reduce `--listings` count
- Check internet connection
- Verify Firebase project is active

## Development Tips

### Add New County
Edit `src/lib/mock/kenya-data.ts`:
```typescript
'NewCounty': {
  locations: ['Location1', 'Location2'],
  coords: { lat: -1.0, lng: 36.0 }
}
```

### Add New User Persona
Edit `src/lib/mock/mock-user-journeys.ts` in MOCK_BUYERS or MOCK_SELLERS array.

### Modify Listing Scenarios
Edit `src/lib/mock/mock-listings.ts` in LISTING_SCENARIOS array.

### Add Conversation Template
Edit `src/lib/mock/mock-conversations.ts` in CONVERSATION_TEMPLATES array.

## Support

For full documentation, see: `src/lib/mock/README.md`

For implementation details, review the source files in `src/lib/mock/`

---

**Ready to seed?** Run: `npm run seed:all -- --clear`
