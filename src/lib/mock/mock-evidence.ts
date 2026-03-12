/**
 * Mock Evidence Documents Generator
 * Generates realistic evidence with quality ratings matching listing scenarios
 */
import { faker } from '@faker-js/faker';
import type { Evidence, EvidenceType } from '../types';
import type { ListingScenario } from './mock-listings';

/**
 * Generate timestamp X days ago
 */
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Generate realistic evidence content text for AI summarization
 */
const generateEvidenceContent = (type: EvidenceType, quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none'): string => {
  const contentTemplates: Record<EvidenceType, Record<string, string>> = {
    title_deed: {
      excellent: `REPUBLIC OF KENYA
LAND REGISTRATION ACT, 2012
TITLE NUMBER: LR NO. ${faker.number.int({ min: 10000, max: 99999 })}/${faker.number.int({ min: 100, max: 999 })}

This is to certify that the person(s) whose name(s) appear(s) below is/are the ABSOLUTE PROPRIETOR(S) of the parcel of land described below, together with appurtenances thereunto, subject to such encumbrances as may be endorsed hereon.

PROPRIETOR: ${faker.person.fullName()}
ID/PASSPORT: ${faker.number.int({ min: 10000000, max: 39999999 })}
PARCEL NUMBER: ${faker.company.buzzNoun().toUpperCase()}/${faker.number.int({ min: 1000, max: 9999 })}
AREA: ${faker.number.float({ min: 0.5, max: 100, precision: 0.01 })} HECTARES
LOCATION: ${faker.location.city()} Sub-County

Date of Registration: ${faker.date.past({ years: 5 }).toLocaleDateString()}
Registered by: Land Registrar, ${faker.location.county()}

All boundaries clearly demarcated and verified. No encumbrances registered.`,
      
      good: `TITLE DEED - LR NO. ${faker.number.int({ min: 10000, max: 99999 })}
Owner: ${faker.person.fullName()}
Area: ${faker.number.float({ min: 0.5, max: 50, precision: 0.01 })} Ha
Registration Date: ${faker.date.past({ years: 3 }).toLocaleDateString()}
Status: Clean title, no charges
Location verified by surveyor`,
      
      fair: `Title Deed Copy
LR Number: ${faker.number.int({ min: 10000, max: 99999 })}
Owner name partially visible
Registration details present but faded
Scan quality: Medium`,
      
      poor: `[Poorly scanned title deed document]
Some text illegible
Registration number: ${faker.number.int({ min: 1000, max: 9999 })}
Date unclear`,
      
      none: ''
    },
    
    survey_map: {
      excellent: `LICENSED SURVEYOR'S CERTIFICATE

Survey Reference: SRV/${faker.number.int({ min: 2020, max: 2024 })}/${faker.number.int({ min: 1000, max: 9999 })}

This is to certify that I have surveyed the parcel of land described below:

COORDINATES (UTM Zone 37S):
North-East Corner: E ${faker.location.longitude({ min: 34.0, max: 41.9, precision: 6 })}° N ${faker.location.latitude({ min: -4.7, max: 5.0, precision: 6 })}°
South-East Corner: E ${faker.location.longitude({ min: 34.0, max: 41.9, precision: 6 })}° N ${faker.location.latitude({ min: -4.7, max: 5.0, precision: 6 })}°
South-West Corner: E ${faker.location.longitude({ min: 34.0, max: 41.9, precision: 6 })}° N ${faker.location.latitude({ min: -4.7, max: 5.0, precision: 6 })}°
North-West Corner: E ${faker.location.longitude({ min: 34.0, max: 41.9, precision: 6 })}° N ${faker.location.latitude({ min: -4.7, max: 5.0, precision: 6 })}°

Total Area: ${faker.number.float({ min: 0.5, max: 100, precision: 0.01 })} Hectares (${faker.number.float({ min: 1, max: 247, precision: 0.01 })} Acres)

Boundaries: All beacons in place and verified
Access: Via public road, easement registered
Adjacent Parcels: Verified with land registry

Surveyed on: ${faker.date.recent({ days: 90 }).toLocaleDateString()}
Licensed Surveyor: ${faker.person.fullName()}
Registration No: LS/${faker.number.int({ min: 1000, max: 9999 })}`,

      good: `SURVEY MAP
Reference: ${faker.number.int({ min: 1000, max: 9999 })}
Area: ${faker.number.float({ min: 0.5, max: 50, precision: 0.01 })} Ha
Boundaries clearly marked
Coordinates provided
Surveyor: ${faker.person.lastName()}
Date: ${faker.date.recent({ days: 180 }).toLocaleDateString()}`,

      fair: `Survey document
Approximate area shown
Some coordinate marks visible
Boundary beacons mentioned
Scan quality: Fair`,

      poor: `[Survey map - poor quality scan]
Area estimate visible
Coordinates partially legible
Date unclear`,

      none: ''
    },

    id_document: {
      excellent: `KENYAN NATIONAL IDENTITY CARD (COPY)

ID Number: ${faker.number.int({ min: 10000000, max: 39999999 })}
Full Name: ${faker.person.fullName()}
Date of Birth: ${faker.date.birthdate({ min: 25, max: 70, mode: 'age' }).toLocaleDateString()}
Place of Birth: ${faker.location.city()}
District: ${faker.location.county()}
Issue Date: ${faker.date.past({ years: 10 }).toLocaleDateString()}

Document verified and authenticated
Serial Number visible
Card in good condition`,

      good: `ID Card Copy
Number: ${faker.number.int({ min: 10000000, max: 39999999 })}
Name: ${faker.person.fullName()}
DOB: ${faker.date.birthdate({ min: 25, max: 70, mode: 'age' }).toLocaleDateString()}
Clear and readable`,

      fair: `ID document copy
Number partially visible: ${faker.number.int({ min: 10000000, max: 39999999 })}
Name readable
Some details faded`,

      poor: `[ID card scan - poor quality]
Number: ${faker.number.int({ min: 10000, max: 99999 })}...
Details unclear`,

      none: ''
    },

    rate_clearance: {
      excellent: `COUNTY GOVERNMENT - LAND RATES CLEARANCE CERTIFICATE

Certificate No: RC/${faker.number.int({ min: 2020, max: 2024 })}/${faker.number.int({ min: 10000, max: 99999 })}

This is to certify that all land rates and charges due in respect of the property described below have been fully paid:

Property Reference: LR NO. ${faker.number.int({ min: 10000, max: 99999 })}/${faker.number.int({ min: 100, max: 999 })}
Owner: ${faker.person.fullName()}
Location: ${faker.location.city()}, ${faker.location.county()} County

Outstanding Balance: KSH 0.00
Last Payment Date: ${faker.date.recent({ days: 30 }).toLocaleDateString()}
Period Covered: January ${new Date().getFullYear() - 1} - December ${new Date().getFullYear()}

Status: RATES FULLY PAID - NO ARREARS

Issued on: ${faker.date.recent({ days: 15 }).toLocaleDateString()}
County Revenue Office
${faker.location.county()} County

This certificate is valid for 3 months from date of issue.`,

      good: `LAND RATES CLEARANCE
Certificate: RC/${faker.number.int({ min: 10000, max: 99999 })}
Property: LR ${faker.number.int({ min: 10000, max: 99999 })}
Status: All rates paid
Date: ${faker.date.recent({ days: 60 }).toLocaleDateString()}
Valid until: ${faker.date.soon({ days: 30 }).toLocaleDateString()}`,

      fair: `Rate clearance document
Property rates paid
Certificate reference visible
Some details unclear`,

      poor: `[Rates document - poor scan]
Payment mentioned
Reference partially visible`,

      none: ''
    },

    other: {
      excellent: `ADDITIONAL PROPERTY DOCUMENTATION

Document Type: ${faker.helpers.arrayElement(['Water Connection Certificate', 'Electricity Connection', 'Environmental Impact Assessment', 'Property Valuation Report', 'Soil Test Report'])}

Property Reference: ${faker.number.int({ min: 10000, max: 99999 })}
Date Issued: ${faker.date.recent({ days: 90 }).toLocaleDateString()}

${faker.lorem.paragraphs(2)}

Status: Valid and Current
Issuing Authority: ${faker.company.name()}
Official Stamp: Visible and Authentic`,

      good: `Additional Document
Type: ${faker.helpers.arrayElement(['Valuation', 'Survey Notes', 'Access Agreement'])}
Date: ${faker.date.recent({ days: 180 }).toLocaleDateString()}
Status: Valid`,

      fair: `Supporting document
Type mentioned
Date visible
Some information unclear`,

      poor: `[Additional document - poor quality]
Type unclear
Partial information visible`,

      none: ''
    }
  };

  return contentTemplates[type]?.[quality] || '';
};

