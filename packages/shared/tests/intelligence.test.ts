import { describe, it, expect } from 'vitest';
import {
  calculateOperationalRisk,
  generateOperationalInsight,
} from '../src/services/intelligence';

describe('Operational Intelligence Engine', () => {
  describe('calculateOperationalRisk', () => {
    it('returns LOW risk when deviation is small (<= 10 min)', () => {
      const result = calculateOperationalRisk(5, 'LOW');
      expect(result.riskLevel).toBe('LOW');
      expect(result.riskScore).toBeLessThan(30);
    });

    it('returns MEDIUM risk when deviation is moderate (15 min)', () => {
      const result = calculateOperationalRisk(15, 'MEDIUM');
      expect(result.riskLevel).toBe('MEDIUM');
      expect(result.riskScore).toBeGreaterThanOrEqual(50);
    });

    it('returns HIGH risk for significant delay (> 30 min)', () => {
      const result = calculateOperationalRisk(45, 'CRITICAL');
      expect(result.riskLevel).toBe('HIGH');
      expect(result.riskScore).toBeGreaterThanOrEqual(80);
    });

    it('returns CRITICAL risk for severe delay (> 60 min) with CRITICAL priority', () => {
      const result = calculateOperationalRisk(75, 'CRITICAL');
      expect(result.riskLevel).toBe('CRITICAL');
      expect(result.riskScore).toBeGreaterThanOrEqual(95);
    });
  });

  describe('generateOperationalInsight', () => {
    it('generates rich operational intelligence response for delayed cryogenic order', async () => {
      const insight = await generateOperationalInsight({
        orderId: 'ORD-8421',
        sku: 'BIO-LNG-CRYO-450L (Cryogenic Liquid Natural Gas)',
        currentStatus: 'DELAYED',
        expectedEta: '16:00 IST',
        currentEta: '16:45 IST',
        etaDeviationMinutes: 45,
        priority: 'CRITICAL',
        driverName: 'Manoj Kumar',
      });

      expect(insight.orderId).toBe('ORD-8421');
      expect(insight.riskLevel).toBe('HIGH');
      expect(insight.confidenceScore).toBeGreaterThanOrEqual(90);
      expect(insight.potentialCause).toContain('Cryogenic boil-off margin');
      expect(insight.recommendedAction).toContain('Manoj Kumar');
      expect(insight.supportingSignals).toHaveLength(4);
      expect(insight.provider).toBe('local_deterministic');
    });

    it('generates nominal response for on-time order', async () => {
      const insight = await generateOperationalInsight({
        orderId: 'ORD-8419',
        sku: 'BIO-METHANE-HIGH-PRESS-200B',
        currentStatus: 'DELIVERED',
        expectedEta: '11:30 IST',
        currentEta: '11:22 IST',
        etaDeviationMinutes: 0,
        priority: 'HIGH',
      });

      expect(insight.riskLevel).toBe('LOW');
      expect(insight.potentialCause).toContain('nominal thresholds');
    });
  });
});
