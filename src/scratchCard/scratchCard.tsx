import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getCoords, getFilledInPixels, getOpaqueIndices, type CustomCheckZone } from '../canvas/canvas';
import { angleBetween, distanceBetween, shuffleInPlace, type Point } from '../math/math';

export type CustomBrush = {
  image: string;
  width: number;
  height: number;
};

export type { CustomCheckZone };

export type Props = {
  width: number;
  height: number;
  coverImage?: string;
  coverColor?: string;
  finishPercent?: number;
  onComplete?: () => void;
  onScratchEnd?: () => void;
  onScratch?: (percent: number) => void;
  brushSize?: number;
  lockOnComplete?: boolean;
  children?: React.ReactNode;
  customBrush?: CustomBrush;
  customCheckZone?: CustomCheckZone;
  imageSmoothingQuality?: ImageSmoothingQuality;
  sampleInterval?: number;
  ariaLabel?: string;
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
};

export type RevealAllOptions = {
  duration?: number;
  interval?: number;
};

export type ScratchCardRef = {
  reset: () => void;
  revealAll: (options?: RevealAllOptions) => void;
};

type MouseOrTouchEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

const DEFAULT_COVER_COLOR = '#ccc';

const ScratchCard = forwardRef<ScratchCardRef, Props>(function ScratchCard(
  props,
  ref
) {
  const {
    width,
    height,
    coverImage,
    coverColor,
    finishPercent = 70,
    onComplete,
    onScratchEnd,
    onScratch,
    brushSize = 20,
    lockOnComplete = true,
    children,
    customBrush,
    customCheckZone,
    imageSmoothingQuality = 'low',
    sampleInterval = 50,
    ariaLabel,
    canvasProps,
  } = props;

  const [loaded, setLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const brushImageRef = useRef<HTMLImageElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const isFinished = useRef(false);
  const hasCompleted = useRef(false);
  const lastSampleTime = useRef(0);
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dprRef = useRef(1);

  const drawCover = useCallback((ctx: CanvasRenderingContext2D) => {
    if (coverImage) {
      const img = imageRef.current;
      if (!img) return;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = coverColor ?? DEFAULT_COVER_COLOR;
      ctx.fillRect(0, 0, width, height);
    }
  }, [coverImage, coverColor, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio ?? 1;
    dprRef.current = dpr;

    // Set buffer dimensions first — assigning canvas.width resets context state.
    // scale() and imageSmoothingQuality must be applied after.
    ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    if (ctxRef.current) {
      ctxRef.current.scale(dpr, dpr);
      ctxRef.current.imageSmoothingQuality = imageSmoothingQuality;
    }

    if (coverImage) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        imageRef.current = img;
        if (ctxRef.current) drawCover(ctxRef.current);
        setLoaded(true);
      };
      img.src = coverImage;
    } else {
      if (ctxRef.current) drawCover(ctxRef.current);
      setLoaded(true);
    }

    if (customBrush) {
      const brush = new Image(customBrush.width, customBrush.height);
      brush.src = customBrush.image;
      brushImageRef.current = brush;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    drawCover(ctx);
    isFinished.current = false;
    hasCompleted.current = false;
  }, [drawCover]);

  const finish = useCallback(() => {
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      onComplete?.();
    }
    isFinished.current = true;
  }, [onComplete]);

  const revealAll = useCallback((options?: RevealAllOptions) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || isFinished.current) return;

    if (!options?.duration) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, width, height);
      finish();
      return;
    }

    const { duration, interval = 16 } = options;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    const opaque = getOpaqueIndices(data);
    shuffleInPlace(opaque);

    const batchSize = Math.ceil(opaque.length / (duration / interval));
    let offset = 0;

    revealIntervalRef.current = setInterval(() => {
      const end = Math.min(offset + batchSize, opaque.length);
      for (let i = offset; i < end; i++) {
        data[opaque[i]] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
      offset = end;

      if (offset >= opaque.length) {
        clearInterval(revealIntervalRef.current!);
        revealIntervalRef.current = null;
        finish();
      }
    }, interval);
  }, [width, height, finish]);

  useImperativeHandle(ref, () => ({ reset, revealAll }), [reset, revealAll]);

  const handlePercentage = (filledInPixels: number) => {
    if (hasCompleted.current) return;

    if (filledInPixels > finishPercent) {
      hasCompleted.current = true;
      onComplete?.();
      if (lockOnComplete) isFinished.current = true;
    }
  };

  const handlePointerDown = (e: MouseOrTouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || isFinished.current) return;
    isDrawing.current = true;
    lastPoint.current = getCoords(e, canvas);
  };

  const handlePointerMove = (e: MouseOrTouchEvent) => {
    if (!isDrawing.current || isFinished.current) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const currentPoint = getCoords(e, canvas);
    const distance = distanceBetween(lastPoint.current, currentPoint);
    const angle = angleBetween(lastPoint.current, currentPoint);

    for (let i = 0; i < distance; i++) {
      const x = lastPoint.current
        ? lastPoint.current.x + Math.sin(angle) * i
        : 0;
      const y = lastPoint.current
        ? lastPoint.current.y + Math.cos(angle) * i
        : 0;

      ctx.globalCompositeOperation = 'destination-out';

      if (brushImageRef.current && customBrush) {
        ctx.drawImage(
          brushImageRef.current,
          x - customBrush.width / 2,
          y - customBrush.height / 2,
          customBrush.width,
          customBrush.height
        );
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, 2 * Math.PI, false);
        ctx.fill();
      }
    }

    lastPoint.current = currentPoint;

    const now = Date.now();
    if (now - lastSampleTime.current >= sampleInterval) {
      lastSampleTime.current = now;
      const filledInPercent = getFilledInPixels(32, ctx, canvas, customCheckZone, dprRef.current);
      onScratch?.(filledInPercent);
      handlePercentage(filledInPercent);
    }
  };

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    onScratchEnd?.();
  }, [onScratchEnd]);

  useEffect(() => {
    window.addEventListener('mouseup', handlePointerUp);
    return () => window.removeEventListener('mouseup', handlePointerUp);
  }, [handlePointerUp]);

  const containerStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    touchAction: 'none',
    width: `${width}px`,
    height: `${height}px`,
  };

  const resultStyle: React.CSSProperties = {
    visibility: loaded ? 'visible' : 'hidden',
    width: '100%',
    height: '100%',
  };

  return (
    <div className='ScratchCard__Container' style={containerStyle}>
      <canvas
        {...canvasProps}
        ref={canvasRef}
        className={['ScratchCard__Canvas', canvasProps?.className].filter(Boolean).join(' ')}
        style={{ ...canvasProps?.style, ...canvasStyle }}
        width={width}
        height={height}
        role='img'
        aria-label={ariaLabel}
        onMouseDown={(e) => handlePointerDown(e)}
        onTouchStart={(e) => handlePointerDown(e)}
        onMouseMove={(e) => handlePointerMove(e)}
        onTouchMove={(e) => handlePointerMove(e)}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      />
      <div className='ScratchCard__Result' style={resultStyle}>
        {children}
      </div>
    </div>
  );
});

export default ScratchCard;
