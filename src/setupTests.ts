import '@testing-library/jest-dom';

// jsdom does not implement Path2D
global.Path2D = class {
  rect() {}
  arc() {}
} as unknown as typeof Path2D;
