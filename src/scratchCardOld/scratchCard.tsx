import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import {getBlockOriginIndices, getCoords, getFilledInPixels, getGlobalCoords} from '../canvas/canvas';
import {angleBetween, distanceBetween, shuffleInPlace, type Point} from '../math/math';
import {buildRegionMask, buildRegionPath, type Region} from '../region/region';

export type CustomBrush = {
    /** URL or base64 data URL of the brush image. */
    image: string;
    /** Brush width in pixels. */
    width: number;
    /** Brush height in pixels. */
    height: number;
};

export type {Region};

export type Props = {
    width: number;
    height: number;
    /** URL or base64 data URL of the image drawn as the scratch-off cover. */
    coverImage?: string;
    /** Solid color cover — used when `coverImage` is not provided. Defaults to `#ccc`. */
    coverColor?: string;
    /** Percentage of pixels that must be erased before `onComplete` fires. Defaults to `70`. */
    finishPercent?: number;
    /** Fires when the finishPercent is reached inside the defined scratching zone */
    onComplete?: () => void;
    /** Fires when the user stops scratching, whether `finishPercent` was reached or not. */
    onScratchEnd?: () => void;
    /**
     * Fires on each pixel sample during scratching. Throttled by `scratchInterval`.
     * @param percent - Current percentage of pixels erased (0–100).
     * @param lastPosition - Canvas coordinates of the last pointer position.
     * @param globalPosition - Viewport (client) coordinates of the pointer.
     */
    onScratch?: (percent: number, lastPosition: Point, globalPosition: Point) => void;
    /** Size of the brush circle in pixels. Ignored when `customBrush` is set. Defaults to `20`. */
    brushSize?: number;
    /** When `true`, scratching is blocked after `finishPercent` is reached. Defaults to `true`. */
    lockOnComplete?: boolean;
    children?: React.ReactNode;
    /** Image brush — replaces the default filled circle. Use `CUSTOM_BRUSH_PRESET` as a starting point. */
    customBrush?: CustomBrush;
    /**
     * Restricts where the user can scratch. Pixels outside the region cannot be erased.
     * Omit to allow scratching anywhere on the card.
     */
    scratchRegion?: Region;
    /**
     * Restricts the region that counts toward `finishPercent`.
     * Only pixels within this region contribute to the completion percentage.
     * Omit to count the entire card.
     */
    validationRegion?: Region;
    /** Canvas `imageSmoothingQuality` used when drawing the cover image. Defaults to `'low'`. */
    imageSmoothingQuality?: ImageSmoothingQuality;
    /**
     * Minimum milliseconds between `onScratch` callbacks. Does not affect the visual scratching effect —
     * brush strokes are drawn on every move regardless. Lower values call `onScratch` more frequently
     * at higher CPU cost. Set to `0` to fire on every move. Defaults to `50`.
     */
    scratchInterval?: number;
    ariaLabel?: string;
    /** HTML attributes passed through to the underlying `<canvas>` element. */
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    /**
     * Controls the canvas buffer scaling factor.
     *
     * Set to `undefined` for better quality if performance is not an issue — automatically uses
     * `window.devicePixelRatio` for sharp rendering on HiDPI screens (Retina, high-density mobile).
     *
     * - `undefined` (default) — auto-detects `window.devicePixelRatio`. The buffer is scaled up
     *   so every physical pixel is drawn 1:1, eliminating blur. Higher memory usage.
     *
     * - `1` — disables automatic scaling. Buffer matches CSS size exactly. Use this if you notice
     *   performance issues on large canvases or low-end devices. Blurry on HiDPI screens.
     *
     * Trade-off: `undefined` = sharper image, higher memory; `1` = lower memory, blurry on HiDPI.
     */
    pixelRatio?: number;
};

export type RevealAllOptions = {
    /** Animation duration in ms. Omit for an instant reveal. */
    duration?: number;
    /** How often the reveal animation updates in ms. Defaults to `16` (~60 fps). */
    interval?: number;
    /**
     * Erases pixels in N×N blocks. Each randomly selected pixel acts as the top-left
     * corner of a block — right, bottom, and bottom-right neighbors are erased together.
     * Defaults to `1` (individual pixels).
     */
    blockSize?: number;
};

