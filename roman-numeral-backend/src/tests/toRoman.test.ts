import { describe, it, expect } from 'vitest';
import { toRoman } from '.././utils/romanConverter';

describe('toRoman', () => {
  it('converts 1 to I', () => {
    expect(toRoman(1)).toBe('I');
  });

  it('converts 4 to IV', () => {
    expect(toRoman(4)).toBe('IV');
  });

  it('converts 9 to IX', () => {
    expect(toRoman(9)).toBe('IX');
  });

  it('converts 58 to LVIII', () => {
    expect(toRoman(58)).toBe('LVIII'); // L = 50, V = 5, III = 3
  });

  it('converts 1994 to MCMXCIV', () => {
    expect(toRoman(1994)).toBe('MCMXCIV');
  });

  it('converts 3999 to MMMCMXCIX', () => {
    expect(toRoman(3999)).toBe('MMMCMXCIX');
  });

  // Error cases
  it('throws error for 0', () => {
    expect(() => toRoman(0)).toThrow('Number must be between 1 and 3999');
  });

  it('throws error for negative numbers', () => {
    expect(() => toRoman(-5)).toThrow('Number must be between 1 and 3999');
  });

  it('throws error for numbers > 3999', () => {
    expect(() => toRoman(4000)).toThrow('Number must be between 1 and 3999');
  });

  it('throws error for decimals', () => {
    expect(() => toRoman(3.14)).toThrow('Only integer values are allowed');
  });

  it('throws error for non-numeric input (e.g., string)', () => {
    // @ts-expect-error intentionally wrong input
    expect(() => toRoman('X')).toThrow('Input must be a number');
  });

  it('throws error for null input', () => {
    // @ts-expect-error intentionally wrong input
    expect(() => toRoman(null)).toThrow('Input must not be null or undefined');
  });
});
