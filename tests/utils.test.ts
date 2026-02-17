import { describe, it, expect } from 'vitest';
import { safeDivide } from '../lib/utils';

describe('safeDivide', () => {
  it('should divide two valid numbers correctly', () => {
    expect(safeDivide(10, 2)).toBe(5);
    expect(safeDivide(9, 3)).toBe(3);
    expect(safeDivide(7, 2)).toBe(3.5);
  });

  it('should handle negative numbers', () => {
    expect(safeDivide(-10, 2)).toBe(-5);
    expect(safeDivide(10, -2)).toBe(-5);
    expect(safeDivide(-10, -2)).toBe(5);
  });

  it('should return fallback when dividing by zero', () => {
    expect(safeDivide(10, 0)).toBe(0);
    expect(safeDivide(10, 0, 42)).toBe(42);
  });

  it('should return fallback when numerator is not finite', () => {
    expect(safeDivide(Infinity, 10)).toBe(0);
    expect(safeDivide(-Infinity, 10)).toBe(0);
    expect(safeDivide(NaN, 10)).toBe(0);
    expect(safeDivide(NaN, 10, 99)).toBe(99);
  });

  it('should return fallback when denominator is not finite', () => {
    expect(safeDivide(10, Infinity)).toBe(0);
    expect(safeDivide(10, -Infinity)).toBe(0);
    expect(safeDivide(10, NaN)).toBe(0);
    expect(safeDivide(10, NaN, 123)).toBe(123);
  });

  it('should handle 0 numerator correctly', () => {
    expect(safeDivide(0, 10)).toBe(0);
    expect(safeDivide(0, -5)).toBe(-0);
  });

  it('should work with floating point numbers', () => {
    expect(safeDivide(1, 3)).toBeCloseTo(0.3333333333);
    expect(safeDivide(0.1, 0.2)).toBeCloseTo(0.5);
  });
});
