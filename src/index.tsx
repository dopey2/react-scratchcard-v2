import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

export type CustomBrush = {
  image: string;
  width: number;
  height: number;
};

export type CustomCheckZone = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Props = {
  width: number;
  height: number;
  image: string;
  finishPercent?: number;
  onComplete?: () => void;
  brushSize?: number;
  fadeOutOnComplete?: boolean;
  children?: React.ReactNode;
  customBrush?: CustomBrush;
  customCheckZone?: CustomCheckZone;
};

export type ScratchCardRef = {
  reset: () => void;
};

type MouseOrTouchEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;

const getCoords = (e: MouseOrTouchEvent, canvas: HTMLCanvasElement): Point => {
  const { top, left } = canvas.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  if ('touches' in e) {
    return {
      x: e.touches[0].clientX - left - scrollLeft,
      y: e.touches[0].clientY - top - scrollTop,
    };
  }

  return {
    x: e.pageX - left - scrollLeft,
    y: e.pageY - top - scrollTop,
  };
};

const distanceBetween = (p1: Point | null, p2: Point | null): number => {
  if (p1 && p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  return 0;
};

const angleBetween = (p1: Point | null, p2: Point | null): number => {
  if (p1 && p2) {
    return Math.atan2(p2.x - p1.x, p2.y - p1.y);
  }
  return 0;
};

const ScratchCard = forwardRef<ScratchCardRef, Props>(function ScratchCard(props, ref) {
  const {
    width,
    height,
    image,
    finishPercent = 70,
    onComplete,
    brushSize = 20,
    fadeOutOnComplete = true,
    children,
    customBrush,
    customCheckZone,
  } = props;

  const [loaded, setLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const brushImageRef = useRef<HTMLImageElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const isFinished = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      ctxRef.current?.drawImage(img, 0, 0, width, height);
      setLoaded(true);
    };
    img.src = image;
    imageRef.current = img;

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
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    canvas.style.opacity = '1';
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, 0, 0, width, height);
    isFinished.current = false;
  }, [width, height]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  const getFilledInPixels = (stride: number): number => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return 0;

    const x = customCheckZone?.x ?? 0;
    const y = customCheckZone?.y ?? 0;
    const w = customCheckZone?.width ?? canvas.width;
    const h = customCheckZone?.height ?? canvas.height;

    const pixels = ctx.getImageData(x, y, w, h);
    const total = pixels.data.length / stride;
    let count = 0;

    for (let i = 0; i < pixels.data.length; i += stride) {
      if (pixels.data[i] === 0) {
        count++;
      }
    }

    return Math.round((count / total) * 100);
  };

  const handlePercentage = (filledInPixels: number) => {
    if (isFinished.current) return;

    if (filledInPixels > finishPercent) {
      const canvas = canvasRef.current;
      if (canvas && fadeOutOnComplete) {
        canvas.style.transition = '1s';
        canvas.style.opacity = '0';
      }
      onComplete?.();
      isFinished.current = true;
    }
  };

  const handlePointerDown = (e: MouseOrTouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPoint.current = getCoords(e, canvas);
  };

  const handlePointerMove = (e: MouseOrTouchEvent) => {
    if (!isDrawing.current) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const currentPoint = getCoords(e, canvas);
    const distance = distanceBetween(lastPoint.current, currentPoint);
    const angle = angleBetween(lastPoint.current, currentPoint);

    for (let i = 0; i < distance; i++) {
      const x = lastPoint.current ? lastPoint.current.x + Math.sin(angle) * i : 0;
      const y = lastPoint.current ? lastPoint.current.y + Math.cos(angle) * i : 0;

      ctx.globalCompositeOperation = 'destination-out';

      if (brushImageRef.current && customBrush) {
        ctx.drawImage(brushImageRef.current, x, y, customBrush.width, customBrush.height);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, 2 * Math.PI, false);
        ctx.fill();
      }
    }

    lastPoint.current = currentPoint;
    handlePercentage(getFilledInPixels(32));
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

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
  };

  const resultStyle: React.CSSProperties = {
    visibility: loaded ? 'visible' : 'hidden',
    width: '100%',
    height: '100%',
  };

  return (
    <div className='ScratchCard__Container' style={containerStyle}>
      <canvas
        ref={canvasRef}
        className='ScratchCard__Canvas'
        style={canvasStyle}
        width={width}
        height={height}
        onMouseDown={(e) => handlePointerDown(e)}
        onTouchStart={(e) => handlePointerDown(e)}
        onMouseMove={(e) => handlePointerMove(e)}
        onTouchMove={(e) => handlePointerMove(e)}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
      />
      <div className='ScratchCard__Result' style={resultStyle}>
        {children}
      </div>
    </div>
  );
});

export default ScratchCard;

export { CUSTOM_BRUSH_PRESET } from './brushPresets';
