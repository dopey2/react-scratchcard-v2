import type { Point } from '../math/math';

type MouseOrTouchEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

/** Rectangle (in pixels) that restricts which area counts toward the completion percentage. */
export type CustomCheckZone = {
  x: number;
  y: number;
  width: number;
  height: number;
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

export const getOpaqueIndices = (data: Uint8ClampedArray): number[] => {
  const indices: number[] = [];
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) indices.push(i);
  }
  return indices;
};

export const getFilledInPixels = (
  stride: number,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  customCheckZone?: CustomCheckZone,
  dpr = 1
): number => {
  const x = customCheckZone ? Math.floor(customCheckZone.x * dpr) : 0;
  const y = customCheckZone ? Math.floor(customCheckZone.y * dpr) : 0;
  const w = customCheckZone ? Math.floor(customCheckZone.width * dpr) : canvas.width;
  const h = customCheckZone ? Math.floor(customCheckZone.height * dpr) : canvas.height;

  const pixels = ctx.getImageData(x, y, w, h);
  const total = pixels.data.length / stride;
  let count = 0;

  for (let i = 0; i < pixels.data.length; i += stride) {
    if (pixels.data[i + 3] === 0) {
      count++;
    }
  }

  return Math.round((count / total) * 100);
};
