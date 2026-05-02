import type { Point } from '../math/math';

type MouseOrTouchEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

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

export const getFilledInPixels = (
  stride: number,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  customCheckZone?: CustomCheckZone
): number => {
  const x = customCheckZone?.x ?? 0;
  const y = customCheckZone?.y ?? 0;
  const w = customCheckZone?.width ?? canvas.width;
  const h = customCheckZone?.height ?? canvas.height;

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
