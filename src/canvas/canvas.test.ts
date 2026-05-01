import { describe, it } from 'vitest';

describe('getCoords', () => {
  it.todo('returns correct coordinates for mouse events');
  it.todo('returns correct coordinates for touch events');
  it.todo('accounts for canvas position offset');
  it.todo('accounts for page scroll offset');
});

describe('getFilledInPixels', () => {
  it.todo('returns 0 when no pixels are transparent');
  it.todo('returns 100 when all pixels are transparent');
  it.todo('respects customCheckZone bounds');
  it.todo('samples every nth pixel based on stride');
});
