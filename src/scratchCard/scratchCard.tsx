import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getCoords, getFilledInPixels, type CustomCheckZone } from '../canvas/canvas';
import { angleBetween, distanceBetween, type Point } from '../math/math';

export type CustomBrush = {
  image: string;
  width: number;
  height: number;
};

export type { CustomCheckZone };

export type Props = {
  width: number;
  height: number;
  image: string;
  finishPercent?: number;
  onComplete?: () => void;
  onScratchEnd?: () => void;
  onScratch?: (percent: number) => void;
  brushSize?: number;
  fadeOutOnComplete?: boolean;
  children?: React.ReactNode;
  customBrush?: CustomBrush;
  customCheckZone?: CustomCheckZone;
};

export type ScratchCardRef = {
  reset: () => void;
};

type MouseOrTouchEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

const ScratchCard = forwardRef<ScratchCardRef, Props>(function ScratchCard(
  props,
  ref
) {
  const {
    width,
    height,
    image,
    finishPercent = 70,
    onComplete,
    onScratchEnd,
    onScratch,
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
    const filledInPercent = getFilledInPixels(32, ctx, canvas, customCheckZone);
    onScratch?.(filledInPercent);
    handlePercentage(filledInPercent);
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
        onTouchCancel={handlePointerUp}
      />
      <div className='ScratchCard__Result' style={resultStyle}>
        {children}
      </div>
    </div>
  );
});

export default ScratchCard;
