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

export const getFilledInPixels = (
  stride: number,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  mask?: boolean[] | null
): number => {
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = pixels;
  let total = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += stride) {
    if (mask && !mask[i / 4]) continue;
    total++;
    if (data[i + 3] === 0) count++;
  }

  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};
