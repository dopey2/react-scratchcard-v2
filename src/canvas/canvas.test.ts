import { describe, it, expect, beforeEach } from 'vitest';
import { getCoords, getFilledInPixels } from './canvas';

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
    expect(getFilledInPixels(4, mockCtx(data), mockCanvas(0, 0, 2, 2))).toBe(50);
  });

  it('does not count dark opaque pixels as transparent', () => {
    // pixel 0: black opaque (R=0 G=0 B=0 A=255) — must NOT be counted
    // pixel 1: fully transparent (R=0 G=0 B=0 A=0) — must be counted
    const data = [0, 0, 0, 255, 0, 0, 0, 0];
    expect(getFilledInPixels(4, mockCtx(data), mockCanvas(0, 0, 2, 1))).toBe(50);
  });

  it('respects customCheckZone bounds', () => {
    const ctx = {
      getImageData: (x: number, y: number, w: number, h: number) => {
        expect(x).toBe(10);
        expect(y).toBe(20);
        expect(w).toBe(50);
        expect(h).toBe(30);
        return { data: new Uint8ClampedArray(50 * 30 * 4) };
      },
    } as unknown as CanvasRenderingContext2D;
    getFilledInPixels(4, ctx, mockCanvas(0, 0, 100, 100), { x: 10, y: 20, width: 50, height: 30 });
  });
});
