import { describe, it, expect, beforeEach } from 'vitest';
import { getBlockOriginIndices, getCoords, getFilledInPixels } from './canvas';

const mockCanvas = (top = 0, left = 0, width = 100, height = 100) =>
  ({
    getBoundingClientRect: () => ({ top, left }),
    width,
    height,
  }) as unknown as HTMLCanvasElement;

const mockCtx = (data: number[]) =>
  ({
    getImageData: () => ({ data: new Uint8ClampedArray(data) }),
  }) as unknown as CanvasRenderingContext2D;

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
});

describe('getCoords', () => {
  it('returns correct coordinates for mouse events', () => {
    const e = { pageX: 80, pageY: 60 } as React.MouseEvent<HTMLCanvasElement>;
    expect(getCoords(e, mockCanvas(10, 20))).toEqual({ x: 60, y: 50 });
  });

  it('returns correct coordinates for touch events', () => {
    const e = {
      touches: [{ clientX: 80, clientY: 60 }],
    } as unknown as React.TouchEvent<HTMLCanvasElement>;
    expect(getCoords(e, mockCanvas(10, 20))).toEqual({ x: 60, y: 50 });
  });

  it('accounts for canvas position offset', () => {
    const e = { pageX: 150, pageY: 200 } as React.MouseEvent<HTMLCanvasElement>;
    expect(getCoords(e, mockCanvas(100, 50))).toEqual({ x: 100, y: 100 });
  });

  it('accounts for page scroll offset for mouse events', () => {
    Object.defineProperty(window, 'scrollY', { value: 20, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 10, configurable: true });
    const e = { pageX: 50, pageY: 50 } as React.MouseEvent<HTMLCanvasElement>;
    expect(getCoords(e, mockCanvas(0, 0))).toEqual({ x: 40, y: 30 });
  });

  it('touch coordinates are not affected by page scroll', () => {
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
    const e = {
      touches: [{ clientX: 80, clientY: 60 }],
    } as unknown as React.TouchEvent<HTMLCanvasElement>;
    expect(getCoords(e, mockCanvas(10, 20))).toEqual({ x: 60, y: 50 });
  });
});

describe('getFilledInPixels', () => {
  it('returns 0 when no pixels are transparent', () => {
    // 4 opaque pixels: alpha=255 at bytes 3,7,11,15
    const data = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];
    expect(getFilledInPixels(4, mockCtx(data), mockCanvas(0, 0, 2, 2))).toBe(0);
  });

  it('returns 100 when all pixels are transparent', () => {
    // 4 transparent pixels: alpha=0 at bytes 3,7,11,15
    const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(getFilledInPixels(4, mockCtx(data), mockCanvas(0, 0, 2, 2))).toBe(100);
  });

  it('returns correct percentage for partially transparent pixels', () => {
    // 2 transparent, 2 opaque out of 4 pixels
    const data = [0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255];
    expect(getFilledInPixels(1, mockCtx(data), mockCanvas(0, 0, 2, 2))).toBe(50);
  });

  it('does not count dark opaque pixels as transparent', () => {
    // pixel 0: black opaque (R=0 G=0 B=0 A=255) — must NOT be counted
    // pixel 1: fully transparent (R=0 G=0 B=0 A=0) — must be counted
    const data = [0, 0, 0, 255, 0, 0, 0, 0];
    expect(getFilledInPixels(1, mockCtx(data), mockCanvas(0, 0, 2, 1))).toBe(50);
  });

  it('always reads full buffer pixels', () => {
    const ctx = {
      getImageData: (x: number, y: number, w: number, h: number) => {
        expect(x).toBe(0);
        expect(y).toBe(0);
        expect(w).toBe(200);
        expect(h).toBe(160);
        return { data: new Uint8ClampedArray(200 * 160 * 4) };
      },
    } as unknown as CanvasRenderingContext2D;
    getFilledInPixels(4, ctx, mockCanvas(0, 0, 200, 160));
  });

  it('filters pixels by mask', () => {
    // 4 pixels: transparent, opaque, transparent, opaque
    const data = [0,0,0,0, 255,255,255,255, 0,0,0,0, 255,255,255,255];
    // mask covers only first 2 pixels: 1 transparent + 1 opaque = 50%
    const mask = [true, true, false, false];
    expect(getFilledInPixels(1, mockCtx(data), mockCanvas(0, 0, 2, 2), mask)).toBe(50);
  });

  it('returns 0 when mask covers no pixels', () => {
    const data = [0,0,0,0, 0,0,0,0];
    const mask = [false, false];
    expect(getFilledInPixels(4, mockCtx(data), mockCanvas(0, 0, 2, 1), mask)).toBe(0);
  });
});

describe('getBlockOriginIndices', () => {
  it('returns one alpha index per pixel when blockSize=1', () => {
    // 2x2 buffer, blockSize=1 → origins at (0,0),(1,0),(0,1),(1,1) → alpha indices 3,7,11,15
    expect(getBlockOriginIndices(2, 2, 1)).toEqual([3, 7, 11, 15]);
  });

  it('returns one alpha index per block when blockSize=2', () => {
    // 4x4 buffer, blockSize=2 → origins at (0,0),(2,0),(0,2),(2,2)
    // pixelIdx: 0, 2, 8, 10 → alpha indices: 3, 11, 35, 43
    expect(getBlockOriginIndices(4, 4, 2)).toEqual([3, 11, 35, 43]);
  });

  it('filters block origins by mask', () => {
    // 2x2 buffer, blockSize=1, mask excludes pixel 1 (index 1)
    const mask = [true, false, true, true];
    expect(getBlockOriginIndices(2, 2, 1, mask)).toEqual([3, 11, 15]);
  });

  it('returns empty array when mask excludes all origins', () => {
    const mask = [false, false, false, false];
    expect(getBlockOriginIndices(2, 2, 1, mask)).toEqual([]);
  });

  it('entry count is DPR-scale-invariant for equivalent CSS canvas sizes', () => {
    // CSS 4×2 at DPR=1: buffer 4×2, step=1 → 8 entries
    expect(getBlockOriginIndices(4, 2, 1).length).toBe(8);
    // CSS 4×2 at DPR=2: buffer 8×4, step=2 → still 8 entries
    expect(getBlockOriginIndices(8, 4, 2).length).toBe(8);
  });
});
