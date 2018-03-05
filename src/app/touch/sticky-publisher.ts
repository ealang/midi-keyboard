import { ElemId, TouchId, Point, TouchEvent, Subscriber, elemsAreEqual, stripData } from './touch-types';

export class StickyPublisher {
  private capturedElem = new Map<TouchId, ElemId>();
  private subscribers = new Map<ElemId, Array<Subscriber>>();

  subscribe(elemId: ElemId, subscriber: Subscriber): void {
    const oldSubs = this.subscribers.get(elemId) || [];
    this.subscribers.set(elemId, [...oldSubs, subscriber]);
  }

  emitEvent(eventType: string, touchId: TouchId, curElemId: ElemId, coordinates: Point): void {
    let isFirstCapture = false;
    if (!this.capturedElem.has(touchId) && this.subscribers.has(stripData(curElemId))) {
      isFirstCapture = true;
      this.capturedElem.set(touchId, stripData(curElemId));
    }

    const capturedElemId = this.capturedElem.get(touchId) || null;
    if (capturedElemId !== null) {
      const event = new TouchEvent(
        isFirstCapture ? 'start' : eventType,
        touchId,
        elemsAreEqual(capturedElemId, curElemId) ? curElemId : null,
        coordinates
      );
      this.subscribers.get(capturedElemId).forEach((subscriber) => {
        subscriber(event);
      });
    }

    if (eventType === 'end') {
      this.capturedElem.delete(touchId);
    }
  }
}
