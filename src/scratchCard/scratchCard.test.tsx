import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import ScratchCard from './scratchCard';
import type { ScratchCardRef } from './scratchCard';

const opaque = [255, 255, 255, 255];
const transparent = new Uint8ClampedArray(4);

const mockCtx = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(opaque) })),
  putImageData: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  scale: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  clip: vi.fn(),
  globalCompositeOperation: '',
  imageSmoothingQuality: 'low',
};

beforeAll(() => {
  class MockImage {
    onload: (() => void) | null = null;
    crossOrigin = '';
    set src(_: string) {
      this.onload?.();
    }
  }
  vi.stubGlobal('Image', MockImage);
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as never;
});

beforeEach(() => {
  mockCtx.drawImage.mockClear();
  mockCtx.getImageData.mockReset();
  mockCtx.putImageData.mockClear();
  mockCtx.beginPath.mockClear();
  mockCtx.arc.mockClear();
  mockCtx.fill.mockClear();
  mockCtx.scale.mockClear();
  mockCtx.save.mockClear();
  mockCtx.restore.mockClear();
  mockCtx.clip.mockClear();
  mockCtx.globalCompositeOperation = '';
  mockCtx.getImageData.mockReturnValue({ data: new Uint8ClampedArray(opaque) });
});

const setup = (props: Partial<React.ComponentProps<typeof ScratchCard>> = {}) => {
  return render(
    <ScratchCard width={300} height={200} coverImage='test.jpg' scratchInterval={0} {...props} />
  );
};

const scratch = (canvas: Element, from = { x: 50, y: 50 }, to = { x: 100, y: 100 }) => {
  fireEvent.mouseDown(canvas, { clientX: from.x, clientY: from.y });
  fireEvent.mouseMove(canvas, { clientX: to.x, clientY: to.y });
};

