/**
 * Seller Validation Utilities
 * Shared validation logic for seller existence and validity
 */
import { adminDb } from './firebase-admin';
import type { UserProfile } from './types';

export type SellerValidationResult = {
  exists: boolean;
  isValidSeller: boolean;
  profile?: UserProfile;
  error?: string;
};

/**
 * Validates that a seller exists and has the SELLER role
 * Used by both server actions and data fetching utilities
 */
export async function validateSellerExists(sellerId: string): Promise<SellerValidationResult> {
  try {
    const userDoc = await adminDb.collection('users').doc(sellerId).get();
    
    if (!userDoc.exists) {
      console.warn(`[ValidationError] Seller not found: ${sellerId}`);
      return { 
        exists: false, 
        isValidSeller: false,
        error: 'Seller account not found'
      };
    }

    const profile = userDoc.data() as UserProfile;
    const isValidSeller = profile.role === 'SELLER' && profile.verified === true;

    if (!isValidSeller) {
      console.warn(`[ValidationError] Invalid seller: ${sellerId} (role: ${profile.role}, verified: ${profile.verified})`);
      return { 
        exists: true, 
        isValidSeller: false, 
        profile,
        error: `Seller is ${profile.verified ? 'not ' : ''}verified or is not a seller`
      };
    }

    return { exists: true, isValidSeller: true, profile };
  } catch (error) {
    console.error(`[ValidationError] Failed to validate seller ${sellerId}:`, error);
    return { 
      exists: false, 
      isValidSeller: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}
