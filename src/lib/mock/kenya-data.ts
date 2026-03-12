/**
 * Realistic Kenyan data for mock generation
 * Includes names, counties, phone formats, and location data
 */

export const KENYAN_FIRST_NAMES = {
  male: [
    'Kamau', 'Mwangi', 'Otieno', 'Ochieng', 'Kipchoge', 'Kimani', 'Njoroge', 
    'Wanjiru', 'Kariuki', 'Mutua', 'Kiptoo', 'Kiprono', 'Baraka', 'Amani',
    'Juma', 'Abdalla', 'Hassan', 'Omar', 'Ali', 'Mohammed', 'Kiplagat',
    'Korir', 'Rotich', 'Cheruiyot', 'Biwott', 'Githinji', 'Githuku', 'Ndung\'u',
    'Omondi', 'Onyango', 'Okoth', 'Owino', 'Odhiambo', 'Achieng', 'Ogola'
  ],
  female: [
    'Njeri', 'Wanjiku', 'Nyambura', 'Wangari', 'Akinyi', 'Atieno', 'Adhiambo',
    'Cheptoo', 'Cherotich', 'Jepkosgei', 'Wambui', 'Wairimu', 'Muthoni',
    'Nyokabi', 'Wangui', 'Chausiku', 'Amina', 'Fatuma', 'Halima', 'Zainab',
    'Mumbi', 'Syokau', 'Nduku', 'Mueni', 'Kavata', 'Moraa', 'Kerubo', 'Nyaboke'
  ]
};

export const KENYAN_LAST_NAMES = [
  'Kamau', 'Mwangi', 'Njoroge', 'Wanjiku', 'Kariuki', 'Kimani', 'Muriuki',
  'Otieno', 'Ochieng', 'Omondi', 'Onyango', 'Okoth', 'Owino', 'Odhiambo',
  'Kipchoge', 'Rotich', 'Korir', 'Kiplagat', 'Cheruiyot', 'Biwott', 'Kiptoo',
  'Mutua', 'Muema', 'Musyoka', 'Mwende', 'Nduku', 'Kituku', 'Kilonzo',
  'Abubakar', 'Hassan', 'Omar', 'Ali', 'Mohammed', 'Abdalla', 'Salim',
  'Githinji', 'Githuku', 'Ndung\'u', 'Ndegwa', 'Waweru', 'Kinyanjui', 'Njuguna'
];

export const KENYAN_BUSINESS_NAMES = [
  'Amani Properties', 'Baraka Lands', 'Trustland Kenya', 'Safari Estates',
  'Green Plains Properties', 'Highland Ventures', 'Makao Properties',
  'Nyumbani Estates', 'Rift Valley Lands', 'Coast Properties Ltd',
  'Metro Realty', 'Prime Acres', 'Uzalendo Properties', 'Taifa Lands',
  'Jamii Estates', 'Upendo Properties', 'Tumaini Lands', 'Maarifa Ventures',
  'Shamba Properties', 'Ardhi Realty', 'Kilimo Lands', 'Uhuru Estates',
  'Kijani Properties', 'Busara Realty', 'Furaha Lands', 'Hakika Properties'
];

