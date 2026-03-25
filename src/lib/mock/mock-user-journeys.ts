/**
 * Mock User Journeys - Complete user personas with realistic behavior patterns
 */
import type { UserProfile } from '../types';
import { 
  generateKenyanName, 
  generateKenyanPhone, 
  KENYAN_BUSINESS_NAMES,
  randomPick 
} from './kenya-data';

export type UserJourney = {
  profile: Omit<UserProfile, 'createdAt'>;
  behavior: {
    lastLoginDays: number; // Days since last login
    activityLevel: 'high' | 'medium' | 'low';
    preferredCounties?: string[];
    budgetRange?: { min: number; max: number };
  };
};

/**
 * BUYER Personas - Users looking for land
 */
export const MOCK_BUYERS: UserJourney[] = [
  {
    profile: {
      uid: 'buyer-young-professional',
      email: 'kamau.tech@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer1',
      phone: generateKenyanPhone(),
      bio: 'Software engineer looking for investment property in Nairobi outskirts',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
      preferredCounties: ['Nairobi', 'Kiambu', 'Kajiado'],
      budgetRange: { min: 2000000, max: 5000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-family-home',
      email: 'wanjiku.home@yahoo.com',
      displayName: generateKenyanName('female'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer2',
      phone: generateKenyanPhone(),
      bio: 'Looking for residential plot to build family home',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 2,
      activityLevel: 'high',
      preferredCounties: ['Machakos', 'Kiambu', 'Kajiado'],
      budgetRange: { min: 1000000, max: 3000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-farmer',
      email: 'kipchoge.agri@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer3',
      phone: generateKenyanPhone(),
      bio: 'Agricultural investor seeking fertile land for commercial farming',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 5,
      activityLevel: 'medium',
      preferredCounties: ['Nakuru', 'Uasin Gishu', 'Kericho', 'Trans Nzoia'],
      budgetRange: { min: 5000000, max: 20000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-diaspora',
      email: 'otieno.diaspora@outlook.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer4',
      phone: generateKenyanPhone(),
      bio: 'Based in USA, investing back home in Kenya. Looking for verified properties.',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 7,
      activityLevel: 'medium',
      preferredCounties: ['Nairobi', 'Mombasa', 'Nakuru'],
      budgetRange: { min: 3000000, max: 10000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-first-time',
      email: 'nyambura.first@gmail.com',
      displayName: generateKenyanName('female'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer5',
      phone: generateKenyanPhone(),
      bio: 'First-time land buyer, need guidance and verified listings',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 3,
      activityLevel: 'high',
      preferredCounties: ['Kiambu', 'Machakos'],
      budgetRange: { min: 500000, max: 2000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-investor-group',
      email: 'ochieng.invest@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer6',
      phone: generateKenyanPhone(),
      bio: 'Investment group representative looking for commercial plots',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
      preferredCounties: ['Nairobi', 'Mombasa', 'Kisumu'],
      budgetRange: { min: 10000000, max: 50000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-retirement',
      email: 'mwangi.retire@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer7',
      phone: generateKenyanPhone(),
      bio: 'Planning retirement home in peaceful countryside',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 10,
      activityLevel: 'low',
      preferredCounties: ['Nyeri', 'Laikipia', 'Nanyuki'],
      budgetRange: { min: 2000000, max: 6000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-coastal-property',
      email: 'akinyi.coast@gmail.com',
      displayName: generateKenyanName('female'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer8',
      phone: generateKenyanPhone(),
      bio: 'Looking for beachfront or near-beach property for vacation home',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 4,
      activityLevel: 'medium',
      preferredCounties: ['Mombasa', 'Kilifi'],
      budgetRange: { min: 5000000, max: 15000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-corporate',
      email: 'corporate@kenyacorp.co.ke',
      displayName: 'Kenya Corp Ltd',
      photoURL: 'https://i.pravatar.cc/150?u=buyer9',
      phone: generateKenyanPhone(),
      bio: 'Corporate buyer looking for industrial land parcels',
      role: 'BUYER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 2,
      activityLevel: 'high',
      preferredCounties: ['Nairobi', 'Kiambu', 'Machakos'],
      budgetRange: { min: 20000000, max: 100000000 }
    }
  },
  {
    profile: {
      uid: 'buyer-casual-browser',
      email: 'cheptoo.browse@gmail.com',
      displayName: generateKenyanName('female'),
      photoURL: 'https://i.pravatar.cc/150?u=buyer10',
      phone: generateKenyanPhone(),
      bio: 'Browsing options for future investment',
      role: 'BUYER',
      verified: false,
    },
    behavior: {
      lastLoginDays: 15,
      activityLevel: 'low',
      preferredCounties: [],
      budgetRange: { min: 500000, max: 3000000 }
    }
  }
];

/**
 * SELLER Personas - Property owners and agents
 */
export const MOCK_SELLERS: UserJourney[] = [
  {
    profile: {
      uid: 'seller-amani-properties',
      email: 'info@amaniproperties.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller1',
      phone: generateKenyanPhone(),
      bio: 'Licensed real estate agency with 10+ years of experience. Specializing in verified properties.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 0,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-baraka-lands',
      email: 'sales@barakalands.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller2',
      phone: generateKenyanPhone(),
      bio: 'Trusted land sellers in Rift Valley region. All properties with clean title deeds.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-private-owner-1',
      email: 'kariuki.lands@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=seller3',
      phone: generateKenyanPhone(),
      bio: 'Private land owner selling inherited property in Kiambu',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 3,
      activityLevel: 'medium',
    }
  },
  {
    profile: {
      uid: 'seller-coast-realty',
      email: 'info@coastrealty.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller4',
      phone: generateKenyanPhone(),
      bio: 'Coastal property specialists. Beach plots, vacation homes, and investment land.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-agri-ventures',
      email: 'contact@agriventures.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller5',
      phone: generateKenyanPhone(),
      bio: 'Agricultural land specialists. Large parcels for commercial farming.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 2,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-private-owner-2',
      email: 'wanjiru.property@gmail.com',
      displayName: generateKenyanName('female'),
      photoURL: 'https://i.pravatar.cc/150?u=seller6',
      phone: generateKenyanPhone(),
      bio: 'Selling family land in Machakos. Clean documents available.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 5,
      activityLevel: 'medium',
    }
  },
  {
    profile: {
      uid: 'seller-metro-estates',
      email: 'sales@metroestates.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller7',
      phone: generateKenyanPhone(),
      bio: 'Nairobi metropolitan area specialists. Residential and commercial plots.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 0,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-highland-ventures',
      email: 'info@highlandventures.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller8',
      phone: generateKenyanPhone(),
      bio: 'Selling premium properties in Central Kenya highlands.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 2,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-new-agent',
      email: 'mutua.newagent@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=seller9',
      phone: generateKenyanPhone(),
      bio: 'New real estate agent building portfolio',
      role: 'SELLER',
      verified: false,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'medium',
    }
  },
  {
    profile: {
      uid: 'seller-lakeside-properties',
      email: 'contact@lakesideproperties.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller10',
      phone: generateKenyanPhone(),
      bio: 'Specializing in lakeside and waterfront properties in Nyanza region',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-rift-valley-lands',
      email: 'sales@riftvalleylands.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller11',
      phone: generateKenyanPhone(),
      bio: 'Large agricultural parcels in Rift Valley. Tea, coffee, and maize farms.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-urban-plots',
      email: 'info@urbanplots.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller12',
      phone: generateKenyanPhone(),
      bio: 'Residential plots in upcoming estates around major towns',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 0,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-investment-properties',
      email: 'invest@investproperties.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller13',
      phone: generateKenyanPhone(),
      bio: 'Commercial and investment-grade properties. High ROI opportunities.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 1,
      activityLevel: 'high',
    }
  },
  {
    profile: {
      uid: 'seller-family-estate',
      email: 'njoroge.estate@gmail.com',
      displayName: generateKenyanName('male'),
      photoURL: 'https://i.pravatar.cc/150?u=seller14',
      phone: generateKenyanPhone(),
      bio: 'Subdividing family land for sale. Multiple plots available.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 4,
      activityLevel: 'medium',
    }
  },
  {
    profile: {
      uid: 'seller-affordable-homes',
      email: 'affordable@homeskenya.co.ke',
      displayName: randomPick(KENYAN_BUSINESS_NAMES),
      photoURL: 'https://i.pravatar.cc/150?u=seller15',
      phone: generateKenyanPhone(),
      bio: 'Affordable plots for low and middle-income families. Flexible payment plans.',
      role: 'SELLER',
      verified: true,
    },
    behavior: {
      lastLoginDays: 0,
      activityLevel: 'high',
    }
  }
];

/**
 * ADMIN Persona
 */
export const MOCK_ADMIN: UserJourney = {
  profile: {
    uid: 'admin-main',
    email: 'admin@kenyalandtrust.co.ke',
    displayName: 'Admin User',
    photoURL: 'https://i.pravatar.cc/150?u=admin',
    phone: generateKenyanPhone(),
    bio: 'Platform administrator responsible for listing verification and moderation',
    role: 'ADMIN',
    verified: true,
  },
  behavior: {
    lastLoginDays: 0,
    activityLevel: 'high',
  }
};

/**
 * Get all mock users
 */
export const getAllMockUsers = (): UserJourney[] => {
  return [...MOCK_BUYERS, ...MOCK_SELLERS, MOCK_ADMIN];
};

/**
 * Get users by role
 */
export const getMockUsersByRole = (role: 'BUYER' | 'SELLER' | 'ADMIN'): UserJourney[] => {
  if (role === 'ADMIN') return [MOCK_ADMIN];
  if (role === 'BUYER') return MOCK_BUYERS;
  if (role === 'SELLER') return MOCK_SELLERS;
  return [];
};
