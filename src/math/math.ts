export type Point = {
  x: number;
  y: number;
};

export const distanceBetween = (p1: Point | null, p2: Point | null): number => {
  if (p1 && p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  return 0;
};

export const angleBetween = (p1: Point | null, p2: Point | null): number => {
  if (p1 && p2) {
    return Math.atan2(p2.x - p1.x, p2.y - p1.y);
  }
  return 0;
};

export const shuffleInPlace = (arr: number[]): void => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};
