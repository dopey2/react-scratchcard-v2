import { ComponentType } from 'react';
import ImageCover from './examples/basic/ImageCover';
import ColorCover from './examples/basic/ColorCover';
import BrushSize from './examples/brush/BrushSize';
import CustomBrush from './examples/brush/CustomBrush';
import FadeOut from './examples/onComplete/FadeOut';
import CircleRegionFadeOut from './examples/onComplete/CircleRegionFadeOut';
import AnimatedReveal from './examples/onComplete/AnimatedReveal';
import CircleRegionRevealAll from './examples/onComplete/CircleRegionRevealAll';
import AnimatedRevealFast from './examples/onComplete/AnimatedRevealFast';
import BlurAnimatedReveal from './examples/onComplete/BlurAnimatedReveal';
import CircleScratchRegion from './examples/region/CircleScratchRegion';
import ImageMaskRegion from './examples/region/ImageMaskRegion';
import ParticleDemo from './examples/particles/ParticleDemo';

export type ExampleDef = {
  slug: string;
  title: string;
  group: string;
  component: ComponentType;
  sourceFile: string;
};

const BASE = 'https://github.com/dopey2/react-scratchcard-v2/blob/main';

export const EXAMPLES: ExampleDef[] = [
  {
    slug: 'image-cover',
    title: 'Image cover',
    group: 'Basic',
    component: ImageCover,
    sourceFile: `${BASE}/demo/src/examples/basic/ImageCover.tsx`,
  },
  {
    slug: 'color-cover',
    title: 'Color cover',
    group: 'Basic',
    component: ColorCover,
    sourceFile: `${BASE}/demo/src/examples/basic/ColorCover.tsx`,
  },
  {
    slug: 'brush-size',
    title: 'Brush size',
    group: 'Brush',
    component: BrushSize,
    sourceFile: `${BASE}/demo/src/examples/brush/BrushSize.tsx`,
  },
  {
    slug: 'custom-brush',
    title: 'Custom brush',
    group: 'Brush',
    component: CustomBrush,
    sourceFile: `${BASE}/demo/src/examples/brush/CustomBrush.tsx`,
  },
  {
    slug: 'circle-scratch-region',
    title: 'Circle scratch region',
    group: 'Scratch Zone',
    component: CircleScratchRegion,
    sourceFile: `${BASE}/demo/src/examples/region/CircleScratchRegion.tsx`,
  },
  {
    slug: 'image-mask-region',
    title: 'Image mask region',
    group: 'Scratch Zone',
    component: ImageMaskRegion,
    sourceFile: `${BASE}/demo/src/examples/region/ImageMaskRegion.tsx`,
  },
  {
    slug: 'animated-reveal',
    title: 'Animated reveal',
    group: 'Animated Reveal',
    component: AnimatedReveal,
    sourceFile: `${BASE}/demo/src/examples/onComplete/AnimatedReveal.tsx`,
  },
  {
    slug: 'animated-reveal-fast',
    title: 'Animated reveal (fast)',
    group: 'Animated Reveal',
    component: AnimatedRevealFast,
    sourceFile: `${BASE}/demo/src/examples/onComplete/AnimatedRevealFast.tsx`,
  },
  {
    slug: 'circle-region-reveal-all',
    title: 'Circle region + reveal all',
    group: 'Animated Reveal',
    component: CircleRegionRevealAll,
    sourceFile: `${BASE}/demo/src/examples/onComplete/CircleRegionRevealAll.tsx`,
  },
  {
    slug: 'fade-out',
    title: 'Fade out',
    group: 'Reveal CSS Animation',
    component: FadeOut,
    sourceFile: `${BASE}/demo/src/examples/onComplete/FadeOut.tsx`,
  },
  {
    slug: 'blur-animated-reveal',
    title: 'Blur animated reveal',
    group: 'Reveal CSS Animation',
    component: BlurAnimatedReveal,
    sourceFile: `${BASE}/demo/src/examples/onComplete/BlurAnimatedReveal.tsx`,
  },
  {
    slug: 'circle-region-fade-out',
    title: 'Circle region + fade out',
    group: 'Reveal CSS Animation',
    component: CircleRegionFadeOut,
    sourceFile: `${BASE}/demo/src/examples/onComplete/CircleRegionFadeOut.tsx`,
  },
  {
    slug: 'particles',
    title: 'Particles',
    group: 'Particles',
    component: ParticleDemo,
    sourceFile: `${BASE}/demo/src/examples/particles/ParticleDemo.tsx`,
  },
];

export const EXAMPLE_GROUPS = Array.from(new Set(EXAMPLES.map((e) => e.group)));
