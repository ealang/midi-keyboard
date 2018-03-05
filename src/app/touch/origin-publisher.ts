import { ElemId, TouchId, Point, TouchEvent, Subscriber, elemsAreEqual, stripData } from './touch-types';

export class OriginPublisher {
  private origins = new Map<TouchId, ElemId>();
  private subscribers = new Map<ElemId, Array<Subscriber>>();

  subscribe(elemId: ElemId, subscriber: Subscriber): void {
    const oldSubs = this.subscribers.get(elemId) || [];
    this.subscribers.set(elemId, [...oldSubs, subscriber]);
  }

  emitEvent(eventType: string, touchId: TouchId, curElemId: ElemId, coordinates: Point): void {
    if (eventType === 'start') {
      this.origins.set(touchId, stripData(curElemId));
    }
    const originElemId = this.origins.get(touchId);

    if (this.subscribers.has(originElemId)) {
      const event = new TouchEvent(
        eventType,
        touchId,
        elemsAreEqual(originElemId, curElemId) ? curElemId : null,
        coordinates
      );
      this.subscribers.get(originElemId).forEach((subscriber) => {
        subscriber(event);
      });
    }

    if (eventType === 'end') {
      this.origins.delete(touchId);
    }
  }
}
