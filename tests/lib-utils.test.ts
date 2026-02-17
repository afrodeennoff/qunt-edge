import { describe, it, expect } from 'vitest';
import { parsePositionTime } from '@/lib/utils';

describe('parsePositionTime', () => {
  it('should format 0 seconds correctly', () => {
    expect(parsePositionTime(0)).toBe('0m 0s');
  });

  it('should format seconds only correctly (< 60s)', () => {
    expect(parsePositionTime(45)).toBe('0m 45s');
    expect(parsePositionTime(10)).toBe('0m 10s');
  });

  it('should format exactly 60 seconds as 1 minute', () => {
    expect(parsePositionTime(60)).toBe('1m 0s');
  });

  it('should format minutes and seconds correctly', () => {
    expect(parsePositionTime(90)).toBe('1m 30s');
    expect(parsePositionTime(125)).toBe('2m 5s');
  });

  it('should format exactly 3600 seconds as 1 hour', () => {
    expect(parsePositionTime(3600)).toBe('1h 0m 0s');
  });

  it('should format hours, minutes, and seconds correctly', () => {
    expect(parsePositionTime(3665)).toBe('1h 1m 5s');
    expect(parsePositionTime(7322)).toBe('2h 2m 2s');
  });

  it('should handle floating point numbers by flooring them', () => {
    expect(parsePositionTime(50.5)).toBe('0m 50s');
    expect(parsePositionTime(3599.9)).toBe('59m 59s');
  });

  it('should return "0" for NaN inputs', () => {
    expect(parsePositionTime(NaN)).toBe('0');
  });
});
