import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyDetailed } from '../src/utils/formatCurrency';

describe('formatCurrency (paise -> INR Indian locale)', () => {
  it('correctly converts 12345600 paise to ₹1,23,456 as specified in the test requirement', () => {
    const paise = 12345600;
    const result = formatCurrency(paise);
    expect(result).toBe('₹1,23,456');
  });

  it('formats thousands correctly (e.g. 8500000 paise -> ₹85,000)', () => {
    expect(formatCurrency(8500000)).toBe('₹85,000');
  });

  it('formats small amounts correctly (e.g. 50000 paise -> ₹500)', () => {
    expect(formatCurrency(50000)).toBe('₹500');
  });

  it('formats crores correctly (e.g. 1500000000 paise -> ₹1,50,00,000)', () => {
    expect(formatCurrency(1500000000)).toBe('₹1,50,00,000');
  });

  it('handles zero, null, and undefined gracefully', () => {
    expect(formatCurrency(0)).toBe('₹0');
    expect(formatCurrency(null as any)).toBe('₹0');
    expect(formatCurrency(undefined as any)).toBe('₹0');
    expect(formatCurrency(NaN)).toBe('₹0');
  });

  it('handles negative values cleanly', () => {
    expect(formatCurrency(-12345600)).toBe('-₹1,23,456');
  });

  it('supports detailed paise format when required', () => {
    expect(formatCurrencyDetailed(12345650)).toBe('₹1,23,456.50');
    expect(formatCurrencyDetailed(12345600)).toBe('₹1,23,456.00');
  });
});
