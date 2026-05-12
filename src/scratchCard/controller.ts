import { getBlockOriginIndices, getFilledInPixels } from '../canvas/canvas';
import { angleBetween, distanceBetween, shuffleInPlace, type Point } from '../math/math';
import { buildRegionMask, buildRegionPath, type Region } from '../region/region';

export type CustomBrush = {
  /** URL or base64 data URL of the brush image. */
  image: string;
  /** Brush width in pixels. */
  width: number;
  /** Brush height in pixels. */
  height: number;
};

export type RevealAllOptions = {
  /** Animation duration in ms. Omit for an instant reveal. */
  duration?: number;
  /** How often the reveal animation updates in ms. Defaults to `16` (~60 fps). */
  interval?: number;
  /**
   * Erases pixels in N×N blocks. Defaults to `1` (individual pixels).
   */
  blockSize?: number;
};

export type StrokeResult = {
  percent: number;
  complete: boolean;
};

export type ControllerConfig = {
  width: number;
  height: number;
  pixelRatio?: number;
  imageSmoothingQuality: ImageSmoothingQuality;
  coverImage?: string;
  coverColor: string;
  customBrush?: CustomBrush;
  scratchRegion?: Region;
  validationRegion?: Region;
  brushSize: number;
  scratchInterval: number;
  finishPercent: number;
  lockOnComplete: boolean;
};

export class Controller {
  // external injected
  private canvas: HTMLCanvasElement;
  private bgCanvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null = null;
  private bgCtx: CanvasRenderingContext2D | null = null;

  // loaded assets
  private coverImage: HTMLImageElement | null = null;
  private brushImage: HTMLImageElement | null = null;
  private scratchRegionImage: HTMLImageElement | null = null;
  private validRegionImage: HTMLImageElement | null = null;

  private dpr = 1;

  // computed data
  private scratchMask: boolean[] | null = null;
  private validationMask: boolean[] | null = null;
  private scratchRegionPath: Path2D | null = null;

  // contextual
  private _isScratching = false;
  private _isScratchingLocked = false;
  private _isComplete = false;
  private _isAllRevealed = false;
  private lastPointerPos: Point | null = null;
  private lastSampleTime = 0;
  private revealInterval: ReturnType<typeof setInterval> | null = null;

  private config: ControllerConfig | null = null;

  constructor(args: { canvas: HTMLCanvasElement; bgCanvas?: HTMLCanvasElement | null }) {
    this.canvas = args.canvas;
    this.bgCanvas = args.bgCanvas ?? null;
  }

  get isScratching() { return this._isScratching; }
  get isScratchingLocked() { return this._isScratchingLocked; }
  get isComplete() { return this._isComplete; }