/**
 * Generate evidence summary based on quality
 */
const generateEvidenceSummary = (type: EvidenceType, quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none'): string => {
  const summaries: Record<EvidenceType, Record<string, string>> = {
    title_deed: {
      excellent: 'Complete title deed document with clear ownership details, registration number, and official stamps. All information matches land registry records.',
      good: 'Title deed provided showing current ownership. Registration details visible and verifiable.',
      fair: 'Title deed copy submitted. Some details visible but document quality could be improved.',
      poor: 'Title deed scan of poor quality. Key details difficult to verify.',
      none: 'No title deed provided.'
    },
    survey_map: {
      excellent: 'Professional survey map with precise coordinates, boundary markers, and licensed surveyor certification. Recent survey with all standards met.',
      good: 'Survey map showing property boundaries and approximate coordinates. Surveyor details provided.',
      fair: 'Survey document submitted. Basic boundary information visible.',
      poor: 'Survey map of inadequate quality for proper verification.',
      none: 'No survey map provided.'
    },
    id_document: {
      excellent: 'Clear national ID copy with all details visible. Document authenticated and matches property owner records.',
      good: 'National ID card copy provided. Owner details clearly visible.',
      fair: 'ID document submitted with some details readable.',
      poor: 'ID document copy of poor quality.',
      none: 'No ID document provided.'
    },
    rate_clearance: {
      excellent: 'Current land rates clearance certificate showing no arrears. All county charges paid up to date. Certificate valid.',
      good: 'Rates clearance provided indicating payment is current.',
      fair: 'Rate clearance certificate submitted but validity unclear.',
      poor: 'Rates document of insufficient quality.',
      none: 'No rates clearance provided.'
    },
    other: {
      excellent: 'Additional supporting documentation provided enhancing property verification.',
      good: 'Supplementary documents submitted supporting ownership claim.',
      fair: 'Additional documentation provided.',
      poor: 'Extra documents of limited value due to quality.',
      none: 'No additional documents provided.'
    }
  };

  return summaries[type]?.[quality] || '';
};

