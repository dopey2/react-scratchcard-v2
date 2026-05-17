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

## Props

| Prop                    | Type                                          | Default                | Description                                                                                                                                                                                                                     |
|-------------------------|-----------------------------------------------|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `width`                 | `number`                                      | —                      | Canvas width in px                                                                                                                                                                                                              |
| `height`                | `number`                                      | —                      | Canvas height in px                                                                                                                                                                                                             |
| `cover`                 | `Cover`                                       | `Covers.color('#ccc')` | Cover drawn on the canvas. Use `Covers.color(color)` or `Covers.image(url)`                                                                                                                                                     |
| `brush`                 | `Brush`                                       | `Brushes.circle(20)`   | Brush shape. Use `Brushes.circle(radius)` or `Brushes.image(url, w, h)`                                                                                                                                                         |
| `finishPercent`         | `number`                                      | `70`                   | % of pixels erased before `onComplete` fires                                                                                                                                                                                    |
| `onComplete`            | `() => void`                                  | —                      | Called once when `finishPercent` is reached                                                                                                                                                                                     |
| `onScratchStart`        | `() => void`                                  | —                      | Called when the user begins scratching                                                                                                                                                                                          |
| `onScratch`             | `(percent, position, globalPosition) => void` | —                      | Called on each pixel sample during scratching                                                                                                                                                                                   |
| `onScratchEnd`          | `(percent: number) => void`                   | —                      | Called when the user stops scratching                                                                                                                                                                                           |
| `onReady`               | `() => void`                                  | —                      | Called when the cover is drawn and the card is interactive                                                                                                                                                                      |
| `onError`               | `(error: Error) => void`                      | —                      | Called if initialization fails                                                                                                                                                                                                  |
| `lockOnComplete`        | `boolean`                                     | `true`                 | Block scratching after `finishPercent` is reached                                                                                                                                                                               |
| `enabled`               | `boolean`                                     | `true`                 | Enable or disable all pointer interaction                                                                                                                                                                                       |
| `scratchRegion`         | `Region`                                      | —                      | Restrict where the user can scratch                                                                                                                                                                                             |
| `validationRegion`      | `Region`                                      | —                      | Restrict which pixels count toward `finishPercent`                                                                                                                                                                              |
| `coverBackground`       | `boolean`                                     | `false`                | Renders a background canvas showing the cover outside `scratchRegion`. Only useful when applying CSS animations to the main canvas — without it, the outer cover fades with the scratch zone. No effect without `scratchRegion` |
| `pixelRatio`            | `number`                                      | `devicePixelRatio`     | Canvas buffer scale. Set `1` to disable HiDPI scaling                                                                                                                                                                           |
| `scratchInterval`       | `number`                                      | `50`                   | Min ms between `onScratch` calls                                                                                                                                                                                                |
| `imageSmoothingQuality` | `ImageSmoothingQuality`                       | `'low'`                | Canvas image smoothing quality. Check https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality                                                                                           |
| `ariaLabel`             | `string`                                      | —                      | Accessible label for the canvas element                                                                                                                                                                                         |
| `canvasProps`           | `CanvasHTMLAttributes`                        | —                      | Extra props forwarded to the `<canvas>` element                                                                                                                                                                                 |
| `children`              | `ReactNode`                                   | —                      | Content revealed beneath the canvas                                                                                                                                                                                             |

____

## Types

### Cover

```ts
// Drawn on top of the canvas. Only opaque pixels are scratchable —
// transparent areas are excluded from the scratch zone automatically.
type Cover =
    | { type: 'color'; color: string }
    | { type: 'image'; image: string }

// factory
Covers.color('#ff0000')
Covers.image(coverImg)
```

### Brush

```ts
// Shape used to erase pixels as the user scratches.
// Only opaque pixels of the brush image contribute to the erase effect.
type Brush =
    | { type: 'circle'; radius: number }
    | { type: 'image'; image: string; width: number; height: number }

// factory
Brushes.circle(20)
Brushes.image(brushImg, 20, 20)
```

### Region

```ts
// Regions have two distinct uses:
//
//   scratchRegion    — defines where the brush has effect. Scratching outside
//                      it does nothing; the cover outside remains permanent.
//
//   validationRegion — defines which pixels count toward finishPercent.
//                      Has no effect on where the user can scratch.
//
// They can be combined: e.g. a star-shaped scratchRegion (user can only scratch
// inside the star) with a smaller circle validationRegion (completion fires when
// that circle is 70% revealed, not the whole star).
//
// If only scratchRegion is set, completion is calculated from the scratchable area.
// If only validationRegion is set, the user can scratch anywhere but only that
// zone counts toward completion.
//
// When using an image, only opaque pixels define the region.
type Region =
    | { type: 'rect'; x: number; y: number; width: number; height: number }
    | { type: 'circle'; x: number; y: number; radius: number }
    | { type: 'image'; image: string }

// factory
Regions.rect(0, 0, 200, 100)
Regions.circle(150, 100, 80)
Regions.image(maskImg)
```

____

## Ref

```ts
// access via useRef<ScratchCardRef>

ref.current.isReady                                          // true once the cover is drawn and the card is interactive

ref.current.reset()                                          // restore to initial state, allows onComplete to fire again

ref.current.revealAll()                                      // instant full reveal
ref.current.revealAll({duration: 500})                     // animated reveal over 500ms
ref.current.revealAll({duration: 500, blockSize: 4})       // animated, erases in 4×4 pixel blocks
```

## License

MIT © [dopey2](https://github.com/dopey2)
