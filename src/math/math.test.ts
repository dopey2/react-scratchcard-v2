import { describe, it, expect, vi } from 'vitest';
import { distanceBetween, angleBetween, shuffleInPlace } from './math';

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

describe('shuffleInPlace', () => {
  it('mutates the array in place', () => {
    const arr = [1, 2, 3, 4, 5];
    const ref = arr;
    shuffleInPlace(arr);
    expect(arr).toBe(ref);
  });

  it('preserves all elements', () => {
    const arr = [10, 20, 30, 40, 50];
    shuffleInPlace(arr);
    expect(arr.sort((a, b) => a - b)).toEqual([10, 20, 30, 40, 50]);
  });

  it('produces a different order with a seeded random', () => {
    // random always 0 → j always 0 → each element gets swapped to front → order changes
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const arr = [0, 1, 2, 3, 4];
    shuffleInPlace(arr);
    expect(arr).not.toEqual([0, 1, 2, 3, 4]);
    vi.restoreAllMocks();
  });

  it('handles an empty array without throwing', () => {
    expect(() => shuffleInPlace([])).not.toThrow();
  });

  it('handles a single-element array without throwing', () => {
    const arr = [42];
    shuffleInPlace(arr);
    expect(arr).toEqual([42]);
  });
});
