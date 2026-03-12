/**
 * Mock Listings with Time-Based Scenarios and AI Flow Results
 */
import { faker } from '@faker-js/faker';
import type { Listing, BadgeValue, ListingStatus, ListingImage, ImageAnalysis, BadgeSuggestion } from '../types';
import { 
  getRandomCounty, 
  KENYAN_LAND_TYPES, 
  KENYAN_PLOT_SIZES,
  randomPick 
} from './kenya-data';
import { PlaceHolderImages } from '../placeholder-images';

/**
 * Generate timestamp X days ago
 */
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Time-based listing scenarios
 */
export type ListingScenario = {
  createdDaysAgo: number;
  status: ListingStatus;
  approvedDaysAgo?: number;
  rejectedDaysAgo?: number;
  badge: BadgeValue | null;
  hasEvidence: boolean;
  evidenceQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  aiRiskScore: number;
  imageAnalysis: ImageAnalysis;
  badgeSuggestion?: BadgeSuggestion;
  views: number;
  inquiryCount: number;
};

/**
 * Predefined listing scenarios for realistic time-based data
 */
export const LISTING_SCENARIOS: ListingScenario[] = [
  // Recently approved with excellent evidence
  {
    createdDaysAgo: 45,
    status: 'approved',
    approvedDaysAgo: 42,
    badge: 'TrustedSignal',
    hasEvidence: true,
    evidenceQuality: 'excellent',
    aiRiskScore: 5,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Property images show consistent quality and recent timestamps. No suspicious patterns detected.'
    },
    badgeSuggestion: {
      badge: 'TrustedSignal',
      reason: 'Complete documentation: verified title deed, recent survey map, and rate clearance certificate. All documents verified authentic by AI analysis.'
    },
    views: 234,
    inquiryCount: 18
  },
  // Approved with good evidence
  {
    createdDaysAgo: 30,
    status: 'approved',
    approvedDaysAgo: 27,
    badge: 'EvidenceReviewed',
    hasEvidence: true,
    evidenceQuality: 'good',
    aiRiskScore: 15,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Images appear authentic. Minor quality variance detected but within acceptable range.'
    },
    badgeSuggestion: {
      badge: 'EvidenceReviewed',
      reason: 'Title deed and survey map provided. Documents appear genuine. Minor discrepancies in survey coordinate notation.'
    },
    views: 187,
    inquiryCount: 12
  },
  // Recently created, pending review
  {
    createdDaysAgo: 2,
    status: 'pending',
    badge: null,
    hasEvidence: true,
    evidenceQuality: 'good',
    aiRiskScore: 20,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Property images await manual review. Preliminary AI analysis shows no immediate red flags.'
    },
    badgeSuggestion: {
      badge: 'EvidenceReviewed',
      reason: 'Initial AI review suggests evidence is legitimate. Recommend manual admin verification.'
    },
    views: 8,
    inquiryCount: 1
  },
  // Old listing with evidence submitted badge
  {
    createdDaysAgo: 60,
    status: 'approved',
    approvedDaysAgo: 58,
    badge: 'EvidenceSubmitted',
    hasEvidence: true,
    evidenceQuality: 'fair',
    aiRiskScore: 35,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Images are of lower quality but appear to be authentic property photos.'
    },
    badgeSuggestion: {
      badge: 'EvidenceSubmitted',
      reason: 'Evidence provided but quality concerns: scanned documents lack clarity. Recommend requesting higher resolution copies.'
    },
    views: 412,
    inquiryCount: 25
  },
  // Suspicious listing flagged
  {
    createdDaysAgo: 15,
    status: 'pending',
    badge: null,
    hasEvidence: true,
    evidenceQuality: 'poor',
    aiRiskScore: 75,
    imageAnalysis: {
      isSuspicious: true,
      reason: 'Warning: Images match previously flagged listings. Possible duplication detected. Metadata shows inconsistent timestamps.'
    },
    badgeSuggestion: {
      badge: 'Suspicious',
      reason: 'AI analysis flagged this listing: Uploaded documents appear to be digitally altered. Recommend thorough manual verification before approval.'
    },
    views: 45,
    inquiryCount: 2
  },
  // Rejected listing
  {
    createdDaysAgo: 20,
    status: 'rejected',
    rejectedDaysAgo: 18,
    badge: null,
    hasEvidence: true,
    evidenceQuality: 'poor',
    aiRiskScore: 85,
    imageAnalysis: {
      isSuspicious: true,
      reason: 'Critical: Stock photos detected. Images sourced from public internet databases, not original property photos.'
    },
    badgeSuggestion: {
      badge: 'Suspicious',
      reason: 'Evidence documents do not match property details. Title deed shows different parcel number than survey map.'
    },
    views: 12,
    inquiryCount: 0
  },
  // No evidence yet, pending
  {
    createdDaysAgo: 5,
    status: 'pending',
    badge: null,
    hasEvidence: false,
    evidenceQuality: 'none',
    aiRiskScore: 50,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Listing awaiting evidence submission. Standard property images provided.'
    },
    views: 23,
    inquiryCount: 3
  },
  // Very popular approved listing
  {
    createdDaysAgo: 90,
    status: 'approved',
    approvedDaysAgo: 87,
    badge: 'TrustedSignal',
    hasEvidence: true,
    evidenceQuality: 'excellent',
    aiRiskScore: 3,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'High-quality property images with proper geotagging. Location verified via satellite imagery cross-reference.'
    },
    badgeSuggestion: {
      badge: 'TrustedSignal',
      reason: 'Outstanding documentation quality. All required evidence verified. Property ownership confirmed through land registry API integration.'
    },
    views: 1247,
    inquiryCount: 89
  },
  // Moderate quality listing
  {
    createdDaysAgo: 12,
    status: 'approved',
    approvedDaysAgo: 9,
    badge: 'EvidenceReviewed',
    hasEvidence: true,
    evidenceQuality: 'good',
    aiRiskScore: 18,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Images consistent with property description. No manipulation detected.'
    },
    badgeSuggestion: {
      badge: 'EvidenceReviewed',
      reason: 'Title deed verified. Survey map provided matches land registry records with minor coordinate variance.'
    },
    views: 95,
    inquiryCount: 7
  },
  // Brand new listing
  {
    createdDaysAgo: 0,
    status: 'pending',
    badge: null,
    hasEvidence: false,
    evidenceQuality: 'none',
    aiRiskScore: 50,
    imageAnalysis: {
      isSuspicious: false,
      reason: 'Newly created listing. Awaiting evidence upload and admin review.'
    },
    views: 2,
    inquiryCount: 0
  }
];

