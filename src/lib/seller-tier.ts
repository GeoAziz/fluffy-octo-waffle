import { BadgeValue } from './types';

export type SellerTier = 'Gold' | 'Silver' | 'Bronze' | 'Unverified';

export function calculateSellerTier(badges: BadgeValue[]): SellerTier {
  if (badges.length === 0) return 'Unverified';
  
  const goldCount = badges.filter(b => b === 'TrustedSignal').length;
  const silverCount = badges.filter(b => b === 'EvidenceReviewed').length;
  const bronzeCount = badges.filter(b => b === 'EvidenceSubmitted').length;
  const total = badges.length;
  
  const goldPercent = (goldCount / total) * 100;
  const silverPercent = ((goldCount + silverCount) / total) * 100;
  
  if (goldPercent >= 50) return 'Gold';
  if (silverPercent >= 50) return 'Silver';
  if (bronzeCount > 0) return 'Bronze';
  return 'Unverified';
}

export function getTierProgress(tier: SellerTier): number {
  const progressMap: Record<SellerTier, number> = {
    'Gold': 100,
    'Silver': 70,
    'Bronze': 30,
    'Unverified': 0,
  };
  return progressMap[tier];
}

export function getTierDescription(tier: SellerTier): string {
  const descriptions: Record<SellerTier, string> = {
    'Gold': 'All evidence reviewed. Top-tier listings badge.',
    'Silver': 'Primary deed verified. Most listings verified.',
    'Bronze': 'Evidence pending triage. Initial verification.',
    'Unverified': 'No evidence submitted. Start verification process.',
  };
  return descriptions[tier];
}
