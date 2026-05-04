import { Section, Divider } from '../examples/shared';
import ImageCover from '../examples/basic/ImageCover';
import ColorCover from '../examples/basic/ColorCover';
import BrushSize from '../examples/brush/BrushSize';
import CustomBrush from '../examples/brush/CustomBrush';
import LockOnComplete from '../examples/onComplete/LockOnComplete';
import ContinueOnComplete from '../examples/onComplete/ContinueOnComplete';
import CircleScratchRegion from '../examples/region/CircleScratchRegion';
import ImageMaskRegion from '../examples/region/ImageMaskRegion';
import FadeOut from '../examples/onComplete/FadeOut';
import BlurOut from '../examples/onComplete/BlurOut';
import AnimatedReveal from '../examples/onComplete/AnimatedReveal';
import AnimatedRevealFast from '../examples/onComplete/AnimatedRevealFast';
import BlurAnimatedReveal from '../examples/onComplete/BlurAnimatedReveal';

export default function BasicDemo() {
  return (
    <div style={{ padding: '0 2rem' }}>

      <Section title="Basic">
        <ImageCover />
        <Divider />
        <ColorCover />
      </Section>

      <Section title="Brush">
        <BrushSize />
        <Divider />
        <CustomBrush />
      </Section>

      <Section title="On Complete">
        <LockOnComplete />
        <Divider />
        <ContinueOnComplete />
        <Divider />
        <FadeOut />
        <Divider />
        <BlurOut />
        <Divider />
        <AnimatedReveal />
        <Divider />
        <AnimatedRevealFast />
        <Divider />
        <BlurAnimatedReveal />
      </Section>

      <Section title="Scratch Zone">
        <CircleScratchRegion />
        <Divider />
        <ImageMaskRegion />
      </Section>

    </div>
  );
}