/**
 * Generate realistic listing description based on property details
 */
const generateListingDescription = (
  landType: string,
  county: string,
  location: string,
  area: number,
  scenario: ListingScenario
): string => {
  const descriptions: Record<string, string[]> = {
    Agricultural: [
      `Prime ${area}-acre ${landType.toLowerCase()} land located in ${location}, ${county}. The property features fertile red soil ideal for maize, beans, and vegetables. Water access available via borehole. Perfect for both commercial and subsistence farming.`,
      `${area} acres of productive agricultural land in ${location}. Gently sloping terrain with excellent drainage. Previous successful harvests documented. Close to main road for easy transport of produce to market.`,
      `Expansive ${area}-acre farm in the heart of ${county}. Rich soil tested and certified for organic farming. Nearby river provides natural irrigation. Suitable for dairy farming, crop cultivation, or mixed farming.`
    ],
    Residential: [
      `Beautiful ${area}-acre residential plot in ${location}, ${county}. Ideal for building your dream home. The area is rapidly developing with good infrastructure including tarmac roads, electricity, and piped water.`,
      `Spacious residential land parcel in serene ${location}. This ${area}-acre plot offers stunning views and a peaceful environment. Perfect for family home or gated community development. All amenities nearby.`,
      `Prime residential plot in the highly sought-after ${location} area of ${county}. ${area} acres with clean title deed ready for transfer. Mature trees and natural landscaping. Security and access roads in place.`
    ],
    Commercial: [
      `Strategic ${area}-acre commercial plot along the busy ${location} corridor. High visibility location with excellent foot and vehicle traffic. Perfect for retail, office, or mixed-use development.`,
      `Premium commercial land in ${location}, ${county}. ${area} acres with frontage on main road. Ideal for shopping complex, petrol station, or warehouse. All utilities available at site boundary.`,
      `Rare commercial property opportunity in the heart of ${location}. ${area} acres with proper zoning approvals. Close to transport hubs and residential estates. High ROI potential.`
    ],
    'Mixed-Use': [
      `Versatile ${area}-acre mixed-use property in ${location}. Zoned for both residential and commercial development. Excellent investment opportunity with multiple income potential. Clean documents.`,
      `${area} acres of strategically located land in growing ${location} area. Perfect for mixed-use development - shops, apartments, and offices. Increasing property values in the neighborhood.`
    ]
  };

  const typeDescriptions = descriptions[landType] || descriptions.Agricultural;
  let description = randomPick(typeDescriptions);

  // Add context based on evidence quality
  if (scenario.badge === 'TrustedSignal') {
    description += '\n\n✅ VERIFIED PROPERTY: All ownership documents have been thoroughly reviewed and verified by Kenya Land Trust. Title deed confirmed authentic with land registry.';
  } else if (scenario.badge === 'EvidenceReviewed') {
    description += '\n\n✓ Evidence Reviewed: Property documents have been submitted and reviewed. Ready for viewing and purchase.';
  } else if (scenario.badge === 'EvidenceSubmitted') {
    description += '\n\nEvidence documents have been submitted for this property. Currently under review.';
  }

  return description;
};

