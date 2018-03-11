import { Injectable } from '@angular/core';

import { OriginPublisher } from './origin-publisher';
import { StickyPublisher } from './sticky-publisher';
import { ElemId, TouchId, Point, Subscriber } from './touch-types';
export { ElemId, TouchId, Point, TouchEvent, Subscriber } from './touch-types';

@Injectable()
export class TouchService {
  private readonly origin = new OriginPublisher();
  private readonly sticky = new StickyPublisher();

  /* Subscribe to touches which strictly originate on the given element.
   */
  subscribeOrigin(elemId: ElemId, subscriber: Subscriber): void {
    this.origin.subscribe(elemId, subscriber);
  }

  /* Subscribe to touches which originate or cross through the given element.
   */
  subscribeSticky(elemId: ElemId, subscriber: Subscriber): void {
    this.sticky.subscribe(elemId, subscriber);
  }

  emitEvent(eventType: string, touchId: TouchId, elemId: ElemId, elemRelCoordinates: Point, globalCoordinates: Point): void {
    this.origin.emitEvent(eventType, touchId, elemId, elemRelCoordinates, globalCoordinates);
    this.sticky.emitEvent(eventType, touchId, elemId, elemRelCoordinates, globalCoordinates);
  }
}
