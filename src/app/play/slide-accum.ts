import { Point } from '../geometry';

export class SlideAccum {
  private static readonly zero2D = {x: 0, y: 0};
  private readonly origin = new Map<number, Point>();

  // @return Change in coordinates since key touched down.
  trackKeySlide(keyNumber: number, coordinates: Point): Point {
    if (coordinates !== null) {
      if (!this.origin.has(keyNumber)) {
        this.origin.set(keyNumber, coordinates);
      }
      const origin = this.origin.get(keyNumber),
            x = coordinates.x - origin.x,
            y = coordinates.y - origin.y;
      return {x, y};
    } else {
      return SlideAccum.zero2D;
    }
  }

  cancelSlide(keyNumber: number): void {
    this.origin.delete(keyNumber);
  }
}

