import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import ScratchCard from './scratchCard';
import type { ScratchCardRef } from './scratchCard';

const opaque = [255, 255, 255, 255];
const transparent = new Uint8ClampedArray(4);

const mockCtx = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(opaque) })),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  globalCompositeOperation: '',
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
  mockCtx.beginPath.mockClear();
  mockCtx.arc.mockClear();
  mockCtx.fill.mockClear();
  mockCtx.globalCompositeOperation = '';
  mockCtx.getImageData.mockReturnValue({ data: new Uint8ClampedArray(opaque) });
});

const setup = (props: Partial<React.ComponentProps<typeof ScratchCard>> = {}) => {
  return render(
    <ScratchCard width={300} height={200} image='test.jpg' {...props} />
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

    it('fades canvas out on completion by default', () => {
      const { container } = setup();
      const canvas = container.querySelector('canvas') as HTMLElement;
      scratch(canvas);
      expect(canvas.style.opacity).toBe('0');
    });

    it('does not fade canvas when fadeOutOnComplete is false', () => {
      const { container } = setup({ fadeOutOnComplete: false });
      const canvas = container.querySelector('canvas') as HTMLElement;
      scratch(canvas);
      expect(canvas.style.opacity).not.toBe('0');
    });

    it('passes customCheckZone bounds to getImageData', () => {
      const customCheckZone = { x: 10, y: 20, width: 50, height: 30 };
      const { container } = setup({ customCheckZone });
      scratch(container.querySelector('canvas')!);
      expect(mockCtx.getImageData).toHaveBeenCalledWith(10, 20, 50, 30);
    });
  });

  describe('reset()', () => {
    it('restores canvas opacity after completion', () => {
      mockCtx.getImageData.mockReturnValue({ data: transparent });
      const ref = createRef<ScratchCardRef>();
      const { container } = setup({ ref });
      const canvas = container.querySelector('canvas') as HTMLElement;
      scratch(canvas);
      expect(canvas.style.opacity).toBe('0');
      act(() => { ref.current?.reset(); });
      expect(canvas.style.opacity).toBe('1');
    });

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
});
