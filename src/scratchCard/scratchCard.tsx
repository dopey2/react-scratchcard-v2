import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import {getCoords, getGlobalCoords} from "../canvas/canvas";
import type {Point} from "../math/math";
import type {Region} from "../region/region";
import {Controller} from "./controller";
import type {RevealAllOptions} from "./controller";
import {Cover, Covers} from "./cover";
import {Brush, Brushes} from "./brush";

export type {RevealAllOptions};
export type {Region};

export type Props = {
    width: number;
    height: number;
    cover?: Cover;
    brush?: Brush;
    /** Percentage of pixels that must be erased before `onComplete` fires. Defaults to `70`. */
    finishPercent?: number;
    /** Fires when the finishPercent is reached inside the defined scratching zone */
    onComplete?: () => void;
    /**
     * Fires when the user stops scratching, whether `finishPercent` was reached or not.
     * @param percent - Current percentage of pixels erased at the moment of release (0–100).
     *                  Always reflects the latest pixel state regardless of `scratchInterval`.
     */
    onScratchEnd?: (percent: number) => void;
    /**
     * Fires on each pixel sample during scratching. Throttled by `scratchInterval`.
     * @param percent - Current percentage of pixels erased (0–100).
     * @param position - Canvas-relative coordinates of the current pointer position.
     * @param globalPosition - Viewport (client) coordinates of the pointer.
     */
    onScratch?: (
        percent: number,
        position: Point,
        globalPosition: Point,
    ) => void;
    /** When `true`, scratching is blocked after `finishPercent` is reached. Defaults to `true`. */
    lockOnComplete?: boolean;
    /** When `false`, all pointer interaction is disabled. Defaults to `true`. */
    enabled?: boolean;
    children?: React.ReactNode;
    /**
     * Restricts where the user can scratch. Pixels outside the region cannot be erased.
     * Omit to allow scratching anywhere on the card.
     */
    scratchRegion?: Region;
    /**
     * When `true`, renders a background canvas behind the main canvas showing the cover
     * outside the `scratchRegion`. Only useful when applying CSS animations (e.g. a fade)
     * to the main canvas — without it, the outer cover would fade along with the scratch zone.
     * Has no effect without `scratchRegion`. Defaults to `false`.
     */
    coverBackground?: boolean;
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
    /** Fires when the user begins scratching (mousedown / touchstart). */
    onScratchStart?: () => void;
    /** Fires when the canvas is ready and the cover has been drawn. */
    onReady?: () => void;
    /** Fires if initialization fails (e.g. cover image or region mask fails to load). */
    onError?: (error: Error) => void;
};

export type ScratchCardRef = {
    /** Restores the scratch card to its initial covered state. Allows `onComplete` to fire again. */
    reset: () => void;
    /** Erases the remaining pixels. Pass `{ duration }` for an animated reveal. */
    revealAll: (options?: RevealAllOptions) => void;
    /** `true` once the cover has been drawn and the card is ready to be scratched. */
    isReady: boolean;
};

type MouseOrTouchEvent =
    | React.MouseEvent<HTMLCanvasElement>
    | React.TouchEvent<HTMLCanvasElement>;

const DEFAULT_COVER_COLOR = "#ccc";