// All 47 Kenyan counties with realistic locations
export const KENYAN_COUNTIES: Record<string, { locations: string[]; coords: { lat: number; lng: number } }> = {
  'Nairobi': {
    locations: ['Karen', 'Runda', 'Lavington', 'Westlands', 'Kilimani', 'Kileleshwa', 'Muthaiga', 'Spring Valley', 'Kitisuru', 'Riverside', 'Ruaka', 'Kahawa', 'Utawala', 'Syokimau', 'Embakasi', 'Kasarani', 'Ngong Road', 'Dagoretti'],
    coords: { lat: -1.2921, lng: 36.8219 }
  },
  'Mombasa': {
    locations: ['Nyali', 'Bamburi', 'Shanzu', 'Diani', 'Likoni', 'Mtwapa', 'Kilifi', 'Old Town', 'Changamwe', 'Tudor', 'Buxton'],
    coords: { lat: -4.0435, lng: 39.6682 }
  },
  'Kisumu': {
    locations: ['Milimani', 'Riat Hills', 'Mamboleo', 'Migosi', 'Tom Mboya', 'Nyalenda', 'Kondele', 'Manyatta'],
    coords: { lat: -0.0917, lng: 34.7680 }
  },
  'Nakuru': {
    locations: ['Milimani', 'Naka', 'Lanet', 'Bahati', 'Njoro', 'Pipeline', 'Shabab', 'Section 58', 'Free Area'],
    coords: { lat: -0.3031, lng: 36.0800 }
  },
  'Kajiado': {
    locations: ['Kitengela', 'Isinya', 'Ngong', 'Rongai', 'Kiserian', 'Kajiado Town', 'Namanga', 'Bissil', 'Sultan Hamud'],
    coords: { lat: -1.8524, lng: 36.7767 }
  },
  'Kiambu': {
    locations: ['Ruiru', 'Thika', 'Kikuyu', 'Juja', 'Limuru', 'Kiambu Town', 'Karuri', 'Banana', 'Ruaka', 'Githunguri', 'Gatundu'],
    coords: { lat: -1.1714, lng: 36.8356 }
  },
  'Machakos': {
    locations: ['Syokimau', 'Athi River', 'Mlolongo', 'Machakos Town', 'Kangundo', 'Matungulu', 'Tala', 'Kathiani'],
    coords: { lat: -1.5177, lng: 37.2634 }
  },
  'Uasin Gishu': {
    locations: ['Eldoret Town', 'Kapsoya', 'Elgon View', 'Pioneer', 'Langas', 'West Indies', 'Huruma', 'Kimumu'],
    coords: { lat: 0.5143, lng: 35.2698 }
  },
  'Kilifi': {
    locations: ['Kilifi Town', 'Malindi', 'Watamu', 'Mtwapa', 'Takaungu', 'Kanamai', 'Vipingo'],
    coords: { lat: -3.6309, lng: 39.8499 }
  },
  'Kakamega': {
    locations: ['Kakamega Town', 'Mumias', 'Butere', 'Khayega', 'Shikusa', 'Lurambi'],
    coords: { lat: 0.2827, lng: 34.7519 }
  },
  'Turkana': {
    locations: ['Lodwar', 'Kakuma', 'Lokichogio', 'Kalokol'],
    coords: { lat: 3.1210, lng: 35.5977 }
  },
  'Nyeri': {
    locations: ['Nyeri Town', 'Karatina', 'Nanyuki', 'Othaya', 'Mukurweini'],
    coords: { lat: -0.4197, lng: 36.9475 }
  },
  'Trans Nzoia': {
    locations: ['Kitale', 'Kiminini', 'Endebess', 'Saboti'],
    coords: { lat: 1.0153, lng: 34.9592 }
  },
  'Nandi': {
    locations: ['Kapsabet', 'Mosoriot', 'Nandi Hills', 'Kobujoi'],
    coords: { lat: 0.1839, lng: 35.1315 }
  },
  'Laikipia': {
    locations: ['Nanyuki', 'Nyahururu', 'Rumuruti', 'Doldol'],
    coords: { lat: 0.3556, lng: 36.7820 }
  },
  'Bungoma': {
    locations: ['Bungoma Town', 'Webuye', 'Kimilili', 'Sirisia'],
    coords: { lat: 0.5635, lng: 34.5606 }
  },
  'Meru': {
    locations: ['Meru Town', 'Maua', 'Nkubu', 'Timau', 'Githongo'],
    coords: { lat: 0.0469, lng: 37.6505 }
  },
  'Embu': {
    locations: ['Embu Town', 'Runyenjes', 'Siakago', 'Kiritiri'],
    coords: { lat: -0.5312, lng: 37.4576 }
  },
  'Kericho': {
    locations: ['Kericho Town', 'Litein', 'Londiani', 'Fort Ternan'],
    coords: { lat: -0.3676, lng: 35.2836 }
  },
  'Bomet': {
    locations: ['Bomet Town', 'Sotik', 'Longisa', 'Mulot'],
    coords: { lat: -0.7804, lng: 35.3088 }
  }
};

// Generate realistic Kenyan phone numbers (+254...)
export const generateKenyanPhone = (): string => {
  const prefixes = ['710', '720', '722', '724', '729', '740', '741', '742', '743', '745', '746', '748', '757', '758', '759', '768', '769', '790', '791', '792', '793', '794', '795', '796', '797', '798', '799'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `+254${prefix}${suffix}`;
};

// Generate realistic Kenyan name
export const generateKenyanName = (gender?: 'male' | 'female'): string => {
  const genderChoice = gender || (Math.random() > 0.5 ? 'male' : 'female');
  const firstName = KENYAN_FIRST_NAMES[genderChoice][Math.floor(Math.random() * KENYAN_FIRST_NAMES[genderChoice].length)];
  const lastName = KENYAN_LAST_NAMES[Math.floor(Math.random() * KENYAN_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

// Get random county data
export const getRandomCounty = (): { county: string; location: string; lat: number; lng: number } => {
  const counties = Object.keys(KENYAN_COUNTIES);
  const county = counties[Math.floor(Math.random() * counties.length)];
  const countyData = KENYAN_COUNTIES[county];
  const location = countyData.locations[Math.floor(Math.random() * countyData.locations.length)];
  
  // Add slight random variance to coordinates
  const lat = countyData.coords.lat + (Math.random() - 0.5) * 0.1;
  const lng = countyData.coords.lng + (Math.random() - 0.5) * 0.1;
  
  return { county, location, lat, lng };
};

// Land types common in Kenya
export const KENYAN_LAND_TYPES = [
  'Agricultural',
  'Residential',
  'Commercial',
  'Mixed-Use',
  'Industrial',
  'Vacant Land',
  'Ranch',
  'Tea Farm',
  'Coffee Farm',
  'Dairy Farm'
];

// Common plot sizes in Kenya
export const KENYAN_PLOT_SIZES = [
  '40x60 ft',
  '50x100 ft',
  '100x100 ft',
  '1/8 Acre',
  '1/4 Acre',
  '1/2 Acre',
  '1 Acre',
  '2 Acres',
  '5 Acres',
  '10 Acres',
  '20 Acres',
  '50 Acres',
  '100 Acres',
  '200 Acres'
];

// Helper function to pick random item
export const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