  loadImageAsync(image: string, message: string): Promise<HTMLImageElement | null> {
     return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        resolve(img)
      }
      img.onerror = () => {
        reject(new Error(`${message}: Failed to load image: ${image}`))
      }
      img.src = image;
    });
  }

  async loadImages(args: {
    coverImage?: string,
    customBrush?: string,
    scratchRegion?: string,
    validRegion?: string
  }): Promise<void> {
    const buildPromise = (message: string, image?: string) => {
      return image ? this.loadImageAsync(image, message) : null;
    }

    const [cover, brush, scratchRegion, validRegion] = await Promise.all([
      buildPromise('Cover', args.coverImage),
      buildPromise('Brush', args.customBrush),
      buildPromise('ScratchRegion', args.scratchRegion),
      buildPromise('ValidRegion', args.validRegion),
    ]);

    this.coverImage = cover;
    this.brushImage = brush;
    this.scratchRegionImage = scratchRegion;
    this.validRegionImage = validRegion;
  }

  setupCanvas(canvas: HTMLCanvasElement, config: {width: number, height: number, dpr: number, imageSmoothingQuality: ImageSmoothingQuality, willReadFrequently: boolean}) {
    const ctx = canvas.getContext('2d', { willReadFrequently: config.willReadFrequently });
    canvas.width = Math.floor(config.width * config.dpr);
    canvas.height = Math.floor(config.height * config.dpr);
    if (ctx) {
      ctx.scale(this.dpr, this.dpr);
      ctx.imageSmoothingQuality = config.imageSmoothingQuality;
    }

    return ctx;
  }

  async init(config: ControllerConfig): Promise<void> {
    this.config = config;
    const { width, height, pixelRatio, imageSmoothingQuality, coverImage, customBrush, scratchRegion, validationRegion } = config;

    this.dpr = pixelRatio ?? window.devicePixelRatio ?? 1;

    // 1) Setup main canvas & the clone canvas
    const commonConfig = { width, height, dpr: this.dpr, imageSmoothingQuality };
    this.ctx = this.setupCanvas(this.canvas, { ...commonConfig, willReadFrequently: true });
    this.bgCtx = this.bgCanvas ? this.setupCanvas(this.bgCanvas, { ...commonConfig, willReadFrequently: false }) : null;

    if (!this.ctx) throw new Error("ScratchCard:: Failed to get 2d context for main canvas");
    if (this.bgCanvas && !this.bgCtx) throw new Error("ScratchCard:: Failed to get 2d context for bg canvas");

    // 2) Load images assets
    const scratchRegionImageToLoad = scratchRegion?.type === 'image' ? scratchRegion.image : undefined;
    const validRegionImageToLoad = validationRegion?.type === 'image' ? validationRegion.image : undefined;

    await this.loadImages({
      coverImage,
      customBrush: customBrush?.image,
      scratchRegion: scratchRegionImageToLoad,
      validRegion: validRegionImageToLoad
    });


    // 3) Create scratch region
    if (scratchRegion && scratchRegion.type !== 'image') {
      this.scratchRegionPath = buildRegionPath(scratchRegion);
      this.scratchMask = buildRegionMask(scratchRegion, this.canvas.width, this.canvas.height, this.dpr, "ScratchRegion");
    }

    if (scratchRegion?.type === 'image' && this.scratchRegionImage) {
      this.scratchMask = buildRegionMask(
          { type: 'image', image: this.scratchRegionImage },
          this.canvas.width, this.canvas.height, this.dpr, "ScratchRegion"
      );
    }

    // 4) Create validation region
    if (validationRegion && validationRegion.type !== 'image') {
      this.validationMask = buildRegionMask(validationRegion, this.canvas.width, this.canvas.height, this.dpr, "ValidationRegion");
    }

    if (validationRegion?.type === 'image' && this.validRegionImage) {
      this.validationMask = buildRegionMask(
        { type: 'image', image: this.validRegionImage },
        this.canvas.width, this.canvas.height, this.dpr, "ValidationRegion"
      );
    }

    // 5) Draw the cover & the clone canvas cover
    if (this.ctx) this.drawCover(this.ctx);
    if (scratchRegion) this.drawBgCover();
  }

  private drawCover(ctx: CanvasRenderingContext2D): void {
    if (!this.config) return;
    const { width, height, coverColor } = this.config;
    ctx.globalCompositeOperation = 'source-over';
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = coverColor;
      ctx.fillRect(0, 0, width, height);
    }
  }

  private drawBgCover(): void {
    if (!this.bgCanvas || !this.bgCtx || !this.config) return;
    const { width, height } = this.config;

    this.drawCover(this.bgCtx);

    if (this.scratchRegionPath) {
      this.bgCtx.globalCompositeOperation = 'destination-out';
      this.bgCtx.save();
      this.bgCtx.clip(this.scratchRegionPath);
      this.bgCtx.fillRect(0, 0, width, height);
      this.bgCtx.restore();
      this.bgCtx.globalCompositeOperation = 'source-over';
    } else if (this.scratchMask) {
      const imageData = this.bgCtx.getImageData(0, 0, this.bgCanvas.width, this.bgCanvas.height);
      const { data } = imageData;
      for (let i = 3; i < data.length; i += 4) {
        if (this.scratchMask[(i - 3) / 4]) data[i] = 0;
      }
      this.bgCtx.putImageData(imageData, 0, 0);
    }
  }

  startStroke(point: Point): void {
    if (this._isScratchingLocked) return;
    this._isScratching = true;
    this.lastPointerPos = point;
  }

  applyStroke(point: Point): StrokeResult | null {
    if (!this._isScratching || this._isScratchingLocked || !this.ctx || !this.config) return null;

    const { brushSize, customBrush, scratchInterval, finishPercent, lockOnComplete } = this.config;
    const distance = distanceBetween(this.lastPointerPos, point);
    const angle = angleBetween(this.lastPointerPos, point);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    if (this.scratchRegionPath) {
      this.ctx.clip(this.scratchRegionPath);
    }

    for (let i = 0; i < distance; i++) {
      const x = this.lastPointerPos ? this.lastPointerPos.x + Math.sin(angle) * i : 0;
      const y = this.lastPointerPos ? this.lastPointerPos.y + Math.cos(angle) * i : 0;

      if (this.brushImage && customBrush) {
        this.ctx.drawImage(this.brushImage, x - customBrush.width / 2, y - customBrush.height / 2, customBrush.width, customBrush.height);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(x, y, brushSize, 0, 2 * Math.PI, false);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
    this.lastPointerPos = point;

    const now = Date.now();
    if (now - this.lastSampleTime < scratchInterval) return null;
    this.lastSampleTime = now;

    const percent = getFilledInPixels(32, this.ctx, this.canvas, this.validationMask ?? this.scratchMask);
    const complete = !this._isComplete && percent > finishPercent;
    if (complete) {
      this._isComplete = true;
      if (lockOnComplete) this._isScratchingLocked = true;
    }

    return { percent, complete };
  }

  endStroke(): boolean {
    if(this._isScratching) {
      this._isScratching = false;
      return true;
    }

    return false;
  }

  reset(): void {
    if (!this.ctx) return;

    if (this.revealInterval) {
      clearInterval(this.revealInterval);
      this.revealInterval = null;
    }

    this.drawCover(this.ctx);
    this.drawBgCover();
    this._isScratchingLocked = false;
    this._isComplete = false;
    this._isAllRevealed = false;
  }

  revealAll(options?: RevealAllOptions, onFinish?: () => void): void {
    if (!this.ctx || !this.config) return;
    if (this._isAllRevealed || this.revealInterval) return;
    const { width, height } = this.config;

    if (!options?.duration) {
      this.ctx.globalCompositeOperation = 'destination-out';
      if (this.scratchRegionPath) {
        this.ctx.save();
        this.ctx.clip(this.scratchRegionPath);
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.restore();
      } else if (this.scratchMask) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const { data } = imageData;
        for (let i = 3; i < data.length; i += 4) {
          if (this.scratchMask[(i - 3) / 4]) data[i] = 0;
        }
        this.ctx.putImageData(imageData, 0, 0);
      } else {
        this.ctx.fillRect(0, 0, width, height);
      }
      this._isComplete = true;
      this._isScratchingLocked = true;
      this._isAllRevealed = true;
      onFinish?.();
      return;
    }

    const { duration, interval = 16, blockSize = 1 } = options;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const { data } = imageData;
    const bufferWidth = this.canvas.width;
    const bufferHeight = this.canvas.height;
    const bufferBlockSize = Math.max(1, Math.round(blockSize * this.dpr));
    const entryStep = Math.max(1, Math.round(this.dpr));
    const ctx = this.ctx;

    const opaque = getBlockOriginIndices(bufferWidth, bufferHeight, entryStep, this.scratchMask);
    shuffleInPlace(opaque);

    const startTime = Date.now();
    let offset = 0;

    this.revealInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const targetIdx = Math.floor(progress * opaque.length);

      while (offset < targetIdx) {
        const alphaIdx = opaque[offset];
        const pixelIdx = (alphaIdx - 3) / 4;
        const ax = pixelIdx % bufferWidth;
        const ay = Math.floor(pixelIdx / bufferWidth);
        for (let dy = 0; dy < bufferBlockSize; dy++) {
          for (let dx = 0; dx < bufferBlockSize; dx++) {
            if (ax + dx < bufferWidth && ay + dy < bufferHeight) {
              data[alphaIdx + (dy * bufferWidth + dx) * 4] = 0;
            }
          }
        }
        offset++;
      }
      ctx.putImageData(imageData, 0, 0);

      if (progress >= 1) {
        clearInterval(this.revealInterval!);
        this.revealInterval = null;
        this._isComplete = true;
        this._isScratchingLocked = true;
        this._isAllRevealed = true;
        onFinish?.();
      }
    }, interval);
  }

  dispose(): void {
    if (this.revealInterval) {
      clearInterval(this.revealInterval);
      this.revealInterval = null;
    }
  }
}
