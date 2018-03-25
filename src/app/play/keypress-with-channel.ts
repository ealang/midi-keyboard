import { KeypressEventType } from '../keypress/keypress.service';
import { Point } from '../geometry';

export interface KeypressEventWithChannel {
  readonly channel: number;
  readonly eventType: KeypressEventType;
  readonly keyNumber: number;
  readonly coordinates: Point;
}
