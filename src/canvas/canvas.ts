import type { Point } from '../math/math';

type MouseOrTouchEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

export const getGlobalCoords = (e: MouseOrTouchEvent): Point => {
  if ('touches' in e) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
};

export const getCoords = (
  e: MouseOrTouchEvent,
  canvas: HTMLCanvasElement
): Point => {
  const { top, left } = canvas.getBoundingClientRect();
  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;

  if ('touches' in e) {
    return {
      x: e.touches[0].clientX - left,
      y: e.touches[0].clientY - top,
    };
  }

  return {
    x: e.pageX - left - scrollLeft,
    y: e.pageY - top - scrollTop,
  };
};

export const getBlockOriginIndices = (
  bufferWidth: number,
  bufferHeight: number,
  blockSize: number,
  mask?: boolean[] | null
): number[] => {
  const indices: number[] = [];
  for (let by = 0; by < bufferHeight; by += blockSize) {
    for (let bx = 0; bx < bufferWidth; bx += blockSize) {
      const pixelIdx = by * bufferWidth + bx;
      if (mask && !mask[pixelIdx]) continue;
      indices.push(pixelIdx * 4 + 3);
    }
  }
  return indices;
};

export type SampleRect = { x: number; y: number; width: number; height: number };

export const computeMaskBoundingBox = (
  mask: boolean[],
  canvasWidth: number,
  canvasHeight: number
): SampleRect => {
  let minX = canvasWidth, minY = canvasHeight, maxX = 0, maxY = 0;
  let found = false;

  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    found = true;
    const x = i % canvasWidth;
    const y = Math.floor(i / canvasWidth);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (!found) return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
};

/**
 * Returns the percentage of pixels that have been erased (alpha = 0).
 * @param pixelStride - Sample every Nth pixel in both axes. Higher = faster but less accurate.
 * @param ctx - Canvas 2D context to read from.
 * @param canvas - Canvas element (used for dimensions and full-canvas mask index remapping).
 * @param mask - Optional boolean mask; only pixels where `mask[i] === true` are counted.
 * @param sampleRect - Optional sub-rect; limits the sample region to avoid looping over each pixels;
 *                   - (precomputed during initialization based on scratchRegion & validationRegion)
 */
export const getFilledInPixels = (
  pixelStride: number,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  mask?: boolean[] | null,
  sampleRect?: SampleRect | null
): number => {
  const rx = sampleRect?.x ?? 0;
  const ry = sampleRect?.y ?? 0;
  const rw = sampleRect?.width ?? canvas.width;
  const rh = sampleRect?.height ?? canvas.height;

  const { data } = ctx.getImageData(rx, ry, rw, rh);
  const fullWidth = canvas.width;
  let total = 0;
  let erased = 0;

  for (let row = 0; row < rh; row += pixelStride) {
    for (let col = 0; col < rw; col += pixelStride) {
      const fullPixelIdx = (ry + row) * fullWidth + (rx + col);
      if (mask && !mask[fullPixelIdx]) continue;
      total++;
      if (data[(row * rw + col) * 4 + 3] === 0) erased++;
    }
  }

  if (total === 0) return 0;
  return Math.round((erased / total) * 100);
};
