export type RectRegion = {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleRegion = {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
};

export type ImageRegion = {
  type: 'image';
  /** URL or base64 data URL. Opaque pixels define the region. */
  image: string;
};

export type Region = RectRegion | CircleRegion | ImageRegion;

/**
 * Builds a flat boolean mask covering the full canvas buffer.
 * `mask[pixelIndex] === true` means the pixel is inside the region.
 * Fires `onReady` synchronously for rect/circle, asynchronously for image.
 */
export const buildRegionMask = (
  region: Region,
  bufferWidth: number,
  bufferHeight: number,
  dpr: number,
  onReady: (mask: boolean[]) => void
): void => {
  if (region.type === 'rect') {
    const x0 = Math.floor(region.x * dpr);
    const y0 = Math.floor(region.y * dpr);
    const x1 = Math.min(x0 + Math.floor(region.width * dpr), bufferWidth);
    const y1 = Math.min(y0 + Math.floor(region.height * dpr), bufferHeight);
    const mask = new Array<boolean>(bufferWidth * bufferHeight).fill(false);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        mask[y * bufferWidth + x] = true;
      }
    }
    onReady(mask);
    return;
  }

  if (region.type === 'circle') {
    const cx = region.x * dpr;
    const cy = region.y * dpr;
    const r = region.radius * dpr;
    const r2 = r * r;
    const mask = new Array<boolean>(bufferWidth * bufferHeight).fill(false);
    for (let y = 0; y < bufferHeight; y++) {
      for (let x = 0; x < bufferWidth; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          mask[y * bufferWidth + x] = true;
        }
      }
    }
    onReady(mask);
    return;
  }

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = bufferWidth;
    offscreen.height = bufferHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, bufferWidth, bufferHeight);
    const { data } = ctx.getImageData(0, 0, bufferWidth, bufferHeight);
    const mask = new Array<boolean>(bufferWidth * bufferHeight);
    for (let i = 0; i < mask.length; i++) {
      mask[i] = data[i * 4 + 3] > 0;
    }
    onReady(mask);
  };
  img.src = region.image;
};

/**
 * Returns a `Path2D` for rect and circle regions — used to clip canvas drawing.
 * Image regions do not support path clipping; use the mask instead.
 */
export const buildRegionPath = (region: RectRegion | CircleRegion): Path2D => {
  const path = new Path2D();
  if (region.type === 'rect') {
    path.rect(region.x, region.y, region.width, region.height);
  } else {
    path.arc(region.x, region.y, region.radius, 0, Math.PI * 2);
  }
  return path;
};

export const Shape = {
  rect: (x: number, y: number, width: number, height: number): RectRegion => ({
    type: 'rect',
    x,
    y,
    width,
    height,
  }),
  circle: (x: number, y: number, radius: number): CircleRegion => ({
    type: 'circle',
    x,
    y,
    radius,
  }),
  image: (image: string): ImageRegion => ({
    type: 'image',
    image,
  }),
};
