export interface Point {
  readonly x: number;
  readonly y: number;
}

export type ElemId = string;
export type TouchId = string;

export class TouchEvent {
  constructor(
    readonly eventType: string,
    readonly touchId: TouchId,
    readonly elemId: ElemId,
    readonly coordinates: Point
  ) {
  }
}

export type Subscriber = (event: TouchEvent) => void;

export function stripData(elemId: ElemId): ElemId {
  return elemId && elemId.split(':')[0];
}

export function elemsAreEqual(elem1: ElemId, elem2: ElemId): boolean {
  return stripData(elem1) === stripData(elem2);
}