describe('ScratchCard', () => {
  describe('rendering', () => {
    it('renders container and canvas', () => {
      const { container } = setup();
      expect(container.querySelector('.ScratchCard__Container')).toBeInTheDocument();
      expect(container.querySelector('.ScratchCard__Canvas')).toBeInTheDocument();
    });

    it('renders children', () => {
      const { getByText } = setup({ children: <div>You Win!</div> });
      expect(getByText('You Win!')).toBeInTheDocument();
    });

    it('applies width and height to canvas element', () => {
      const { container } = setup({ width: 400, height: 300 });
      const canvas = container.querySelector('canvas')!;
      expect(canvas.getAttribute('width')).toBe('400');
      expect(canvas.getAttribute('height')).toBe('300');
    });

    it('applies width and height to container style', () => {
      const { container } = setup({ width: 400, height: 300 });
      const div = container.querySelector('.ScratchCard__Container') as HTMLElement;
      expect(div.style.width).toBe('400px');
      expect(div.style.height).toBe('300px');
    });

    it('shows result div after image loads', () => {
      const { container } = setup();
      const result = container.querySelector('.ScratchCard__Result') as HTMLElement;
      expect(result.style.visibility).toBe('visible');
    });
  });

  describe('drawing', () => {
    it('uses destination-out composite operation on mousemove', () => {
      const { container } = setup();
      scratch(container.querySelector('canvas')!);
      expect(mockCtx.globalCompositeOperation).toBe('destination-out');
    });

    it('uses destination-out composite operation on touchmove', () => {
      const { container } = setup();
      const canvas = container.querySelector('canvas')!;
      fireEvent.touchStart(canvas, { touches: [{ clientX: 50, clientY: 50 }] });
      fireEvent.touchMove(canvas, { touches: [{ clientX: 100, clientY: 100 }] });
      expect(mockCtx.globalCompositeOperation).toBe('destination-out');
    });

    it('does not draw when mouse was not pressed first', () => {
      const { container } = setup();
      fireEvent.mouseMove(container.querySelector('canvas')!, { clientX: 100, clientY: 100 });
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });

    it('stops drawing after mouseup', () => {
      const { container } = setup();
      const canvas = container.querySelector('canvas')!;
      scratch(canvas);
      const callsBeforeUp = mockCtx.arc.mock.calls.length;
      fireEvent.mouseUp(canvas);
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      expect(mockCtx.arc.mock.calls.length).toBe(callsBeforeUp);
    });
  });

  describe('scratchInterval', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('samples on every move when scratchInterval is 0', () => {
      const { container } = setup({ scratchInterval: 0 });
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(2);
    });

    it('skips sampling within the interval', () => {
      const { container } = setup({ scratchInterval: 50 });
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(1);
    });

    it('samples again after the interval has passed', () => {
      const { container } = setup({ scratchInterval: 50 });
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      vi.advanceTimersByTime(51);
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(2);
    });

    it('throttles onScratch within the interval', () => {
      const onScratch = vi.fn();
      const { container } = setup({ scratchInterval: 50, onScratch });
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      expect(onScratch).toHaveBeenCalledTimes(1);
    });

    it('drawing is not throttled — arc is called on every move regardless of interval', () => {
      const { container } = setup({ scratchInterval: 50 });
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      const arcCallsAfterFirst = mockCtx.arc.mock.calls.length;
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      expect(mockCtx.arc.mock.calls.length).toBeGreaterThan(arcCallsAfterFirst);
    });
  });

  describe('completion', () => {
    beforeEach(() => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
    });

    it('calls onComplete when scratch threshold is reached', () => {
      const onComplete = vi.fn();
      const { container } = setup({ onComplete });
      scratch(container.querySelector('canvas')!);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call onComplete after revealAll via further scratching', () => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
      const onComplete = vi.fn();
      const ref = createRef<ScratchCardRef>();
      const { container } = setup({ ref, onComplete });
      act(() => { ref.current?.revealAll(); });
      scratch(container.querySelector('canvas')!);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('calls onComplete only once across multiple moves', () => {
      const onComplete = vi.fn();
      const { container } = setup({ onComplete });
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('always reads the full canvas buffer for pixel sampling', () => {
      const { container } = setup();
      scratch(container.querySelector('canvas')!);
      expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 300, 200);
    });
  });

  describe('onScratchEnd', () => {
    it('fires onScratchEnd on mouseup', () => {
      const onScratchEnd = vi.fn();
      const { container } = setup({ onScratchEnd });
      const canvas = container.querySelector('canvas')!;
      scratch(canvas);
      fireEvent.mouseUp(canvas);
      expect(onScratchEnd).toHaveBeenCalledTimes(1);
    });

    it('fires onScratchEnd on touchend', () => {
      const onScratchEnd = vi.fn();
      const { container } = setup({ onScratchEnd });
      const canvas = container.querySelector('canvas')!;
      fireEvent.touchStart(canvas, { touches: [{ clientX: 50, clientY: 50 }] });
      fireEvent.touchMove(canvas, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(canvas);
      expect(onScratchEnd).toHaveBeenCalledTimes(1);
    });

    it('fires onScratchEnd on global mouseup (released outside canvas)', () => {
      const onScratchEnd = vi.fn();
      const { container } = setup({ onScratchEnd });
      scratch(container.querySelector('canvas')!);
      fireEvent.mouseUp(window);
      expect(onScratchEnd).toHaveBeenCalledTimes(1);
    });

    it('does not fire onScratchEnd if pointer was never down', () => {
      const onScratchEnd = vi.fn();
      setup({ onScratchEnd });
      fireEvent.mouseUp(window);
      expect(onScratchEnd).not.toHaveBeenCalled();
    });
  });

  describe('revealAll()', () => {
    it('calls onComplete', () => {
      const onComplete = vi.fn();
      const ref = createRef<ScratchCardRef>();
      setup({ ref, onComplete });
      act(() => { ref.current?.revealAll(); });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call onComplete a second time', () => {
      const onComplete = vi.fn();
      const ref = createRef<ScratchCardRef>();
      setup({ ref, onComplete });
      act(() => { ref.current?.revealAll(); });
      act(() => { ref.current?.revealAll(); });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('allows onComplete to fire again after reset', () => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
      const onComplete = vi.fn();
      const ref = createRef<ScratchCardRef>();
      const { container } = setup({ ref, onComplete });
      act(() => { ref.current?.revealAll(); });
      act(() => { ref.current?.reset(); });
      scratch(container.querySelector('canvas')!);
      expect(onComplete).toHaveBeenCalledTimes(2);
    });

    it('does not call onComplete if already completed via scratch', () => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
      const onComplete = vi.fn();
      const ref = createRef<ScratchCardRef>();
      const { container } = setup({ ref, onComplete });
      scratch(container.querySelector('canvas')!);
      act(() => { ref.current?.revealAll(); });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    describe('animated (duration option)', () => {
      beforeEach(() => { vi.useFakeTimers(); });
      afterEach(() => { vi.useRealTimers(); });

      it('does not call onComplete immediately when duration is given', () => {
        const opaqueData = new Uint8ClampedArray([255, 255, 255, 255]);
        mockCtx.getImageData.mockReturnValue({ data: opaqueData });
        const onComplete = vi.fn();
        const ref = createRef<ScratchCardRef>();
        setup({ ref, onComplete });
        act(() => { ref.current?.revealAll({ duration: 100 }); });
        expect(onComplete).not.toHaveBeenCalled();
      });

      it('calls onComplete after animation finishes', () => {
        const opaqueData = new Uint8ClampedArray([255, 255, 255, 255]);
        mockCtx.getImageData.mockReturnValue({ data: opaqueData });
        const onComplete = vi.fn();
        const ref = createRef<ScratchCardRef>();
        setup({ ref, onComplete });
        act(() => { ref.current?.revealAll({ duration: 100 }); });
        act(() => { vi.runAllTimers(); });
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('calls putImageData during animation', () => {
        const putImageData = vi.fn();
        (HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>).mockReturnValue({
          ...mockCtx,
          putImageData,
        });
        const opaqueData = new Uint8ClampedArray([255, 255, 255, 255]);
        mockCtx.getImageData.mockReturnValue({ data: opaqueData });
        const ref = createRef<ScratchCardRef>();
        setup({ ref });
        act(() => { ref.current?.revealAll({ duration: 100 }); });
        act(() => { vi.advanceTimersByTime(16); });
        expect(putImageData).toHaveBeenCalled();
        (HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>).mockReturnValue(mockCtx);
      });

      it('cancels animation and does not call onComplete when reset mid-animation', () => {
        const opaqueData = new Uint8ClampedArray([255, 255, 255, 255]);
        mockCtx.getImageData.mockReturnValue({ data: opaqueData });
        const onComplete = vi.fn();
        const ref = createRef<ScratchCardRef>();
        setup({ ref, onComplete });
        act(() => { ref.current?.revealAll({ duration: 100 }); });
        act(() => { ref.current?.reset(); });
        act(() => { vi.runAllTimers(); });
        expect(onComplete).not.toHaveBeenCalled();
      });

      it('skips animation when all pixels are already transparent', () => {
        mockCtx.getImageData.mockReturnValue({ data: new Uint8ClampedArray([255, 255, 255, 0]) });
        const onComplete = vi.fn();
        const ref = createRef<ScratchCardRef>();
        setup({ ref, onComplete });
        act(() => { ref.current?.revealAll({ duration: 100 }); });
        act(() => { vi.runAllTimers(); });
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('lockOnComplete', () => {
    beforeEach(() => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
    });

    describe('true (default)', () => {
      it('blocks further scratching after threshold is reached', () => {
        const { container } = setup();
        const canvas = container.querySelector('canvas')!;
        scratch(canvas);
        const arcCallsAfterComplete = mockCtx.arc.mock.calls.length;
        scratch(canvas);
        expect(mockCtx.arc.mock.calls.length).toBe(arcCallsAfterComplete);
      });

      it('calls onComplete only once even when scratching continues', () => {
        const onComplete = vi.fn();
        const { container } = setup({ onComplete });
        const canvas = container.querySelector('canvas')!;
        scratch(canvas);
        scratch(canvas);
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    describe('false', () => {
      it('allows scratching to continue after threshold is reached', () => {
        const { container } = setup({ lockOnComplete: false });
        const canvas = container.querySelector('canvas')!;
        scratch(canvas);
        const arcCallsAfterComplete = mockCtx.arc.mock.calls.length;
        scratch(canvas);
        expect(mockCtx.arc.mock.calls.length).toBeGreaterThan(arcCallsAfterComplete);
      });

      it('calls onComplete only once even when scratching continues', () => {
        const onComplete = vi.fn();
        const { container } = setup({ lockOnComplete: false, onComplete });
        const canvas = container.querySelector('canvas')!;
        scratch(canvas);
        scratch(canvas);
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('does not call onComplete again when revealAll is called after threshold', () => {
        const onComplete = vi.fn();
        const ref = createRef<ScratchCardRef>();
        setup({ ref, lockOnComplete: false, onComplete });
        scratch(document.querySelector('canvas')!);
        act(() => { ref.current?.revealAll(); });
        expect(onComplete).toHaveBeenCalledTimes(1);
      });

      it('allows onComplete to fire again after reset', () => {
        const onComplete = vi.fn();
        const ref = createRef<ScratchCardRef>();
        const { container } = setup({ ref, lockOnComplete: false, onComplete });
        const canvas = container.querySelector('canvas')!;
        scratch(canvas);
        act(() => { ref.current?.reset(); });
        scratch(canvas);
        expect(onComplete).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('reset()', () => {
    it('allows onComplete to fire again after reset', () => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
      const onComplete = vi.fn();
      const ref = createRef<ScratchCardRef>();
      const { container } = setup({ ref, onComplete });
      const canvas = container.querySelector('canvas')!;
      scratch(canvas);
      expect(onComplete).toHaveBeenCalledTimes(1);
      act(() => { ref.current?.reset(); });
      scratch(canvas);
      expect(onComplete).toHaveBeenCalledTimes(2);
    });
  });

  describe('devicePixelRatio scaling', () => {
    afterEach(() => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
    });

    it('scales canvas buffer by DPR on mount', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
      const { container } = setup({ width: 300, height: 200 });
      const canvas = container.querySelector('canvas')!;
      expect(canvas.width).toBe(600);
      expect(canvas.height).toBe(400);
    });

    it('is a no-op at DPR=1 — buffer matches props', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
      const { container } = setup({ width: 300, height: 200 });
      const canvas = container.querySelector('canvas')!;
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(200);
    });

    it('calls ctx.scale with DPR on mount', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
      setup();
      expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);
    });

    it('arc coordinates are CSS pixels, not pre-multiplied by DPR', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
      const { container } = setup();
      scratch(container.querySelector('canvas')!, { x: 50, y: 50 }, { x: 60, y: 60 });
      mockCtx.arc.mock.calls.forEach((call: number[]) => {
        expect(call[0]).toBeLessThan(200);
        expect(call[1]).toBeLessThan(200);
      });
    });

    it('always reads the full canvas buffer regardless of DPR', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
      const { container } = setup();
      scratch(container.querySelector('canvas')!);
      expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 600, 400);
    });

    it('pixelRatio prop overrides window.devicePixelRatio', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true });
      const { container } = setup({ width: 300, height: 200, pixelRatio: 1 });
      const canvas = container.querySelector('canvas')!;
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(200);
      expect(mockCtx.scale).toHaveBeenCalledWith(1, 1);
    });
  });
});

describe('background canvas', () => {
  it('is not rendered without scratchRegion', () => {
    const { container } = setup();
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
  });

  it('is rendered when scratchRegion is set', () => {
    const { container } = setup({ scratchRegion: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
    expect(container.querySelectorAll('canvas')).toHaveLength(2);
  });

  it('has aria-hidden and no pointer events', () => {
    const { container } = setup({ scratchRegion: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
    const bg = container.querySelector('.ScratchCard__CoverBackground') as HTMLElement;
    expect(bg.getAttribute('aria-hidden')).toBe('true');
    expect(bg.style.pointerEvents).toBe('none');
  });

  it('sits behind the main canvas (lower z-index)', () => {
    const { container } = setup({ scratchRegion: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
    const main = container.querySelector('.ScratchCard__Canvas') as HTMLElement;
    const bg = container.querySelector('.ScratchCard__CoverBackground') as HTMLElement;
    expect(Number(main.style.zIndex)).toBeGreaterThan(Number(bg.style.zIndex));
  });

  it('erases the scratch region interior on mount using destination-out', () => {
    mockCtx.getImageData.mockReturnValue({ data: new Uint8ClampedArray(300 * 200 * 4).fill(255) });
    setup({ coverColor: '#f00', scratchRegion: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
    const ops = mockCtx.fillRect.mock.calls;
    // at least two fillRect calls: one for main cover, one for bg cover, one for destination-out erase
    expect(ops.length).toBeGreaterThanOrEqual(3);
    expect(mockCtx.clip).toHaveBeenCalled();
  });

  it('redraws bg canvas on reset()', () => {
    const ref = createRef<ScratchCardRef>();
    setup({ ref, coverColor: '#f00', scratchRegion: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } });
    const fillRectCallsAfterMount = mockCtx.fillRect.mock.calls.length;
    act(() => { ref.current?.reset(); });
    expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(fillRectCallsAfterMount);
  });
});