const ScratchCardComponent: React.ForwardRefRenderFunction<ScratchCardRef, Props> = (props, ref) => {
    const {
        width,
        height,
        cover = Covers.color(DEFAULT_COVER_COLOR),
        brush = Brushes.circle(20),
        finishPercent = 70,
        onComplete,
        onScratchEnd,
        onScratchStart,
        onScratch,
        lockOnComplete = true,
        enabled = true,
        children,
        scratchRegion,
        coverBackground = false,
        validationRegion,
        imageSmoothingQuality = "low",
        scratchInterval = 50,
        ariaLabel,
        canvasProps,
        pixelRatio,
        onReady,
        onError,
    } = props;

    const [isReady, setIsReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const controllerRef = useRef<Controller | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        let isMounted = true;

        controllerRef.current = new Controller({
            canvas: canvasRef.current,
            bgCanvas: bgCanvasRef.current
        });

        controllerRef.current.init({
            width,
            height,
            pixelRatio,
            imageSmoothingQuality,
            cover,
            brush,
            scratchRegion,
            validationRegion,
            scratchInterval,
            finishPercent,
            lockOnComplete,
        }).then(() => {
            if (!isMounted) return;
            setIsReady(true);
            onReady?.();
        }).catch((err) => {
            if (!isMounted) return;
            const _err = err instanceof Error ? err : new Error(String(err))
            onError?.(_err)
        });

        return () => {
            isMounted = false;
            controllerRef.current?.dispose()
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reset = useCallback(() => {
        if (!isReady) return;
        controllerRef.current?.reset();
    }, [isReady]);

    const revealAll = useCallback(
        (options?: RevealAllOptions) => {
            if (!isReady) return;
            const controller = controllerRef.current;
            if (!controller) return;
            const wasComplete = controller.isComplete;
            controller.revealAll(options, () => {
                if (!wasComplete) onComplete?.();
            });
        },
        [isReady, onComplete],
    );

    useImperativeHandle(ref, () => ({reset, revealAll, isReady}), [
        reset,
        revealAll,
        isReady,
    ]);

    const handlePointerDown = (e: MouseOrTouchEvent) => {
        if (!enabled) return;
        const canvas = canvasRef.current;
        if (!canvas || !controllerRef.current) return;
        controllerRef.current.startStroke(getCoords(e, canvas));
        onScratchStart?.();
    };

    const handlePointerMove = (e: MouseOrTouchEvent) => {
        if (!enabled) return;
        const canvas = canvasRef.current;
        if (!canvas || !controllerRef.current) return;
        const point = getCoords(e, canvas);
        const result = controllerRef.current.applyStroke(point);
        if (!result) return;
        onScratch?.(result.percent, point, getGlobalCoords(e));
        if (result.complete) onComplete?.();
    };

    const handlePointerUp = useCallback(() => {
        const percent = controllerRef.current?.endStroke();
        if (percent != null) {
            onScratchEnd?.(percent);
        }
    }, [onScratchEnd]);

    useEffect(() => {
        window.addEventListener("mouseup", handlePointerUp);
        return () => window.removeEventListener("mouseup", handlePointerUp);
    }, [handlePointerUp]);


    const containerStyle = useMemo(() => buildContainerStyle(width, height), [width, height]);
    const canvasStyle = useMemo(() => buildCanvasStyle(width, height, isReady, enabled), [width, height, isReady, enabled]);
    const bgCanvasStyle = useMemo(() => buildBgCanvasStyle(width, height), [width, height]);
    const resultStyle = useMemo(() => buildResultStyle(isReady), [isReady]);

    const canvasClassName = ["ScratchCard__Canvas", canvasProps?.className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="ScratchCard__Container" style={containerStyle}>
            <canvas
                {...canvasProps}
                ref={canvasRef}
                className={canvasClassName}
                style={{...canvasProps?.style, ...canvasStyle}}
                width={width}
                height={height}
                role="img"
                aria-label={ariaLabel}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                onMouseMove={handlePointerMove}
                onTouchMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchEnd={handlePointerUp}
                onTouchCancel={handlePointerUp}
            />
            {scratchRegion && coverBackground && (
                <canvas
                    ref={bgCanvasRef}
                    className="ScratchCard__CoverBackground"
                    style={bgCanvasStyle}
                    width={width}
                    height={height}
                    aria-hidden
                />
            )}
            <div className="ScratchCard__Result" style={resultStyle}>
                {children}
            </div>
        </div>
    );
}

const ScratchCard = forwardRef<ScratchCardRef, Props>(ScratchCardComponent);
export default ScratchCard

const buildDimensionsStyle = (width: number, height: number) => {
    return {
        width: `${width}px`,
        height: `${height}px`,
    };
};

const buildContainerStyle = (width: number, height: number): React.CSSProperties => {
    return {
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        ...buildDimensionsStyle(width, height),
    };
};

const buildCanvasStyle = (width: number, height: number, isReady: boolean, enabled: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    zIndex: 1,
    touchAction: "none",
    pointerEvents: isReady && enabled ? "auto" : "none",
    ...buildDimensionsStyle(width, height),
});

const buildBgCanvasStyle = (width: number, height: number): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    zIndex: 0,
    pointerEvents: "none",
    ...buildDimensionsStyle(width, height),
});

const buildResultStyle = (isReady: boolean): React.CSSProperties => ({
    visibility: isReady ? "visible" : "hidden",
    width: "100%",
    height: "100%",
});
