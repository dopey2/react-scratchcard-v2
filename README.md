# react-scratchcard-v2

> A canvas-based scratchcard component for React <br>
> Originally forked from [aleksik/react-scratchcard](https://github.com/aleksik/react-scratchcard), with a significant
> API expansion — customisable covers, brushes, scratch/validation masks and more.


[![NPM](https://img.shields.io/npm/v/react-scratchcard-v2.svg)](https://www.npmjs.com/package/react-scratchcard-v2)

## Demo

![scratchcard-demo](https://user-images.githubusercontent.com/22329040/140519100-b6ee86e3-0009-4ab6-bcd0-c7fefdb8720d.gif)

More live examples: https://dopey2.github.io/react-scratchcard-v2

## Install

```bash
npm install react-scratchcard-v2
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

const COVER = Covers.image(coverImg);
const BRUSH = Brushes.circle(20);
// or: Brushes.image(brushImg, 20, 20)

// opaque pixels define the scratchable area
const SCRATCH_REGION = Regions.image(scratchRegionImg);

// opaque pixels define the area that counts toward completion
// if omitted, the full canvas (or scratchRegion) is used
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

## Props

| Prop                    | Type                                          | Default                | Description                                                                                                                                                                                                              |
|-------------------------|-----------------------------------------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `width`                 | `number`                                      | —                      | Canvas width in px                                                                                                                                                                                                       |
| `height`                | `number`                                      | —                      | Canvas height in px                                                                                                                                                                                                      |
| `cover`                 | `Cover`                                       | `Covers.color('#ccc')` | Cover drawn on the canvas. Use `Covers.color(color)` or `Covers.image(url)`                                                                                                                                              |
| `brush`                 | `Brush`                                       | `Brushes.circle(20)`   | Brush shape. Use `Brushes.circle(radius)` or `Brushes.image(url, w, h)`                                                                                                                                                  |
| `finishPercent`         | `number`                                      | `70`                   | % of pixels erased before `onComplete` fires                                                                                                                                                                             |
| `onComplete`            | `() => void`                                  | —                      | Called once when `finishPercent` is reached                                                                                                                                                                              |
| `onScratchStart`        | `() => void`                                  | —                      | Called when the user begins scratching                                                                                                                                                                                   |
| `onScratch`             | `(percent, position, globalPosition) => void` | —                      | Called on each pixel sample during scratching                                                                                                                                                                            |
| `onScratchEnd`          | `(percent: number) => void`                   | —                      | Called when the user stops scratching                                                                                                                                                                                    |
| `onReady`               | `() => void`                                  | —                      | Called when the cover is drawn and the card is interactive                                                                                                                                                               |
| `onError`               | `(error: Error) => void`                      | —                      | Called if initialization fails                                                                                                                                                                                           |
| `lockOnComplete`        | `boolean`                                     | `true`                 | Block scratching after `finishPercent` is reached                                                                                                                                                                        |
| `enabled`               | `boolean`                                     | `true`                 | Enable or disable all pointer interaction                                                                                                                                                                                |
| `scratchRegion`         | `Region`                                      | —                      | Restrict where the user can scratch                                                                                                                                                                                      |
| `validationRegion`      | `Region`                                      | —                      | Restrict which pixels count toward `finishPercent`                                                                                                                                                                       |
| `coverBackground`       | `boolean`                                     | `false`                | Renders a background canvas showing the cover outside `scratchRegion`. Useful when applying CSS animations to the main canvas — without it, the outer ring disappears with the canvas. No effect without `scratchRegion` |
| `pixelRatio`            | `number`                                      | `devicePixelRatio`     | Canvas buffer scale. Set `1` to disable HiDPI scaling                                                                                                                                                                    |
| `scratchInterval`       | `number`                                      | `50`                   | Min ms between `onScratch` calls. Does not affect visual drawing                                                                                                                                                         |
| `imageSmoothingQuality` | `ImageSmoothingQuality`                       | `'low'`                | Canvas image smoothing quality                                                                                                                                                                                           |
| `ariaLabel`             | `string`                                      | —                      | Accessible label for the canvas element                                                                                                                                                                                  |
| `canvasProps`           | `CanvasHTMLAttributes`                        | —                      | Extra props forwarded to the `<canvas>` element (e.g. `style`, `className`)                                                                                                                                              |
| `children`              | `ReactNode`                                   | —                      | Content revealed beneath the canvas                                                                                                                                                                                      |

---

## Types

### Cover

```ts
type Cover =
    | { type: 'color'; color: string }
    | { type: 'image'; image: string }

Covers.color('#ff0000')
Covers.image(coverImg)
```

### Brush

```ts
// Only opaque pixels of the brush image contribute to the erase effect.
type Brush =
    | { type: 'circle'; radius: number }
    | { type: 'image'; image: string; width: number; height: number }

Brushes.circle(20)
Brushes.image(brushImg, 20, 20)
```

### Region

```ts
// scratchRegion    — defines where the brush has effect.
//                   Scratching outside it does nothing.
//
// validationRegion — defines which pixels count toward finishPercent.
//                   Has no effect on where the user can scratch.
//
// They can be combined: e.g. a star-shaped scratchRegion with a smaller
// circle validationRegion (completion fires when the circle is 70% revealed).
//
// When using an image region, only opaque pixels define the active area.

type Region =
    | { type: 'rect'; x: number; y: number; width: number; height: number }
    | { type: 'circle'; x: number; y: number; radius: number }
    | { type: 'image'; image: string }

Regions.rect(0, 0, 200, 100)
Regions.circle(150, 100, 80)
Regions.image(maskImg)
```

---

## Ref

```ts
// access via useRef<ScratchCardRef>

ref.current.isReady                                    // true once the cover is drawn and the card is interactive

ref.current.reset()                                    // restore to initial state; onComplete can fire again

ref.current.revealAll()                                // instant full reveal
ref.current.revealAll({duration: 500})               // animated reveal over 500ms
ref.current.revealAll({duration: 500, blockSize: 4}) // animated, erases in 4×4 pixel blocks
```

---

## License

MIT © [dopey2](https://github.com/dopey2)
