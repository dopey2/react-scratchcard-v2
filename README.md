# react-scratchcard-v2

> A scratchcard component for React

[![NPM](https://img.shields.io/npm/v/react-scratchcard-v2.svg)](https://www.npmjs.com/package/react-scratchcard-v2)

##### Original repo by Aleksik (not maintained)

https://github.com/aleksik/react-scratchcard

##### V2 Improvement ✨

- Resize the image using width and height props (in the original repo, the image was croped)
- Smooth fade out animation on scratch complete
- Add type definition (ts)
- Change brush size through props
- Use custom brush through props
- Define a custom check zone through props

## Demo

![scratchcard-demo](https://user-images.githubusercontent.com/22329040/140519100-b6ee86e3-0009-4ab6-bcd0-c7fefdb8720d.gif)

## Install

```bash
npm install --save react-scratchcard-v2
```

or

```bash
yarn add react-scratchcard-v2
```

## Usage

```tsx
import ScratchCard, {Covers} from 'react-scratchcard-v2';
import coverImg from './cover.jpg';

function App() {
    return (
        <ScratchCard width={300} height={200} cover={Covers.image(coverImg)}>
            <h1>Content</h1>
        </ScratchCard>
    );
}
```

## Advanced Usage

```tsx
import {useRef} from 'react';
import ScratchCard, {Covers, Brushes, Regions, type ScratchCardRef} from 'react-scratchcard-v2';
import coverImg from './cover.jpg';
import scratchRegionImg from './scratchRegion.png';
import validationRegionImg from './validationRegion.png';
// import brushImg from './brush.png';

const COVER = Covers.image(coverImg);

const BRUSH = Brushes.circle(20);
// or use a custom image brush:
// const BRUSH = Brushes.image(brushImg, 20, 20);

// opaque pixels define the scratchable area
const SCRATCH_REGION = Regions.image(scratchRegionImg);

// opaque pixels define the area that counts toward scratch completion
// if not defined, completion is based on the entire canvas
const VALIDATION_REGION = Regions.image(validationRegionImg);

function App() {
    const ref = useRef<ScratchCardRef>(null);

    return (
        <>
            <button onClick={() => ref.current?.reset()}>Reset</button>

            <ScratchCard
                ref={ref}
                width={300}
                height={200}
                cover={COVER}
                brush={BRUSH}
                scratchRegion={SCRATCH_REGION}
                validationRegion={VALIDATION_REGION}
                finishPercent={80}
                onComplete={() => console.log('done')}
                onScratchStart={() => console.log('start')}
                onScratch={(percent, position, globalPosition) => console.log(percent, position, globalPosition)}
            >
                <h1>Content</h1>
            </ScratchCard>
        </>
    );
}
```

## API

### Props

| Prop                    | Type                                          | Default                | Description                                                                                                                            |
|-------------------------|-----------------------------------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `width`                 | `number`                                      | —                      | Canvas width in px                                                                                                                     |
| `height`                | `number`                                      | —                      | Canvas height in px                                                                                                                    |
| `cover`                 | `Cover`                                       | `Covers.color('#ccc')` | Cover drawn on the canvas. Use `Covers.color(color)` or `Covers.image(url)`                                                            |
| `brush`                 | `Brush`                                       | `Brushes.circle(20)`   | Brush shape. Use `Brushes.circle(radius)` or `Brushes.image(url, w, h)`                                                                |
| `finishPercent`         | `number`                                      | `70`                   | % of pixels erased before `onComplete` fires                                                                                           |
| `onComplete`            | `() => void`                                  | —                      | Called once when `finishPercent` is reached                                                                                            |
| `onScratchStart`        | `() => void`                                  | —                      | Called when the user begins scratching                                                                                                 |
| `onScratch`             | `(percent, position, globalPosition) => void` | —                      | Called on each pixel sample during scratching                                                                                          |
| `onScratchEnd`          | `(percent: number) => void`                   | —                      | Called when the user stops scratching                                                                                                  |
| `onReady`               | `() => void`                                  | —                      | Called when the cover is drawn and the card is interactive                                                                             |
| `onError`               | `(error: Error) => void`                      | —                      | Called if initialization fails                                                                                                         |
| `lockOnComplete`        | `boolean`                                     | `true`                 | Block scratching after `finishPercent` is reached                                                                                      |
| `enabled`               | `boolean`                                     | `true`                 | Enable or disable all pointer interaction                                                                                              |
| `scratchRegion`         | `Region`                                      | —                      | Restrict where the user can scratch                                                                                                    |
| `validationRegion`      | `Region`                                      | —                      | Restrict which pixels count toward `finishPercent`                                                                                     |
| `pixelRatio`            | `number`                                      | `devicePixelRatio`     | Canvas buffer scale. Set `1` to disable HiDPI scaling                                                                                  |
| `scratchInterval`       | `number`                                      | `50`                   | Min ms between `onScratch` calls                                                                                                       |
| `imageSmoothingQuality` | `ImageSmoothingQuality`                       | `'low'`                | Canvas image smoothing quality. Check https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality  |
| `ariaLabel`             | `string`                                      | —                      | Accessible label for the canvas element                                                                                                |
| `canvasProps`           | `CanvasHTMLAttributes`                        | —                      | Extra props forwarded to the `<canvas>` element                                                                                        |
| `children`              | `ReactNode`                                   | —                      | Content revealed beneath the canvas                                                                                                    |

### Ref

Access via `useRef<ScratchCardRef>`.

| Member                | Type                                                            | Description                                                                                                                                     |
|-----------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `reset()`             | `() => void`                                                    | Restore to initial covered state. Allows `onComplete` to fire again                                                                             |
| `revealAll(options?)` | `(options?: { duration?: number; blockSize?: number }) => void` | Erase remaining pixels. Pass `{ duration }` for an animated reveal. `blockSize` controls the N×N pixel block size erased per step (default `1`) |
| `isReady`             | `boolean`                                                       | `true` once the cover has been drawn and the card is interactive                                                                                |

## License

MIT © [dopey2](https://github.com/dopey2)
