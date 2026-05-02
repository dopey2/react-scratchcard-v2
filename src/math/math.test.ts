import { describe, it, expect } from 'vitest';
import { distanceBetween, angleBetween } from './math';

describe('distanceBetween', () => {
  it('returns correct distance for known points', () => {
    expect(distanceBetween({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('returns 0 when both points are the same', () => {
    expect(distanceBetween({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(0);
  });

  it('returns 0 when either point is null', () => {
    expect(distanceBetween(null, { x: 3, y: 4 })).toBe(0);
    expect(distanceBetween({ x: 3, y: 4 }, null)).toBe(0);
    expect(distanceBetween(null, null)).toBe(0);
  });
});

describe('angleBetween', () => {
  it('returns correct angle for known points', () => {
    // straight right: atan2(1, 0) = π/2
    expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(Math.PI / 2);
    // straight down: atan2(0, 1) = 0
    expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(0);
    // diagonal: atan2(1, 1) = π/4
    expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.PI / 4);
  });

  it('returns 0 when either point is null', () => {
    expect(angleBetween(null, { x: 1, y: 1 })).toBe(0);
    expect(angleBetween({ x: 1, y: 1 }, null)).toBe(0);
    expect(angleBetween(null, null)).toBe(0);
  });
});