/**
 * Generate comprehensive mock listing
 */
export const generateMockListing = (
  listingId: string,
  ownerId: string,
  ownerName: string,
  ownerAvatar: string,
  scenario: ListingScenario
): Omit<Listing, 'createdAt' | 'updatedAt' | 'adminReviewedAt'> & {
  createdAt: Date;
  updatedAt: Date;
  adminReviewedAt?: Date;
} => {
  const locationData = getRandomCounty();
  const landType = randomPick(KENYAN_LAND_TYPES);
  const area = faker.number.int({ min: 0.25, max: 100 });
  const pricePerAcre = faker.number.int({ min: 500000, max: 5000000 });
  const price = Math.round(area * pricePerAcre);

  // Get random placeholder images
  const imageCount = faker.number.int({ min: 1, max: 4 });
  const images: ListingImage[] = [];
  for (let i = 0; i < imageCount; i++) {
    const placeholderImage = randomPick(PlaceHolderImages);
    images.push({
      url: placeholderImage.imageUrl,
      hint: placeholderImage.imageHint
    });
  }

  const createdAt = daysAgo(scenario.createdDaysAgo);
  const updatedAt = daysAgo(Math.max(scenario.createdDaysAgo - 1, 0));
  
  let adminReviewedAt: Date | undefined;
  if (scenario.approvedDaysAgo !== undefined) {
    adminReviewedAt = daysAgo(scenario.approvedDaysAgo);
  } else if (scenario.rejectedDaysAgo !== undefined) {
    adminReviewedAt = daysAgo(scenario.rejectedDaysAgo);
  }

  const listing: Omit<Listing, 'createdAt' | 'updatedAt' | 'adminReviewedAt'> & {
    createdAt: Date;
    updatedAt: Date;
    adminReviewedAt?: Date;
  } = {
    id: listingId,
    ownerId: ownerId,
    title: `${area} ${area === 1 ? 'Acre' : 'Acres'} ${landType} Land in ${locationData.location}`,
    description: generateListingDescription(landType, locationData.county, locationData.location, area, scenario),
    price: price,
    location: locationData.location,
    county: locationData.county,
    area: area,
    size: randomPick(KENYAN_PLOT_SIZES),
    landType: landType,
    latitude: locationData.lat,
    longitude: locationData.lng,
    isApproximateLocation: faker.datatype.boolean(0.3), // 30% approximate
    status: scenario.status,
    seller: {
      name: ownerName,
      avatarUrl: ownerAvatar
    },
    evidence: [], // Will be populated by evidence generator
    images: images,
    createdAt: createdAt,
    updatedAt: updatedAt,
    adminReviewedAt: adminReviewedAt,
    rejectionReason: scenario.status === 'rejected' 
      ? 'Evidence documents do not match property details. Please resubmit with correct documentation.'
      : undefined,
    adminNotes: scenario.status === 'approved' 
      ? `Reviewed and verified. Badge: ${scenario.badge}. Risk score: ${scenario.aiRiskScore}`
      : scenario.status === 'rejected'
      ? 'Suspicious activity detected. Documents appear fraudulent.'
      : 'Awaiting review',
    imageAnalysis: scenario.imageAnalysis,
    badgeSuggestion: scenario.badgeSuggestion,
    aiRiskScore: scenario.aiRiskScore,
    badge: scenario.badge,
    views: scenario.views,
    inquiryCount: scenario.inquiryCount
  };

  return listing;
};

/**
 * Generate multiple listings for a seller
 */
export const generateSellerListings = (
  sellerId: string,
  sellerName: string,
  sellerAvatar: string,
  count: number
): (Omit<Listing, 'createdAt' | 'updatedAt' | 'adminReviewedAt'> & {
  createdAt: Date;
  updatedAt: Date;
  adminReviewedAt?: Date;
})[] => {
  const listings: (Omit<Listing, 'createdAt' | 'updatedAt' | 'adminReviewedAt'> & {
    createdAt: Date;
    updatedAt: Date;
    adminReviewedAt?: Date;
  })[] = [];

  for (let i = 0; i < count; i++) {
    // Cycle through scenarios or pick random
    const scenario = LISTING_SCENARIOS[i % LISTING_SCENARIOS.length];
    const listingId = `listing-${sellerId}-${i}`;
    
    const listing = generateMockListing(
      listingId,
      sellerId,
      sellerName,
      sellerAvatar,
      scenario
    );
    
    listings.push(listing);
  }

  return listings;
};

/**
 * Get scenario by status for targeted generation
 */
export const getScenarioByStatus = (status: ListingStatus): ListingScenario => {
  const scenarios = LISTING_SCENARIOS.filter(s => s.status === status);
  return randomPick(scenarios);
};
