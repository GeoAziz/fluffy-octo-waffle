import type { Listing } from './types';

// In-memory store for listings. In a real app, this would be a database.
let listings: Listing[] = [
  {
    id: '1',
    title: '5 Acres in Kitengela',
    location: 'Kitengela, Kajiado County',
    price: 5_500_000,
    description:
      'A prime 5-acre parcel of land in the fast-growing area of Kitengela. Ideal for residential development or speculation. The property has access to water and electricity and is located just 2km from the main road. Clean title deed available for inspection.',
    image: 'https://picsum.photos/seed/land1/600/400',
    imageHint: 'kenya landscape',
    badge: 'TrustedSignal',
    seller: {
      name: 'Amina Biwott',
      avatarUrl: 'https://i.pravatar.cc/150?u=amina',
    },
    evidence: [
      {
        id: 'e1-1',
        name: 'TitleDeed_KJD_123.pdf',
        url: '#',
        content: 'Official title deed for parcel KJD/KITENGELA/123 registered to Amina Biwott. Dimensions are 200m x 101m, totaling 5 acres. No encumbrances listed as of Jan 2023.',
      },
      {
        id: 'e1-2',
        name: 'SurveyMap_456.pdf',
        url: '#',
        content: 'Official survey map from Survey of Kenya, reference number 456. Confirms boundary markers and dimensions of the KJD/KITENGELA/123 property.',
      },
    ],
  },
  {
    id: '2',
    title: '1/4 Acre Plot in Ruiru',
    location: 'Ruiru, Kiambu County',
    price: 3_200_000,
    description:
      'A beautiful quarter-acre plot in a controlled development estate in Ruiru. Perfect for building a family home. The area is well-developed with good schools and amenities nearby.',
    image: 'https://picsum.photos/seed/land4/600/400',
    imageHint: 'suburban plot',
    badge: 'EvidenceReviewed',
    seller: {
      name: 'James Mwangi',
      avatarUrl: 'https://i.pravatar.cc/150?u=james',
    },
    evidence: [
      {
        id: 'e2-1',
        name: 'Title_RUIRU_789.pdf',
        url: '#',
        content: 'Title deed for RUIRU/BLOCK5/789. Registered owner is James Mwangi. The plot size is 0.25 acres. Awaiting final review.',
      },
    ],
  },
  {
    id: '3',
    title: '10 Acres Agricultural Land',
    location: 'Naivasha, Nakuru County',
    price: 8_900_000,
    description:
      'Fertile 10-acre agricultural land near Lake Naivasha. Suitable for farming flowers, vegetables, or for dairy farming. Rich volcanic soil and good rainfall.',
    image: 'https://picsum.photos/seed/land2/600/400',
    imageHint: 'farmland kenya',
    badge: 'EvidenceSubmitted',
    seller: {
      name: 'Fatuma Aden',
      avatarUrl: 'https://i.pravatar.cc/150?u=fatuma',
    },
    evidence: [],
  },
  {
    id: '4',
    title: 'Beach Plot in Diani',
    location: 'Diani, Kwale County',
    price: 15_000_000,
    description:
      'Stunning 1-acre beach plot with direct access to the white sandy beaches of Diani. Perfect for a holiday home or a boutique hotel. This is a rare opportunity to own a piece of paradise.',
    image: 'https://picsum.photos/seed/land7/600/400',
    imageHint: 'coastal land',
    badge: 'None',
    seller: {
      name: 'David Ochieng',
      avatarUrl: 'https://i.pravatar.cc/150?u=david',
    },
    evidence: [],
  },
  {
    id: '5',
    title: 'Plot with Great Views',
    location: 'Rift Valley',
    price: 2_100_000,
    description: 'Half-acre plot with spectacular views of the Great Rift Valley. The documents seem a bit inconsistent, but the seller assures us everything is in order. Buyer to verify.',
    image: 'https://picsum.photos/seed/land8/600/400',
    imageHint: 'rift valley',
    badge: 'Suspicious',
    seller: {
      name: 'Unknown Seller',
      avatarUrl: 'https://i.pravatar.cc/150?u=unknown',
    },
    evidence: [
      {
        id: 'e5-1',
        name: 'SalesAgreement_2020.pdf',
        url: '#',
        content: 'A sales agreement from 2020. The buyer name is different from the current seller. The signature is blurry.',
      },
      {
        id: 'e5-2',
        name: 'Handdrawn_Map.jpg',
        url: '#',
        content: 'A hand-drawn map of the property. No official markings or stamps are visible.',
      },
    ],
  },
  {
    id: '6',
    title: 'Commercial Plot in Westlands',
    location: 'Westlands, Nairobi',
    price: 45_000_000,
    description: 'Prime 0.5-acre commercial plot in the heart of Westlands. Suitable for high-rise apartments or office blocks. All documents have been submitted for verification.',
    image: 'https://picsum.photos/seed/land3/600/400',
    imageHint: 'aerial land',
    badge: 'EvidenceSubmitted',
    seller: {
      name: 'Capital Developers Ltd',
      avatarUrl: 'https://i.pravatar.cc/150?u=capitaldev',
    },
    evidence: [
      {
        id: 'e6-1',
        name: 'Title_Westlands_XYZ.pdf',
        url: '#',
        content: 'Title deed for a commercial plot in Westlands. Ownership is listed as Capital Developers Ltd.',
      },
    ],
  },
];

// Simulate a database read
export async function getListings(): Promise<Listing[]> {
  // In a real app, you'd fetch from a database
  return Promise.resolve(listings);
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  return Promise.resolve(listings.find((listing) => listing.id === id));
}

// Simulate a database write
export async function updateListing(updatedListing: Listing): Promise<Listing> {
  listings = listings.map((listing) =>
    listing.id === updatedListing.id ? updatedListing : listing
  );
  return Promise.resolve(updatedListing);
}

export async function addListing(newListing: Omit<Listing, 'id'>): Promise<Listing> {
  const listing: Listing = {
    id: (listings.length + 1).toString(),
    ...newListing,
  };
  listings.push(listing);
  return Promise.resolve(listing);
}