export type ScratchCardRef = {
    /** Restores the scratch card to its initial covered state. Allows `onComplete` to fire again. */
    reset: () => void;
    /** Erases the remaining pixels. Pass `{ duration }` for an animated reveal. */
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
        scratchRegion,
        validationRegion,
        imageSmoothingQuality = 'low',
        scratchInterval = 50,
        ariaLabel,
        canvasProps,
        pixelRatio,
    } = props;

    const [loaded, setLoaded] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const bgCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const brushImageRef = useRef<HTMLImageElement | null>(null);
    const isScratching = useRef(false);
    const lastPointerPos = useRef<Point | null>(null);
    const isScratchingLocked = useRef(false);
    const hasCompleted = useRef(false);
    const lastSampleTime = useRef(0);
    const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dprRef = useRef(1);
    const scratchMaskRef = useRef<boolean[] | null>(null);
    const validationMaskRef = useRef<boolean[] | null>(null);
    const scratchRegionPathRef = useRef<Path2D | null>(null);

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

    // Redraws the background canvas: full cover with the scratch region interior erased.
    // This creates a "donut" that stays visible under the main canvas when it fades via CSS.
    const drawBgCover = useCallback(() => {
        const bgCanvas = bgCanvasRef.current;
        const bgCtx = bgCtxRef.current;
        if (!bgCanvas || !bgCtx) return;

        drawCover(bgCtx);

        if (scratchRegionPathRef.current) {
            bgCtx.globalCompositeOperation = 'destination-out';
            bgCtx.save();
            bgCtx.clip(scratchRegionPathRef.current);
            bgCtx.fillRect(0, 0, width, height);
            bgCtx.restore();
            bgCtx.globalCompositeOperation = 'source-over';
        } else if (scratchMaskRef.current) {
            const imageData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height);
            const {data} = imageData;
            for (let i = 3; i < data.length; i += 4) {
                if (scratchMaskRef.current[(i - 3) / 4]) data[i] = 0;
            }
            bgCtx.putImageData(imageData, 0, 0);
        }
    }, [drawCover, width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        dprRef.current = pixelRatio ?? window.devicePixelRatio ?? 1;

        // Set buffer dimensions first — assigning canvas.width resets context state.
        // scale() and imageSmoothingQuality must be applied after.
        ctxRef.current = canvas.getContext('2d', {willReadFrequently: true});
        canvas.width = Math.floor(width * dprRef.current);
        canvas.height = Math.floor(height * dprRef.current);
        if (ctxRef.current) {
            ctxRef.current.scale(dprRef.current, dprRef.current);
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

        if (scratchRegion) {
            const bgCanvas = bgCanvasRef.current;
            if (bgCanvas) {
                bgCtxRef.current = bgCanvas.getContext('2d');
                bgCanvas.width = Math.floor(width * dprRef.current);
                bgCanvas.height = Math.floor(height * dprRef.current);
                if (bgCtxRef.current) {
                    bgCtxRef.current.scale(dprRef.current, dprRef.current);
                    bgCtxRef.current.imageSmoothingQuality = imageSmoothingQuality;
                }
            }

            // Build path before mask so it's available when the (synchronous) callback fires.
            if (scratchRegion.type !== 'image') {
                scratchRegionPathRef.current = buildRegionPath(scratchRegion);
            }

            buildRegionMask(scratchRegion, canvas.width, canvas.height, dprRef.current, (mask) => {
                scratchMaskRef.current = mask;
                drawBgCover();
            });
        }

        if (validationRegion) {
            buildRegionMask(validationRegion, canvas.width, canvas.height, dprRef.current, (mask) => {
                validationMaskRef.current = mask;
            });
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
        drawBgCover();
        isScratchingLocked.current = false;
        hasCompleted.current = false;
    }, [drawCover, drawBgCover]);

    const finish = useCallback(() => {
        if (!hasCompleted.current) {
            hasCompleted.current = true;
            onComplete?.();
        }
        isScratchingLocked.current = true;
    }, [onComplete]);

    const revealAll = useCallback((options?: RevealAllOptions) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current);
            revealIntervalRef.current = null;
        }

        // instant clear, no animations
        if (!options?.duration) {
            ctx.globalCompositeOperation = 'destination-out';
            if (scratchRegionPathRef.current) {
                ctx.save();
                ctx.clip(scratchRegionPathRef.current);
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            } else if (scratchMaskRef.current) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const {data} = imageData;
                for (let i = 3; i < data.length; i += 4) {
                    if (scratchMaskRef.current[(i - 3) / 4]) data[i] = 0;
                }
                ctx.putImageData(imageData, 0, 0);
            } else {
                ctx.fillRect(0, 0, width, height);
            }
            finish();
            return;
        }

        const {duration, interval = 16, blockSize = 1} = options;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const {data} = imageData;
        const bufferWidth = canvas.width;
        const bufferHeight = canvas.height;
        const bufferBlockSize = Math.max(1, Math.round(blockSize * dprRef.current));
        const entryStep = Math.max(1, Math.round(dprRef.current));

        const opaque = getBlockOriginIndices(bufferWidth, bufferHeight, entryStep, scratchMaskRef.current);
        shuffleInPlace(opaque);

        const startTime = Date.now();
        let offset = 0;

        revealIntervalRef.current = setInterval(() => {
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
                clearInterval(revealIntervalRef.current!);
                revealIntervalRef.current = null;
                finish();
            }
        }, interval);
    }, [width, height, finish]);

    useImperativeHandle(ref, () => ({reset, revealAll}), [reset, revealAll]);

    const handlePercentage = (filledInPixels: number) => {
        if (hasCompleted.current) return;

        if (filledInPixels > finishPercent) {
            hasCompleted.current = true;
            onComplete?.();
            if (lockOnComplete) isScratchingLocked.current = true;
        }
    };

    const handlePointerDown = (e: MouseOrTouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || isScratchingLocked.current) return;
        isScratching.current = true;
        lastPointerPos.current = getCoords(e, canvas);
    };

    const handlePointerMove = (e: MouseOrTouchEvent) => {
        if (!isScratching.current || isScratchingLocked.current) return;

        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        const currentPoint = getCoords(e, canvas);
        const distance = distanceBetween(lastPointerPos.current, currentPoint);
        const angle = angleBetween(lastPointerPos.current, currentPoint);

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        if (scratchRegionPathRef.current) {
            ctx.clip(scratchRegionPathRef.current);
        }

        for (let i = 0; i < distance; i++) {
            const x = lastPointerPos.current
                ? lastPointerPos.current.x + Math.sin(angle) * i
                : 0;
            const y = lastPointerPos.current
                ? lastPointerPos.current.y + Math.cos(angle) * i
                : 0;

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

        ctx.restore();

        lastPointerPos.current = currentPoint;

        const now = Date.now();
        if (now - lastSampleTime.current >= scratchInterval) {
            lastSampleTime.current = now;
            const filledInPercent = getFilledInPixels(32, ctx, canvas, validationMaskRef.current ?? scratchMaskRef.current);
            onScratch?.(filledInPercent, currentPoint, getGlobalCoords(e));
            handlePercentage(filledInPercent);
        }
    };

    const handlePointerUp = useCallback(() => {
        if (!isScratching.current) return;
        isScratching.current = false;
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

    const bgCanvasStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        zIndex: 0,
        pointerEvents: 'none',
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
                style={{...canvasProps?.style, ...canvasStyle}}
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
            {scratchRegion && (
                <canvas
                    ref={bgCanvasRef}
                    className='ScratchCard__CoverBackground'
                    style={bgCanvasStyle}
                    width={width}
                    height={height}
                    aria-hidden
                />
            )}
            <div className='ScratchCard__Result' style={resultStyle}>
                {children}
            </div>
        </div>
    );
});

export default ScratchCard;