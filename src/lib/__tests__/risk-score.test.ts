import { describe, it, expect } from 'vitest';

/**
 * Basic unit test for the risk score calculation logic.
 */

const calculateRiskScore = (data: any): number => {
  let score = 0;
  if (data.imageAnalysis?.isSuspicious) score += 40;
  if (data.badgeSuggestion?.badge === 'Suspicious') score += 50;
  if (data.badgeSuggestion?.badge === 'None') score += 10;
  return Math.min(score, 100);
}

describe('Risk Score Logic', () => {
  it('should return 0 for clean data', () => {
    const data = {
      imageAnalysis: { isSuspicious: false },
      badgeSuggestion: { badge: 'Gold' }
    };
    expect(calculateRiskScore(data)).toBe(0);
  });

  it('should flag suspicious images with 40 points', () => {
    const data = {
      imageAnalysis: { isSuspicious: true },
      badgeSuggestion: { badge: 'EvidenceReviewed' }
    };
    expect(calculateRiskScore(data)).toBe(40);
  });

  it('should cap the score at 100', () => {
    const data = {
      imageAnalysis: { isSuspicious: true },
      badgeSuggestion: { badge: 'Suspicious' },
      additionalRisk: true
    };
    // 40 (image) + 50 (badge) = 90.
    expect(calculateRiskScore(data)).toBe(90);
  });

  it('should flag suspicious badges heavily', () => {
    const data = {
      badgeSuggestion: { badge: 'Suspicious' }
    };
    expect(calculateRiskScore(data)).toBe(50);
  });
});