/**
 * Generate checksum (simulated)
 */
const generateChecksum = (): string => {
  return faker.string.hexadecimal({ length: 64, prefix: '' });
};

/**
 * Generate evidence for a listing based on scenario
 */
export const generateListingEvidence = (
  listingId: string,
  ownerId: string,
  scenario: ListingScenario
): Evidence[] => {
  if (!scenario.hasEvidence || scenario.evidenceQuality === 'none') {
    return [];
  }

  const evidence: Evidence[] = [];
  const quality = scenario.evidenceQuality;
  const uploadedDaysAgo = faker.number.int({ min: scenario.createdDaysAgo - 2, max: scenario.createdDaysAgo });

  // Always generate title deed for listings with evidence
  evidence.push({
    id: `evidence-${listingId}-title-deed`,
    listingId: listingId,
    ownerId: ownerId,
    type: 'title_deed',
    name: `Title_Deed_LR_${faker.number.int({ min: 10000, max: 99999 })}.pdf`,
    storagePath: `/evidence/${listingId}/title_deed_${faker.string.alphanumeric(8)}.pdf`,
    uploadedAt: daysAgo(uploadedDaysAgo),
    summary: generateEvidenceSummary('title_deed', quality),
    content: generateEvidenceContent('title_deed', quality),
    verified: quality === 'excellent' || quality === 'good',
    checksum: generateChecksum(),
    url: `https://storage.googleapis.com/kenya-land-trust.appspot.com/evidence/${listingId}/title_deed.pdf`
  });

  // Add survey map for good and excellent quality
  if (quality === 'excellent' || quality === 'good' || quality === 'fair') {
    evidence.push({
      id: `evidence-${listingId}-survey-map`,
      listingId: listingId,
      ownerId: ownerId,
      type: 'survey_map',
      name: `Survey_Map_${faker.number.int({ min: 2020, max: 2024 })}.pdf`,
      storagePath: `/evidence/${listingId}/survey_map_${faker.string.alphanumeric(8)}.pdf`,
      uploadedAt: daysAgo(uploadedDaysAgo),
      summary: generateEvidenceSummary('survey_map', quality),
      content: generateEvidenceContent('survey_map', quality),
      verified: quality === 'excellent' || quality === 'good',
      checksum: generateChecksum(),
      url: `https://storage.googleapis.com/kenya-land-trust.appspot.com/evidence/${listingId}/survey_map.pdf`
    });
  }

  // Add ID document for excellent and good quality
  if (quality === 'excellent' || quality === 'good') {
    evidence.push({
      id: `evidence-${listingId}-id-document`,
      listingId: listingId,
      ownerId: ownerId,
      type: 'id_document',
      name: `Owner_ID_Copy.pdf`,
      storagePath: `/evidence/${listingId}/id_document_${faker.string.alphanumeric(8)}.pdf`,
      uploadedAt: daysAgo(uploadedDaysAgo),
      summary: generateEvidenceSummary('id_document', quality),
      content: generateEvidenceContent('id_document', quality),
      verified: quality === 'excellent',
      checksum: generateChecksum(),
      url: `https://storage.googleapis.com/kenya-land-trust.appspot.com/evidence/${listingId}/id_document.pdf`
    });
  }

  // Add rate clearance for excellent quality
  if (quality === 'excellent') {
    evidence.push({
      id: `evidence-${listingId}-rate-clearance`,
      listingId: listingId,
      ownerId: ownerId,
      type: 'rate_clearance',
      name: `Rate_Clearance_Certificate_${new Date().getFullYear()}.pdf`,
      storagePath: `/evidence/${listingId}/rate_clearance_${faker.string.alphanumeric(8)}.pdf`,
      uploadedAt: daysAgo(uploadedDaysAgo),
      summary: generateEvidenceSummary('rate_clearance', quality),
      content: generateEvidenceContent('rate_clearance', quality),
      verified: true,
      checksum: generateChecksum(),
      url: `https://storage.googleapis.com/kenya-land-trust.appspot.com/evidence/${listingId}/rate_clearance.pdf`
    });

    // Add additional supporting document
    evidence.push({
      id: `evidence-${listingId}-other`,
      listingId: listingId,
      ownerId: ownerId,
      type: 'other',
      name: `Additional_Documentation.pdf`,
      storagePath: `/evidence/${listingId}/other_${faker.string.alphanumeric(8)}.pdf`,
      uploadedAt: daysAgo(uploadedDaysAgo),
      summary: generateEvidenceSummary('other', quality),
      content: generateEvidenceContent('other', quality),
      verified: true,
      checksum: generateChecksum(),
      url: `https://storage.googleapis.com/kenya-land-trust.appspot.com/evidence/${listingId}/other.pdf`
    });
  }

  return evidence;
};
